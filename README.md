# Cool Music Player

Simple responsive music player with controls: play/pause, previous, next, shuffle, loop, replay, progress, and current date/time.

How to use
- Open [index.html](index.html) in your browser.
- The background image will randomly pick one of the three images in `background-image/` each time the page is loaded.
- The player can play a YouTube playlist directly. It is wired to the playlist you provided: `PL0umg_TNpoZTTdZVIi5tfX69pRmoMFGna`.
- For best results click the play button to start (browsers often block autoplay).
- On supported mobile browsers, playback can continue while the tab is backgrounded or the screen is locked, with controls available from the lock screen or notification shade. A regular webpage cannot continue playing after the browser or tab is fully closed; that requires an installed app or PWA with platform-specific support.

Customization
- To use a different YouTube playlist, edit `script.js` and change the `playlistId` constant.
- To use local audio files instead, replace the player implementation in `script.js` with an `<audio>` based playlist and update `index.html` accordingly.

Files created:
- [index.html](index.html)
- [styles.css](styles.css)
- [script.js](script.js)
