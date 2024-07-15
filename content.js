// content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'search') {
    // Search for text in the page content
    const found = document.body.innerText.includes(message.searchText);

    // Send result back to background script
    chrome.runtime.sendMessage({ type: 'searchResult', found });
  }
});
