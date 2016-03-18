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

var _videoJs = require('video.js');

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
        if (this.tryingReconnect < 3) {
          this.setTimeout(this.initializeApi, 5000);
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
      var ref1 = undefined;
      var value = undefined;

      _videoJs2['default'].log('Session initialized: ' + session.sessionId);

      this.selectedTrack = null;
      this.apiSession = session;
      this.addClass('connected');

      var source = this.player_.currentSrc();
      var type = this.player_.currentType();

      mediaInfo = new chrome.cast.media.MediaInfo(source, type);

      if (this.options_.metadata) {
        mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
        ref = this.options_.metadata;
        for (key in ref) {
          value = ref[key];
          mediaInfo.metadata[key] = value;
        }

        //Add poster image on player
        var poster = this.player().poster();
        if (poster) {
          image = new chrome.cast.Image(poster);
          mediaInfo.metadata.images = [image];
        }
      }

      // Load/Add caption tracks
      this.plTracks = this.options_.tracks;

      if (this.plTracks) {
        this.nbTrack = 1;
        this.tracks = [];
        ref1 = this.plTracks;
        for (key in ref1) {
          value = ref1[key];
          this.track = new chrome.cast.media.Track(this.nbTrack, chrome.cast.media.TrackType.TEXT);
          this.track.trackContentId = value.src;
          this.track.trackContentType = value.type;
          this.track.subtype = chrome.cast.media.TextTrackType.CAPTIONS;
          this.track.name = value.label;
          this.track.language = value.language;
          if (value.mode === 'showing') {
            this.selectedTrack = this.track;
          }
          this.track.customData = null;
          this.tracks.push(this.track);
          ++this.nbTrack;
        }

        mediaInfo.textTrackStyle = new chrome.cast.media.TextTrackStyle();
        mediaInfo.tracks = this.tracks;
      }

      // Request load media source
      loadRequest = new chrome.cast.media.LoadRequest(mediaInfo);

      loadRequest.autoplay = true;
      loadRequest.currentTime = this.player_.currentTime();

      this.apiSession.loadMedia(loadRequest, this.onMediaDiscovered.bind(this), this.castError.bind(this));
      return this.apiSession.addUpdateListener(this.onSessionUpdate.bind(this));
    }
  }, {
    key: 'onTrackChangeHandler',
    value: function onTrackChangeHandler() {
      var i = undefined;
      var len = undefined;
      var ref = undefined;
      var track = undefined;

      this.activeTrackIds = [];

      ref = this.player_.textTracks();
      for (i = 0, len = ref.length; i < len; i++) {
        track = ref[i];
        if (track['mode'] === 'showing') {
          this.activeTrackIds.push(track.id);
        }
      }
      this.tracksInfoRequest = new chrome.cast.media.EditTracksInfoRequest(this.activeTrackIds);

      if (this.apiMedia) {
        return this.apiMedia.editTracksInfo(this.tracksInfoRequest, this.onTrackSuccess.bind(this), this.onTrackError.bind(this));
      }
    }
  }, {
    key: 'onTrackSuccess',
    value: function onTrackSuccess() {
      return _videoJs2['default'].log('track added');
    }
  }, {
    key: 'onTrackError',
    value: function onTrackError() {
      return _videoJs2['default'].log('track error');
    }
  }, {
    key: 'onMediaDiscovered',
    value: function onMediaDiscovered(media) {
      this.apiMedia = media;
      this.apiMedia.addUpdateListener(this.onMediaStatusUpdate.bind(this));
      if (this.selectedTrack) {
        this.activeTrackIds = [this.selectedTrack.trackId];
        this.tracksInfoRequest = new chrome.cast.media.EditTracksInfoRequest(this.activeTrackIds);
        this.apiMedia.editTracksInfo(this.tracksInfoRequest, this.onTrackSuccess.bind(this), this.onTrackError.bind(this));
      }
      this.startProgressTimer(this.incrementMediaTime.bind(this));
      this.player_.loadTech_('Chromecast', {
        receiver: this.apiSession.receiver.friendlyName
      });

      this.casting = true;
      this.paused = this.player_.paused();
      this.inactivityTimeout = this.player_.options_.inactivityTimeout;
      this.player_.options_.inactivityTimeout = 0;
      return this.player_.userActive(true);
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
    key: 'onMediaStatusUpdate',
    value: function onMediaStatusUpdate(isAlive) {
      if (!this.apiMedia) {
        return;
      }
      this.currentMediaTime = this.apiMedia.currentTime;
      switch (this.apiMedia.playerState) {
        case chrome.cast.media.PlayerState.IDLE:
          this.currentMediaTime = 0;
          this.trigger('timeupdate');
          return this.onStopAppSuccess();
        case chrome.cast.media.PlayerState.PAUSED:
          if (this.paused) {
            return;
          }
          this.player_.pause();
          return this.paused = true;
        case chrome.cast.media.PlayerState.PLAYING:
          if (!this.paused) {
            return;
          }
          this.player_.play();
          return this.paused = false;
      }
    }
  }, {
    key: 'startProgressTimer',
    value: function startProgressTimer(callback) {
      if (this.timer) {
        this.clearInterval(this.timer);
        this.timer = null;
      }
      return this.timer = this.setInterval(callback.bind(this), this.timerStep);
    }
  }, {
    key: 'play',
    value: function play() {
      if (!this.apiMedia) {
        return;
      }
      if (this.paused) {
        this.apiMedia.play(null, this.mediaCommandSuccessCallback.bind(this, 'Playing: ' + this.apiMedia.sessionId), this.onError.bind(this));
        return this.paused = false;
      }
    }
  }, {
    key: 'pause',
    value: function pause() {
      if (!this.apiMedia) {
        return;
      }
      if (!this.paused) {
        this.apiMedia.pause(null, this.mediaCommandSuccessCallback.bind(this, 'Paused: ' + this.apiMedia.sessionId), this.onError);
        return this.paused = true;
      }
    }
  }, {
    key: 'seekMedia',
    value: function seekMedia(position) {
      var request = undefined;
      request = new chrome.cast.media.SeekRequest();
      request.currentTime = position;
      if (this.player_.controlBar.progressControl.seekBar.videoWasPlaying) {
        request.resumeState = chrome.cast.media.ResumeState.PLAYBACK_START;
      }
      return this.apiMedia.seek(request, this.onSeekSuccess.bind(this, position), this.onError.bind(this));
    }
  }, {
    key: 'onSeekSuccess',
    value: function onSeekSuccess(position) {
      return this.currentMediaTime = position;
    }
  }, {
    key: 'setMediaVolume',
    value: function setMediaVolume(level, mute) {
      var request = undefined;
      var volume = undefined;
      if (!this.apiMedia) {
        return;
      }
      volume = new chrome.cast.Volume();
      volume.level = level;
      volume.muted = mute;
      this.currentVolume = volume.level;
      this.muted = mute;
      request = new chrome.cast.media.VolumeRequest();
      request.volume = volume;
      this.apiMedia.setVolume(request, this.mediaCommandSuccessCallback.bind(this, 'Volume changed'), this.onError.bind(this));
      return this.player_.trigger('volumechange');
    }
  }, {
    key: 'incrementMediaTime',
    value: function incrementMediaTime() {
      if (this.apiMedia.playerState !== chrome.cast.media.PlayerState.PLAYING) {
        return;
      }
      if (this.currentMediaTime < this.apiMedia.media.duration) {
        this.currentMediaTime += 1;
        return this.trigger('timeupdate');
      } else {
        this.currentMediaTime = 0;
        return this.clearInterval(this.timer);
      }
    }
  }, {
    key: 'mediaCommandSuccessCallback',
    value: function mediaCommandSuccessCallback(information, event) {
      return _videoJs2['default'].log(information);
    }
  }, {
    key: 'onError',
    value: function onError() {
      return _videoJs2['default'].log('error');
    }
  }, {
    key: 'stopCasting',
    value: function stopCasting() {
      return this.apiSession.stop(this.onStopAppSuccess.bind(this), this.onError);
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
      this.player_.options_.inactivityTimeout = this.inactivityTimeout;
      this.apiMedia = null;
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
     *
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