/**
 * @file chromecast.js
 * Chromecast Media Controller - Wrapper for HTML5 Media API
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _videoJs = require('video.js');

var _videoJs2 = _interopRequireDefault(_videoJs);

var _node_modulesGlobalWindow = require('../../../node_modules/global/window');

var _node_modulesGlobalWindow2 = _interopRequireDefault(_node_modulesGlobalWindow);

var Component = _videoJs2['default'].getComponent('Component');
var Tech = _videoJs2['default'].getComponent('Tech');

/**
 * Chromecast Media Controller - Wrapper for HTML5 Media API
 *
 * @param {Object=} options Object of option names and values
 * @param {Function=} ready Ready callback function
 * @extends Tech
 * @class Chromecast
 */

var Chromecast = (function (_Tech) {
  _inherits(Chromecast, _Tech);

  function Chromecast(options, ready) {
    _classCallCheck(this, Chromecast);

    _get(Object.getPrototypeOf(Chromecast.prototype), 'constructor', this).call(this, options, ready);

    this.featuresVolumeControl = true;
    this.movingMediaElementInDOM = false;
    this.featuresFullscreenResize = false;
    this.featuresProgressEvents = true;
    this.receiver = options.source.receiver;
    this.triggerReady();
  }

  _createClass(Chromecast, [{
    key: 'createEl',
    value: function createEl() {
      var element = undefined;
      element = _videoJs2['default'].createEl('div', {
        id: this.options_.techId,
        className: 'videojs-tech videojs-tech-chromecast',
        innerHTML: '<div class="casting-image" style="background-image: url(\'' + this.options_.poster + '\')"></div><div class="casting-overlay"><div class="casting-information"><div class="casting-icon">&#58880</div><div class="casting-description"><small>' + this.localize('CASTING TO') + '</small><br>' + this.receiver + '</div></div></div>'
      });
      return element;
    }
  }, {
    key: 'startProgressTimer',
    value: function startProgressTimer() {
      return this.player_.chromecastButton.apiInitialized;
    }

    /**
     * Set video
     *
     * @param {Object=} src Source object
     * @method setSrc
     */
  }, {
    key: 'src',
    value: function src(_src) {
      if (_src === undefined) {
        return this.el_.src;
      } else {}
    }
  }, {
    key: 'onProgress',
    value: function onProgress(e) {
      this.trigger('progress');
    }
  }, {
    key: 'resetSrc_',
    value: function resetSrc_(callback) {
      // In Chrome, MediaKeys can NOT be changed when a src is loaded in the video element
      // Dash.js has a bug where it doesn't correctly reset the data so we do it manually
      // The order of these two lines is important. The video element's src must be reset
      // to allow `mediaKeys` to changed otherwise a DOMException is thrown.
      if (this.el()) {
        this.el().src = '';
        if (this.el().setMediaKeys) {
          this.el().setMediaKeys(null).then(callback, callback);
        } else {
          callback();
        }
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      if (this.mediaPlayer_) {
        this.mediaPlayer_.reset();
      }
      this.resetSrc_(Function.prototype);
      _get(Object.getPrototypeOf(Chromecast.prototype), 'dispose', this).call(this, this);
    }
  }]);

  return Chromecast;
})(Tech);

Chromecast.prototype.options_ = {};

/* Dash Support Testing -------------------------------------------------------- */

Chromecast.isSupported = function () {
  return Html5.isSupported() && !!_node_modulesGlobalWindow2['default'].MediaSource;
};

// Add Source Handler pattern functions to this tech
Tech.withSourceHandlers(Chromecast);

/*
 * The default native source handler.
 * This simply passes the source to the video element. Nothing fancy.
 *
 * @param  {Object} source   The source object
 * @param  {Flash} tech  The instance of the Flash tech
 */
Chromecast.nativeSourceHandler = {};

/**
 * Check if Flash can play the given videotype
 * @param  {String} type    The mimetype to check
 * @return {String}         'probably', 'maybe', or '' (empty string)
 */
Chromecast.nativeSourceHandler.canPlayType = function (source) {

  var dashTypeRE = /^application\/(?:dash\+xml|(x-|vnd\.apple\.)mpegurl)/i;
  var dashExtRE = /^video\/(mpd|mp4|webm|m3u8)/i;

  if (dashTypeRE.test(source)) {
    return 'probably';
  } else if (dashExtRE.test(source)) {
    return 'maybe';
  } else {
    return '';
  }
};

/*
 * Check Flash can handle the source natively
 *
 * @param  {Object} source  The source object
 * @return {String}         'probably', 'maybe', or '' (empty string)
 */
Chromecast.nativeSourceHandler.canHandleSource = function (source) {

  // If a type was provided we should rely on that
  if (source.type) {
    return Chromecast.nativeSourceHandler.canPlayType(source.type);
  } else if (source.src) {
    return Chromecast.nativeSourceHandler.canPlayType(source.src);
  }

  return '';
};

/*
 * Pass the source to the flash object
 * Adaptive source handlers will have more complicated workflows before passing
 * video data to the video element
 *
 * @param  {Object} source    The source object
 * @param  {Flash} tech   The instance of the Flash tech
 */
Chromecast.nativeSourceHandler.handleSource = function (source, tech) {
  tech.src(source.src);
};

/*
 * Clean up the source handler when disposing the player or switching sources..
 * (no cleanup is needed when supporting the format natively)
 */
Chromecast.nativeSourceHandler.dispose = function () {};

// Register the native source handler
Chromecast.registerSourceHandler(Chromecast.nativeSourceHandler);

_videoJs2['default'].options.chromecast = {};

Component.registerComponent('Chromecast', Chromecast);
Tech.registerTech('Chromecast', Chromecast);
exports['default'] = Chromecast;
module.exports = exports['default'];