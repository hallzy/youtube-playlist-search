import spinner from './objects/spinner.js';
import playlistID from './data/playlistID.js';
import populatePopup from './functions/populatePopup.js';

window.videos = [];

function showError(message) {
    document.body.innerHTML = `
        <div class='error'>${message}</div>
    `;
    console.error(message);
}

function isBackgroundScript() {
    // If container doesn't exist, then this is the background script, so just
    // ignore everything.
    const container = document.querySelector('.container');
    return !container;
}

(function() {
    try {
        if (isBackgroundScript()) {
            return;
        }

        if (playlistID == "WL") {
            showError("Watch Later playlist is inaccessible due to privacy concerns. Thank you for understanding.");
            return;
        }

        spinner.wrapAround(populatePopup);
    } catch(err) {
        showError(err);
    }
})();
