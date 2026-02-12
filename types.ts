export interface GenerationRequest {
  specificationText: string;
  userPrompt: string;
  exampleContent?: string; // New: Optional reference content
  currentContent?: string;
}

export interface GenerationResponse {
  content: string;
  error?: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  UPDATING = 'UPDATING',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}