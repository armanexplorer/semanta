if (typeof chrome !== "undefined" && chrome){
    browser = chrome
  }
  
  function showWelcomePage(){
    browser.tabs.create({url: chrome.i18n.getMessage("welcomeURL")}, function (tab) {});
      browser.runtime.openOptionsPage()
  }
  browser.runtime.onInstalled.addListener(function (object) {
      if(object.reason === 'install') {
        showWelcomePage()
      }
  });
  chrome.runtime.setUninstallURL(chrome.i18n.getMessage("goodbyeURL"), null);
  
  const doiRegex = new RegExp(
    /\b(10[.][0-9]{4,}(?:[.][0-9]+)*\/(?:(?!["&\'<>])\S)+)\b/
  );
  
  var paperURL;
  const trueRed = "#BC243C";
  var autoCheckServer = false;
  const defaults = {
    "paper-url": "https://oa.mg/work/",
    "open-in-new-tab": true,
    "autocheck-server": false
  };
  
  function setthing(name, value) {
    switch(name) {
      case "paper-url":
        paperURL = value;
        break;
      case "open-in-new-tab":
        openInNewTab = value;
        break;
      case "autocheck-server":
        autoCheckServer = value;
        break;
    }
  }
  function initialize(name) {
    chrome.storage.local.get([name], function(result) {
      if (!(name in result)) {
        result[name] = defaults[name];
        chrome.storage.local.set(result, function () {});
      }
      setthing(name, result[name]);
    })
  }

  function santizeDOI(doiStr) {
    const re = /(.+)\.pdf.*/;
    newDoiStr = doiStr.replace(re, '$1');
    return newDoiStr
  }

  function getHtml(htmlSource) {
    if (!htmlSource) {
        return;
    }
    
    htmlSource = htmlSource[0];
    foundRegex = htmlSource.match(doiRegex);
    if (foundRegex) {
      foundRegex = foundRegex[0].split(";")[0];
      foundRegex = santizeDOI(foundRegex);
      if (openInNewTab) {
        browser.tabs.create({
          url: paperURL + foundRegex,
        });
      } else {
        browser.tabs.update(undefined, {url: paperURL + foundRegex});
      }
    }
    else {
      chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
        let pageURL = tabs[0].url;
        console.log(pageURL);
        let archiveURL = 'https://archive.is/?run=1&url=';
  
       const getHostname = (url) => {
         return new URL(url).hostname;
       }
       pageDomain = getHostname(pageURL);
  
        let pageDomains = [
          'www.nytimes.com', 
          'www.telegraph.co.uk', 
          'www.newyorker.com', 
          'www.washingtonpost.com', 
          'www.latimes.com',
          'hbr.org',
          'foreignpolicy.com',
          'www.ft.com',
          'www.britannica.com',
          'baltimoresun.com',
          'www.bloomberg.com',
          'www.bostonglobe.com',
          'sloanreview.mit.edu',
          'www.technologyreview.com',
          'www.lrb.co.uk',
          'medium.com',
          'www.nzherald.co.nz',
          'asia.nikkei.com',
          'qz.com',
          'thediplomat.com',
          'www.theglobeandmail.com',
          'www.vanityfair.com',
          'www.zeit.de',
          'www.wired.com',
          'www.vulture.com',
          'slate.com'
        ];
        
        
        if (pageDomains.indexOf(pageDomain) != -1) {
          if (openInNewTab) {
            browser.tabs.create({
              url: archiveURL + pageURL,
            });
          } else {
            browser.tabs.update(undefined, {url: archiveURL + pageURL});
          }
        }
    });
    }
  }
  
  function executeJs() {
    chrome.tabs.executeScript( null, {code:"document.body.innerHTML"}, function(results){ getHtml(results); } );
  }

  chrome.runtime.onMessage.addListener( function (message, sender, sendResponse) {
    if (message.clicked) {
      executeJs();
    }
  });
  
  
  browser.browserAction.onClicked.addListener(executeJs);

  for (const property in defaults) {
    initialize(property);
  }

  

document.querySelectorAll('[data-locale]').forEach(elem => {
	elem.innerText = chrome.i18n.getMessage(elem.dataset.locale)
})

// document.getElementById("fetchPaper").addEventListener("click",
// 	function(){
// 		browser.runtime.sendMessage({clicked : true});
// 	}
// )

// document.getElementById("settings").addEventListener("click",
// 	function(){
// 		browser.runtime.openOptionsPage()
// 	}
// )

// document.getElementById("instructions").addEventListener("click",
// 	function(){
// 		browser.tabs.create({url: chrome.i18n.getMessage("instructionsURL")})
// 	}
// )


// chrome.runtime.onInstalled.addListener(() => {
//     browser.browserAction.setBadgeText({
//       text: "OFF",
//     });
//   });