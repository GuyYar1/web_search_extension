document.getElementById('searchButton').addEventListener('click', async () => {
  const urlsInput = document.getElementById('urlInput').value;
  const searchText = document.getElementById('searchInput').value;

  if (searchText.trim() === '') {
    console.error('Please enter search text.');
    return;
  }

  const urls = urlsInput.split(',').map(url => url.trim());
  const searchResults = {};

  // Function to search text and update searchResults
  const searchAndHighlightText = async (tabId, url, searchText) => {
    return new Promise((resolve, reject) => {
      chrome.scripting.executeScript({
        target: { tabId },
        function: (searchText) => {
          let found = false;
          const regex = new RegExp(searchText, 'gi');
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
          let node;
          while (node = walker.nextNode()) {
            if (regex.test(node.nodeValue)) {
              found = true;
              break; // Stop on first match to speed up the process
            }
          }
          return found;
        },
        args: [searchText]
      }, (result) => {
        if (chrome.runtime.lastError) {
          console.error('Error executing script:', chrome.runtime.lastError.message);
          reject(chrome.runtime.lastError.message);
        } else {
          resolve(result && result[0] && result[0].result);
        }
      });
    });
  };

  // Function to handle search result and update dictionary
  const handleSearchResult = async (tabId, url, searchText) => {
    try {
      const result = await searchAndHighlightText(tabId, url, searchText);
      searchResults[url] = result ? 1 : 0;

      // Notify user of search result
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon16.png',
        title: 'Search Result',
        message: `Text ${result ? 'found' : 'not found'} in ${url}.`,
      });
      console.log(`Text ${result ? 'found' : 'not found'} in ${url}.`);

      // Close the tab after search is complete
      chrome.tabs.remove(tabId);

      // Proceed to next URL if available
      searchNextUrl();
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  // Recursive function to sequentially search URLs
  const searchNextUrl = async () => {
    if (urls.length > 0) {
      const url = urls.shift();
      chrome.tabs.create({ url, active: false }, (newTab) => {
        // Wait for the new tab to load
        chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
          if (tabId === newTab.id && changeInfo.status === 'complete') {
            handleSearchResult(newTab.id, url, searchText);
            chrome.tabs.onUpdated.removeListener(listener);
          }
        });
      });
    } else {
      // All searches completed, save searchResults to storage
      try {
        await chrome.storage.local.set({ [searchText]: searchResults });
        console.log('Search results saved:', searchResults);
        const docLink = chrome.runtime.getURL('results.html');
        // Notify user that results are saved
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon16.png',
          title: 'Search Results Saved',
          message: `Search results for "${searchText}" have been saved.`,
          buttons: [{ title: 'View Results', iconUrl: 'icon16.png' }],
        }, (notificationId) => {
          chrome.notifications.onButtonClicked.addListener((clickedNotificationId, buttonIndex) => {
            if (clickedNotificationId === notificationId && buttonIndex === 0) {
              chrome.tabs.create({ url: docLink });
            }
          });
        });
      } catch (error) {
        console.error('Error saving search results:', error);
      }
    }
  };

  // Start searching sequentially
  searchNextUrl();
});
