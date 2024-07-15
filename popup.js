document.getElementById('searchButton').addEventListener('click', () => {
  console.log("Hello, world1!");
  const url = document.getElementById('urlInput').value;
  const searchText = document.getElementById('searchInput').value;
  // Open a new tab with the specified URL
  chrome.tabs.create({ url }, (newTab) => {
    // Wait for 1 minute (60,000 milliseconds)
    setTimeout(() => {
      // Search for the specified text in the new tab
      chrome.tabs.sendMessage(newTab.id, { type: 'search', searchText }, (response) => {
        if (response && response.found) {
          console.log('Text found in the new tab!');
        } else {
          console.log('Text not found in the new tab.');
        }
      });
    }, 600); // 1 minute delay
  });
});
console.log("Hello, world3!");