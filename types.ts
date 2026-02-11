export interface GenerationRequest {
  specificationText: string;
  userPrompt: string;
  currentContent?: string; // Optional: Only needed for refinement
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