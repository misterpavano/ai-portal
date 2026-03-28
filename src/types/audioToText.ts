import { TranscriptData } from "./response/openai";

export type AudioToTextFlow = {
  file: File;
  tasks: string[];
  transcriptionOptions: {
    provideSummary: boolean;
    includeTimestamps: boolean;
    includeSpeakerIdentifier: boolean;
  };
  uploadedFile: globalThis.File | null;
  transcript: string | TranscriptData | null;
  transcriptEdits: {
    speakerEdits: Record<string, string>;
    segmentTextEdits: Record<number, string>;
    segmentSpeakerReassignments: Record<number, string>;
  };
  vectorStoreId?: string;
  assistantId?: string;
  summary?: string;
};

export type File = {
  fileId: string;
  fileName: string;
};

export type AudioToTextStep = {
  currentStep: number;
  isFinished?: boolean;
};
