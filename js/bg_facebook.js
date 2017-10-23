//Store notification count for Facebook in local storage
function storeFacebookNotifications() {
  browser.storage.local.get('nFB').then(function (result) {
    if (result.nFB !== nFB) {
      browser.storage.local.set({ nFB: nFB });
    }
  });
}

function updateFBNotifications(tabTitle) {
  prevnFB = null;
  noFB = tabTitle.match(/\d+/);
  nFB = parseInt(noFB === null ? '0' : noFB[0]);

  if (nFBInterval === null) {
    nFBInterval = setInterval(function () {
      if (prevnFB === nFB) {
        if (nFB === 0) {
          pFB = nFB;
          storeFacebookNotifications();
        }
      } else {
        if (pFB !== nFB && nFB !== 0) {
          pFB = nFB;
          storeFacebookNotifications();
        }

        prevnFB = nFB;
      }
    }, 3000);
  }
}

//Handling new facebook notifications
function handleFacebookUpdated(tabId, changeInfo, tabInfo) {
  if (idFB !== null && tabId === idFB && changeInfo.title !== undefined) {
    updateFBNotifications(changeInfo.title);
  }
}

function facebookRemoved(tabId) {
  browser.storage.local.get('facebook_enabled').then(function (result) {
    if (tabId === idFB && result.facebook_enabled === 1) {
      idFB = null;
      window.setTimeout(checkFacebookTab, 2000);
    }
  });
}

//Check if Facebook tab is present or not
function facebookTab(foundCallback, notFoundCallback) {
  browser.tabs.query(
    { url: 'https://www.messenger.com/*' }).then(
    (result) => {
      if (result.length > 0) {
        foundCallback(result[0]);
      } else {
        notFoundCallback();
      }
    },
  );
}

//Create pinned Facebook tab if not present already
function checkFacebookTab() {
  if (!stopFB) {
    facebookTab((tab) => {
      idFB = tab.id;

      if (idFB != null && tab != null) {
        updateFBNotifications(tab.title);
      }

      if (!tab.pinned) {
        browser.tabs.update(tab.id, {
          pinned: true,
        });
      }
    }, () => {
      if (idFB == null || idFB != idPrevFB) {
        browser.tabs.create({
          index: 0,
          pinned: true,
          url: 'https://www.messenger.com/',
          active: false,
        }).then((tab) => {
          if (typeof tab === 'object') {
            idFB = tab.id;
            idPrevFB = tab.id;
          }
        });
      }
    });
  }
}

//Open Facebook tab by either keyboard shortcut or toolbar click
function onFBTabSwitchRequested() {
  browser.tabs.query({ active: true }).then((tabs) => {
    let idActivate;
    if (tabs[0].id !== idFB) {
      idPrevious = tabs[0].id;
      idActivate = idFB;
    } else {
      idActivate = idPrevious;
    }

    browser.tabs.update(idActivate, {
      active: true,
    });
  });
}

function runFacebook() {
  stopFB = false;
  window.setTimeout(checkFacebookTab, 2000);

  //Listen for keyboard shortcuts
  browser.commands.onCommand.addListener((command) => {
    browser.storage.local.get('facebook_enabled').then(function (result) {
      if (command === 'fb-shortcut' && result.facebook_enabled === 1) {
        onFBTabSwitchRequested();
      }
    });
  });

  //Reload tabs if closed
  browser.tabs.onRemoved.addListener(facebookRemoved);

  //For checking notifications
  browser.tabs.onUpdated.addListener(handleFacebookUpdated);
}

function stopFacebook() {
  stopFB = true;

  if (idFB !== null) {
    browser.tabs.remove(idFB);
    idFB = null;
  }

  nFB = 0;
  storeFacebookNotifications();

  browser.tabs.onUpdated.removeListener(handleFacebookUpdated);
  browser.tabs.onRemoved.removeListener(facebookRemoved);

  clearInterval(nFBInterval);
  nFBInterval = null;
}
