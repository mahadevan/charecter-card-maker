
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
}

export interface CharacterImage {
  file: File | null;
  objectURL: string | null;
}
