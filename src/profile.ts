import { applyFavoriteToggle, celebrateFavorite } from './favorites-ui.ts';
import { isFavorite, toggleFavorite } from './favorites-store.ts';

function wireFavoriteToggle(button: HTMLButtonElement) {
  const id = button.dataset.id;
  if (!id) return;
  const name = button.dataset.name?.trim() || 'Professor';
  applyFavoriteToggle(button, isFavorite(id));
  button.addEventListener('click', () => {
    const favorited = toggleFavorite(id);
    applyFavoriteToggle(button, favorited);
    if (favorited) celebrateFavorite(button, name);
  });
}

document.querySelectorAll<HTMLButtonElement>('.favorite-toggle[data-id]').forEach(wireFavoriteToggle);
