// background.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'search') {
    // Open tabs for each URL
    message.urls.forEach((url) => {
      chrome.tabs.create({ url });
    });
  }
});
