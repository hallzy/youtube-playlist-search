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

## TODO

* Cleanup CSS and fix/improve the styling
* Add a spinner, and display it whenever something is loading
* Add to Chrome Extension Store
