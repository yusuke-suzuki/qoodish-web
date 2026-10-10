type RateLimiter = {
  limit(options: { key: string }): Promise<{ success: boolean }>;
};

type AnalyticsEngineDataset = {
  writeDataPoint(event: {
    indexes?: string[];
    blobs?: string[];
    doubles?: number[];
  }): void;
};

type KvNamespace = {
  get(key: string, type: 'json'): Promise<unknown>;
};

declare global {
  interface CloudflareEnv {
    IMAGE_UPLOAD_BURST_LIMIT?: RateLimiter;
    IMAGE_UPLOAD_LIMIT?: RateLimiter;
    ANALYTICS_EVENTS?: AnalyticsEngineDataset;
    MAINTENANCE?: KvNamespace;
  }
}

export {};
