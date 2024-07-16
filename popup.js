document.getElementById('searchButton').addEventListener('click', () => {
  const url = document.getElementById('urlInput').value;
  const searchText = document.getElementById('searchInput').value;

  if (url.trim() === '' && searchText.trim() !== '') {
    // Handle searching in the current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];

      chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        function: searchAndHighlightText,
        args: [searchText],
      }, (result) => {
        handleSearchResult(result, 'current tab');
      });
    });
  } else {
    // Handle opening a new tab with the specified URL
    chrome.tabs.create({ url }, (newTab) => {
      // Wait for the new tab to load
      chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
        if (tabId === newTab.id && changeInfo.status === 'complete') {
          chrome.scripting.executeScript({
            target: { tabId: newTab.id },
            function: searchAndHighlightText,
            args: [searchText],
          }, (result) => {
            handleSearchResult(result, 'new tab');
          });

          // Clean up listener after executing search
          chrome.tabs.onUpdated.removeListener(listener);
        }
      });
    });
  }
});

function searchAndHighlightText(searchText) {
  const found = document.body.innerText.includes(searchText);
  if (found) {
    // Highlight matching text with a yellow background
    const elements = document.querySelectorAll('body, body *');
    elements.forEach((element) => {
      if (element.innerText.includes(searchText)) {
        element.style.backgroundColor = 'yellow';
      }
    });
  }
  return found;
}

function handleSearchResult(result, tabType) {
  if (chrome.runtime.lastError) {
    console.error('Error executing script:', chrome.runtime.lastError.message);
    return;
  }

  if (result && result[0] && result[0].result) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon16.png',
      title: 'Search Result',
      message: `Text found in the ${tabType}!`,
    });
    console.log(`Text found in the ${tabType}!`);
  } else {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon16.png',
      title: 'Search Result',
      message: `Text not found in the ${tabType}.`,
    });
    console.log(`Text not found in the ${tabType}.`);
  }
}
