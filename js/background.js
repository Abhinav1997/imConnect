//TODO: Notifications on application startup.

//Show notification badge
function updateNotification() {
  nTotal = nWA + nTG + nFB;
  if (nTotal > 0) {
    browser.browserAction.setBadgeText({ text: nTotal.toString() });
  } else {
    browser.browserAction.setBadgeText({ text: '' });
  }
}

function launchOptions() {
  browser.runtime.openOptionsPage().then(function () {
    if (browser.runtime.lastError) {
      console.error(browser.runtime.lastError);
    }
  });
}

function checkApps() {
  appsEnabled = 0;

  fbEnabled = false;
  tgEnabled = false;
  waEnabled = false;

  browser.storage.local.get().then(function (result) {
    if (result === null || result.facebook_enabled === undefined) {
      browser.storage.local.set({ facebook_enabled: 0 });
    } else if (result.facebook_enabled === 1) {
      appsEnabled = appsEnabled + 1;
      fbEnabled = true;
    }

    if (result === null || result.telegram_enabled === undefined) {
      browser.storage.local.set({ telegram_enabled: 0 });
    } else if (result.telegram_enabled === 1) {
      appsEnabled = appsEnabled + 1;
      tgEnabled = true;
    }

    if (result === null || result.whatsapp_enabled === undefined) {
      browser.storage.local.set({ whatsapp_enabled: 0 });
    } else if (result.whatsapp_enabled === 1) {
      appsEnabled = appsEnabled + 1;
      waEnabled = true;
    }

    if (appsEnabled > 0) {
      browser.browserAction.setPopup({ popup: '/choose_messenger.html' });
    }

    if (fbEnabled && !fbRunning) {
      runFacebook();
      fbRunning = true;
    } else if (!fbEnabled && fbRunning) {
      stopFacebook();
      fbRunning = false;
    }

    if (tgEnabled && !tgRunning) {
      runTelegram();
      tgRunning = true;
    } else if (!tgEnabled && tgRunning) {
      stopTelegram();
      tgRunning = false;
    }

    if (waEnabled && !waRunning) {
      runWhatsApp();
      waRunning = true;
    } else if (!waEnabled && waRunning) {
      stopWhatsApp();
      waRunning = false;
    }

  });
}

function checkFirstBoot() {
  //TODO: Rename in production
  browser.storage.local.get('not_first_boot_0005').then(function (result) {
    if (result === null || result.not_first_boot_0005 !== 1) {
      launchOptions();
      browser.storage.local.set({ not_first_boot_0005: 1 });
    }
  });
}

checkFirstBoot();
updateNotification();
checkApps();

browser.storage.onChanged.addListener(function (changes, namespace) {
  checkApps();
  for (key in changes) {
    var storageChange = changes[key];

    if (appsEnabled === 0) {
      browser.browserAction.setPopup({ popup: '' });
    } else {
      browser.browserAction.setPopup({ popup: '/choose_messenger.html' });
    }

    if (key == 'nFB') {
      nFB = storageChange.newValue;
      updateNotification();
    }

    if (key == 'nTG') {
      nTG = storageChange.newValue;
      updateNotification();
    }

    if (key == 'nWA') {
      nWA = storageChange.newValue;
      updateNotification();
    }

  }
});

browser.browserAction.onClicked.addListener((tab) => {
  if (appsEnabled === 0) {
    launchOptions();
  }
});
