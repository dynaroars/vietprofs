// One delegated handler covers the directory and generated profile/hub pages.
document.addEventListener('click', async (event) => {
  const button =
    event.target instanceof Element ? event.target.closest('[data-share-title]') : null;
  if (!button) return;
  const url = button.dataset.shareUrl || location.href;
  const title = button.dataset.shareTitle || document.title;
  if (navigator.share) {
    try {
      await navigator.share({ url, title });
      return;
    } catch (error) {
      if (error.name === 'AbortError') return;
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    button.title = 'Link copied!';
    setTimeout(() => {
      button.title = 'Share this page';
    }, 1500);
  } catch {
    window.prompt('Copy this link:', url);
  }
});
