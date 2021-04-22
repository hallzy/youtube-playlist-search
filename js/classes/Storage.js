import playlistID from '../data/playlistID.js';

export default class Storage {
    constructor() {

    }

    get filter() {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(playlistID, (result) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                    return reject(chrome.runtime.lastError);
                }
                resolve(result[playlistID] ?? '');
            });
        });
    }

    set filter(searchString) {
        chrome.storage.sync.set(
            {
                [playlistID]: searchString,
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
            chrome.storage.local.get(`VIDEOS_${playlistID}`, (result) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                    return reject(chrome.runtime.lastError);
                }
                resolve(result[`VIDEOS_${playlistID}`]);
            });
        });
    }

    set videos(videos) {
        // NOTE, there is an unlimited storage permission that I can use if needed.
        // Currently local storage quota is 5MB. My biggest playlist is about 5kB,
        // so there is a lot of wiggle room still.
        chrome.storage.local.set(
            {
                [`VIDEOS_${playlistID}`]: videos,
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
