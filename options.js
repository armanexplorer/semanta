'use strict';

document.querySelectorAll('[data-locale]').forEach(elem => {
  elem.innerText = chrome.i18n.getMessage(elem.dataset.locale)
})

function updatePageString(field, propname, isUrl) {
  chrome.storage.local.get([propname], function (result) {
    field.value = result[propname];
  })
}
function updatePageBool(field, propname) {
  chrome.storage.local.get([propname], function (result) {
    field.checked = result[propname];
  })
}
function updateStorage(val, propname) {
  var obj = {};
  obj[propname] = val;
  chrome.storage.local.set(obj, function () {});
  var bgPage = chrome.extension.getBackgroundPage();
  bgPage.setthing(propname, val);
}
function updateStuffString(field, propname, isUrl) {
  updatePageString(field, propname, isUrl);
  field.onkeyup = function () {
    updateStorage(field.value, propname);
  }
}
function updateStuffBool(field, propname) {
  updatePageBool(field, propname);
  field.onchange = function () {
    updateStorage(field.checked, propname);
  }
}
function checkServerStatus(domain, i, ifOnline, ifOffline) {
  var img = document.body.appendChild(document.createElement("img"));
  img.height = 0;
  img.visibility = "hidden";
  img.onload = function () {
    ifOnline && ifOnline.constructor == Function && ifOnline(i);
  };
  img.onerror = function () {
    ifOffline && ifOffline.constructor == Function && ifOffline(i);
  }
  img.src = domain + "/misc/img/raven_1.png";
}

updateStuffBool(document.getElementById("newtab"), "open-in-new-tab");
updateStuffString(document.getElementById("url"), "paper-url", true);


var links;
var linkstable = document.getElementById("links");
function setUrl(i) {  
  var selectedLink = document.getElementById("link" + i).getAttribute("data-link");
  
  document.getElementById("url").value = selectedLink;
  updateStorage(selectedLink, "paper-url");
}
function fillUrls() {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      links = JSON.parse(this.responseText);
      for (const i in links) {
        var link = links[i];
        linkstable.insertRow();

        const td1 = document.createElement("td");
        let html_text = document.createElement("div")
        html_text.innerHTML = link.t
        td1.appendChild(html_text);

        const td2 = document.createElement("td");
        const button = document.createElement("button");
        button.appendChild(document.createTextNode("Use"));
        button.setAttribute("id", "link" + i);
        button.setAttribute("data-link", link.l);
        td2.appendChild(button);
        
        const row = linkstable.rows[linkstable.rows.length-1];
        row.appendChild(td1);
        row.appendChild(td2);
        document.getElementById("link" + i).onclick = function () { setUrl(i); alert("URL: Saved!");}
    }
    
    }
  };
  xmlhttp.open("GET", "https://semanta.armanexplorer.com/sources.json", true);
  xmlhttp.send();
}
fillUrls();

document.getElementById("closeButton").onclick = function () {window.close()}