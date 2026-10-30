// One delegated handler covers the directory and generated profile/hub pages.
const feedbackTimers = new WeakMap();

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
    clearTimeout(feedbackTimers.get(button));
    const label = button.querySelector('span');
    if (label) label.textContent = 'Link copied!';
    button.setAttribute('aria-label', 'Link copied!');
    button.title = 'Link copied!';
    feedbackTimers.set(
      button,
      setTimeout(() => {
        if (label) label.textContent = 'Share';
        button.setAttribute('aria-label', 'Share');
        button.title = 'Share this page';
        feedbackTimers.delete(button);
      }, 1500),
    );
  } catch {
    window.prompt('Copy this link:', url);
  }
});
