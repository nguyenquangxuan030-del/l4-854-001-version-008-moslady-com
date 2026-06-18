import { H as Hls } from './hls.js';

const setupPlayer = wrapper => {
  const video = wrapper.querySelector('video');
  const overlay = wrapper.querySelector('.player-poster');
  const stream = video ? video.getAttribute('data-stream') : '';
  let hls = null;
  let started = false;

  if (!video || !stream) {
    return;
  }

  const attach = () => {
    if (started) {
      video.play().catch(() => {});
      return;
    }

    started = true;
    wrapper.classList.add('is-ready');
    video.controls = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {});
      }, { once: true });
      video.load();
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data || !data.fatal || !hls) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
          hls = null;
        }
      });
      return;
    }

    video.src = stream;
    video.play().catch(() => {});
  };

  if (overlay) {
    overlay.addEventListener('click', attach);
  }

  video.addEventListener('click', () => {
    if (!started) {
      attach();
    }
  });
};

document.querySelectorAll('[data-player]').forEach(setupPlayer);
