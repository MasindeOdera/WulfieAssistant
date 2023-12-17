// Add this code to popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.closePopup) {
    chrome.windows.getCurrent((window) => {
      chrome.windows.remove(window.id);
    });
  }
});
