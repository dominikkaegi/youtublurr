
const timeUntilBlurrInput = document.getElementById('blurr-time');
const blurrDurationInput = document.getElementById('blurr-duration');

document.addEventListener('DOMContentLoaded', () => {
  timeUntilBlurrInput.focus();

  chrome.storage.local.get(['config'], (resp) => {
    const {config: {settings: {
      blurrDuration,
      timeUntilBlurr
    }}} = resp;
  
    timeUntilBlurrInput.value = timeUntilBlurr;
    blurrDurationInput.value = blurrDuration * 1000;
  });
  
})

document.getElementById('settings-form').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const blurrTime = parseInt(timeUntilBlurrInput.value);
  const blurrDuration = parseInt(blurrDurationInput.value) / 1000;

  chrome.storage.local.get(['config'], (resp) => {
    const {config} = resp;
    config.settings.timeUntilBlurr = blurrTime;
    config.settings.blurrDuration = blurrDuration;
      
    chrome.storage.local.set({config}, () => {
      chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];

        chrome.tabs.sendMessage(activeTab.id, config.messages.toggleOnce, () => window.close());
       });
    });
  });
});