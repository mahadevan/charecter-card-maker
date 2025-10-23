import { CharacterCard } from '../types';

// CRC32 implementation
let crcTable: number[] | undefined;
const makeCRCTable = () => {
    if (crcTable) return;
    crcTable = [];
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) {
            c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
};

const crc32 = (buf: Uint8Array): number => {
    if (!crcTable) makeCRCTable();
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
        crc = (crc >>> 8) ^ crcTable![(crc ^ buf[i]) & 0xFF];
    }
    return (crc ^ -1) >>> 0;
};

// PNG constants and helpers
const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
const CHUNK_TYPE_IEND = 'IEND';
const CHUNK_TYPE_TEXT = 'tEXt';
const CHARACTER_KEY = 'chara';

const b64_to_utf8 = (str: string) => {
    return decodeURIComponent(escape(window.atob(str)));
}

const utf8_to_b64 = (str: string) => {
    return window.btoa(unescape(encodeURIComponent(str)));
}

interface PngChunk {
    type: string;
    data: Uint8Array;
}

const decode = (arrayBuffer: ArrayBuffer): PngChunk[] => {
    const view = new DataView(arrayBuffer);
    const signature = new Uint8Array(arrayBuffer.slice(0, 8));

    if (signature.join(',') !== PNG_SIGNATURE.join(',')) {
        console.error("Not a valid PNG file.");
        return [];
    }
    
    const chunks: PngChunk[] = [];
    let offset = 8;
    while (offset < arrayBuffer.byteLength) {
        const length = view.getUint32(offset);
        const typeBytes = new Uint8Array(arrayBuffer.slice(offset + 4, offset + 8));
        const type = String.fromCharCode.apply(null, Array.from(typeBytes));
        const data = new Uint8Array(arrayBuffer.slice(offset + 8, offset + 8 + length));
        
        chunks.push({ type, data });

        if (type === CHUNK_TYPE_IEND) {
            break;
        }

        offset += 12 + length;
    }
    return chunks;
}

const encode = (chunks: PngChunk[]): ArrayBuffer => {
    let totalLength = 8; // For PNG signature
    chunks.forEach(chunk => {
        totalLength += 12 + chunk.data.length;
    });

    const buffer = new ArrayBuffer(totalLength);
    const view = new DataView(buffer);
    const uint8 = new Uint8Array(buffer);
    
    uint8.set(PNG_SIGNATURE, 0);
    let offset = 8;

    for (const chunk of chunks) {
        const chunkTypeBytes = new Uint8Array(4);
        for (let i = 0; i < 4; i++) {
            chunkTypeBytes[i] = chunk.type.charCodeAt(i);
        }

        view.setUint32(offset, chunk.data.length);
        uint8.set(chunkTypeBytes, offset + 4);
        uint8.set(chunk.data, offset + 8);

        const crcData = new Uint8Array(4 + chunk.data.length);
        crcData.set(chunkTypeBytes);
        crcData.set(chunk.data, 4);
        const crc = crc32(crcData);
        view.setUint32(offset + 8 + chunk.data.length, crc);
        
        offset += 12 + chunk.data.length;
    }
    return buffer;
}

export const extractDataFromPng = async (arrayBuffer: ArrayBuffer): Promise<CharacterCard | null> => {
    const chunks = decode(arrayBuffer);
    if (chunks.length === 0) return null;

    // Find the 'chara' text chunk
    for (const chunk of chunks) {
        if (chunk.type === CHUNK_TYPE_TEXT) {
            const dataText = new TextDecoder('latin1').decode(chunk.data);
            const nullSeparatorIndex = dataText.indexOf('\0');
            const key = dataText.substring(0, nullSeparatorIndex);
            
            if (key === CHARACTER_KEY) {
                const value = dataText.substring(nullSeparatorIndex + 1);
                try {
                    const decoded = b64_to_utf8(value);
                    const parsedJson = JSON.parse(decoded);
                    
                    if (parsedJson.spec && parsedJson.spec.startsWith('chara_card_v') && parsedJson.data) {
                        return parsedJson.data as CharacterCard;
                    }
                    
                    return parsedJson as CharacterCard;
                } catch (e) {
                    console.error("Failed to parse character data:", e);
                    return null;
                }
            }
        }
    }

    return null;
};

export const embedDataInPng = async (arrayBuffer: ArrayBuffer, characterData: CharacterCard): Promise<Blob | null> => {
    const chunks = decode(arrayBuffer);
    if (chunks.length === 0) {
        console.error("Could not decode PNG file for embedding data.");
        return null;
    }

    // Remove any old character data chunk to avoid duplicates
    const filteredChunks = chunks.filter(chunk => {
        if (chunk.type === CHUNK_TYPE_TEXT) {
            const dataText = new TextDecoder('latin1').decode(chunk.data);
            const nullSeparatorIndex = dataText.indexOf('\0');
            const key = dataText.substring(0, nullSeparatorIndex);
            return key !== CHARACTER_KEY;
        }
        return true;
    });

    const dataToEmbed = {
      spec: 'chara_card_v3',
      spec_version: '3.0',
      data: characterData,
    };

    const jsonString = JSON.stringify(dataToEmbed);
    const base64String = utf8_to_b64(jsonString);
    const textEncoder = new TextEncoder();
    const keywordBytes = textEncoder.encode(CHARACTER_KEY);
    const textBytes = textEncoder.encode(base64String);

    const chunkData = new Uint8Array(keywordBytes.length + 1 + textBytes.length);
    chunkData.set(keywordBytes, 0);
    chunkData[keywordBytes.length] = 0; // Null separator
    chunkData.set(textBytes, keywordBytes.length + 1);

    const newChunk: PngChunk = {
        type: CHUNK_TYPE_TEXT,
        data: chunkData,
    };

    const iendIndex = filteredChunks.findIndex(chunk => chunk.type === CHUNK_TYPE_IEND);
    if (iendIndex === -1) {
        console.error("Could not find IEND chunk in the original image.");
        return null;
    }
    
    // Insert our new chunk right before the IEND chunk
    filteredChunks.splice(iendIndex, 0, newChunk);

    const newPngBuffer = encode(filteredChunks);

    return new Blob([newPngBuffer], { type: 'image/png' });
};