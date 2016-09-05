/**
 * ! videojs-chromecast - v1.0.0 - 2016-02-15
 * Copyright (c) 2015 benjipott
 * Licensed under the Apache-2.0 license.
 * @file videojs-chromecast.js
 **/
import videojs from 'video.js';
import chromecastButton from './component/control-bar/chromecast-button';
import chromecastTech from './tech/chromecast';

let Component = videojs.getComponent('Component');

/**
 * Initialize the plugin.
 * @param options (optional) {object} configuration for the plugin
 */
class Chromecast extends Component {
    constructor (player, options) {
        super(player, options);
    }
}


Chromecast.prototype.options_ = {};


// register the plugin
videojs.options.children.push('chromecast');


videojs.addLanguage('en', {
    'CASTING TO': 'WIEDERGABE AUF'
});

videojs.addLanguage('de', {
    'CASTING TO': 'WIEDERGABE AUF'
});

videojs.addLanguage('it', {
    'CASTING TO': 'PLAYBACK SU'
});

videojs.addLanguage('fr', {
    'CASTING TO': 'CAST EN COURS SUR'
});

const USER_AGENT = window.navigator.userAgent;

videojs.browser.IS_EDGE = (/Edge/i).test(USER_AGENT);

Component.registerComponent('Chromecast', Chromecast);
export default Chromecast;
