// popup.js

document.getElementById('open-new-tab').addEventListener('click', () => {
  chrome.tabs.create({});
});
