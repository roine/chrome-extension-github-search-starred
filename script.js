;
(function (global) {

    var url = 'https://api.github.com/users/roine/starred';
    var console = chrome.extension.getBackgroundPage().console;


    function xhrSuccess() {
        this.callback.apply(this);
    }

    function xhrError() {
        console.error(this.statusText);
    }

    function loadStarred(sURL, fCallback) {
        var oReq = new XMLHttpRequest();
        oReq.callback = fCallback;
        oReq.onload = xhrSuccess;
        oReq.onerror = xhrError;
        oReq.open("get", sURL, true);
        oReq.send(null);
    }

    loadStarred(url, updateSource);

    function updateSource() {
        var data = JSON.parse(this.responseText);
        chrome.omnibox.onInputChanged.addListener(function updateResult(text, suggest) {
            var suggestion = [];
            var reg = new RegExp("[ ,;]+", "g");
            var texts = text.split(reg)
            var exp = '';
            for (i in texts) {
                exp += '(?=.*' + texts[i] + ')';
            }
            var regAnd = new RegExp(exp + '.*', "gi");
            var regOr = new RegExp(texts.join('|'), "gi");
            // error append show it
            if (data.message) {
                console.log(data)
                alert(data.message)
                return;
            }
            for (var i in data) {
                var item = data[i];

                if (item.description.match(regAnd) || item.name.match(regOr)) {
                    suggestion.push({content: item.html_url, description: item.name + ': ' + item.description})
                }
            }
            suggest(suggestion);
        });
        chrome.omnibox.onInputEntered.addListener(function (url) {
            chrome.tabs.create({ url: url });
        });
    }


})(this);