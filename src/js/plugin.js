import videojs from 'video.js';
import Chromecast from './videojs-chromecast';

/**
 * The video.js playlist plugin. Invokes the playlist-maker to create a
 * playlist function on the specific player.
 *
 * @param {Array} list
 */
const plugin = function (options) {
    let player = this
    player.addChild('Chromecast', options)
};

videojs.plugin('chromecast', plugin);

export default plugin;
