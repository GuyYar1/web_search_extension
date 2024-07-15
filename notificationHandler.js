// notificationHandler.js

chrome.notifications.create({
    type: 'basic',
    iconUrl: "C:\\Users\\DELL\\Documents\\GitHub\\web_search_extension\\icon16.png",
    title: 'Search Result',
    message: 'Text found in the current tab!'
  }, (notificationId) => {
    if (chrome.runtime.lastError) {
        console.error('Error creating notification: Unable to download all specified images.', chrome.runtime.lastError.message);
    } else {
      console.log('Notification created successfully with ID:', notificationId);
    }
  });
 