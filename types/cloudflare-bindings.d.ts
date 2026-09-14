type RateLimiter = {
  limit(options: { key: string }): Promise<{ success: boolean }>;
};

declare global {
  interface CloudflareEnv {
    IMAGE_UPLOAD_BURST_LIMIT?: RateLimiter;
    IMAGE_UPLOAD_LIMIT?: RateLimiter;
  }
}

export {};
