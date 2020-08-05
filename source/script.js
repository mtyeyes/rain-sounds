if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
    .catch(err => {
      console.error('service-worker not installed');
    });
  });
};

const minutesToMilliseconds = (minutes) => {
  return minutes * 60000
};

class CallFunctionOnDeviceRotate {
  constructor(functionRef, functionArguments, context, threshold) {
    this.previousOrientation = undefined;
    this.rotateCounter = 0;
    this.threshold = threshold;
    this.functionToCall = functionRef;
    this.functionContext = context;
    this.functionArgumets = (typeof functionArguments === 'string') ? [functionArguments] : functionArguments;
    window.addEventListener('deviceorientation', (e) => {
      this.ifRotatedCallFunction(e);
    });
  };
  ifRotatedCallFunction(e) {
    if(this.checkIfRotated(e.alpha)) {this.invokeFunction()};
  };
  invokeFunction() {
    this.functionToCall.apply(this.functionContext, this.functionArgumets);
  };
  checkIfRotated(currentOrientation) {
    if (!this.previousOrientation || this.isUnderRotated(currentOrientation)) {
      this.updatePreviousOrientation(currentOrientation);
      return false
    };
    this.rotateCounter++;
    this.updatePreviousOrientation(currentOrientation);
    if (this.rotateCounter >= 2) {
      this.rotateCounter = 0;
      return true
    } else {
      return false
    };
  };
  updatePreviousOrientation(degrees) {
    this.previousOrientation = degrees;
  };
  isUnderRotated(newOrientation) {
    if (Math.abs(this.previousOrientation - newOrientation) <= this.threshold) {
      return true
    } else {
      return false
    }
  }
};

class Wakelock {
  constructor() {
    this.state = 'unlocked';
    this.wakelock = null;
    this.container = document.querySelector('html');
  };
  async lock() {
    try {
      if (this.state !== 'unlocked') {return};
      this.wakelock = await navigator.wakeLock.request('screen');
      this.state = 'locked';
      this.container.classList.add('powersave');
    } catch(error) {
      console.error(`${err.name}, ${err.message}`);
    };
  };
  unlock() {
    if (this.state !== 'locked') {return};
    this.wakelock.release();
    this.state = 'unlocked';
    this.container.classList.remove('powersave');
  };
}

class RainSoundPlayer {
  constructor() {
    this.audio = document.querySelector('#rainAudio');
    this.audio.volume = 0;
    this.playBtn = document.querySelector('#playBtn');
    this.playBtn.addEventListener('click', ()=>{this.run('btn')});
    if ('DeviceOrientationEvent' in window) {
      new CallFunctionOnDeviceRotate(this.run, 'rotation', this, 80);
    };
    if ('wakeLock' in navigator) {
      this.wakeLock = new Wakelock();
    }
  };
  startPlayback(minutes) {
    this.gradualVolumeChange('fadeIn');
    this.playbackStatus = 'started';
    this.stopPlaybackTime = Date.now() + minutesToMilliseconds(minutes);
    this.adjustRefreshTime(minutes);
    if (this.wakeLock) {wakelock.lock()};
    this.refreshTimeout = setTimeout(() => {this.refresh()}, this.refreshInterval);
  };
  stopPlayback() {
    this.audio.volume = 0;
    this.playbackStatus = 'stopped';
    if (this.wakeLock) {wakelock.unlock()};
    setTimeout(()=>{this.blockPlayback()}, minutesToMilliseconds(15));
  };
  restartTimer() {
    this.stopPlaybackTime = Date.now() + minutesToMilliseconds(15);
    if (this.audio.volume < 1) {this.gradualVolumeChange('fadeIn')};
    this.adjustRefreshTime(15);
    this.refreshTimeout = setTimeout(() => {this.refresh()}, this.refreshInterval);
  };
  refresh() {
    const timeUntilPause = (this.stopPlaybackTime - Date.now()) / minutesToMilliseconds(1);
    if (timeUntilPause <= 3 || !this.volumeChangeTimeout) {this.gradualVolumeChange('fadeOut')};
    if (timeUntilPause <= 0) {this.stopPlayback(); return};
    this.adjustRefreshTime(timeUntilPause);
    clearTimeout(this.refreshTimeout);
    this.refreshTimeout = setTimeout(() => {this.refresh()}, this.refreshInterval);
  };
  adjustRefreshTime(minutesUntilPause) {
    (minutesUntilPause >= minutesToMilliseconds(5)) ? this.refreshInterval = minutesToMilliseconds(5) : this.refreshInterval = minutesToMilliseconds(0.5);
  };
  gradualVolumeChange(fadeInOrOut) {
    if (fadeInOrOut === 'fadeIn') {
      if (this.audio.volume >= 0.95) {this.audio.volume = 1; return} else {this.audio.volume += 0.05};
    } else {
      if (this.audio.volume <= 0.05) {this.audio.volume = 0; return} else {this.audio.volume -= 0.05};
    };
    let volumeChangeInterval;
    (fadeInOrOut === 'fadeIn') ? volumeChangeInterval = minutesToMilliseconds(0.02) : volumeChangeInterval = minutesToMilliseconds(0.15);
    clearTimeout(this.volumeChangeTimeout);
    this.volumeChangeTimeout = setTimeout(() => {
      this.gradualVolumeChange(fadeInOrOut)
    }, volumeChangeInterval);
  };
  blockPlayback() {
    if (this.playbackStatus !== 'stopped') {return};
    this.playBtn.classList.add('push-to-unlock');
    this.playbackStatus = 'blocked';
  };
  run(inputMethod) {
    switch(this.playbackStatus) {
      case 'started':
        this.restartTimer();
        break;
      case 'blocked':
        if (inputMethod === 'btn') {
          this.playBtn.classList.remove('push-to-unlock');
          this.startPlayback(15)};
        break;
      default:
        this.startPlayback(15);
    };
  };
};

new RainSoundPlayer();
