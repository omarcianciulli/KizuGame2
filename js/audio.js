(function () {
  'use strict';

  const TRACKS = Object.freeze([
    Object.freeze({ id: 'bam-bam', title: 'Bam bam', artist: 'goofy / паранойя / dadbackwood / eelijahh type beat', src: './assets/audio/bam-bam.mp3' }),
    Object.freeze({ id: 'glass-jaw', title: 'Glass jaw', artist: 'slayr + waera type beat', src: './assets/audio/glass-jaw.mp3' }),
    Object.freeze({ id: 'escape-matrix', title: 'Escape matrix', artist: 'twentythree type beat', src: './assets/audio/escape-matrix.mp3' }),
    Object.freeze({ id: 'no-peace', title: 'No peace', artist: 'slayr + waera · beat switch', src: './assets/audio/no-peace.mp3' }),
    Object.freeze({ id: 'young-money', title: '2010 / R&B / Young Money', artist: 'type beat', src: './assets/audio/young-money.mp3' })
  ]);

  /** One persistent media element: chapter changes remain compatible with iOS audio unlock. */
  class NastyAudio {
    constructor(options = {}) {
      if (typeof options === 'function') options = { onChange: options };
      this._onChange = typeof options.onChange === 'function' ? options.onChange : () => {};
      this._audio = new Audio();
      this._audio.preload = 'metadata';
      this._audio.loop = true;
      this._audio.playsInline = true;
      this._audio.setAttribute('playsinline', '');
      this._audio.setAttribute('webkit-playsinline', '');
      this._volume = Number.isFinite(options.volume) ? Math.max(0, Math.min(1, options.volume)) : 0.55;
      this._muted = Boolean(options.muted);
      this._audio.volume = this._volume;
      this._audio.muted = this._muted;
      this._track = null;
      this._unlocked = false;
      this._wantedPlaying = false;
      this._error = null;
      this._positions = new Map();
      this._pendingSeek = null;
      this._generation = 0;
      this._destroyed = false;
      this._listeners = [];

      this._listen('loadedmetadata', () => {
        this._restorePosition();
        this._emit();
      });
      this._listen('canplay', () => {
        this._restorePosition();
        this._emit();
      });
      this._listen('playing', () => {
        this._error = null;
        this._emit();
      });
      this._listen('pause', () => this._emit());
      this._listen('ended', () => this._emit());
      this._listen('error', () => {
        const code = this._audio.error ? this._audio.error.code : 0;
        if (code === 1) return;
        this._error = code === 2
          ? 'La musica non è stata caricata. Controlla la connessione e tocca la nota per riprovare.'
          : 'Non riesco ad aprire questa traccia. Tocca la nota per riprovare.';
        this._emit();
      });
    }

    static getTracks() {
      return TRACKS.map(track => ({ ...track }));
    }

    getTracks() {
      return NastyAudio.getTracks();
    }

    _listen(name, callback) {
      this._audio.addEventListener(name, callback);
      this._listeners.push([name, callback]);
    }

    _emit() {
      if (!this._destroyed) this._onChange(this.getState());
    }

    _rememberPosition() {
      if (this._track && Number.isFinite(this._audio.currentTime)) {
        this._positions.set(this._track.id, this._audio.currentTime);
      }
    }

    _restorePosition() {
      if (this._pendingSeek === null || this._audio.readyState < 1) return;
      const duration = this._audio.duration;
      const position = Number.isFinite(duration) && duration > 0
        ? Math.max(0, Math.min(this._pendingSeek, Math.max(0, duration - 0.05)))
        : Math.max(0, this._pendingSeek);
      try {
        this._audio.currentTime = position;
        this._pendingSeek = null;
      } catch (_) {
        // Some Safari versions permit seeking only after canplay.
      }
    }

    _play() {
      if (this._destroyed || !this._track || !this._unlocked || !this._wantedPlaying) {
        return Promise.resolve(false);
      }
      const generation = this._generation;
      let request;
      try {
        // Keep play() synchronous with the caller's tap: never wait for metadata first.
        request = this._audio.play();
      } catch (error) {
        return Promise.resolve(this._handlePlayError(error, generation));
      }
      return Promise.resolve(request).then(() => {
        if (this._destroyed || generation !== this._generation) return false;
        this._error = null;
        this._emit();
        return true;
      }).catch(error => this._handlePlayError(error, generation));
    }

    _handlePlayError(error, generation) {
      if (this._destroyed || generation !== this._generation) return false;
      if (error && error.name === 'AbortError') return false;
      if (error && error.name === 'NotAllowedError') {
        this._unlocked = false;
        this._error = 'Tocca la nota per avviare la musica.';
      } else {
        this._error = 'La musica non è partita. Tocca la nota per riprovare.';
      }
      this._emit();
      return false;
    }

    /** Select accepts a track id or its chapter index (0–4). It never requests permission by itself. */
    select(trackId, { restart = false } = {}) {
      if (this._destroyed) return Promise.resolve(false);
      const track = typeof trackId === 'number'
        ? TRACKS[trackId]
        : TRACKS.find(item => item.id === trackId);
      if (!track) {
        this._error = 'Traccia non disponibile.';
        this._emit();
        return Promise.resolve(false);
      }

      this._wantedPlaying = true;
      if (this._track && this._track.id === track.id) {
        if (restart) {
          this._positions.set(track.id, 0);
          this._pendingSeek = 0;
          this._restorePosition();
        }
        this._error = null;
        this._emit();
        return this._play();
      }

      this._rememberPosition();
      this._generation += 1;
      this._audio.pause();
      this._track = track;
      this._pendingSeek = restart ? 0 : (this._positions.get(track.id) || 0);
      this._error = null;
      this._audio.src = track.src;
      this._audio.load();
      this._restorePosition();
      this._emit();
      return this._play();
    }

    /** Call directly from a click/pointer event, including the initial Start button. */
    unlock() {
      if (this._destroyed) return Promise.resolve(false);
      this._unlocked = true;
      this._wantedPlaying = true;
      this._error = null;
      if (this._audio.error) {
        this._rememberPosition();
        this._pendingSeek = this._track ? (this._positions.get(this._track.id) || 0) : 0;
        this._audio.load();
      }
      this._emit();
      return this._play();
    }

    setMuted(muted) {
      this._muted = Boolean(muted);
      this._audio.muted = this._muted;
      this._emit();
      return this._muted;
    }

    setVolume(volume) {
      const numeric = Number(volume);
      if (!Number.isFinite(numeric)) return this._volume;
      this._volume = Math.max(0, Math.min(1, numeric));
      this._audio.volume = this._volume;
      this._emit();
      return this._volume;
    }

    pause() {
      if (this._destroyed) return;
      this._wantedPlaying = false;
      this._rememberPosition();
      this._audio.pause();
      this._emit();
    }

    resume() {
      if (this._destroyed) return Promise.resolve(false);
      this._wantedPlaying = true;
      this._emit();
      return this._play();
    }

    getState() {
      return {
        trackId: this._track ? this._track.id : null,
        title: this._track ? this._track.title : '',
        artist: this._track ? this._track.artist : '',
        muted: this._muted,
        volume: this._volume,
        playing: !this._audio.paused && !this._audio.ended && this._audio.readyState > 2,
        unlocked: this._unlocked,
        error: this._error,
        currentTime: Number.isFinite(this._audio.currentTime) ? this._audio.currentTime : 0,
        duration: Number.isFinite(this._audio.duration) ? this._audio.duration : 0
      };
    }

    destroy() {
      if (this._destroyed) return;
      this._rememberPosition();
      this._destroyed = true;
      this._generation += 1;
      this._audio.pause();
      this._listeners.forEach(([name, callback]) => this._audio.removeEventListener(name, callback));
      this._listeners.length = 0;
      this._audio.removeAttribute('src');
      this._audio.load();
    }
  }

  window.NastyAudio = NastyAudio;
})();
