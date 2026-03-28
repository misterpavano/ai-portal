import { AIPersonasFlow } from "../types/aiPersonas";

export const initialAIPersonasValues: AIPersonasFlow = {
  persona: {
    id: "",
    name: "",
    role: "",
    industry: "",
    description: "",
    image: "",
    conversationGoals: "",
    attributes: {
      directness: 0,
      formality: 0,
      detail_oriented: 0,
      persuasiveness: 0,
      receptiveness: 0,
      empathy: 0,
      assertiveness: 0,
      pacing: 0,
      humor: 0,
      conciseness: 0,
    },
    background: {
      biases: {
        against: [],
        in_favor_of: [],
      },
      pain_points: [],
      motivations: [],
      conversation_preferences: {
        preferred_topics: [],
        avoid_topics: [],
        persuasive_strategies: [],
      },
      notes: [],
    },
  },
  file: {
    fileId: "",
    fileName: "",
  },
};
