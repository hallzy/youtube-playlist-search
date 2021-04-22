const playlistID = await getPlaylistID();
export default playlistID;

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

async function getPlaylistID() {
    const url = await getCurrentTabURL();
    const urlObj = new URL(url);
    const search = urlObj.search;
    const searchObj = new URLSearchParams(search);

    return searchObj.get('list');
}
