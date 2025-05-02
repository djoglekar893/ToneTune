// background.js
chrome.runtime.onInstalled.addListener(() => {
    // Set default settings
    chrome.storage.sync.get(['apiKey', 'improvementLevel', 'tone', 'aiProvider'], function(data) {
      if (!data.improvementLevel) {
        chrome.storage.sync.set({ improvementLevel: 'medium' });
      }
      if (!data.tone) {
        chrome.storage.sync.set({ tone: 'professional' });
      }
      if (!data.aiProvider) {
        chrome.storage.sync.set({ aiProvider: 'browser' }); // Default to free browser-based option
      }
    });
  });
  
  // Listen for messages from content scripts
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSettings') {
      chrome.storage.sync.get(['apiKey', 'improvementLevel', 'tone'], function(data) {
        sendResponse(data);
      });
      return true; // Indicates we will send a response asynchronously
    }
  });