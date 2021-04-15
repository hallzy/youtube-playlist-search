// handles link clicks from popup
$('body').on('click', 'a', function(e) {
    var href = e.currentTarget.href;
    chrome.tabs.getSelected(null,function(tab) {
        chrome.tabs.update(tab.id, {url: href});
    });
});

// get value of parameter from url (from http://stackoverflow.com/a/901144/5179469)
function getParameterByName(name, url) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// fills videos with more results from next page until no more pages left
function fillList(playlistID, oauth_token, next_page_token, videos){
    var xhr = new XMLHttpRequest();
    request_url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=" + playlistID + "&pageToken=" + next_page_token + "&access_token=" + oauth_token;
    xhr.open("GET", request_url, true); // ASYNC
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'OAuth ' + oauth_token);
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var result = xhr.responseText;
                var jsonResponse = JSON.parse(result);
                var items = jsonResponse["items"];

                for (var i = 0; i < items.length; i++){
                    addResult(items[i].snippet.title, items[i].snippet.resourceId.videoId, playlistID, videos);
                }

                if (typeof jsonResponse.nextPageToken !== "undefined"){
                    fillList(playlistID, oauth_token, jsonResponse.nextPageToken, videos);
                }
            }
        }
    };
    xhr.onerror = function (e) {
        showError("Connection error.");
    };
    xhr.send(null);
}


function addResult(video_title, video_id, playlist_id, videos) {
    videos.add({
        link: "https://www.youtube.com/watch?v=" + video_id + "&list=" + playlist_id,
        title: video_title
    });
}

function showError(message) {
    document.getElementById("content").innerHTML = message;
    document.getElementById("content").style = "text-align: center; max-width: 600px;overflow: hidden;white-space: nowrap;";
}

chrome.tabs.query({'active': true, 'currentWindow': true}, function (tabs) {
    var options = {
        valueNames: [
        { name: 'link', attr: 'href' },
        'title'
        ]
    };

    var videos = new List('videos', options);

    var url = tabs[0].url;
    var playlistID = getParameterByName("list", url);

    // handle deprecated playlist access
    if (playlistID == "WL"){
        showError("Watch Later playlist is inaccessible due to privacy concerns. Thank you for understanding.");
    }

    else {
        chrome.identity.getAuthToken({ 'interactive': true}, function(token) {
            var xhr = new XMLHttpRequest();
            request_url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=" + playlistID + "&access_token=" + token;
            xhr.open("GET", request_url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Authorization', 'OAuth ' + token);
            xhr.onload = function (e) {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var result = xhr.responseText;
                        var jsonResponse = JSON.parse(result);
                        var items = jsonResponse["items"];

                        // add first page of results to videos
                        for (var i = 0; i < items.length; i++){
                            addResult(items[i].snippet.title, items[i].snippet.resourceId.videoId, playlistID, videos);
                        }

                        // fill rest of list if there are more results to load
                        if (jsonResponse.nextPageToken != ""){
                            fillList(playlistID, token, jsonResponse.nextPageToken, videos);
                        }

                        videos.remove("link", "#"); // remove loading entry in list that is required to init the list via list.js

                    } else {
                        showError("Invalid playlist.");
                    }
                }
            };
            xhr.onerror = function (e) {
                showError("Connection error.");
            };
            xhr.send(null);

        });
    } //else
});
