import videoList from '../elements/videoList.js'

import updateMatchCount from '../functions/updateMatchCount.js';

const videosPerLoad = 25;
let videos = [];
let nextStartIdx = 0;

export default function lazyLoad(vidsInput) {
    if (vidsInput) {
        reset();
        videos = vidsInput;
    }
    videoList.innerHTML += getVideoHTML();
    updateMatchCount();
}

function reset() {
    nextStartIdx = 0;
    videoList.innerHTML = '';
}

function getNextVideos() {
    const startIdx = nextStartIdx;
    nextStartIdx += videosPerLoad;
    const endIdx = nextStartIdx;

    return videos.slice(startIdx, endIdx);
}

function getVideoHTML() {
    let html = '';

    const videos = getNextVideos();
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
