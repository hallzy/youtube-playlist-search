import storage from '../objects/storage.js';
import matchingVideos from '../objects/matchingVideos.js';

import lazyLoad from '../functions/lazyLoad.js';

import playlistID from '../data/playlistID.js';

import channelList from '../elements/channelList.js';

export default async function populatePopup() {
    const savedVideos = await storage.videos;

    if (savedVideos) {
        document.querySelector('#query').classList.add('fetch-btn');
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

    updateVideosByChannelDOM();

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

function updateVideosByChannelDOM() {
    const videosByChannel = getVideosByChannel();

    let html = '';
    videosByChannel.forEach(video => {
        html += `
            <li data-channel='${video.channel}'>${video.channel} (${video.count})</li>
        `;
    });
    channelList.innerHTML = html;
}

function getVideosByChannel() {
    let hash = {};

    videos.forEach(video => {
        const channel = video.channelName;

        if (channel === '') {
            return;
        }

        if (!hash[channel]) {
            hash[channel] = 0;
        }
        hash[channel]++;
    });

    let sorted = Object
        .entries(hash)
        .sort(([,a], [,b]) => b - a)
        .map(([channel, count]) => ({ channel, count }))
    ;

    return sorted;
}
