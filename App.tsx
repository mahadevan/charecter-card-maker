import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ImageHandler from './components/ImageHandler';
import CharacterForm from './components/CharacterForm';
import Footer from './components/Footer';
import { CharacterCard, CharacterImage } from './types';
import { generatePlaceholder } from './services/placeholderService';
import { extractDataFromPng, embedDataInPng } from './services/pngService';

const initialCharacterCard: CharacterCard = {
  name: '',
  description: '',
  personality: '',
  scenario: '',
  first_mes: '',
  mes_example: '',
  creator_notes: '',
  system_prompt: '',
  post_history_instructions: '',
  tags: [],
  creator: '',
  character_version: '',
};

const App: React.FC = () => {
  const [characterCard, setCharacterCard] = useState<CharacterCard>(initialCharacterCard);
  const [characterImage, setCharacterImage] = useState<CharacterImage>({ file: null, objectURL: null });
  const [isDirty, setIsDirty] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
  });

  useEffect(() => {
    // Add 'dark' class to html element for scrollbar styling
    const root = window.document.documentElement;
     if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleImageChange = useCallback((newImage: CharacterImage) => {
    setCharacterImage(prevImage => {
      if (prevImage.objectURL && prevImage.objectURL !== newImage.objectURL) {
        URL.revokeObjectURL(prevImage.objectURL);
      }
      return newImage;
    });
  }, []);
  
  const regeneratePlaceholder = useCallback(async (name: string) => {
      const placeholder = await generatePlaceholder(name, theme);
      if (placeholder) {
        handleImageChange(placeholder);
      }
  }, [theme, handleImageChange]);

  useEffect(() => {
    const isPlaceholderActive = !characterImage.file || characterImage.file.name === 'placeholder.png';
    if (isPlaceholderActive) {
      if (isDirty || characterCard.name === '') {
        regeneratePlaceholder(characterCard.name);
      }
    }
  }, [characterCard.name, theme, isDirty, regeneratePlaceholder]);


  const handleCardChange = (newCardData: Partial<CharacterCard>) => {
    setCharacterCard(prev => ({ ...prev, ...newCardData }));
    if (!isDirty) setIsDirty(true);
  };

  const handleCardDataExtract = (extractedData: Partial<CharacterCard>) => {
    const newCard: CharacterCard = { ...initialCharacterCard, ...extractedData };

    if (newCard.tags && typeof newCard.tags === 'string') {
      newCard.tags = (newCard.tags as string).split(',').map(tag => tag.trim());
    } else if (!Array.isArray(newCard.tags)) {
      newCard.tags = [];
    }
    
    setCharacterCard(newCard);
    setIsDirty(true);
  };
  
  const handlePngImport = async (file: File) => {
    if (file && file.type === 'image/png') {
      const objectURL = URL.createObjectURL(file);
      handleImageChange({ file, objectURL });

      const arrayBuffer = await file.arrayBuffer();
      const extractedData = await extractDataFromPng(arrayBuffer);
      if (extractedData) {
        handleCardDataExtract(extractedData);
      }
    }
  };

  const handleReset = () => {
    setCharacterCard(initialCharacterCard);
    regeneratePlaceholder('');
    setIsDirty(false);
  };

  const handleDownloadPng = async () => {
    if (!characterImage.file) {
      alert("Please upload an image first to embed data.");
      return;
    }

    const arrayBuffer = await characterImage.file.arrayBuffer();
    const newPngBlob = await embedDataInPng(arrayBuffer, characterCard);

    if (newPngBlob) {
      const url = URL.createObjectURL(newPngBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${characterCard.name || 'character'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      alert("Failed to embed data into PNG.");
    }
  };

  const handleExportJson = () => {
    const dataToExport = {
      spec: 'chara_card_v3',
      spec_version: '3.0',
      data: characterCard,
    };
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${characterCard.name || 'character'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const appClasses = theme === 'light' 
    ? 'bg-neutral-100 text-neutral-900' 
    : 'bg-neutral-900 text-white';

  return (
    <div className={`${appClasses} min-h-screen font-sans transition-colors duration-300`}>
      <Header theme={theme} setTheme={setTheme} />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <ImageHandler 
              characterImage={characterImage}
              characterName={characterCard.name}
              characterVersion={characterCard.character_version}
              onImageChange={handleImageChange}
              onCardDataExtract={handleCardDataExtract}
              theme={theme}
            />
          </div>
          <div className="md:col-span-2">
            <CharacterForm 
              characterCard={characterCard}
              onCardChange={handleCardChange}
              onCardImport={handleCardDataExtract}
              onPngImport={handlePngImport}
              onReset={handleReset}
              theme={theme}
              onDownloadPng={handleDownloadPng}
              onExportJson={handleExportJson}
            />
          </div>
        </div>
      </main>
      <Footer theme={theme} />
    </div>
  );
};

export default App;