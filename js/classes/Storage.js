import playlistID from '../data/playlistID.js';

export default class Storage {
    constructor() {

    }

    get titleFilter() {
        return getGeneric(`TITLE_${playlistID}`, true);
    }

    set titleFilter(searchString) {
        return setGeneric({ [`TITLE_${playlistID}`]: searchString }, true);
    }

    get channelFilter() {
        return getGeneric(`CHANNEL_${playlistID}`, true);
    }

    set channelFilter(searchString) {
        return setGeneric({ [`CHANNEL_${playlistID}`]: searchString }, true);
    }

    get videos() {
        return getGeneric(`VIDEOS_${playlistID}`, false);
    }

    set videos(videos) {
        return setGeneric({ [`VIDEOS_${playlistID}`]: videos }, false);
    }

    resetVideos() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.remove(`VIDEOS_${playlistID}`, (result) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                    return reject(chrome.runtime.lastError);
                }
                resolve();
            });
        });
    }
}

function getGeneric(key, isSync) {
    return new Promise((resolve, reject) => {
        chrome.storage[isSync ? 'sync' : 'local'].get(key, (result) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                return reject(chrome.runtime.lastError);
            }
            resolve(result[key] ?? '');
        });
    });
}

function setGeneric(obj, isSync) {
    chrome.storage[isSync ? 'sync' : 'local'].set(obj, (result) => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            alert(chrome.runtime.lastError);
        }
    });
}
