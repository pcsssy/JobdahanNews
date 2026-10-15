import { TossAds } from '@apps-in-toss/web-framework';

const AD_GROUP_ID = 'ait.v2.live.8d33d2477f554ba7';
let initialized = false;
let latestFeed = { showAd: false };
let attachedBanners = [];

function clearBanner() {
  for (const banner of attachedBanners) {
    try { banner.destroy(); } catch {}
  }
  attachedBanners = [];
  document.querySelectorAll('.ad-banner-slot').forEach(slot => slot.remove());
}

function mountBanner() {
  clearBanner();
  if (!initialized || !latestFeed.showAd) return;

  const cards = [...document.querySelectorAll('#news-list > .news-card')];
  if (cards.length < 5) return;

  for (let index = 4; index < cards.length; index += 5) {
    const host = document.createElement('div');
    host.id = `news-banner-ad-${Math.floor(index / 5) + 1}`;
    host.className = 'ad-banner-slot';
    host.setAttribute('aria-label', '광고');
    cards[index].after(host);

    const removeEmptyAd = () => {
      if (host.isConnected) host.remove();
    };

    try {
      const banner = TossAds.attachBanner(AD_GROUP_ID, host, {
        theme: 'auto',
        tone: 'grey',
        variant: 'card',
        callbacks: {
          onAdRendered: () => host.classList.add('is-ready'),
          onNoFill: removeEmptyAd,
          onAdFailedToRender: removeEmptyAd,
        },
      });
      attachedBanners.push(banner);
    } catch {
      removeEmptyAd();
    }
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
