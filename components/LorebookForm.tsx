import React from 'react';
import { Lorebook } from '../types';

interface LorebookFormProps {
  lorebook: Lorebook;
  onLorebookChange: (newLorebook: Lorebook) => void;
  onExportJson: () => void;
  theme: 'light' | 'dark';
}

const LorebookForm: React.FC<LorebookFormProps> = ({ lorebook, onLorebookChange, onExportJson, theme }) => {
  const handleAddEntry = () => {
    const newEntries = [...lorebook.entries, { keyword: '', content: '' }];
    onLorebookChange({ ...lorebook, entries: newEntries });
  };

  const handleRemoveEntry = (index: number) => {
    const newEntries = lorebook.entries.filter((_, i) => i !== index);
    onLorebookChange({ ...lorebook, entries: newEntries });
  };

  const handleEntryChange = (index: number, field: 'keyword' | 'content', value: string) => {
    const newEntries = [...lorebook.entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    onLorebookChange({ ...lorebook, entries: newEntries });
  };

  const formClasses = theme === 'light' ? 'bg-white text-gray-800' : 'bg-gray-800 text-white';
  const inputClasses = theme === 'light' ? 'bg-gray-100 text-gray-800' : 'bg-gray-700 text-white';

  return (
    <div className={`p-4 rounded-lg ${formClasses}`}>
      <h2 className="text-2xl font-bold mb-4">Lorebook / World Info</h2>
      {lorebook.entries.map((entry, index) => (
        <div key={index} className="flex items-center mb-4">
          <input
            type="text"
            placeholder="Keyword"
            value={entry.keyword}
            onChange={(e) => handleEntryChange(index, 'keyword', e.target.value)}
            className={`w-1/3 p-2 rounded-md ${inputClasses}`}
          />
          <textarea
            placeholder="Content"
            value={entry.content}
            onChange={(e) => handleEntryChange(index, 'content', e.target.value)}
            className={`w-2/3 p-2 rounded-md ml-2 ${inputClasses}`}
          />
          <button onClick={() => handleRemoveEntry(index)} className="ml-2 text-red-500">Remove</button>
        </div>
      ))}
      <button onClick={handleAddEntry} className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2">Add Entry</button>
      <button onClick={onExportJson} className="bg-green-500 text-white px-4 py-2 rounded-md">Export JSON</button>
    </div>
  );
};

export default LorebookForm;
