document.addEventListener('DOMContentLoaded', () => {
    // Retrieve all stored search results
    chrome.storage.local.get(null, (items) => {
      if (chrome.runtime.lastError) {
        console.error('Error retrieving search results:', chrome.runtime.lastError.message);
        return;
      }
  
      const resultsTableBody = document.getElementById('resultsTableBody');
      const noResultsMessage = document.getElementById('noResultsMessage');
  
      if (!resultsTableBody) {
        console.error('No results table body found.');
        return;
      }
  
      // Check if there are any search results stored
      if (Object.keys(items).length === 0) {
        resultsTableBody.style.display = 'none';
        noResultsMessage.style.display = 'block';
        return;
      }
  
      let index = 1;
  
      // Display the search results
      for (const [searchText, results] of Object.entries(items)) {
        for (const [url, found] of Object.entries(results)) {
          const row = document.createElement('tr');
  
          const indexCell = document.createElement('td');
          indexCell.textContent = index++;
          row.appendChild(indexCell);
  
          const urlCell = document.createElement('td');
          urlCell.textContent = url;
          row.appendChild(urlCell);
  
          const resultCell = document.createElement('td');
          resultCell.textContent = found ? 'Yes' : 'No';
          row.appendChild(resultCell);
  
          resultsTableBody.appendChild(row);
        }
      }
    });
  });
  