function makeLinksClickable()
{
    document.querySelectorAll('ul.list a')
        .forEach(
            el => {
                addClickHandler(el);
            }
        );
    ;
}

function addClickHandler(el)
{
    el.addEventListener(
        'click',
        (e) =>
        {
            const url = e.currentTarget.href;
            openVideo(url);
        }
    );
}

function openVideo(url)
{
    chrome.tabs.getSelected(
        null,
        tab =>
        {
            chrome.tabs.update(tab.id, { url });
        }
    );
}

const filterInput = document.querySelector('input');
filterInput.addEventListener(
    'change',
    (event) =>
    {
        const searchWords = event.target.value.split(' ');
        updateVideoList(searchWords);
    }
);

function createElementFromHTML(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    return div.firstChild;
}

function updateVideoList(searchWords) {
    const videosInList = document.querySelectorAll('li a');

    searchWords = searchWords.map(word => word.toLowerCase());

    videosInList.forEach(
        videoEl =>
        {
            const videoName = videoEl.innerText.toLowerCase();;
            const videoMatches = searchWords.every(word => videoName.indexOf(word) !== -1);

            videoEl.parentElement.hidden = !videoMatches;
        }
    );
}

function addVideoToList(videoName, videoURL)
{
    const html = `
        <li>
            <a href='${videoURL}' class='link title'>${videoName}</a>
        </li>
    `;

    const anchor = createElementFromHTML(html);
    document.querySelector('ul.list').appendChild(anchor);

    const loading = document.querySelector('#loading')
    if (loading)
    {
        loading.remove();
    }
}

function getParameterByName(name, url) {
    name = name.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
    if (!results)
    {
        return null;
    }

    if (!results[2])
    {
        return '';
    }

    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// fills videos with more results from next page until no more pages left
async function fillList(playlistID, oauth_token, next_page_token)
{
    let pageToken = "";

    if (next_page_token)
    {
        pageToken = `&pageToken=${next_page_token}`;
    }
    const requestURL = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=" + playlistID + pageToken + "&access_token=" + oauth_token;

    const settings = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'OAuth ' + oauth_token,
        }
    };

    try
    {
        const response = await fetch(requestURL, settings);
        const json = await response.json();

        const items = json.items;

        for (var i = 0; i < items.length; i++){
            const videoTitle = items[i].snippet.title;
            const videoID =  items[i].snippet.resourceId.videoId;
            addResult(videoTitle, videoID, playlistID);
        }

        if (typeof json.nextPageToken !== "undefined"){
            fillList(playlistID, oauth_token, json.nextPageToken);
        }
    }
    catch(e)
    {
        showError(e);
    }
}

function addResult(videoTitle, videoID, playlistID) {
    const videoURL = "https://www.youtube.com/watch?v=" + videoID + "&list=" + playlistID;

    addVideoToList(videoTitle, videoURL)
}

function showError(message) {
    alert(e);
    console.error(e);
}

chrome.tabs.query(
    {
        'active': true,
        'currentWindow': true
    },
    tabs =>
    {
        var url = tabs[0].url;
        var playlistID = getParameterByName("list", url);

        // handle deprecated playlist access
        if (playlistID == "WL"){
            showError("Watch Later playlist is inaccessible due to privacy concerns. Thank you for understanding.");
            return;
        }

        chrome.identity.getAuthToken(
            {
                'interactive': true
            },
            async token =>
            {
                await fillList(playlistID, token, null);
                makeLinksClickable()
            }
        );
    }
);
