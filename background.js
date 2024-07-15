// background.js

console.log("Hello, world2!");

// Set up a connection with the content script
chrome.runtime.onConnect.addListener((port) => {
  console.log("Connected to content script");
  port.onMessage.addListener((message) => {
    if (message.type === 'searchResult') {
      // Open tabs for each URL
      message.urls.forEach((url) => {
        chrome.tabs.create({ url });
      });
    }
  });
});
