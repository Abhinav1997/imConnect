var facebookSwitch = document.getElementById('switch-fb');
var telegramSwitch = document.getElementById('switch-tg');
var whatsAppSwitch = document.getElementById('switch-wa');

function updateSwitches() {
  browser.storage.local.get().then(function (result) {
    if (result.facebook_enabled) {
      facebookSwitch.checked = true;
    } else {
      facebookSwitch.checked = false;
    }

    if (result.telegram_enabled) {
      telegramSwitch.checked = true;
    } else {
      telegramSwitch.checked = false;
    }

    if (result.whatsapp_enabled) {
      whatsAppSwitch.checked = true;
    } else {
      whatsAppSwitch.checked = false;
    }

    facebookSwitch.dispatchEvent(new Event('change'));
    telegramSwitch.dispatchEvent(new Event('change'));
    whatsAppSwitch.dispatchEvent(new Event('change'));
  });
}

updateSwitches();

document.addEventListener('DOMContentLoaded', updateSwitches);

facebookSwitch.addEventListener('change', function () {
  if (this.checked) {
    browser.storage.local.set({ facebook_enabled: 1 });
  } else {
    browser.storage.local.set({ facebook_enabled: 0 });
  }
});

telegramSwitch.addEventListener('change', function () {
  if (this.checked) {
    browser.storage.local.set({ telegram_enabled: 1 });
  } else {
    browser.storage.local.set({ telegram_enabled: 0 });
  }
});

whatsAppSwitch.addEventListener('change', function () {
  if (this.checked) {
    browser.storage.local.set({ whatsapp_enabled: 1 });
  } else {
    browser.storage.local.set({ whatsapp_enabled: 0 });
  }
});
