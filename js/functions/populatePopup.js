import storage from '../objects/storage.js';
import matchingVideos from '../objects/matchingVideos.js';

import lazyLoad from '../functions/lazyLoad.js';

import playlistID from '../data/playlistID.js';

export default async function populatePopup() {
    const savedVideos = await storage.videos;

    if (savedVideos) {
        document.querySelector('#menu').classList.add('fetch-btn');
        videos = savedVideos;
    } else {
        const token = await getAuthToken();
        const duration = await timeFunction(() => fillList(token));

        const oneSecond = 1000;
        const fetchTookTooLong = duration > oneSecond;

        if (fetchTookTooLong) {
            storage.videos = videos;
        }
    }

    lazyLoad(matchingVideos.update());
}

async function fillList(token, nextPage) {
    let pageToken = "";

    if (nextPage) {
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

    const items = json.items ?? [];

    items.forEach(item => {
        const videoTitle = item.snippet.title;
        const videoID =  item.snippet.resourceId.videoId;
        const channelName = item.snippet.videoOwnerChannelTitle ?? "";

        const thumbnails = item.snippet.thumbnails;

        const thumbnail = thumbnails.medium ?? thumbnails.high ?? thumbnails.standard ?? thumbnails.maxres ?? thumbnails.default ?? {};
        const thumbnailURL = thumbnail?.url;

        const videoURL = `https://www.youtube.com/watch?v=${videoID}&list=${playlistID}`;

        videos.push({
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


function getAuthToken() {
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ 'interactive': true }, token => resolve(token));
    });
}

async function timeFunction(func) {
    const start = new Date();
    await func();
    const end = new Date();

    return end - start;
}
