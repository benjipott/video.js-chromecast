(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
if (typeof window !== "undefined") {
    module.exports = window;
} else if (typeof global !== "undefined") {
    module.exports = global;
} else if (typeof self !== "undefined"){
    module.exports = self;
} else {
    module.exports = {};
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
(function (global){
/**
 * @file chromecast-button.js
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

var _videoJs = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

var _videoJs2 = _interopRequireDefault(_videoJs);

var Component = _videoJs2['default'].getComponent('Component');
var ControlBar = _videoJs2['default'].getComponent('ControlBar');
var Button = _videoJs2['default'].getComponent('Button');

/**
 * The base class for buttons that toggle chromecast video
 *
 * @param {Player|Object} player
 * @param {Object=} options
 * @extends Button
 * @class ChromeCastButton
 */

var ChromeCastButton = (function (_Button) {
  _inherits(ChromeCastButton, _Button);

  function ChromeCastButton(player, options) {
    _classCallCheck(this, ChromeCastButton);

    _get(Object.getPrototypeOf(ChromeCastButton.prototype), 'constructor', this).call(this, player, options);
    this.hide();
    this.initializeApi();
    player.chromecast = this;
  }

  /**
   * Init chromecast sdk api
   *
   * @method initializeApi
   */

  _createClass(ChromeCastButton, [{
    key: 'initializeApi',
    value: function initializeApi() {
      var apiConfig = undefined;
      var appId = undefined;
      var sessionRequest = undefined;

      if (!_videoJs2['default'].browser.IS_CHROME) {
        return;
      }
      if (!chrome.cast || !chrome.cast.isAvailable) {
        _videoJs2['default'].log('Cast APIs not available');
        if (this.tryingReconnect < 10) {
          this.setTimeout(this.initializeApi, 1000);
          ++this.tryingReconnect;
        }
        _videoJs2['default'].log('Cast APIs not available. Max reconnect attempt');
        return;
      }
      this.show();
      _videoJs2['default'].log('Cast APIs are available');
      appId = this.options_.appId || chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
      sessionRequest = new chrome.cast.SessionRequest(appId);
      apiConfig = new chrome.cast.ApiConfig(sessionRequest, this.sessionJoinedListener.bind(this), this.receiverListener.bind(this));
      return chrome.cast.initialize(apiConfig, this.onInitSuccess.bind(this), this.castError.bind(this));
    }
  }, {
    key: 'castError',
    value: function castError(_castError) {
      return _videoJs2['default'].log('Cast Error: ' + JSON.stringify(_castError));
    }
  }, {
    key: 'onInitSuccess',
    value: function onInitSuccess() {
      return this.apiInitialized = true;
    }
  }, {
    key: 'sessionJoinedListener',
    value: function sessionJoinedListener(session) {
      return console.log('Session joined');
    }
  }, {
    key: 'receiverListener',
    value: function receiverListener(availability) {
      if (availability === 'available') {
        return this.show();
      }
    }
  }, {
    key: 'doLaunch',
    value: function doLaunch() {
      _videoJs2['default'].log('Cast video: ' + this.player_.currentSrc());
      if (this.apiInitialized) {
        return chrome.cast.requestSession(this.onSessionSuccess.bind(this), this.castError.bind(this));
      } else {
        return _videoJs2['default'].log('Session not initialized');
      }
    }
  }, {
    key: 'onSessionSuccess',
    value: function onSessionSuccess(session) {
      var image = undefined;
      var key = undefined;
      var loadRequest = undefined;
      var mediaInfo = undefined;
      var ref = undefined;
      var value = undefined;

      _videoJs2['default'].log('Session initialized: ' + session.sessionId);

      this.apiSession = session;
      this.addClass('connected');

      var source = this.player_.currentSrc();
      var type = this.player_.currentType();

      mediaInfo = new chrome.cast.media.MediaInfo(source, type);
      mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
      if (this.options_.metadata) {
        ref = this.options_.metadata;
        for (key in ref) {
          value = ref[key];
          mediaInfo.metadata[key] = value;
        }
      }
      //Add poster image on player
      var poster = this.player().poster();
      if (poster) {
        image = new chrome.cast.Image(poster);
        mediaInfo.metadata.images = [image];
      }

      // Load/Add caption tracks
      var plTracks = this.player().textTracks();
      var remotePlTracks = this.player().remoteTextTrackEls();
      if (plTracks) {
        var tracks = [];
        for (var i = 0; i < plTracks.length; i++) {
          var plTrack = plTracks.tracks_[i];
          var remotePlTrack = remotePlTracks.trackElements_[i];
          var track = new chrome.cast.media.Track(i + 1, chrome.cast.media.TrackType.TEXT);
          track.trackContentId = plTrack.id || remotePlTrack.src;
          track.trackContentType = plTrack.type;
          track.subtype = chrome.cast.media.TextTrackType.CAPTIONS;
          track.name = plTrack.label;
          track.language = plTrack.language;
          track.customData = null;
          tracks.push(track);
        }
        mediaInfo.textTrackStyle = new chrome.cast.media.TextTrackStyle();
        mediaInfo.textTrackStyle.foregroundColor = '#FFFFFF';
        mediaInfo.textTrackStyle.backgroundColor = '#00000060';
        mediaInfo.textTrackStyle.edgeType = chrome.cast.media.TextTrackEdgeType.DROP_SHADOW;
        mediaInfo.textTrackStyle.windowType = chrome.cast.media.TextTrackWindowType.ROUNDED_CORNERS;
        mediaInfo.tracks = tracks;
      }

      // Request load media source
      loadRequest = new chrome.cast.media.LoadRequest(mediaInfo);

      loadRequest.autoplay = true;
      loadRequest.currentTime = this.player_.currentTime();

      this.apiSession.loadMedia(loadRequest, this.onMediaDiscovered.bind(this), this.castError.bind(this));
      this.apiSession.addUpdateListener(this.onSessionUpdate.bind(this));
    }
  }, {
    key: 'onMediaDiscovered',
    value: function onMediaDiscovered(media) {
      this.player_.loadTech_('Chromecast', {
        apiMedia: media,
        apiSession: this.apiSession
      });

      this.casting = true;
      this.player_.userActive(true);
    }
  }, {
    key: 'onSessionUpdate',
    value: function onSessionUpdate(isAlive) {
      if (!this.player_.apiMedia) {
        return;
      }
      if (!isAlive) {
        return this.onStopAppSuccess();
      }
    }
  }, {
    key: 'onError',
    value: function onError() {
      return _videoJs2['default'].log('error' + e.code + ' ' + e.description);
    }
  }, {
    key: 'stopCasting',
    value: function stopCasting() {
      return this.apiSession.stop(this.onStopAppSuccess.bind(this), this.onError.bind(this));
    }
  }, {
    key: 'onStopAppSuccess',
    value: function onStopAppSuccess() {
      this.casting = false;
      var time = this.player_.currentTime();
      this.removeClass('connected');
      this.player_.src(this.player_.options_['sources']);
      if (!this.player_.paused()) {
        this.player_.one('seeked', function () {
          return this.player_.play();
        });
      }
      this.player_.currentTime(time);
      return this.apiSession = null;
    }

    /**
     * Allow sub components to stack CSS class names
     *
     * @return {String} The constructed class name
     * @method buildCSSClass
     */
  }, {
    key: 'buildCSSClass',
    value: function buildCSSClass() {
      return 'vjs-chromecast-button ' + _get(Object.getPrototypeOf(ChromeCastButton.prototype), 'buildCSSClass', this).call(this);
    }

    /**
     * Handle click on mute
     * @method handleClick
     */
  }, {
    key: 'handleClick',
    value: function handleClick() {
      _get(Object.getPrototypeOf(ChromeCastButton.prototype), 'handleClick', this).call(this);
      if (this.casting) {
        return this.stopCasting();
      } else {
        return this.doLaunch();
      }
    }
  }]);

  return ChromeCastButton;
})(Button);

ChromeCastButton.prototype.tryingReconnect = 0;

ChromeCastButton.prototype.controlText_ = 'Chromecast';

//Replace videojs CaptionButton child with this one
ControlBar.prototype.options_.children.splice(12, 0, 'chromeCastButton');

Component.registerComponent('ChromeCastButton', ChromeCastButton);
exports['default'] = ChromeCastButton;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _videoJs = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

var _videoJs2 = _interopRequireDefault(_videoJs);

var _videojsChromecast = require('./videojs-chromecast');

var _videojsChromecast2 = _interopRequireDefault(_videojsChromecast);

/**
 * The video.js playlist plugin. Invokes the playlist-maker to create a
 * playlist function on the specific player.
 *
 * @param {Array} list
 */
var plugin = function plugin(options) {
  (0, _videojsChromecast2['default'])(this, options);
};

_videoJs2['default'].plugin('chromecast', plugin);

exports['default'] = plugin;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./videojs-chromecast":5}],4:[function(require,module,exports){
(function (global){
/**
 * @file chromecast.js
 * Chromecast Media Controller - Wrapper for HTML5 Media API
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _videoJs = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

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
    var _this = this;

    _classCallCheck(this, Chromecast);

    _get(Object.getPrototypeOf(Chromecast.prototype), 'constructor', this).call(this, options, ready);
    this.apiMedia = this.options_.source.apiMedia;
    this.apiSession = this.options_.source.apiSession;
    this.receiver = this.apiSession.receiver.friendlyName;

    this.apiMedia.addUpdateListener(this.onMediaStatusUpdate.bind(this));
    this.apiSession.addUpdateListener(this.onSessionUpdate.bind(this));
    this.startProgressTimer();
    var tracks = this.textTracks();
    if (tracks) {
      (function () {
        var changeHandler = _this.handleTracksChange.bind(_this);

        tracks.addEventListener('change', changeHandler);
        _this.on('dispose', function () {
          tracks.removeEventListener('change', changeHandler);
        });

        _this.handleTracksChange();
      })();
    }

    this.update();
    this.triggerReady();
  }

  _createClass(Chromecast, [{
    key: 'createEl',
    value: function createEl() {
      var element = undefined;
      element = _videoJs2['default'].createEl('div', {
        id: this.options_.techId,
        className: 'vjs-tech vjs-tech-chromecast'
      });
      return element;
    }
  }, {
    key: 'update',
    value: function update() {
      this.el_.innerHTML = '<div class="casting-image" style="background-image: url(\'' + this.options_.poster + '\')"></div><div class="casting-overlay"><div class="casting-information"><div class="casting-icon"></div><div class="casting-description"><small>' + this.localize('CASTING TO') + '</small><br>' + this.receiver + '</div></div></div>';
    }
  }, {
    key: 'incrementMediaTime',
    value: function incrementMediaTime() {
      if (this.apiMedia.playerState !== chrome.cast.media.PlayerState.PLAYING) {
        return;
      }
      if (this.apiMedia.currentTime) {
        this.trigger('timeupdate');
      } else {
        this.clearInterval(this.timer);
      }
    }
  }, {
    key: 'onSessionUpdate',
    value: function onSessionUpdate(isAlive) {
      if (!this.apiMedia) {
        return;
      }
      if (!isAlive) {
        return this.onStopAppSuccess();
      }
    }
  }, {
    key: 'onStopAppSuccess',
    value: function onStopAppSuccess() {
      this.clearInterval(this.timer);
      this.casting = false;
      this.removeClass('connected');
      this.player_.src(this.player_.options_['sources']);
      if (!this.paused) {
        this.player_.one('seeked', function () {
          return this.player_.play();
        });
      }
      this.player_.currentTime(this.currentMediaTime);
      this.player_.controls(false);
      this.player_.apiMedia = null;
      return this.apiSession = null;
    }
  }, {
    key: 'onMediaStatusUpdate',
    value: function onMediaStatusUpdate() {
      if (!this.apiMedia) {
        return;
      }
      switch (this.apiMedia.playerState) {
        case chrome.cast.media.PlayerState.BUFFERING:
          this.trigger('waiting');
          break;
        case chrome.cast.media.PlayerState.IDLE:
          this.trigger('timeupdate');
          break;
        case chrome.cast.media.PlayerState.PAUSED:
          this.trigger('pause');
          this.paused_ = true;
          break;
        case chrome.cast.media.PlayerState.PLAYING:
          this.trigger('play');
          this.trigger('playing');
          this.paused_ = false;
          break;
      }
    }
  }, {
    key: 'startProgressTimer',
    value: function startProgressTimer() {
      this.clearInterval(this.timer);
      return this.timer = this.setInterval(this.incrementMediaTime.bind(this), this.timerStep);
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
    key: 'handleTracksChange',
    value: function handleTracksChange() {
      var trackInfo = [];
      var tracks = this.textTracks();

      if (!tracks) {
        return;
      }

      for (var i = 0; i < tracks.length; i++) {
        var track = tracks[i];
        if (track['mode'] === 'showing') {
          trackInfo.push(i + 1);
        }
      }

      if (this.apiMedia) {
        this.tracksInfoRequest = new chrome.cast.media.EditTracksInfoRequest(trackInfo);
        return this.apiMedia.editTracksInfo(this.tracksInfoRequest, this.onTrackSuccess.bind(this), this.onTrackError.bind(this));
      }
    }
  }, {
    key: 'onTrackSuccess',
    value: function onTrackSuccess(e) {
      return _videoJs2['default'].log('track added');
    }
  }, {
    key: 'onTrackError',
    value: function onTrackError(e) {
      return _videoJs2['default'].log('track error' + e.code + ' ' + e.description);
    }
  }, {
    key: 'onError',
    value: function onError(e) {
      return _videoJs2['default'].log('error' + e.code + ' ' + e.description);
    }
  }, {
    key: 'play',
    value: function play() {
      if (!this.apiMedia) {
        return;
      }
      if (this.paused_) {
        this.apiMedia.play(null, this.mediaCommandSuccessCallback.bind(this, 'Playing: ' + this.apiMedia.sessionId), this.onError.bind(this));
      }
      return this.paused_ = false;
    }
  }, {
    key: 'pause',
    value: function pause() {
      if (!this.apiMedia) {
        return;
      }
      if (!this.paused_) {
        this.apiMedia.pause(null, this.mediaCommandSuccessCallback.bind(this, 'Paused: ' + this.apiMedia.sessionId), this.onError.bind(this));
        return this.paused_ = true;
      }
    }
  }, {
    key: 'paused',
    value: function paused() {
      return this.paused_;
    }
  }, {
    key: 'currentTime',
    value: function currentTime() {
      if (!this.apiMedia) {
        return 0;
      }
      return this.apiMedia.currentTime;
    }
  }, {
    key: 'setCurrentTime',
    value: function setCurrentTime(position) {

      if (!this.apiMedia) {
        return 0;
      }
      var request = undefined;
      request = new chrome.cast.media.SeekRequest();
      request.currentTime = position;
      //if (this.player_.controlBar.progressControl.seekBar.videoWasPlaying) {
      //  request.resumeState = chrome.cast.media.ResumeState.PLAYBACK_START;
      //}
      return this.apiMedia.seek(request, this.onSeekSuccess.bind(this, position), this.onError.bind(this));
    }
  }, {
    key: 'onSeekSuccess',
    value: function onSeekSuccess(position) {
      _videoJs2['default'].log('seek success' + position);
    }
  }, {
    key: 'volume',
    value: function volume() {
      return this.volume_;
    }
  }, {
    key: 'duration',
    value: function duration() {
      if (!this.apiMedia) {
        return 0;
      }
      return this.apiMedia.media.duration;
    }
  }, {
    key: 'controls',
    value: function controls() {
      return false;
    }
  }, {
    key: 'setVolume',
    value: function setVolume(level) {
      var mute = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      var request = undefined;
      var volume = undefined;
      if (!this.apiMedia) {
        return;
      }
      volume = new chrome.cast.Volume();
      volume.level = level;
      volume.muted = mute;
      this.volume_ = volume.level;
      this.muted_ = mute;
      request = new chrome.cast.media.VolumeRequest();
      request.volume = volume;
      this.apiMedia.setVolume(request, this.mediaCommandSuccessCallback.bind(this, 'Volume changed'), this.onError.bind(this));
      return this.trigger('volumechange');
    }
  }, {
    key: 'mediaCommandSuccessCallback',
    value: function mediaCommandSuccessCallback(information, event) {
      return _videoJs2['default'].log(information);
    }
  }, {
    key: 'muted',
    value: function muted() {
      return this.muted_;
    }
  }, {
    key: 'setMuted',
    value: function setMuted(muted) {
      return this.setVolume(this.volume_, muted);
    }
  }, {
    key: 'supportsFullScreen',
    value: function supportsFullScreen() {
      return false;
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

Chromecast.prototype.paused_ = false;

Chromecast.prototype.options_ = {};

Chromecast.prototype.timerStep = 1000;

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

/*
 * Set the tech's volume control support status
 *
 * @type {Boolean}
 */
Chromecast.prototype['featuresVolumeControl'] = true;

/*
 * Set the tech's playbackRate support status
 *
 * @type {Boolean}
 */
Chromecast.prototype['featuresPlaybackRate'] = false;

/*
 * Set the tech's status on moving the video element.
 * In iOS, if you move a video element in the DOM, it breaks video playback.
 *
 * @type {Boolean}
 */
Chromecast.prototype['movingMediaElementInDOM'] = false;

/*
 * Set the the tech's fullscreen resize support status.
 * HTML video is able to automatically resize when going to fullscreen.
 * (No longer appears to be used. Can probably be removed.)
 */
Chromecast.prototype['featuresFullscreenResize'] = false;

/*
 * Set the tech's progress event support status
 * (this disables the manual progress events of the Tech)
 */
Chromecast.prototype['featuresProgressEvents'] = true;

/*
 * Sets the tech's status on native text track support
 *
 * @type {Boolean}
 */
Chromecast.prototype['featuresNativeTextTracks'] = true;

/*
 * Sets the tech's status on native audio track support
 *
 * @type {Boolean}
 */
Chromecast.prototype['featuresNativeAudioTracks'] = true;

/*
 * Sets the tech's status on native video track support
 *
 * @type {Boolean}
 */
Chromecast.prototype['featuresNativeVideoTracks'] = false;

/*
 * Set the tech's timeupdate event support status
 * (this disables the manual timeupdate events of the Tech)
 */
Chromecast.prototype['featuresTimeupdateEvents'] = true;

_videoJs2['default'].options.chromecast = {};

Component.registerComponent('Chromecast', Chromecast);
Tech.registerTech('Chromecast', Chromecast);
exports['default'] = Chromecast;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../../node_modules/global/window":1}],5:[function(require,module,exports){
(function (global){
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

var _videoJs = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

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
_videoJs2['default'].options.children.chromecast = {};

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

Component.registerComponent('Chromecast', Chromecast);
exports['default'] = Chromecast;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./component/control-bar/chromecast-button":2,"./tech/chromecast":4}]},{},[3]);
