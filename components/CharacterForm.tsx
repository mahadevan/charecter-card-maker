import React, { useRef } from 'react';
import { CharacterCard } from '../types';
import FileCodeIcon from './icons/FileCodeIcon';
import DownloadIcon from './icons/DownloadIcon';
import UploadCloudIcon from './icons/UploadCloudIcon';

interface CharacterFormProps {
  characterCard: CharacterCard;
  onCardChange: (newCardData: Partial<CharacterCard>) => void;
  onCardImport: (newCardData: Partial<CharacterCard>) => void;
  onPngImport: (file: File) => void;
  onReset: () => void;
  theme: 'light' | 'dark';
  onDownloadPng: () => void;
  onExportJson: () => void;
}

const CharacterForm: React.FC<CharacterFormProps> = ({
  characterCard,
  onCardChange,
  onCardImport,
  onPngImport,
  onReset,
  theme,
  onDownloadPng,
  onExportJson,
}) => {
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'tags') {
      onCardChange({ [name]: value.split(',').map(tag => tag.trim()) });
    } else {
      onCardChange({ [name]: value });
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type === 'image/png' || file.name.endsWith('.png')) {
      onPngImport(file);
    } else if (file.type === 'application/json' || file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          // Support both v3 spec {spec, data} and raw data objects
          const cardData = json.data && json.spec ? json.data : json;
          onCardImport(cardData);
        } catch (error) {
          console.error("Error parsing JSON file", error);
          alert("Invalid JSON file.");
        }
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a valid PNG or JSON file.");
    }

    // Reset the input value to allow re-uploading the same file
    if (event.target) event.target.value = '';
  };
  
  const containerClasses = theme === 'light' ? 'bg-white' : 'bg-neutral-800';
  const inputClasses = ` ${theme === 'light'
    ? 'bg-neutral-100 border-neutral-300 focus:ring-blue-500 focus:border-blue-500'
    : 'bg-neutral-700 border-neutral-600 text-white focus:ring-blue-500 focus:border-blue-500'}`;
  const labelClasses = theme === 'light' ? 'text-neutral-700' : 'text-neutral-300';
  const buttonClasses = theme === 'light'
    ? 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800'
    : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-200';
  const primaryButtonClasses = 'bg-blue-600 hover:bg-blue-700 text-white';
  const warningButtonClasses = 'bg-orange-500 hover:bg-orange-600 text-white';
  const successButtonClasses = 'bg-green-600 hover:bg-green-700 text-white';

  const renderTextarea = (name: keyof CharacterCard, label: string, placeholder: string, rows = 3, required = false) => (
    <div>
      <label htmlFor={name} className={`block text-sm font-medium mb-1 ${labelClasses}`}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={(characterCard[name] as string) || ''}
        onChange={handleInputChange}
        placeholder={placeholder}
        rows={rows}
        className={`w-full p-2 border rounded-md shadow-sm text-sm ${inputClasses}`}
      />
    </div>
  );

  const renderInput = (name: keyof CharacterCard, label: string, placeholder: string, required = false) => (
     <div>
      <label htmlFor={name} className={`block text-sm font-medium mb-1 ${labelClasses}`}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        id={name}
        name={name}
        value={(name === 'tags' ? (characterCard.tags || []).join(', ') : (characterCard[name] as string)) || ''}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={`w-full p-2 border rounded-md shadow-sm text-sm ${inputClasses}`}
      />
    </div>
  );

  return (
    <div className={`${containerClasses} p-6 rounded-lg shadow-lg flex flex-col h-full`}>
        <input 
          type="file" 
          ref={importInputRef} 
          onChange={handleFileImport} 
          accept=".png,.json,image/png,application/json" 
          className="hidden" 
        />

      <div className="flex-grow space-y-4 overflow-y-auto pr-2 -mr-2">
        <div className={`flex justify-between items-center mb-4 border-b pb-2 ${theme === 'light' ? 'border-neutral-200' : 'border-neutral-700'}`}>
          <h2 className="text-xl font-semibold">Character Details</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => importInputRef.current?.click()} 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${primaryButtonClasses}`}
            >
              <UploadCloudIcon className="w-4 h-4" />
              Import
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInput('name', 'Name', 'Enter character name', true)}
          {renderInput('creator', 'Creator', 'Your name or username')}
        </div>
        {renderTextarea('description', 'Description', 'A short description of the character.', 6)}
        {renderTextarea('personality', 'Personality', 'Describe the character\'s personality traits.', 4)}
        {renderTextarea('scenario', 'Scenario', 'The context or setting for the character.', 3)}
        {renderTextarea('first_mes', 'First Message', 'The first thing the character says to the user.', 5, true)}
        {renderTextarea('mes_example', 'Example Messages', 'Examples of dialogue for the character.', 8)}
        
        <hr className={`border-dashed ${theme === 'light' ? 'border-neutral-200' : 'border-neutral-700'}`} />

        {renderTextarea('creator_notes', 'Creator Notes', 'Notes for yourself or other creators.', 3)}
        {renderTextarea('system_prompt', 'System Prompt', 'System-level instructions for the AI model.', 6)}
        {renderTextarea('post_history_instructions', 'Post History Instructions', 'Instructions processed after context history.', 4)}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInput('tags', 'Tags', 'Comma-separated tags (e.g., fantasy, sci-fi)')}
          {renderInput('character_version', 'Character Version', 'e.g., 1.0.0')}
        </div>
      </div>
      
      <div className={`mt-6 pt-4 border-t flex justify-between items-center flex-shrink-0 ${theme === 'light' ? 'border-neutral-200' : 'border-neutral-700'}`}>
        <div>
           <button onClick={onReset} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${warningButtonClasses}`}>
                Reset
            </button>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={onExportJson} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${buttonClasses}`}>
                <FileCodeIcon className="w-4 h-4" />
                Export JSON
            </button>
            <button onClick={onDownloadPng} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${successButtonClasses}`}>
                <DownloadIcon className="w-4 h-4" />
                Download PNG
            </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterForm;