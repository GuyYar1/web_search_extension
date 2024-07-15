// popup.js

document.getElementById('searchButton').addEventListener('click', () => {
  const url = document.getElementById('urlInput').value;
  const searchText = document.getElementById('searchInput').value;

  if (url.trim() === '' && searchText.trim() !== '') {
    // Get the active tab (current tab) for searching
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];

      // Search for the specified text in the current tab
      chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        function: (searchText) => {
          const found = document.body.innerText.includes(searchText);
          if (found) {
            // Highlight the matching text with a yellow background
            const highlightedElements = document.querySelectorAll(`*:contains("${searchText}")`);
            highlightedElements.forEach((element) => {
              element.style.backgroundColor = 'yellow';
            });
          }
          return found;
        },
        args: [searchText],
      }, (result) => {
        if (result && result[0]) {
          console.log('Text found in the current tab!');
        } else {
          console.log('Text not found in the current tab.');
        }
      });
    });
  } else {
    // Open a new tab with the specified URL
    chrome.tabs.create({ url }, (newTab) => {
      // Wait for the new tab to load
      chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
        if (tabId === newTab.id && changeInfo.status === 'complete') {
          // Search for the specified text in the new tab
          chrome.scripting.executeScript({
            target: { tabId: newTab.id },
            function: (searchText) => {
              const found = document.body.innerText.includes(searchText);
              if (found) {
                // Highlight the matching text with a yellow background
                const highlightedElements = document.querySelectorAll(`*:contains("${searchText}")`);
                highlightedElements.forEach((element) => {
                  element.style.backgroundColor = 'yellow';
                });
              }
              return found;
            },
            args: [searchText],
          }, (result) => {
            if (result && result[0]) {
              console.log('Text found in the new tab!');
            } else {
              console.log('Text not found in the new tab.');
            }
          });

          // Remove the listener after executing the search
          chrome.tabs.onUpdated.removeListener(listener);
        }
      });
    });
  }
});
