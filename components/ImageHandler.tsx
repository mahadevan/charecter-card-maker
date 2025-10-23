import React, { useRef, useCallback } from 'react';
import { CharacterImage, CharacterCard } from '../types';
import { extractDataFromPng } from '../services/pngService';
import UploadCloudIcon from './icons/UploadCloudIcon';

interface ImageHandlerProps {
  characterImage: CharacterImage;
  characterName: string;
  characterVersion?: string;
  onImageChange: (image: CharacterImage) => void;
  onCardDataExtract: (card: Partial<CharacterCard>) => void;
  theme: 'light' | 'dark';
}

const ImageHandler: React.FC<ImageHandlerProps> = ({ characterImage, characterName, characterVersion, onImageChange, onCardDataExtract, theme }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'image/png') {
      const objectURL = URL.createObjectURL(file);
      onImageChange({ file, objectURL });

      const arrayBuffer = await file.arrayBuffer();
      const extractedData = await extractDataFromPng(arrayBuffer);
      if (extractedData) {
        onCardDataExtract(extractedData);
      }
    } else {
      alert("Please upload a PNG file.");
    }
  };

  const handleDrop = useCallback(async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type === 'image/png') {
        const objectURL = URL.createObjectURL(file);
        onImageChange({ file, objectURL });

        const arrayBuffer = await file.arrayBuffer();
        const extractedData = await extractDataFromPng(arrayBuffer);
        if (extractedData) {
            onCardDataExtract(extractedData);
        }
    } else {
        alert("Please upload a PNG file.");
    }
  }, [onImageChange, onCardDataExtract]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const containerClasses = theme === 'light' ? 'bg-white' : 'bg-neutral-800';
  const dropzoneClasses = theme === 'light' 
    ? 'border-neutral-300 hover:border-neutral-400' 
    : 'border-neutral-600 hover:border-neutral-500';
  const textClasses = theme === 'light' ? 'text-neutral-500' : 'text-neutral-400';
  const nameTextClasses = theme === 'light' ? 'text-neutral-700' : 'text-neutral-300';
  const versionTextClasses = theme === 'light' ? 'text-neutral-500' : 'text-neutral-400';

  return (
    <div className={`${containerClasses} p-4 rounded-lg shadow-lg flex flex-col items-center justify-center`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png"
        className="hidden"
      />
      <div 
        className={`w-full aspect-[4/5] border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer transition-colors ${dropzoneClasses}`}
        onClick={triggerFileInput}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {characterImage.objectURL ? (
          <img src={characterImage.objectURL} alt="Character" className="max-w-full max-h-full object-contain rounded-md" />
        ) : (
          <div className={`text-center ${textClasses}`}>
            <UploadCloudIcon className="w-16 h-16 mx-auto mb-4" />
            <p className="font-semibold">Click to upload or drag & drop</p>
            <p className="text-sm">PNG image required</p>
          </div>
        )}
      </div>
      {characterName && (
        <div className="mt-4 text-center w-full">
            <h3 className={`text-lg font-semibold break-words ${nameTextClasses}`}>
              {characterName}
            </h3>
            {characterVersion && (
                <p className={`text-xs mt-1 ${versionTextClasses}`}>
                    Ver: {characterVersion}
                </p>
            )}
        </div>
      )}
    </div>
  );
};

export default ImageHandler;