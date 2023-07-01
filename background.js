
try{

  //ON page change
  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    console.log("On update the tab URL is: ", tab.url);
    console.log("On update the tab id is: ", tabId);

    // skip urls like "chrome://" to avoid extension error
    if (tab.url?.startsWith("chrome://")) return undefined;

    chrome.storage.local.get(["site"]).then((result) => {
      let options = result.site;
      const siteOptions = options?.map(element => {
        return element.toString().toLowerCase();
      });
      console.log("onUpdated listener, siteOptions: ", siteOptions);
      
      // Filter out any empty values.
      const selectedOptions = siteOptions.filter((element) => element !== '');
      console.log("onUpdated listener, Value currently is: ", selectedOptions);
      if (selectedOptions.some(v => tab.url.includes(v))) {
        chrome.scripting.executeScript({
          files: ['contentScript.js'],
          target: {tabId: tabId}
        });
      }
    });
  });

  // Works for new pages, need to have it work when navigating back to already open tab.

}catch(e){
  console.log(e);
}

// If a user navigates to an already open tab, compare with list of sites to be blocked.
chrome.tabs.onActivated.addListener((activeInfo) => {
  const tabId = activeInfo.tabId;
  
  chrome.tabs.get(tabId, (tab) => {
    const url = tab.url;
    // skip urls like "chrome://" to avoid extension error
    if (url?.startsWith("chrome://")) return undefined;

    chrome.storage.local.get(["site"]).then((result) => {
      let options = result.site;
      const siteOptions = options?.map(element => {
        return element.toString().toLowerCase();
      });
      console.log("onActivated listener, siteOptions: ", siteOptions);
      
      // Filter out any empty values.
      const selectedOptions = siteOptions.filter((element) => element !== '');
      console.log("onActivated listener, Value currently is: ", selectedOptions);
      console.log("tab: ", tab);
      if (selectedOptions.some(v => tab.url.includes(v))) {
        chrome.scripting.executeScript({
          files: ['contentScript.js'],
          target: {tabId: tabId}
        });
      }
    });
  });
});


chrome.runtime.onMessage.addListener(function(request, message, sender, sendResponse) {
  if (request.type === "inputValue") {
    console.log("onMessage listener, request: ", request);
    let inputValue = request.value;
    console.log("onMessage listener, inputValue: ", inputValue);
    const siteOptions = inputValue.map(element => {
      return element.toString().toLowerCase();
    });
    // Use the input value here
    console.log("onMessage listener, Input value from Background: ", siteOptions);

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var activeTab = tabs[0];
      if (activeTab && activeTab.url) {
        var activeUrl = activeTab.url;
        console.log('onMessage listener, Active URL is: ', activeUrl);
      } else {
        console.log('onMessage listener, No active tab or URL found');
      }
    });

    chrome.tabs.getCurrent(function(currentTab) {
      if (currentTab && currentTab.url) {
        var activeUrl = currentTab.url;
        console.log('Active URL is', activeUrl);
      } else {
        console.log('No active tab or URL found');
      }
    });
    
  }
});
