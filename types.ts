export interface LorebookEntry {
  id: number | string;
  keys: string[];
  content: string;
  enabled: boolean;
  insertion_order: number;
  use_regex: boolean;
  constant?: boolean;
  case_sensitive?: boolean;
  name?: string;
  priority?: number;
  comment?: string;
  selective?: boolean;
  secondary_keys?: string[];
  position?: 'before_char' | 'after_char';
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