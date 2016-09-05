/**
 * ! videojs-chromecast - v1.0.0 - 2016-02-15
 * Copyright (c) 2015 benjipott
 * Licensed under the Apache-2.0 license.
 * @file videojs-chromecast.js
 **/
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _videoJs = require('video.js');

var _videoJs2 = _interopRequireDefault(_videoJs);

var _componentControlBarChromecastButton = require('./component/control-bar/chromecast-button');

var _componentControlBarChromecastButton2 = _interopRequireDefault(_componentControlBarChromecastButton);

var _techChromecast = require('./tech/chromecast');

var _techChromecast2 = _interopRequireDefault(_techChromecast);

var Component = _videoJs2['default'].getComponent('Component');

/**
 * Initialize the plugin.
 * @param options (optional) {object} configuration for the plugin
 */

var Chromecast = (function (_Component) {
    _inherits(Chromecast, _Component);

    function Chromecast(player, options) {
        _classCallCheck(this, Chromecast);

        _get(Object.getPrototypeOf(Chromecast.prototype), 'constructor', this).call(this, player, options);
    }

    return Chromecast;
})(Component);

Chromecast.prototype.options_ = {};

// register the plugin
_videoJs2['default'].options.children.push('chromecast');

_videoJs2['default'].addLanguage('en', {
    'CASTING TO': 'WIEDERGABE AUF'
});

_videoJs2['default'].addLanguage('de', {
    'CASTING TO': 'WIEDERGABE AUF'
});

_videoJs2['default'].addLanguage('it', {
    'CASTING TO': 'PLAYBACK SU'
});

_videoJs2['default'].addLanguage('fr', {
    'CASTING TO': 'CAST EN COURS SUR'
});

var USER_AGENT = window.navigator.userAgent;

_videoJs2['default'].browser.IS_EDGE = /Edge/i.test(USER_AGENT);

Component.registerComponent('Chromecast', Chromecast);
exports['default'] = Chromecast;
module.exports = exports['default'];