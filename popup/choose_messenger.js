/*
Listen for clicks in the popup.
*/

document.addEventListener("click", (e) => {
  chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
    var activeTab = arrayOfTabs[0];
    if((e.target.id == 'whatsapp-icon' || e.target.id == 'whatsapp-icon-notify') && !(~activeTab.url.indexOf("https://web.whatsapp.com"))) {
      onWATabSwitchRequested();
    }
    if((e.target.id == 'telegram-icon' || e.target.id == 'telegram-icon-notify') && !(~activeTab.url.indexOf("https://web.telegram.org"))) {
      onTGTabSwitchRequested();
    }
  });
})
