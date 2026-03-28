export type AIPersonasFlow = {
  persona: AIPersona;
  file: File;
};

export type File = {
  fileId: string;
  fileName: string;
};

export type AIPersonasStep = {
  currentStep: number;
  isFinished?: boolean;
};

export type AIPersona = {
  id: string;
  name: string;
  role?: string;
  industry?: string;
  description?: string;
  image?: string;
  conversationGoals?: string;
  attributes?: {
    directness: number;
    formality: number;
    detail_oriented: number;
    persuasiveness: number;
    receptiveness: number;
    empathy: number;
    assertiveness: number;
    pacing: number;
    humor: number;
    conciseness: number;
  };
  background?: {
    biases: {
      against: string[];
      in_favor_of: string[];
    };
    pain_points: string[];
    motivations: string[];
    conversation_preferences: {
      preferred_topics: string[];
      avoid_topics: string[];
      persuasive_strategies: string[];
    };
    notes: string[];
  };
};
