// background.js
// Regular expression to find StubRef codes in two formats:
// 1. YYYY-MM-DD-STUB-XXXX where XXXX is 4 alphanumeric characters
// 2. YYYY-MM-DD-XXXX-XXXX where XXXX is 4 alphanumeric characters
const stubRefRegex =
  /\b\d{4}-\d{2}-\d{2}-(?:STUB|[a-zA-Z0-9]{4})-[a-zA-Z0-9]{4}\b/i;
const uuidV5Regex =
  /\b[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i;

const contextMenus = [
  {
    id: "openStubber",
    title: "Open in Stubber",
    contexts: ["selection"],
  },
  {
    id: "openStubberOrg",
    title: "Open as Stubber Org",
    contexts: ["selection"],
    visible: false,
  },
  {
    id: "openStubberTemplate",
    title: "Open as Stubber Template",
    contexts: ["selection"],
    visible: false,
  },
];

function getFirstMatch(text, regex) {
  const match = text.match(regex);
  return match?.[0]?.trim();
}

function openUrl(url) {
  chrome.tabs.create({
    url: url,
    active: true,
  });
}

// Create the context menu item
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    contextMenus.forEach((menu) => chrome.contextMenus.create(menu));
  });
});

chrome.contextMenus.onShown.addListener((info) => {
  const uuid = getFirstMatch(info.selectionText || "", uuidV5Regex);
  const hasUuid = Boolean(uuid);

  chrome.contextMenus.update("openStubberOrg", { visible: hasUuid }, () => {
    chrome.contextMenus.update(
      "openStubberTemplate",
      { visible: hasUuid },
      () => chrome.contextMenus.refresh(),
    );
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openStubber" && info.selectionText) {
    // Get the selected text
    const selectedText = info.selectionText;

    // Find the first StubRef in the selected text
    const stubRef = getFirstMatch(selectedText, stubRefRegex);

    if (stubRef) {
      // Create the URL
      const url = `https://stub.by/${stubRef}`;

      // Open in a new tab - explicitly set active to true
      openUrl(url);

      // Log for debugging
      console.log(`Opening StubRef in new tab: ${url}`);
    } else {
      console.log("No valid StubRef found in selection");
    }
  }

  if (
    (info.menuItemId === "openStubberOrg" ||
      info.menuItemId === "openStubberTemplate") &&
    info.selectionText
  ) {
    const uuid = getFirstMatch(info.selectionText, uuidV5Regex);

    if (uuid) {
      const url =
        info.menuItemId === "openStubberOrg"
          ? `https://editor.stubber.com/org/${uuid}`
          : `https://editor.stubber.com/metronet/templates/${uuid}`;

      openUrl(url);
      console.log(`Opening Stubber UUID in new tab: ${url}`);
    } else {
      console.log("No valid v5 UUID found in selection");
    }
  }
});
