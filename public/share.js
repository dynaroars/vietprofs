// Behavior for the Share menu (see src/share.ts). Delegated, so it also covers markup the
// directory renders after load.
(() => {
  const target = (menu) => ({
    url: menu.dataset.shareUrl || location.href,
    title: menu.dataset.shareTitle || document.title,
  });

  const fillLinks = (menu) => {
    const { url, title } = target(menu);
    for (const link of menu.querySelectorAll('a[data-share-template]')) {
      link.href = link.dataset.shareTemplate
        .replace('{url}', encodeURIComponent(url))
        .replace('{title}', encodeURIComponent(title));
    }
  };

  const copy = async (button, url) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const field = document.createElement('textarea');
      field.value = url;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.append(field);
      field.select();
      document.execCommand('copy');
      field.remove();
    }
    button.dataset.label ||= button.textContent;
    button.textContent = 'Copied!';
    setTimeout(() => { button.textContent = button.dataset.label; }, 1500);
  };

  document.addEventListener('click', async (event) => {
    const clicked = event.target instanceof Element ? event.target : null;
    if (!clicked) return;

    const summary = clicked.closest('.share-menu > summary');
    if (summary) {
      const menu = summary.parentElement;
      fillLinks(menu);
      // On phones, the system share sheet reaches Zalo, Messenger, and the rest.
      if (navigator.share && matchMedia('(pointer: coarse)').matches) {
        event.preventDefault();
        try { await navigator.share(target(menu)); } catch { /* dismissed */ }
      }
      return;
    }

    // Mastodon servers are independent, so ask which one the visitor posts from and remember it.
    const mastodonLink = clicked.closest('a[data-share-mastodon]');
    if (mastodonLink) {
      event.preventDefault();
      const KEY = 'vietprofs:mastodon-server';
      let saved = '';
      try { saved = localStorage.getItem(KEY) || ''; } catch { /* storage blocked */ }
      const answer = prompt('Your Mastodon server (for example mastodon.social):', saved || 'mastodon.social');
      const server = (answer || '').trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '').replace(/^@?[^@\s]*@/, '').toLowerCase();
      if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(server)) return;
      try { localStorage.setItem(KEY, server); } catch { /* storage blocked */ }
      const menu = mastodonLink.closest('.share-menu');
      const { url, title } = target(menu);
      window.open(`https://${server}/share?text=${encodeURIComponent(`${title} ${url}`)}`, '_blank', 'noopener,noreferrer');
      menu.open = false;
      return;
    }

    const copyButton = clicked.closest('[data-share-copy]');
    if (copyButton) {
      await copy(copyButton, target(copyButton.closest('.share-menu')).url);
      return;
    }

    for (const menu of document.querySelectorAll('.share-menu[open]')) {
      if (!menu.contains(clicked) || clicked.closest('a.share-item')) menu.open = false;
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    for (const menu of document.querySelectorAll('.share-menu[open]')) {
      menu.open = false;
      menu.querySelector('summary')?.focus();
    }
  });
})();
