//Store notification count for Telegram in local storage
function storeTelegramNotifications() {
  browser.storage.local.get('nTG').then(function (result) {
    if (result.nTG !== nTG) {
      browser.storage.local.set({ nTG: nTG });
    }
  });
}

function updateTGNotifications(tabTitle) {
  prevnTG = null;
  noTG = tabTitle.match(/\d+/);
  nTG = parseInt(noTG === null ? '0' : noTG[0]);

  if (nTGInterval === null) {
    nTGInterval = setInterval(function () {
      if (prevnTG === nTG) {
        if (nTG === 0) {
          pTG = nTG;
          storeTelegramNotifications();
        }
      } else {
        if (pTG !== nTG && nTG !== 0) {
          pTG = nTG;
          storeTelegramNotifications();
        }

        prevnTG = nTG;
      }
    }, 3000);
  }
}

//Handling new telegram notifications
function handleTelegramUpdated(tabId, changeInfo, tabInfo) {
  if (idTG !== null && tabId === idTG && changeInfo.title !== undefined) {
    updateTGNotifications(changeInfo.title);
  }
}

function telegramRemoved(tabId) {
  browser.storage.local.get('telegram_enabled').then(function (result) {
    if (tabId === idTG && result.telegram_enabled === 1) {
      idTG = null;
      window.setTimeout(checkTelegramTab, 2000);
    }
  });
}

//Check if Telegram tab is present or not
function telegramTab(foundCallback, notFoundCallback) {
  browser.tabs.query(
    { url: 'https://web.telegram.org/*' }).then(
    (result) => {
      if (result.length > 0) {
        foundCallback(result[0]);
      } else {
        notFoundCallback();
      }
    },
  );
}

//Create pinned Telegram tab if not present already
function checkTelegramTab() {
  if (!stopTG) {
    telegramTab((tab) => {
      idTG = tab.id;

      if (idTG != null && tab != null) {
        updateTGNotifications(tab.title);
      }

      if (!tab.pinned) {
        browser.tabs.update(tab.id, {
          pinned: true,
        });
      }
    }, () => {
      if (idTG == null || idTG != idPrevTG) {
        browser.tabs.create({
          index: 0,
          pinned: true,
          url: 'https://web.telegram.org/',
          active: false,
        }).then((tab) => {
          if (typeof tab === 'object') {
            idTG = tab.id;
            idPrevTG = tab.id;
          }
        });
      }
    });
  }
}

//Open Telegram tab by either keyboard shortcut or toolbar click
function onTGTabSwitchRequested() {
  browser.tabs.query({ active: true }).then((tabs) => {
    let idActivate;
    if (tabs[0].id !== idTG) {
      idPrevious = tabs[0].id;
      idActivate = idTG;
    } else {
      idActivate = idPrevious;
    }

    browser.tabs.update(idActivate, {
      active: true,
    });
  });
}

function runTelegram() {
  stopTG = false;
  window.setTimeout(checkTelegramTab, 2000);

  //Listen for keyboard shortcuts
  browser.commands.onCommand.addListener((command) => {
    browser.storage.local.get('telegram_enabled').then(function (result) {
      if (command === 'tg-shortcut' && result.telegram_enabled === 1) {
        onTGTabSwitchRequested();
      }
    });
  });

  //Reload tabs if closed
  browser.tabs.onRemoved.addListener(telegramRemoved);

  //For checking notifications
  browser.tabs.onUpdated.addListener(handleTelegramUpdated);
}

function stopTelegram() {
  stopTG = true;

  if (idTG !== null) {
    browser.tabs.remove(idTG);
    idTG = null;
  }

  nTG = 0;
  storeTelegramNotifications();

  browser.tabs.onUpdated.removeListener(handleTelegramUpdated);
  browser.tabs.onRemoved.removeListener(telegramRemoved);

  clearInterval(nTGInterval);
  nTGInterval = null;
}
