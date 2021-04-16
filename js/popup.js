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

function addVideoToList(videoName, channelName, videoURL, thumbnailURL)
{
    let img = '';
    if (thumbnailURL)
    {
        img = `
            <div><img src='${thumbnailURL}'></div>
        `;
    }

    const html = `
        <li>
            <a href='${videoURL}' class='link title'>
                ${img}
                <div class='channel'>${channelName}</div>
                <div class='title'>${videoName}</div>
            </a>
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

function getParameterByName(url) {
    const urlObj = new URL(url);
    const search = urlObj.search;
    const searchObj = new URLSearchParams(search);

    return searchObj.get('list');
}

async function fillList(playlistID, token, nextPage)
{
    let pageToken = "";

    if (nextPage)
    {
        pageToken = `&pageToken=${nextPage}`;
    }
    const requestURL = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistID}${pageToken}&access_token=${token}`;

    const settings = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `OAuth ${token}`,
        }
    };

    const response = await fetch(requestURL, settings);
    const json = await response.json();

    const items = json.items;

    items.forEach(
        item =>
        {
            const videoTitle = item.snippet.title;
            const videoID =  item.snippet.resourceId.videoId;
            const channelName = item.snippet.videoOwnerChannelTitle;
            console.log(item.snippet.thumbnails);

            const thumbnails = item.snippet.thumbnails;

            const thumbnail = thumbnails.medium ?? thumbnails.high ?? thumbnails.standard ?? thumbnails.maxres ?? thumbnails.default ?? {};
            const thumbnailURL = thumbnail?.url;

            const videoURL = `https://www.youtube.com/watch?v=${videoID}&list=${playlistID}`;
            addVideoToList(videoTitle, channelName, videoURL, thumbnailURL)
        }
    );

    if (typeof json.nextPageToken !== "undefined"){
        fillList(playlistID, token, json.nextPageToken);
    }
}

function showError(message) {
    document.body.classList.add('error');
    document.body.innerText = message;
    console.error(message);
}

function populatePopup(playlistID)
{
    chrome.identity.getAuthToken(
        {
            'interactive': true
        },
        async token =>
        {
            try
            {
                await fillList(playlistID, token);
                makeLinksClickable()
            }
            catch(e)
            {
                showError(e);
            }
        }
    );
}

chrome.tabs.query(
    {
        'active': true,
        'currentWindow': true
    },
    tabs =>
    {
        const url = tabs[0].url;
        const playlistID = getParameterByName(url);

        if (playlistID == "WL")
        {
            showError("Watch Later playlist is inaccessible due to privacy concerns. Thank you for understanding.");
        }
        else
        {
            populatePopup(playlistID);
        }
    }
);
