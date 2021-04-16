# Youtube Playlist Search

This started as a copy of the "Playlist Search For YouTube" extension, but I am
cleaning it up and customizing it to my liking.

## Customizations

- Searching is now more 'fuzzy', so it searches words individually instead of
  together.
  Searches contain the name of the channel that the video is from, and the
  channel name is also searchable
- Videos in the list have a thumbnail
- Removed list.js and jQuery dependencies (jQuery was literally being used for
  list.js and one other thing, and list.js honestly just complicated the script
  more because it just wasn't necessary).
- Cleaned up the code significantly
- Updated and cleaned up CSS
- The UI resembles the YouTube dark theme now.

## Installation

I do not have this in the Chrome Extension Store, and I never will. Apparently
Google requires that you pay a $5 registration fee to become an extension
developer now and honestly, I can't be bothered.

So, to install this extension:

* Download, or clone this repository
* Open the 'Extensions' page in Chrome settings
* Toggle 'Developer mode' on (this should be in the top right corner)
* Click "Load Unpacked"
* Select the folder that this extension was saved as when you cloned or
  downloaded it.

You should have the extension now.

Optionally, you can now disable "Developer mode". Chrome should keep the custom
version even after disabling.

## TODO

* Add a spinner, and display it whenever something is loading
