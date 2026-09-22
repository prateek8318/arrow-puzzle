import Sound from 'react-native-sound';

// Enable playback in silence mode
Sound.setCategory('Playback');

class SoundManagerClass {
  private music: Sound | null = null;
  private sfxWhoosh: Sound | null = null;
  private sfxError: Sound | null = null;
  private sfxWin: Sound | null = null;
  private sfxFail: Sound | null = null;
  private sfxClick: Sound | null = null;
  
  private musicEnabled = true;
  private sfxEnabled = true;

  init() {
    // Note: In a real app, you need actual .mp3 files in android/app/src/main/res/raw/ and ios/ group
    // We instantiate them here. They will fail gracefully if files are missing.
    this.music = new Sound('bg_music.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (!error && this.music) {
        this.music.setNumberOfLoops(-1);
        if (this.musicEnabled) this.music.play();
      }
    });

    this.sfxWhoosh = new Sound('sfx_whoosh.mp3', Sound.MAIN_BUNDLE);
    this.sfxError = new Sound('sfx_error.mp3', Sound.MAIN_BUNDLE);
    this.sfxWin = new Sound('sfx_win.mp3', Sound.MAIN_BUNDLE);
    this.sfxFail = new Sound('sfx_fail.mp3', Sound.MAIN_BUNDLE);
    this.sfxClick = new Sound('sfx_click.mp3', Sound.MAIN_BUNDLE);
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (this.music) {
      if (enabled) {
        this.music.play();
      } else {
        this.music.pause();
      }
    }
  }

  setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
  }

  playWhoosh() {
    if (this.sfxEnabled && this.sfxWhoosh) this.sfxWhoosh.play();
  }

  playError() {
    if (this.sfxEnabled && this.sfxError) this.sfxError.play();
  }

  playWin() {
    if (this.sfxEnabled && this.sfxWin) this.sfxWin.play();
  }

  playFail() {
    if (this.sfxEnabled && this.sfxFail) this.sfxFail.play();
  }

  playClick() {
    if (this.sfxEnabled && this.sfxClick) this.sfxClick.play();
  }
}

export const SoundManager = new SoundManagerClass();
