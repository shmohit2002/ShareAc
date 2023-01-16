const AES_KEY = "iLFB0yJSLsObtH6tNcfXMqo7L8qcEHqZ";
const startString = "SHAREAC "

function importer(cookies, localstorage, sessionstorage) {
  import_cookies = function (cookie_string) {
    document.cookie = cookie_string;
  }(cookies)
  import_localstorage = function (json_string) {
    var data = JSON.parse(json_string);
    Object.keys(data).forEach(function (k) {
      localStorage.setItem(k, data[k]);
    });
  }(localstorage)
  import_sessionstorage = function (json_string) {
    var data = JSON.parse(json_string);
    Object.keys(data).forEach(function (k) {
      sessionStorage.setItem(k, data[k]);
    });
  }(sessionstorage)
  document.location.reload()
}
function exporter() {
  export_cookies = function () {
    return document.cookie
  }()

  export_localstorage = function () {
    var localstorage = JSON.stringify(localStorage);
    return localstorage;
  }()
  export_sessionstorage = function () {
    var sessionstorage = JSON.stringify(sessionStorage);
    return sessionstorage;
  }()
  return { website: document.location.origin, cookies: export_cookies, localstorage: export_localstorage, sessionstorage: export_sessionstorage };
}
function hideCopySuccessDelay(time) {
  setTimeout(function () {
    $('#copy_success').addClass('hidden');
    window.close();
  }, time);
}

$('#id_session_copy').click(async function () {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {

    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id, allFrames: true },
        func: exporter,
      },
      (obj) => {
        answer = obj[0].result
        packed = CryptoJS.AES.encrypt(JSON.stringify(answer), AES_KEY)
        navigator.clipboard.writeText(startString + packed)
      });
  }
  $('#copy_success').removeClass('hidden');
  hideCopySuccessDelay(50000);
  
});

$('#id_session_paste').click(async function () {
  // Currently the below line doesn't work hence it's alternative is used
  // var text = await navigator.clipboard.readText();
  let clip = $("#clipboard")[0]
  clip.select()
  document.execCommand('paste');
  var text = clip.value
  if (!text.startsWith(startString)) {
    alert("Don't paste rubbish bruh!!")
    return
  }
  text = JSON.parse(  CryptoJS.AES.decrypt(text.substring(startString.length),AES_KEY).toString(CryptoJS.enc.Utf8) )
  currentTab = await chrome.tabs.update({ url: text.website })
  chrome.scripting.executeScript(
    {
      target: { tabId: currentTab.id, allFrames: true },
      func: importer,
      args: [text.cookies, text.localstorage, text.sessionstorage]
    });
});
