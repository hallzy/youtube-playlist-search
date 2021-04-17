function triggerFilterChange()
{
    const searchWords = filterInput.value.split(' ');
    updateVideoList(searchWords);
    setSavedSearch(searchWords);
}

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
    let channel = '';

    if (thumbnailURL)
    {
        img = `
            <div class='thumbnail'><img src='${thumbnailURL}'></div>
        `;
    }

    if (channelName)
    {
        channel = `
            <div class='channel'>${channelName}</div>
        `;
    }

    const html = `
        <li>
            <a href='${videoURL}' target='_blank' class='video-link'>
                ${img}
                <div class='title'>${videoName}</div>
                ${channel}
            </a>
        </li>
    `;

    const anchor = createElementFromHTML(html);
    document.querySelector('.video-list').appendChild(anchor);

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

async function fillList(token, nextPage)
{
    let pageToken = "";

    if (nextPage)
    {
        pageToken = `&pageToken=${nextPage}`;
    }
    const requestURL = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${PLAYLIST_ID}${pageToken}&access_token=${token}`;

    const settings = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `OAuth ${token}`,
        }
    };

    const response = await fetch(requestURL, settings);
    const json = await response.json();

    const items = json.items ?? [];

    items.forEach(
        item =>
        {
            const videoTitle = item.snippet.title;
            const videoID =  item.snippet.resourceId.videoId;
            const channelName = item.snippet.videoOwnerChannelTitle;

            const thumbnails = item.snippet.thumbnails;

            const thumbnail = thumbnails.medium ?? thumbnails.high ?? thumbnails.standard ?? thumbnails.maxres ?? thumbnails.default ?? {};
            const thumbnailURL = thumbnail?.url;

            const videoURL = `https://www.youtube.com/watch?v=${videoID}&list=${PLAYLIST_ID}`;
            addVideoToList(videoTitle, channelName, videoURL, thumbnailURL)
        }
    );

    if (typeof json.nextPageToken !== "undefined"){
        await fillList(token, json.nextPageToken);
    }
}

function showError(message) {
    document.body.innerHTML = `
        <div class='error'>${message}</div>
    `;
    console.error(message);
}

async function initializeVideoFilter()
{
    const savedSearch = await getSavedSearch();
    filterInput.value = savedSearch;
    triggerFilterChange();
}

function getAuthToken()
{
    return new Promise(
        (resolve, reject) =>
        {
            chrome.identity.getAuthToken(
                {
                    'interactive': true
                },
                token => resolve(token)
            );
        }
    );
}

async function populatePopup()
{
    try
    {
        const token = await getAuthToken();
        await fillList(token);
        initializeVideoFilter();
    }
    catch(e)
    {
        showError(e);
    }
}

function getSavedSearch()
{
    return new Promise(
        (resolve, reject) =>
        {
            chrome.storage.sync.get(
                PLAYLIST_ID,
                (result) =>
                {
                    if (chrome.runtime.lastError)
                    {
                        console.error(chrome.runtime.lastError);
                        return reject(chrome.runtime.lastError);
                    }
                    resolve(result[PLAYLIST_ID]);
                }
            );
        }
    );
}

function setSavedSearch(searchString)
{
    chrome.storage.sync.set(
        {
            [PLAYLIST_ID]: searchString,
        },
        (result) =>
        {
            if (chrome.runtime.lastError)
            {
                console.error(chrome.runtime.lastError);
            }
        }
    );
}

function getCurrentTabURL()
{
    return new Promise(
        (resolve, reject) =>
        {
            chrome.tabs.query(
                {
                    'active': true,
                    'currentWindow': true
                },
                tabs => resolve(tabs[0].url)
            );
        }
    );
}

let PLAYLIST_ID = null;
let filterInput = null;

async function main()
{
    filterInput = document.querySelector('input');
    if (filterInput)
    {
        filterInput.addEventListener('change', triggerFilterChange);
    }

    const url = await getCurrentTabURL();
    PLAYLIST_ID = getParameterByName(url);

    if (PLAYLIST_ID == "WL")
    {
        showError("Watch Later playlist is inaccessible due to privacy concerns. Thank you for understanding.");
    }
    else
    {
        populatePopup();
    }
}

window.addEventListener('DOMContentLoaded', main);
