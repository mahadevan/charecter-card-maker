import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ImageHandler from './components/ImageHandler';
import CharacterForm from './components/CharacterForm';
import LorebookManager from './components/LorebookManager';
import Footer from './components/Footer';
import { CharacterCard, CharacterImage, Lorebook } from './types';
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

const initialLorebook: Lorebook = {
  entries: [],
  extensions: {},
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'character' | 'lorebook'>('character');
  const [characterCard, setCharacterCard] = useState<CharacterCard>(initialCharacterCard);
  const [lorebook, setLorebook] = useState<Lorebook>(initialLorebook);
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
    
    // Extract lorebook if present
    if (newCard.character_book) {
      setLorebook(newCard.character_book);
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
    setLorebook(initialLorebook);
    regeneratePlaceholder('');
    setIsDirty(false);
  };

  const handleDownloadPng = async () => {
    if (!characterImage.file) {
      alert("Please upload an image first to embed data.");
      return;
    }

    // Merge lorebook into character card if it has entries
    const cardWithLorebook = {
      ...characterCard,
      character_book: lorebook.entries.length > 0 ? lorebook : undefined,
    };

    const arrayBuffer = await characterImage.file.arrayBuffer();
    const newPngBlob = await embedDataInPng(arrayBuffer, cardWithLorebook);

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
      data: {
        ...characterCard,
        character_book: lorebook.entries.length > 0 ? lorebook : undefined,
      },
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

  const handleExportLorebook = () => {
    if (lorebook.entries.length === 0) {
      alert("No lorebook entries to export.");
      return;
    }
    
    const jsonString = JSON.stringify(lorebook, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lorebook.name || characterCard.name || 'lorebook'}_worldinfo.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const appClasses = theme === 'light' 
    ? 'bg-neutral-100 text-neutral-900' 
    : 'bg-neutral-900 text-white';
  
  const tabClasses = (isActive: boolean) => 
    isActive 
      ? theme === 'light'
        ? 'bg-white text-blue-600 border-b-2 border-blue-600'
        : 'bg-neutral-800 text-blue-400 border-b-2 border-blue-400'
      : theme === 'light'
        ? 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700';

  return (
    <div className={`${appClasses} min-h-screen font-sans transition-colors duration-300`}>
      <Header theme={theme} setTheme={setTheme} />
      
      {/* Tab Navigation */}
      <div className={`${theme === 'light' ? 'bg-neutral-200' : 'bg-neutral-800'} border-b ${theme === 'light' ? 'border-neutral-300' : 'border-neutral-700'}`}>
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('character')}
              className={`px-6 py-3 font-medium transition-colors ${tabClasses(activeTab === 'character')}`}
            >
              Character Card
            </button>
            <button
              onClick={() => setActiveTab('lorebook')}
              className={`px-6 py-3 font-medium transition-colors ${tabClasses(activeTab === 'lorebook')}`}
            >
              Lorebook / World Info
              {lorebook.entries.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-600 text-white">
                  {lorebook.entries.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'character' ? (
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
        ) : (
          <div className="max-w-5xl mx-auto">
            <LorebookManager 
              lorebook={lorebook}
              onLorebookChange={setLorebook}
              theme={theme}
            />
            <div className={`mt-6 flex justify-end gap-3 ${theme === 'light' ? 'bg-white' : 'bg-neutral-800'} p-4 rounded-lg shadow-lg`}>
              <button 
                onClick={handleExportLorebook}
                disabled={lorebook.entries.length === 0}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  lorebook.entries.length === 0
                    ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                Export Lorebook JSON
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer theme={theme} />
    </div>
  );
};

export default App;