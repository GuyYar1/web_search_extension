document.getElementById('searchButton').addEventListener('click', () => {
  const url = document.getElementById('urlInput').value;
  const searchText = document.getElementById('searchInput').value;
  chrome.runtime.sendMessage({ type: 'search', url, searchText });
});
