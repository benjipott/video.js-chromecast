import videojs from 'video.js';
import chromecast from './videojs-chromecast';

/**
 * The video.js playlist plugin. Invokes the playlist-maker to create a
 * playlist function on the specific player.
 *
 * @param {Array} list
 */
const plugin = function (options) {
  chromecast(this, options);
};

videojs.plugin('chromecast', plugin);

export default plugin;
