var facebookNotifications = document.getElementById('facebook-icon-notify');
var facebookIcon = document.getElementById('facebook-icon');
var facebookDiv = document.getElementById('facebook');
var fbEnabled = false;

var telegramNotifications = document.getElementById('telegram-icon-notify');
var telegramIcon = document.getElementById('telegram-icon');
var telegramDiv = document.getElementById('telegram');
var tgEnabled = false;

var whatsAppNotifications = document.getElementById('whatsapp-icon-notify');
var whatsAppIcon = document.getElementById('whatsapp-icon');
var whatsAppDiv = document.getElementById('whatsapp');
var waEnabled = false;

function badgeDisplay() {
  if (parseInt(facebookNotifications.textContent) > 0) {
    facebookNotifications.style.display = 'inline-block';
  } else {
    facebookNotifications.style.display = 'none';
  }

  if (parseInt(telegramNotifications.textContent) > 0) {
    telegramNotifications.style.display = 'inline-block';
  } else {
    telegramNotifications.style.display = 'none';
  }

  if (parseInt(whatsAppNotifications.textContent) > 0) {
    whatsAppNotifications.style.display = 'inline-block';
  } else {
    whatsAppNotifications.style.display = 'none';
  }

}

function iconDisplay() {
  if (fbEnabled) {
    facebookIcon.style.display = 'block';
    facebookDiv.style.display = 'block';
  } else {
    facebookIcon.style.display = 'none';
    facebookDiv.style.display = 'none';
  }

  if (tgEnabled) {
    telegramIcon.style.display = 'block';
    telegramDiv.style.display = 'block';
  } else {
    telegramIcon.style.display = 'none';
    telegramDiv.style.display = 'none';
  }

  if (waEnabled) {
    whatsAppIcon.style.display = 'block';
    whatsAppDiv.style.display = 'block';
  } else {
    whatsAppIcon.style.display = 'none';
    whatsAppDiv.style.display = 'none';
  }

}

//Get values from local storage.
browser.storage.local.get().then(function (result) {
  if (result.nFB !== undefined) {
    facebookNotifications.textContent = result.nFB.toString();
  }

  if (result.nTG !== undefined) {
    telegramNotifications.textContent = result.nTG.toString();
  }

  if (result.nWA !== undefined) {
    whatsAppNotifications.textContent = result.nWA.toString();
  }

  if (result.facebook_enabled === 1) {
    fbEnabled = true;
  } else {
    fbEnabled = false;
  }

  if (result.telegram_enabled === 1) {
    tgEnabled = true;
  } else {
    tgEnabled = false;
  }

  if (result.whatsapp_enabled === 1) {
    waEnabled = true;
  } else {
    waEnabled = false;
  }

  badgeDisplay();
  iconDisplay();
});

//Listen for clicks in the popup.
document.addEventListener('click', (e) => {

  //Check current tab
  browser.tabs.query({ active: true, currentWindow: true }).then(function (arrayOfTabs) {
    var activeTab = arrayOfTabs[0];

    if ((e.target.id == 'whatsapp-icon' ||
         e.target.id == 'whatsapp-icon-notify') &&
         !(~activeTab.url.indexOf('https://web.whatsapp.com'))) {
      browser.runtime.getBackgroundPage().then(function (page) {
        page.onWATabSwitchRequested();
      });
    } else if ((e.target.id == 'telegram-icon' ||
         e.target.id == 'telegram-icon-notify') &&
         !(~activeTab.url.indexOf('https://web.telegram.org'))) {
      browser.runtime.getBackgroundPage().then(function (page) {
        page.onTGTabSwitchRequested();
      });
    } else if ((e.target.id == 'facebook-icon' ||
         e.target.id == 'facebook-icon-notify') &&
         !(~activeTab.url.indexOf('https://www.messenger.com'))) {
      browser.runtime.getBackgroundPage().then(function (page) {
        page.onFBTabSwitchRequested();
      });
    } else if (e.target.id == 'settings-icon') {
      browser.runtime.openOptionsPage().then(function onOpened() {
        window.close();
      });
    }

  });
});

//Check for new notifications
browser.storage.onChanged.addListener(function (changes, namespace) {
  for (key in changes) {
    var storageChange = changes[key];

    if (key == 'nFB' && storageChange.newValue !== undefined) {
      facebookNotifications.textContent = storageChange.newValue.toString();
    }

    if (key == 'nTG' && storageChange.newValue !== undefined) {
      telegramNotifications.textContent = storageChange.newValue.toString();
    }

    if (key == 'nWA' && storageChange.newValue !== undefined) {
      whatsAppNotifications.textContent = storageChange.newValue.toString();
    }

  }

  badgeDisplay();
});
