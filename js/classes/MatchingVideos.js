import filterInput from '../elements/filterInput.js';

import storage from '../objects/storage.js';

export default class MatchingVideos {
    constructor() {
        this.videos = [];
    }

    update() {
        storage.filter = filterInput.value;

        const searchWords = filterInput
            .value
            .toLowerCase()
            .split(' ')
        ;

        this.videos = videos.filter(video => {
            const videoName = video.videoTitle.toLowerCase();
            const channelName = video.channelName.toLowerCase();

            const videoMatches = searchWords.every(word => videoName.indexOf(word) !== -1 || channelName.indexOf(word) !== -1);

            return videoMatches;
        });

        return this.videos;
    }

    reset() {
        this.videos = [];
    }

    get count() {
        return this.videos.length;
    }
}
