# Youtube Playlist Search

## Donate

[![paypal](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/donate?business=QMDXUKQXRT75N&currency_code=CAD)

### Crypto

Click address for QR code

BTC: [1QCihPNTYRKMhwW6vKjHNkGJkWzR5vdsRp](https://stmhall.ca/btc.png)

ETH: [0xF7A8fed794e5ed89a294b2E6c3f1BcCa03b8ebaC](https://stmhall.ca/eth.png)

LTC: [MMcQLnqeZ6zrfzhLWqwfgoEuKCd5P3ASP4](https://stmhall.ca/ltc.png)

## Description

This started as a copy of the "Playlist Search For YouTube" extension, but I am
cleaning it up and customizing it to my liking.

![Screenshot 1](screenshot-1.png)

![Screenshot 2](screenshot-2.png)

## Limitations

- You must authenticate with Google when using the extension for the first time
  so that the extension is able to use the YouTube API.
  The YouTube API does not allow access to your "Watch List", so the extension
  will not work on your "Watch List".

## Customizations

- Searching is now more 'fuzzy', so it searches words individually instead of
  together.
- Search by video title
- Searchable channel dropdown
- Videos in the list have a thumbnail
- Removed list.js and jQuery dependencies (jQuery was literally being used for
  list.js and one other thing, and list.js honestly just complicated the script
  more because it just wasn't necessary).
- Cleaned up the code significantly
- Updated and cleaned up CSS
- The UI resembles the YouTube dark theme now.
- Clicking on a video opens the video in a new tab
- Search filter is persistent. The extension will remember the filter you used
  the last time that you did a search for a particular playlist.
- Loading spinner
- Lazy Loading
- Local storage of videos for large playlists for fast retrieval
  - Fetch button to force fetch the playlist from the API

## Installation

I do not have this in the Chrome Extension Store, and I never will. Apparently
Google requires that you pay a $5 registration fee to become an extension
developer now and honestly, I can't be bothered.

If you want to publish this extension in the Chrome Web Store, you are free to
do so. However, I just ask that you:

* Let me know first so I can update this README to say that it is being added
* Let me know when it is approved and published so that I can post the link here
* Let reference this git repo somewhere in the details of the extension so that
  people can easily review the code if they want, and/or submit bug reports or
  feature requests.
* Try and keep the chrome extension in the store relatively up to date with the
  repo.

So, to install this extension:

* Download, or clone this repository
* For the 'Brave Browser' only, enable the setting "Allow Google login for
  extensions" and restart the browser
* Open the 'Extensions' page in Chrome settings
* Toggle 'Developer mode' on (this should be in the top right corner)
* Click "Load Unpacked"
* Select the folder that this extension was saved as when you cloned or
  downloaded it.

You should have the extension now.

When you use the extension for the first time you will be required to log in to
a Google account. This extension uses Google's YouTube API, and requires a token
from Google that allows the extension to retrieve information from the API.

Optionally, you can now disable "Developer mode". Chrome should keep the custom
version even after disabling.

## Why this Extension is Missing from Extension Stores

This extension is currently not in any extension store.

You are free to add it to an extension store if you want, but if you do so I ask
that you:

* Let me know first so I can update this README to say that it is being added
* Let me know when it is approved and published so that I can post the link here
* Let reference this git repo somewhere in the details of the extension so that
  people can easily review the code if they want, and/or submit bug reports or
  feature requests.
* Try and keep the chrome extension in the store relatively up to date with the
  repo.

There are a variety of reasons why this isn't in any extension store, which I
will list below:

### Google Chrome / Chromium Browsers

I do not have this in the Chrome Extension Store because apparently Google
requires that you pay a $5 registration fee to become an extension developer now
and honestly, I can't be bothered, and I find it kind of insulting that I spend
my free time to make a free extension and then I have to pay Google for the
privilege to add it to their store.

### Firefox

Firefox's extension system is significantly different to Chrome, and this is a
Chrome extension. There would be added work involved in getting it working on
Firefox because of this.

I am also not that familiar with extension development, and I don't even know if
you can use the YouTube APIs from Google in Firefox, which I need in order for
this extension to work.

### Edge

In theory, Edge should be easy to do because it is a Chromium based browser.

However, I also don't know if Edge has the ability to use the YouTube API.

But more importantly, I don't have any Windows computers in my home so there is
no way for me to test if Edge even works at all.

This also means that any changes I make in the future will have absolutely 0
testing for Edge before an update.

### Safari

I don't know if Safari has the ability to use the YouTube API.

Like Windows, I don't have any Macs in my home so there is no way for me to test
Safari either, so there is no way to know if it would even work.

This also means that any changes I make in the future will have absolutely 0
testing for Edge before an update.

I also am not familiar with Safari at all and if it even has an extension store
or what is involved in adding it.
