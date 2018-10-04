const YOUTUBE_PLAYER_ID = 'player';

function Timer() {
  let time;

  function setNew(fn, t) {
    clearTimeout(time);
    time = setTimeout(() => {
      fn();
    }, t)
  }
  return {
    setNew
  }
}

function State() {
  const BLURRED = 'blurred';
  const UNBLURRED = 'unblurred';
  let state = UNBLURRED

  function toggle() {
    if(state === UNBLURRED) {
      state = BLURRED;
    } else {
      state = UNBLURRED;
    }
  }

  function isBlurred() {
    return state === BLURRED
  }

  return {
    toggle,
    isBlurred
  }
}

function Blurrer(timer, state) {
  this.timer = timer;
  this.state = state;
  this.DEFAULT_TIME_UNTIL_BLURR = 3000;

  function blur(blurIt) {
    const regWatch = /www.youtube.com\/watch/;
    if (regWatch.test(document.URL)) {
      chrome.storage.local.get(['config'], (resp) => {
        const {config: {settings: {blurrDuration}}} = resp;

        const secondary = document.getElementById("secondary")
        if(secondary) {
          secondary.style.filter = blurIt ? 'blur(10px)' : 'none';
          secondary.style.transition = blurIt ? `filter ${blurrDuration}s ease-in` : '';
        }
  
        const primary = Array.from(document.getElementById('primary-inner').childNodes)
        const siblings = primary.filter(item => item.id !== YOUTUBE_PLAYER_ID  && item.nodeType === 1);
        siblings.forEach((item) => {
          item.style.filter = blurIt ? 'blur(10px)' : 'none';
          item.style.transition = blurIt ? `filter ${blurrDuration}s ease-in` : '';
        });
      })
    }
  }

  function toggle(){
    if(state.isBlurred()) {
      blur(false)
      state.toggle();
    } else {
      console.log('blurring now')
      chrome.storage.local.get(['config'], (response) => {
        const {config: {settings: {timeUntilBlurr}}} = response; 

        if (!timeUntilBlurr) timeUntilBlurr = this.DEFAULT_TIME_UNTIL_BLURR

        timer.setNew(() => {
          blur(true);
          state.toggle();
        }, timeUntilBlurr);
      })
    }
  }

  function forceBlurr() {
    if(!state.isBlurred) {
      toggle();
    }
  }

  function start() {
    toggle()
    document.body.addEventListener('mousemove', toggle);
    window.addEventListener('scroll', toggle)
  }
  
  return {start, forceBlurr}
}

function processMessage(msg) {
  chrome.storage.local.get(['config'], (resp) => {
    const {config: {messages}} = resp

    switch (msg) {
      case messages.startBlurr:
        blurrer.start();
        break;
      case messages.toggleOnce:
        blurrer.forceBlurr();
        break;
    }
  });
}

const timer = new Timer();
const state = new State();
const blurrer = new Blurrer(timer, state);


chrome.runtime.onMessage.addListener(processMessage);