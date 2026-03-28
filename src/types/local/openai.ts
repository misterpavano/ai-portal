export type Assistant = {
  id: string;
  object: string;
  created_at: number;
  name: string;
  description: string | null;
  model: string;
  instructions: string;
  tools: Array<{ type: string }>;
  tool_resources?: {
    file_search?: {
      vector_store_ids: string[];
    };
  };
  metadata?: Record<string, any>;
};

export type FileItem = {
  id: string;
  object: string;
  bytes: number;
  created_at: number;
  filename: string;
  purpose: string;
  status?: string;
  status_details?: string;
};

export type VectorStore = {
  id: string;
  object: string;
  created_at: number;
  name: string;
  usage_bytes: number;
  file_counts: {
    in_progress: number;
    completed: number;
    failed: number;
    cancelled: number;
    total: number;
  };
  status: string;
  expires_after?: {
    anchor: string;
    days: number;
  };
  expires_at?: number;
  last_active_at: number;
  metadata?: Record<string, any>;
};

export type Thread = {
  id: string;
  object: string;
  created_at: number;
  metadata?: Record<string, any>;
};
