//Store notification count for WhatsApp in local storage
function storeWhatsAppNotifications() {
  browser.storage.local.set({ nWA: nWA });
}

function updateWANotifications(tabTitle) {
  noWA = tabTitle.match(/\((\d+)\)/);
  nWA = parseInt(noWA === null ? '0' : noWA[0]);
  storeWhatsAppNotifications();
}

//Handling new notifications
function handleWhatsAppUpdated(tabId, changeInfo, tabInfo) {
  if (idWA !== null && tabId === idWA && changeInfo.title !== undefined) {
    updateWANotifications(changeInfo.title);
  }
}

function whatsAppRemoved(tabId) {
  browser.storage.local.get('whatsapp_enabled').then(function (result) {
    if (tabId === idWA && result.whatsapp_enabled === 1) {
      idWA = null;
      window.setTimeout(checkWhatsAppTab, 2000);
    }
  });
}

//Check if WhatsApp tab is present or not
function whatsAppTab(foundCallback, notFoundCallback) {
  browser.tabs.query(
    { url: 'https://web.whatsapp.com/*' }).then(
    (result) => {
      if (result.length > 0) {
        foundCallback(result[0]);
      } else {
        notFoundCallback();
      }
    },
  );
}

//Create pinned WhatsApp tab if not present already
function checkWhatsAppTab() {
  if (!stopWA) {
    whatsAppTab((tab) => {
      idWA = tab.id;

      if (idWA != null && tab != null) {
        updateWANotifications(tab.title);
      }

      if (!tab.pinned) {
        browser.tabs.update(tab.id, {
          pinned: true,
        });
      }
    }, () => {
      if (idWA == null || idWA != idPrevWA) {
        browser.tabs.create({
          index: 0,
          pinned: true,
          url: 'https://web.whatsapp.com/',
          active: false,
        }).then((tab) => {
          if (typeof tab === 'object') {
            idWA = tab.id;
            idPrevWA = tab.id;
          }
        });
      }
    });
  }
}

//Open WhatsApp tab by either keyboard shortcut or toolbar click
function onWATabSwitchRequested() {
  browser.tabs.query({ active: true }).then((tabs) => {
    let idActivate;
    if (tabs[0].id !== idWA) {
      idPrevious = tabs[0].id;
      idActivate = idWA;
    } else {
      idActivate = idPrevious;
    }

    browser.tabs.update(idActivate, {
      active: true,
    });
  });
}

function runWhatsApp() {
  stopWA = false;
  window.setTimeout(checkWhatsAppTab, 2000);

  //Listen for keyboard shortcuts
  browser.commands.onCommand.addListener((command) => {
    browser.storage.local.get('whatsapp_enabled').then(function (result) {
      if (command === 'wa-shortcut' && result.whatsapp_enabled === 1) {
        onWATabSwitchRequested();
      }
    });
  });

  //Reload tabs if closed
  if (!browser.tabs.onRemoved.hasListener(whatsAppRemoved)) {
    browser.tabs.onRemoved.addListener(whatsAppRemoved);
  }

  //For checking notifications
  browser.tabs.onUpdated.addListener(handleWhatsAppUpdated);
}

function stopWhatsApp() {
  stopWA = true;

  if (idWA !== null) {
    browser.tabs.remove(idWA);
    idWA = null;
  }

  nWA = 0;
  storeWhatsAppNotifications();

  browser.tabs.onUpdated.removeListener(handleWhatsAppUpdated);
  browser.tabs.onRemoved.removeListener(whatsAppRemoved);
}
