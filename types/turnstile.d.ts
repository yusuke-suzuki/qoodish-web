declare global {
  type TurnstileRenderOptions = {
    sitekey: string;
    callback?: (token: string) => void;
    'expired-callback'?: () => void;
    'error-callback'?: () => void;
    theme?: 'light' | 'dark' | 'auto';
    size?: 'normal' | 'compact' | 'flexible';
    language?: string;
  };

  type TurnstileApi = {
    render(container: HTMLElement, options: TurnstileRenderOptions): string;
    reset(widgetId?: string): void;
    remove(widgetId: string): void;
  };

  interface Window {
    turnstile?: TurnstileApi;
  }
}

export {};
