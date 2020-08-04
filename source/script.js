if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
    .catch(err => {
      console.error('service-worker not installed');
    });
  });
};

const minutesToMilliseconds = (minutes) => {
  return minutes * 60000;
};

// class CallFunctionOnShake {
//   constructor(functionRef, functionArguments, context, timeframe, threshold) {
//     this.deviceMoveHistory = [];
//     this.threshold = threshold;
//     this.timeframe = timeframe;
//     this.functionToCall = functionRef;
//     this.functionContext = context;
//     this.functionArgumets = functionArguments;
//     window.addEventListener('devicemotion', (e) => {
//       this.ifShakeCallFunction(e);
//     });
//   };
//   ifShakeCallFunction(e) {
//     this.updateHistory(e);
//     if(this.checkIfShake(e)) {this.invokeFunction()};
//   };
//   invokeFunction() {
//     this.functionToCall.apply(this.functionContext, this.functionArgumets);
//   };
//   checkIfShake(e) {
//     if (this.deviceMoveHistory.length < 2) {return};
//     const findDelta = (axis, i = 0) => {
//       let currentCoordinates = this.deviceMoveHistory[i];
//       let previousCoordinates = this.deviceMoveHistory[i+1]
//       if(i > (this.deviceMoveHistory.length - 2) || Date.now() > (previousCoordinates.timeOfMove + this.timeframe)) {return 0};
//       return Math.abs(currentCoordinates[axis] - previousCoordinates[axis]) + findDelta(axis, i+1);
//     };
//     if (findDelta('x') > this.threshold || findDelta('y') > this.threshold || findDelta('z') > this.threshold) {
//       this.invokeFunction();
//     };
//   };
//   updateHistory(e) {
//     const x = e.accelerationIncludingGravity.x;
//     const y = e.accelerationIncludingGravity.y;
//     const z = e.accelerationIncludingGravity.z;
//     const timeOfMove = Date.now();
//     if (this.deviceMoveHistory.length === 4) {this.deviceMoveHistory.pop()};
//     this.deviceMoveHistory.unshift({x,y,z,timeOfMove});
//   };
// };

class RainSoundPlayer {
  constructor() {
    this.audio = document.querySelector('#rainAudio');
    this.audio.volume = 0;
    this.playBtn = document.querySelector('#playBtn');
    this.playBtn.addEventListener('click', ()=>{this.run('btn')});
  };
  startPlayback(minutes) {
    this.playbackStatus = 'started';
    this.gradualVolumeChange('fadeIn');
    this.stopPlaybackTime = Date.now() + minutesToMilliseconds(minutes);
    this.adjustRefreshTime(minutes);
    this.refreshTimeout = setTimeout(() => {this.refresh()}, this.refreshInterval);
  };
  stopPlayback() {
    this.audio.volume = 0;
    setTimeout(()=>{this.blockPlayback()}, minutesToMilliseconds(10));
  };
  restartTimer() {
    this.stopPlaybackTime = Date.now() + minutesToMilliseconds(15);
    if (this.audio.volume < 1) {this.gradualVolumeChange('fadeIn')};
    this.adjustRefreshTime(15);
    this.refreshTimeout = setTimeout(() => {this.refresh()}, this.refreshInterval);
  };
  refresh() {
    console.log(this.audio.volume);
    const timeUntilPause = (this.stopPlaybackTime - Date.now()) / minutesToMilliseconds(1);
    if (timeUntilPause <= 3) {this.gradualVolumeChange('fadeOut')};
    if (timeUntilPause <= 0) {this.stopPlayback(); return};
    this.adjustRefreshTime(timeUntilPause);
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
    this.playbackStatus = 'blocked';
  };
  run(inputMethod) {
    switch(this.playbackStatus) {
      case 'started':
        this.restartTimer();
        break;
      case 'blocked':
        if (inputMethod === 'btn') {this.startPlayback(30)};
        break;
      default:
        this.startPlayback(30);
    };
  };
};

new RainSoundPlayer();
