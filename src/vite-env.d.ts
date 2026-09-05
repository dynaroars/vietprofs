interface ImportMeta {
  readonly env: {
    readonly BASE_URL: string;
  };
}

declare module '*.css';

declare const __BUILD_COMMIT__: string;
declare const __BUILD_TIMESTAMP__: string;
declare const __BUILD_LABEL__: string;

interface Document {
  getElementById(elementId: 'app'): HTMLElement;
  getElementById(elementId: 'search'): HTMLInputElement;
  getElementById(elementId: 'search-scope'): HTMLSelectElement;
  getElementById(elementId: 'search-suggestion-panel'): HTMLDivElement;
  getElementById(elementId: 'location-filter' | 'field-filter' | 'track-filter'): HTMLSelectElement;
  getElementById(elementId: 'home-link'): HTMLAnchorElement;
  getElementById(elementId: 'roster' | 'examples'): HTMLDivElement;
  getElementById(elementId: 'result-count'): HTMLParagraphElement;
  getElementById(elementId: 'back-to-top'): HTMLButtonElement;
  getElementById(elementId: 'submit-form'): HTMLFormElement;
  getElementById(elementId: 'name'): HTMLInputElement;
  getElementById(elementId: 'name-suggestions' | 'name-match-notice'): HTMLDivElement;
}
