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
  } else if (url.trim() !== '') {
    // Handle opening a new tab with the specified URL
    chrome.tabs.create({ url, active: false }, (newTab) => {
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
  } else {
    console.error('Please enter a search text or URL.');
  }
});

function searchAndHighlightText(searchText) {
  let found = false;
  
  // Create a regular expression to match the searchText as a substring
  const regex = new RegExp(searchText, 'gi');

  // Traverse all text nodes within the body
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  let node;
  while (node = walker.nextNode()) {
    if (regex.test(node.nodeValue)) {
      found = true;
      // Create a fragment to hold the modified node with highlights
      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      let match;

      // Iterate over matches in the text node
      while (match = regex.exec(node.nodeValue)) {
        // Create a text node for text before the match
        const before = document.createTextNode(node.nodeValue.substring(lastIndex, match.index));
        fragment.appendChild(before);

        // Create a span element to highlight the match
        const highlight = document.createElement('span');
        highlight.style.backgroundColor = 'yellow';
        highlight.appendChild(document.createTextNode(match[0]));
        fragment.appendChild(highlight);

        lastIndex = regex.lastIndex;
      }

      // Append remaining text after the last match
      const after = document.createTextNode(node.nodeValue.substring(lastIndex));
      fragment.appendChild(after);

      // Replace original node with the fragment containing highlights
      node.parentNode.replaceChild(fragment, node);
    }
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
