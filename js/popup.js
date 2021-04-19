function getMatchingVideos()
{
    setSavedSearch(filterInput.value);

    const searchWords = filterInput
        .value
        .toLowerCase()
        .split(' ')
    ;

    return VIDEOS
        .filter(
            video =>
            {
                const videoName = video.videoTitle.toLowerCase();
                const channelName = video.channelName.toLowerCase();

                const videoMatches = searchWords.every(word => videoName.indexOf(word) !== -1 || channelName.indexOf(word) !== -1);

                return videoMatches;
            }
        )
    ;
}

function addVideosToDOM(append = false)
{
    if (!append)
    {
        nextVideosStartIdx = 0;
    }

    const matchingVideos50 = matchingVideos.slice(nextVideosStartIdx, nextVideosStartIdx + 50);
    nextVideosStartIdx += 50;

    const html = getVideoHTML(matchingVideos50);

    if (append)
    {
        document.querySelector('.video-list').innerHTML += html;
    }
    else
    {
        document.querySelector('.video-list').innerHTML = html;
    }
}

function getVideoHTML(videos)
{
    let html = '';

    videos.forEach(
        videoObj =>
        {
            const { videoTitle, channelName, videoURL, thumbnailURL } = videoObj;

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

            html += `
                <li>
                    <a href='${videoURL}' target='_blank' class='video-link'>
                        ${img}
                        <div class='title'>${videoTitle}</div>
                        ${channel}
                    </a>
                </li>
            `;
        }
    );

    return html;
}

function getPlaylistID(url) {
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
            const channelName = item.snippet.videoOwnerChannelTitle ?? "";

            const thumbnails = item.snippet.thumbnails;

            const thumbnail = thumbnails.medium ?? thumbnails.high ?? thumbnails.standard ?? thumbnails.maxres ?? thumbnails.default ?? {};
            const thumbnailURL = thumbnail?.url;

            const videoURL = `https://www.youtube.com/watch?v=${videoID}&list=${PLAYLIST_ID}`;

            VIDEOS.push(
                {
                    videoTitle,
                    channelName,
                    videoURL,
                    thumbnailURL,
                }
            );
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

function showSpinner()
{
    const spinner = document.querySelector('.spinner');
    spinner.classList.remove('hidden');
}

function hideSpinner()
{
    const spinner = document.querySelector('.spinner');
    spinner.classList.add('hidden');
}

async function populatePopup()
{
    try
    {
        const savedVideos = await getSavedVideos();
        if (savedVideos)
        {
            document.querySelector('#query').classList.add('fetch-btn');
            VIDEOS = savedVideos;
        }
        else
        {
            const token = await getAuthToken();
            const duration = await timeFunction(() => fillList(token));

            const oneSecond = 1000;

            if (duration > oneSecond)
            {
                saveVideos();
            }
        }

        matchingVideos = getMatchingVideos();
        addVideosToDOM();
    }
    catch(e)
    {
        showError(e);
    }
}

async function timeFunction(func)
{
    const start = new Date();
    await func();
    const end = new Date();

    return end - start;
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
                    resolve(result[PLAYLIST_ID] ?? '');
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
                alert(chrome.runtime.lastError);
            }
        }
    );
}

function getSavedVideos()
{
    return new Promise(
        (resolve, reject) =>
        {
            chrome.storage.local.get(
                `VIDEOS_${PLAYLIST_ID}`,
                (result) =>
                {
                    if (chrome.runtime.lastError)
                    {
                        console.error(chrome.runtime.lastError);
                        return reject(chrome.runtime.lastError);
                    }
                    resolve(result[`VIDEOS_${PLAYLIST_ID}`]);
                }
            );
        }
    );
}

function removeSavedVideos()
{
    VIDEOS = [];
    return new Promise(
        (resolve, reject) =>
        {
            chrome.storage.local.remove(
                `VIDEOS_${PLAYLIST_ID}`,
                (result) =>
                {
                    if (chrome.runtime.lastError)
                    {
                        console.error(chrome.runtime.lastError);
                        return reject(chrome.runtime.lastError);
                    }
                    resolve();
                }
            );
        }
    );
}

function saveVideos()
{
    // NOTE, there is an unlimited storage permission that I can use if needed.
    // Currently local storage quota is 5MB. My biggest playlist is about 5kB,
    // so there is a lot of wiggle room still.
    chrome.storage.local.set(
        {
            [`VIDEOS_${PLAYLIST_ID}`]: VIDEOS,
        },
        (result) =>
        {
            if (chrome.runtime.lastError)
            {
                console.error(chrome.runtime.lastError);
                alert(chrome.runtime.lastError);
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

function scrollToTop()
{
    scrollable.scrollTop = 0;
}

async function setupFilterChangeEvent()
{
    if (!filterInput)
    {
        return;
    }

    filterInput.value = await getSavedSearch();
    filterInput.addEventListener(

        'change',
        () => spinnerWrapper(
            () => {
                scrollToTop();
                matchingVideos = getMatchingVideos();
                addVideosToDOM();
            }
        )
    );
}

function setupFetchClickEvent()
{
    const fetchBtn = document.querySelector('.fetch');
    if (!fetchBtn)
    {
        return;
    }

    fetchBtn.addEventListener(
        'click',
        async () =>
        {

            await removeSavedVideos();
            spinnerWrapper(populatePopup);
        }
    );
}

function setupScrollEvent()
{
    if (!scrollable)
    {
        return;
    }

    let lastScrollHeight = 0;
    scrollable.addEventListener(
        'scroll',
        e =>
        {
            const scrollHeight = scrollable.scrollHeight;
            const scrollDistance = scrollable.scrollTop;

            const newScrollHeight = scrollHeight !== lastScrollHeight;

            const percentScrolled = scrollDistance / scrollHeight;

            if (newScrollHeight && percentScrolled > 0.80)
            {
                lastScrollHeight = scrollHeight;
                addVideosToDOM(true);
            }
        }
    );
}

async function spinnerWrapper(func)
{
    showSpinner();
    await func();
    hideSpinner();
}

let PLAYLIST_ID = null;
let VIDEOS = [];
let nextVideosStartIdx = 0;
let matchingVideos = [];

let scrollable = null;
let filterInput = null;

async function main()
{
    const url = await getCurrentTabURL();
    PLAYLIST_ID = getPlaylistID(url);

    if (PLAYLIST_ID == "WL")
    {
        showError("Watch Later playlist is inaccessible due to privacy concerns. Thank you for understanding.");
        return;
    }

    filterInput = document.querySelector('input');
    scrollable = document.querySelector('#scrollable');

    setupFilterChangeEvent();
    setupFetchClickEvent();
    setupScrollEvent();

    spinnerWrapper(populatePopup);
}

window.addEventListener('DOMContentLoaded', main);
