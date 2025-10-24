import React, { useState } from 'react';
import { Lorebook, LorebookEntry } from '../types';

// Simple inline icon components to avoid import issues
const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

interface LorebookManagerProps {
  lorebook: Lorebook;
  onLorebookChange: (lorebook: Lorebook) => void;
  theme: 'light' | 'dark';
}

const LorebookManager: React.FC<LorebookManagerProps> = ({ lorebook, onLorebookChange, theme }) => {
  const [expandedEntries, setExpandedEntries] = useState<Set<number | string>>(new Set());

  const containerClasses = theme === 'light' ? 'bg-white' : 'bg-neutral-800';
  const inputClasses = `font-readex-pro ${theme === 'light' 
    ? 'bg-neutral-100 border-neutral-300 focus:ring-blue-500 focus:border-blue-500' 
    : 'bg-neutral-700 border-neutral-600 text-white focus:ring-blue-500 focus:border-blue-500'}`;
  const labelClasses = theme === 'light' ? 'text-neutral-700' : 'text-neutral-300';
  const buttonClasses = theme === 'light'
    ? 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800'
    : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-200';
  const primaryButtonClasses = 'bg-blue-600 hover:bg-blue-700 text-white';
  const dangerButtonClasses = 'bg-red-600 hover:bg-red-700 text-white';
  const entryCardClasses = theme === 'light' ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-750 border-neutral-600';

  const handleLorebookMetaChange = (field: keyof Lorebook, value: any) => {
    onLorebookChange({ ...lorebook, [field]: value });
  };

  const handleAddEntry = () => {
    const newEntry: LorebookEntry = {
    id: Date.now(),
    uid: lorebook.entries.length + 1,
    key: [],
    content: '',
    enabled: true,
    insertion_order: lorebook.entries.length,
    constant: false,
    case_sensitive: false,
  };
    onLorebookChange({
      ...lorebook,
      entries: [...lorebook.entries, newEntry],
    });
    setExpandedEntries(new Set([...expandedEntries, newEntry.id]));
  };

  const handleDeleteEntry = (id: number | string) => {
    onLorebookChange({
      ...lorebook,
      entries: lorebook.entries.filter(e => e.id !== id),
    });
    const newExpanded = new Set(expandedEntries);
    newExpanded.delete(id);
    setExpandedEntries(newExpanded);
  };

  const handleEntryChange = (id: number | string, field: keyof LorebookEntry, value: any) => {
    onLorebookChange({
      ...lorebook,
      entries: lorebook.entries.map(e => 
        e.id === id ? { ...e, [field]: value } : e
      ),
    });
  };

  const toggleExpanded = (id: number | string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedEntries(newExpanded);
  };

  return (
    <div className={`${containerClasses} p-6 rounded-lg shadow-lg flex flex-col h-full`}>
      <div className={`flex justify-between items-center mb-4 border-b pb-2 ${theme === 'light' ? 'border-neutral-200' : 'border-neutral-700'}`}>
        <h2 className="text-xl font-semibold">Lorebook / World Info</h2>
      </div>

      {/* Lorebook Metadata */}
      <div className="space-y-4 mb-6">
        <div>
          <label className={`block text-sm font-medium mb-1 ${labelClasses}`}>
            Lorebook Name
          </label>
          <input
            type="text"
            value={lorebook.name || ''}
            onChange={(e) => handleLorebookMetaChange('name', e.target.value)}
            placeholder="Optional lorebook name"
            className={`w-full p-2 border rounded-md shadow-sm text-sm ${inputClasses}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${labelClasses}`}>
            Description
          </label>
          <textarea
            value={lorebook.description || ''}
            onChange={(e) => handleLorebookMetaChange('description', e.target.value)}
            placeholder="Optional lorebook description"
            rows={2}
            className={`w-full p-2 border rounded-md shadow-sm text-sm ${inputClasses}`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${labelClasses}`}>
              Scan Depth
            </label>
            <input
              type="number"
              value={lorebook.scan_depth ?? ''}
              onChange={(e) => handleLorebookMetaChange('scan_depth', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Optional"
              className={`w-full p-2 border rounded-md shadow-sm text-sm ${inputClasses}`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${labelClasses}`}>
              Token Budget
            </label>
            <input
              type="number"
              value={lorebook.token_budget ?? ''}
              onChange={(e) => handleLorebookMetaChange('token_budget', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Optional"
              className={`w-full p-2 border rounded-md shadow-sm text-sm ${inputClasses}`}
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={lorebook.recursive_scanning ?? false}
                onChange={(e) => handleLorebookMetaChange('recursive_scanning', e.target.checked)}
                className="mr-2"
              />
              <span className={`text-sm ${labelClasses}`}>Recursive Scanning</span>
            </label>
          </div>
        </div>
      </div>

      <hr className={`border-dashed mb-4 ${theme === 'light' ? 'border-neutral-200' : 'border-neutral-700'}`} />

      {/* Entries Section */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Entries ({lorebook.entries.length})</h3>
        <button
          onClick={handleAddEntry}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${primaryButtonClasses}`}
        >
          <PlusIcon className="w-4 h-4" />
          Add Entry
        </button>
      </div>

      <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-3">
        {lorebook.entries.length === 0 ? (
          <div className={`text-center py-8 ${theme === 'light' ? 'text-neutral-500' : 'text-neutral-400'}`}>
            <p>No entries yet. Click "Add Entry" to create your first lorebook entry.</p>
          </div>
        ) : (
          lorebook.entries.map((entry, index) => {
            const isExpanded = expandedEntries.has(entry.id);
            return (
              <div key={entry.id} className={`border rounded-md p-3 ${entryCardClasses}`}>
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => toggleExpanded(entry.id)}
                    className="flex items-center gap-2 flex-grow text-left"
                  >
                    {isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                    <span className="font-medium">
                      {entry.name || `Entry #${index + 1}`}
                    </span>
                    {!entry.enabled && (
                      <span className="text-xs px-2 py-0.5 rounded bg-neutral-500 text-white">Disabled</span>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className={`p-1.5 rounded transition-colors ${dangerButtonClasses}`}
                    title="Delete entry"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>

                {isExpanded && (
                  <div className="space-y-3 mt-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${labelClasses}`}>
                          Entry Name
                        </label>
                        <input
                          type="text"
                          value={entry.name || ''}
                          onChange={(e) => handleEntryChange(entry.id, 'name', e.target.value)}
                          placeholder="Optional display name"
                          className={`w-full p-2 border rounded-md shadow-sm text-sm ${inputClasses}`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-medium mb-1 ${labelClasses}`}>
                          Priority / Order
                        </label>
                        <input
                          type="number"
                          value={entry.insertion_order}
                          onChange={(e) => handleEntryChange(entry.id, 'insertion_order', parseInt(e.target.value) || 0)}
                          className={`w-full p-2 border rounded-md shadow-sm text-sm ${inputClasses}`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs font-medium mb-1 ${labelClasses}`}>
                        Keys (comma-separated) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={entry.key.join(', ')}
                        onChange={(e) => handleEntryChange(entry.id, 'key', e.target.value.split(',').map(k => k.trim()).filter(Boolean))}
                        placeholder="trigger, keywords, phrases"
                        className={`w-full p-2 border rounded-md shadow-sm text-sm ${inputClasses}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-medium mb-1 ${labelClasses}`}>
                        Content <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={entry.content}
                        onChange={(e) => handleEntryChange(entry.id, 'content', e.target.value)}
                        placeholder="The content to inject when keys are matched..."
                        rows={4}
                        className={`w-full p-2 border rounded-md shadow-sm text-sm ${inputClasses}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-medium mb-1 ${labelClasses}`}>
                        Secondary Keys (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={(entry.keysecondary || []).join(', ')}
                        onChange={(e) => handleEntryChange(entry.id, 'keysecondary', e.target.value.split(',').map(k => k.trim()).filter(Boolean))}
                        placeholder="optional, secondary, triggers"
                        className={`w-full p-2 border rounded-md shadow-sm text-sm ${inputClasses}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-medium mb-1 ${labelClasses}`}>
                        Comment
                      </label>
                      <input
                        type="text"
                        value={entry.comment || ''}
                        onChange={(e) => handleEntryChange(entry.id, 'comment', e.target.value)}
                        placeholder="Notes about this entry"
                        className={`w-full p-2 border rounded-md shadow-sm text-sm ${inputClasses}`}
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={entry.enabled}
                          onChange={(e) => handleEntryChange(entry.id, 'enabled', e.target.checked)}
                          className="mr-2"
                        />
                        <span className={`text-xs ${labelClasses}`}>Enabled</span>
                      </label>

                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={entry.use_regex || false}
                          onChange={(e) => handleEntryChange(entry.id, 'use_regex', e.target.checked)}
                          className="mr-2"
                        />
                        <span className={`text-xs ${labelClasses}`}>Use Regex</span>
                      </label>

                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={entry.constant || false}
                          onChange={(e) => handleEntryChange(entry.id, 'constant', e.target.checked)}
                          className="mr-2"
                        />
                        <span className={`text-xs ${labelClasses}`}>Always Active</span>
                      </label>

                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={entry.case_sensitive || false}
                          onChange={(e) => handleEntryChange(entry.id, 'case_sensitive', e.target.checked)}
                          className="mr-2"
                        />
                        <span className={`text-xs ${labelClasses}`}>Case Sensitive</span>
                      </label>

                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={entry.selective || false}
                          onChange={(e) => handleEntryChange(entry.id, 'selective', e.target.checked)}
                          className="mr-2"
                        />
                        <span className={`text-xs ${labelClasses}`}>Selective</span>
                      </label>
                    </div>

                    <div>
                      <label className={`block text-xs font-medium mb-1 ${labelClasses}`}>
                        Position
                      </label>
                      <select
                        value={entry.position || ''}
                        onChange={(e) => handleEntryChange(entry.id, 'position', e.target.value || undefined)}
                        className={`w-full p-2 border rounded-md shadow-sm text-sm ${inputClasses}`}
                      >
                        <option value="">Default</option>
                        <option value="before_char">Before Character</option>
                        <option value="after_char">After Character</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LorebookManager;