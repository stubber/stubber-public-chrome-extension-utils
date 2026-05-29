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
];

function getFirstMatch(text, regex) {
  const match = text.match(regex);
  return match?.[0]?.trim();
}

function getStubberUrl(text) {
  const stubRef = getFirstMatch(text, stubRefRegex);

  if (stubRef) {
    return `https://stub.by/${stubRef}`;
  }

  const uuid = getFirstMatch(text, uuidV5Regex);

  if (uuid) {
    return `https://manage.stubber.com/redirect/uuid/${uuid}`;
  }

  return undefined;
}

function openUrl(url) {
  chrome.tabs.create({
    url: url,
    active: true,
  });
}

function addChromeListener(event, callback, eventName) {
  if (event?.addListener) {
    event.addListener(callback);
    return;
  }

  console.error(`Chrome extension event unavailable: ${eventName}`);
}

function createContextMenus() {
  if (!chrome.contextMenus?.removeAll || !chrome.contextMenus?.create) {
    console.error("Chrome contextMenus API unavailable");
    return;
  }

  chrome.contextMenus.removeAll(() => {
    contextMenus.forEach((menu) => chrome.contextMenus.create(menu));
  });
}

// Create the context menu item
addChromeListener(
  chrome.runtime?.onInstalled,
  createContextMenus,
  "runtime.onInstalled",
);

// Handle context menu click
addChromeListener(chrome.contextMenus?.onClicked, (info, tab) => {
  if (info.menuItemId !== "openStubber" || !info.selectionText) {
    return;
  }

  const url = getStubberUrl(info.selectionText);

  if (!url) {
    console.log("No valid StubRef or v5 UUID found in selection");
    return;
  }

  openUrl(url);
  console.log(`Opening Stubber URL in new tab: ${url}`);
}, "contextMenus.onClicked");
