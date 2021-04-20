class LazyLoader {
    constructor(videoListElement, scrollableEl, videosPerLoad) {
        this.videoList = videoListElement;
        this.videosPerLoad = videosPerLoad;
        this.videos = [];
        this.nextStartIdx = 0;

        this.startLazyScroll(scrollableEl);
    }

    startLazyScroll(scrollable) {
        let lastScrollHeight = 0;

        scrollable.addEventListener('scroll', e => {
            const scrollHeight = scrollable.scrollHeight;
            const scrollDistance = scrollable.scrollTop;

            const newScrollHeight = scrollHeight !== lastScrollHeight;

            const percentScrolled = scrollDistance / scrollHeight;

            const triggerUpdate = newScrollHeight && percentScrolled > 0.80;
            if (triggerUpdate) {
                lastScrollHeight = scrollHeight;
                this.updateDOM();
            }
        });
    }

    reset() {
        this.nextStartIdx = 0;
        this.videoList.innerHTML = '';
    }

    getNextVideos() {
        const startIdx = this.nextStartIdx;
        this.nextStartIdx += this.videosPerLoad;
        const endIdx = this.nextStartIdx;

        return this.videos.slice(startIdx, endIdx);
    }

    getVideoHTML() {
        let html = '';

        const videos = this.getNextVideos();
        videos.forEach(videoObj => {
            const { videoTitle, channelName, videoURL, thumbnailURL } = videoObj;

            let img = '';
            let channel = '';

            if (thumbnailURL) {
                img = `
                    <div class='thumbnail'><img src='${thumbnailURL}'></div>
                `;
            }

            if (channelName) {
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
        });

        return html;
    }

    updateDOM(videos) {
        if (videos) {
            this.reset();
            this.videos = videos;
        }
        this.videoList.innerHTML += this.getVideoHTML();
    }
}

class Spinner {
    constructor(spinnerEl) {
        this.el = spinnerEl;
    }

    async wrapAround(func) {
        this.show();
        await func();
        this.hide();
    }

    show() {
        this.el.classList.remove('hidden');
    }

    hide() {
        this.el.classList.add('hidden');
    }
}

class Storage {
    constructor() {

    }

    get filter() {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(PLAYLIST_ID, (result) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                    return reject(chrome.runtime.lastError);
                }
                resolve(result[PLAYLIST_ID] ?? '');
            });
        });
    }

    set filter(searchString) {
        chrome.storage.sync.set(
            {
                [PLAYLIST_ID]: searchString,
            },
            (result) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                    alert(chrome.runtime.lastError);
                }
            }
        );
    }

    get videos() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(`VIDEOS_${PLAYLIST_ID}`, (result) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                    return reject(chrome.runtime.lastError);
                }
                resolve(result[`VIDEOS_${PLAYLIST_ID}`]);
            });
        });
    }

    set videos(videos) {
        // NOTE, there is an unlimited storage permission that I can use if needed.
        // Currently local storage quota is 5MB. My biggest playlist is about 5kB,
        // so there is a lot of wiggle room still.
        chrome.storage.local.set(
            {
                [`VIDEOS_${PLAYLIST_ID}`]: videos,
            },
            (result) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                    alert(chrome.runtime.lastError);
                }
            }
        );
    }

    resetVideos() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.remove(`VIDEOS_${PLAYLIST_ID}`, (result) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                    return reject(chrome.runtime.lastError);
                }
                resolve();
            });
        });
    }
}

function getMatchingVideos() {
    storage.filter = filterInput.value;

    const searchWords = filterInput
        .value
        .toLowerCase()
        .split(' ')
    ;

    return VIDEOS.filter(video => {
        const videoName = video.videoTitle.toLowerCase();
        const channelName = video.channelName.toLowerCase();

        const videoMatches = searchWords.every(word => videoName.indexOf(word) !== -1 || channelName.indexOf(word) !== -1);

        return videoMatches;
    });
}

function getPlaylistID(url) {
    const urlObj = new URL(url);
    const search = urlObj.search;
    const searchObj = new URLSearchParams(search);

    return searchObj.get('list');
}

async function fillList(token, nextPage) {
    let pageToken = "";

    if (nextPage) {
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

    items.forEach(item => {
        const videoTitle = item.snippet.title;
        const videoID =  item.snippet.resourceId.videoId;
        const channelName = item.snippet.videoOwnerChannelTitle ?? "";

        const thumbnails = item.snippet.thumbnails;

        const thumbnail = thumbnails.medium ?? thumbnails.high ?? thumbnails.standard ?? thumbnails.maxres ?? thumbnails.default ?? {};
        const thumbnailURL = thumbnail?.url;

        const videoURL = `https://www.youtube.com/watch?v=${videoID}&list=${PLAYLIST_ID}`;

        VIDEOS.push({
            videoTitle,
            channelName,
            videoURL,
            thumbnailURL,
        });
    });

    const thereIsNextPage = typeof json.nextPageToken !== "undefined";
    if (thereIsNextPage) {
        await fillList(token, json.nextPageToken);
    }
}

function showError(message) {
    document.body.innerHTML = `
        <div class='error'>${message}</div>
    `;
    console.error(message);
}

function getAuthToken() {
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ 'interactive': true }, token => resolve(token));
    });
}

async function populatePopup() {
    try {
        const savedVideos = await storage.videos;
        if (savedVideos) {
            document.querySelector('#query').classList.add('fetch-btn');
            VIDEOS = savedVideos;
        } else {
            const token = await getAuthToken();
            const duration = await timeFunction(() => fillList(token));

            const oneSecond = 1000;
            const fetchTookTooLong = duration > oneSecond;

            if (fetchTookTooLong) {
                storage.videos = VIDEOS;
            }
        }

        lazyLoader.updateDOM(getMatchingVideos());
    } catch(e) {
        showError(e);
    }
}

async function timeFunction(func) {
    const start = new Date();
    await func();
    const end = new Date();

    return end - start;
}

function getCurrentTabURL() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query(
            {
                'active': true,
                'currentWindow': true
            },
            tabs => resolve(tabs[0].url)
        );
    });
}

function scrollToTop() {
    scrollable.scrollTop = 0;
}

async function setupFilterChangeEvent() {
    if (!filterInput) {
        return;
    }

    filterInput.value = await storage.filter;
    filterInput.addEventListener('change', () => {
        spinner.wrapAround(() => {
            scrollToTop();
            lazyLoader.updateDOM(getMatchingVideos());
        })
    });
}

function setupFetchClickEvent() {
    const fetchBtn = document.querySelector('.fetch');
    if (!fetchBtn) {
        return;
    }

    fetchBtn.addEventListener('click', async () => {
        VIDEOS = [];
        await storage.resetVideos();
        spinner.wrapAround(populatePopup);
    });
}

function isBackgroundScript() {
    // If container doesn't exist, then this is the background script, so just
    // ignore everything.
    const container = document.querySelector('.container');
    return !container;
}

let PLAYLIST_ID = null;
let VIDEOS = [];
let nextVideosStartIdx = 0;
let matchingVideos = [];

let scrollable = null;
let filterInput = null;

let lazyLoader = null;
let spinner = null;
let storage = null;

async function main() {
    if (isBackgroundScript()) {
        return;
    }

    const url = await getCurrentTabURL();
    PLAYLIST_ID = getPlaylistID(url);

    if (PLAYLIST_ID == "WL") {
        showError("Watch Later playlist is inaccessible due to privacy concerns. Thank you for understanding.");
        return;
    }

    filterInput = document.querySelector('input');
    scrollable = document.querySelector('#scrollable');

    const videoList = document.querySelector('.video-list');
    const spinnerEl = document.querySelector('.spinner');

    spinner = new Spinner(spinnerEl);
    storage = new Storage();
    lazyLoader = new LazyLoader(videoList, scrollable, 50);

    setupFilterChangeEvent();
    setupFetchClickEvent();

    spinner.wrapAround(populatePopup);
}

window.addEventListener('DOMContentLoaded', main);
