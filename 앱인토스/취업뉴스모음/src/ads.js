import { TossAds } from '@apps-in-toss/web-framework';

const AD_GROUP_ID = 'ait.v2.live.8d33d2477f554ba7';
let initialized = false;
let latestFeed = { showAd: false };
let attachedBanner = null;

function clearBanner() {
  try { attachedBanner?.destroy(); } catch {}
  attachedBanner = null;
  document.querySelector('#news-banner-ad')?.remove();
}

function mountBanner() {
  clearBanner();
  if (!initialized || !latestFeed.showAd) return;

  const cards = document.querySelectorAll('#news-list > .news-card');
  if (cards.length < 5) return;

  const host = document.createElement('div');
  host.id = 'news-banner-ad';
  host.className = 'ad-banner-slot';
  host.setAttribute('aria-label', '광고');
  cards[4].after(host);

  const removeEmptyAd = () => {
    if (host.isConnected) host.remove();
  };

  try {
    attachedBanner = TossAds.attachBanner(AD_GROUP_ID, host, {
      theme: 'auto',
      tone: 'grey',
      variant: 'card',
      callbacks: {
        onAdRendered: () => host.classList.add('is-ready'),
        onNoFill: removeEmptyAd,
        onAdFailedToRender: removeEmptyAd,
      },
    });
  } catch {
    removeEmptyAd();
  }
}

window.addEventListener('jobdahan:feed-rendered', event => {
  latestFeed = event.detail || { showAd: false };
  mountBanner();
});

if (TossAds.initialize.isSupported()) {
  TossAds.initialize({
    callbacks: {
      onInitialized: () => {
        initialized = true;
        mountBanner();
      },
      onInitializationFailed: clearBanner,
    },
  });
}
