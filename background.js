// Default Configuration
const config = {
  messages: {
    startBlurr: 'startBlurr',
    toggleOnce: 'toggleOnce'
  },
  settings: {
    timeUntilBlurr: 3000, // ms
    blurrDuration: 1,  // s
  }
}

// Reset to default configs:
// chrome.storage.local.set({config})

// Set default if none
chrome.storage.local.get(['config'], (resp) => {
  if(!resp.config) chrome.storage.local.set({config})
})

// Manage Activation
chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'www.youtube.com'},
      })
      ],
          actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});


// Start Blurrer
chrome.tabs.onUpdated.addListener(
  function(tabId, changeInfo, tab) {
    const regYoutube = /www.youtube.com/
    console.log('send message');

    if(regYoutube.test(tab.url)) {
      chrome.storage.local.get(['config'], (resp) => {
        console.log(resp);
        const {config: {messages: {startBlurr}}} = resp;
        chrome.tabs.sendMessage(tab.id, startBlurr)
      })
    }
  }
);


