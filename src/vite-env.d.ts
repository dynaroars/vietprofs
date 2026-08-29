interface ImportMeta {
  readonly env: {
    readonly BASE_URL: string;
  };
}

declare module '*.css';

interface Document {
  getElementById(elementId: 'app'): HTMLElement;
  getElementById(elementId: 'search'): HTMLInputElement;
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
