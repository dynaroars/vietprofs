export const STAR_ICON = '<path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>';

let toastHideTimer = 0;

export function applyFavoriteToggle(button: HTMLButtonElement, favorited: boolean) {
  button.classList.toggle('is-favorite', favorited);
  button.setAttribute('aria-pressed', favorited ? 'true' : 'false');
  const label = favorited ? 'Remove from favorites' : 'Add to favorites';
  button.setAttribute('aria-label', label);
  button.title = label;
}

function showFavoriteToast(message: string) {
  let toast = document.getElementById('favorite-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'favorite-toast';
    toast.className = 'favorite-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(toastHideTimer);
  toastHideTimer = window.setTimeout(() => toast?.classList.remove('is-visible'), 2000);
}

export function celebrateFavorite(button: HTMLButtonElement, name: string) {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    button.classList.add('favorite-pop');
    const clear = () => button.classList.remove('favorite-pop');
    button.addEventListener('animationend', clear, { once: true });
    window.setTimeout(clear, 400);
  }
  showFavoriteToast(`${name} has been starred`);
}
