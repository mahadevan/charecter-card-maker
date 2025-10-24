export interface LorebookEntry {
  id: number | string; // Used internally in the UI
  uid?: number; // Used for SillyTavern export
  key: string[];
  keysecondary?: string[];
  content: string;
  comment?: string;
  constant: boolean;
  selective?: boolean;
  selectiveLogic?: number;
  order?: number;
  position?: 'before_char' | 'after_char' | 'after_prompt';
  disable?: boolean;
  addMemo?: boolean;
  excludeRecursion?: boolean;
  probability?: number;
  useProbability?: boolean;
  
  // Fields from the original interface that map to SillyTavern's format
  enabled: boolean;
  name?: string;
  insertion_order: number; // Maps to 'insertion_order' or 'priority'
  case_sensitive: boolean;
  
  // Fields that might not have a direct 1:1 mapping but are in the UI
  use_regex?: boolean;

  // Redundant/legacy fields seen in examples
  secondary_keys?: string[]; // Will be mapped to keysecondary
  priority?: number; // Will be mapped to insertion_order

  extensions?: Record<string, any>;
}

export interface Lorebook {
  name?: string;
  description?: string;
  scan_depth?: number;
  token_budget?: number;
  recursive_scanning?: boolean;
  entries: LorebookEntry[];
  extensions?: Record<string, any>;
}

export interface CharacterCard {
  name: string;
  description: string;
  personality: string;
  scenario: string;
  first_mes: string;
  mes_example: string;
  // V3 Spec fields
  creator_notes?: string;
  system_prompt?: string;
  post_history_instructions?: string;
  tags?: string[];
  creator?: string;
  character_version?: string;
  character_book?: Lorebook;
}

export interface CharacterImage {
  file: File | null;
  objectURL: string | null;
}