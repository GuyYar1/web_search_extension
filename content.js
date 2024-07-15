// content.js (run on newTabOverride.html)
// Find the element you want to update (e.g., footer)
const footerElement = document.querySelector('footer p');

// Update the text
footerElement.textContent = 'Your updated text';

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'search') {
    // Search for text in the page content
    const found = document.body.innerText.includes(message.searchText);

    // Send result back to background script
    chrome.runtime.sendMessage({ type: 'searchResult', found });
  }
});
