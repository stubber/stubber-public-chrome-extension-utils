// background.js
// Regular expression to find StubRef codes in two formats:
// 1. YYYY-MM-DD-STUB-XXXX where XXXX is 4 alphanumeric characters
// 2. YYYY-MM-DD-XXXX-XXXX where XXXX is 4 alphanumeric characters
const stubRefRegex = /(\d{4}-\d{2}-\d{2}-(?:STUB|XXXX)-[a-zA-Z0-9]{4})/i;

// Create the context menu item
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "openStubber",
    title: "Open in Stubber",
    contexts: ["selection"],
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openStubber" && info.selectionText) {
    // Get the selected text
    const selectedText = info.selectionText;

    // Find the first StubRef in the selected text
    const match = selectedText.match(stubRefRegex);

    if (match && match[0]) {
      // Extract the matched StubRef
      const stubRef = match[0].trim();
      // Create the URL
      const url = `https://stub.by/${stubRef}`;

      // Open in a new tab - explicitly set active to true
      chrome.tabs.create({
        url: url,
        active: true,
      });

      // Log for debugging
      console.log(`Opening StubRef in new tab: ${url}`);
    } else {
      console.log("No valid StubRef found in selection");
    }
  }
});
