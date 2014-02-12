/*! videojs-chromeCast - v0.1.0 - 2014-02-12
* https://github.com/benjipott/videojs-chromeCast
* Copyright (c) 2014 Pott Benjamin; Licensed MIT */

/**
 * Merge two objects together and return the original.
 *
 * @param {Object}
 *                obj1
 * @param {Object}
 *                obj2
 * @return {Object}
 */
vjs.plugin.merge = function(obj1, obj2) {
    var settings = vjs.obj.merge.apply(this,arguments);
    if(settings.hasOwnProperty('userAgentAllowed') && settings.enabled){
        settings.userAgentAllowed = settings.userAgentAllowed.split(',');
        for ( var a = 0, b = settings.userAgentAllowed; a < b.length; a++) {
            var ualist = new RegExp(b[a],'i');
            settings.enabled = !!vjs.USER_AGENT.match(ualist);
            if (settings.enabled){
                break;
            }
        }
    }
    return settings;
};(function() {
    var defaults = {
        enabled : true,
        appId : 'your_app_id',
        namespace : '',
        title:'',
        description:''
    };

    vjs.plugin('chromecast', function(options) {
        var settings = vjs.plugin.merge(defaults, options);

        if (!settings.enabled) {
            return false;
        }

        this.player = this;

        /*
         * 
         * var cast_api, cv_activity;
         * 
         * cast_api = new cast.Api();
         * 
         * if (cast && cast.isAvailable) { // Cast is known to be available this.initializeApi(); } else { // Wait for
         * API to post a message to us window.addEventListener("message", function(event) { if (event.source == window &&
         * event.data && event.data.source == "CastApi" && event.data.event == "Hello") initializeApi(); })); };
         */
        this.chromeCastComponent = new vjs.ChromeCastComponent(this, settings);
        this.player.controlBar.addChild(this.chromeCastComponent);
    });


})();
/**
 * Button pour envoyer le flux a ChromeCast
 *
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
var cast = cast || {};

vjs.Player.prototype.chromeCastComponent = {};

vjs.ChromeCastComponent = vjs.Button.extend({
    /** @constructor */
    init: function (player, options) {
        vjs.Button.call(this, player, options);

        vjs.log(this.player_);
        if (!player.controls()) {
            this.disable();
        }

        this.hide();
        this.el_.setAttribute('role', 'button');

        this.initializeApi();
        
    }

});

vjs.ChromeCastComponent.prototype.kind_ = 'chromecast';
vjs.ChromeCastComponent.prototype.buttonText = 'Chromecast';
vjs.ChromeCastComponent.prototype.className = 'vjs-chromecast-button ';
vjs.ChromeCastComponent.prototype.chromeCastBanner = {};


vjs.ChromeCastComponent.prototype.apiMedia = null;
vjs.ChromeCastComponent.prototype.apiSession = null;
vjs.ChromeCastComponent.prototype.apiInitialized = false;

vjs.ChromeCastComponent.prototype.progressFlag = 1;
vjs.ChromeCastComponent.prototype.timer = null;
vjs.ChromeCastComponent.prototype.timerStep = 1000;
vjs.ChromeCastComponent.prototype.currentMediaTime = 0;

vjs.ChromeCastComponent.prototype.playing = false;


vjs.ChromeCastComponent.prototype.onInitSuccess = function() {
    vjs.log("api_status :Initialized");

    this.apiInitialized = true;
}

vjs.ChromeCastComponent.prototype.onInitError = function(castError) {
    vjs.log("Initialize Error: " + JSON.stringify(castError));
};

vjs.ChromeCastComponent.prototype.sessionJoinedListener = function(session) {
    vjs.log("Joined " + session.sessionId);
};

vjs.ChromeCastComponent.prototype.sessionUpdateListener = function(session) {};

vjs.ChromeCastComponent.prototype.receiverListener = function(availability) {
    vjs.log("receivers available: " + (('available' === availability) ? "Yes" : "No"));
    if ('available' === availability){
        this.show();
    }
};

vjs.ChromeCastComponent.prototype.initializeApi = function () {
    vjs.log('ChromeCastComponent initializeApi');

    if (!vjs.IS_CHROME){
        return;
    }

    if (!chrome.cast || !chrome.cast.isAvailable) {
        vjs.log("Cast APIs not Available. Retrying...");
        setTimeout(this.initializeApi.bind(this), 1000);
        return;
    }

    var sessionRequest = new chrome.cast.SessionRequest(this.options_.appId);
    var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
                    this.sessionJoinedListener.bind(this),
                    this.receiverListener.bind(this));
    chrome.cast.initialize(apiConfig, this.onInitSuccess.bind(this), this.onInitError.bind(this));
};

vjs.ChromeCastComponent.prototype.doLaunch = function () {
    vjs.log("Cast video : " + this.player_.currentSrc());

    if(this.apiInitialized) {
        chrome.cast.requestSession(
                // Success
                this.onSessionSuccess.bind(this),
                // Error
                function(castError){
                    vjs.log("session_established ERROR: " + JSON.stringify(castError));
                });
    } else {
        vjs.log("session_established NOT INITIALIZED");
    }
};

vjs.ChromeCastComponent.prototype.onSessionSuccess = function(session){
    this.apiSession = session;
    vjs.log("session_established YES - " + session.sessionId);

    this.addClass("connected");

    this.player_.pause();
    this.player_.chromeCastComponent.disableNativeControls();

    var mediaInfo = new chrome.cast.media.MediaInfo(this.player_.currentSrc(), "video/mp4");
    //vjs.log("## MediaInfo('"+url+"', '"+mime+"')");
    var loadRequest = new chrome.cast.media.LoadRequest(mediaInfo);
    loadRequest.autoplay = true;

    vjs.log('Sending Load Request: ');
    vjs.log(loadRequest);

    this.apiSession.loadMedia(loadRequest, this.onMediaDiscovered.bind(this), this.onMediaError.bind(this));
}

vjs.ChromeCastComponent.prototype.onMediaDiscovered = function(media){
    // chrome.cast.media.Media object
    this.apiMedia = media;
    this.apiMedia.addUpdateListener(this.onMediaStatusUpdate.bind(this));

    vjs.log("Got media object");
    this.startProgressTimer(this.incrementMediaTime.bind(this));
    
    vjs.log("play!!!!");
    this.playing = true;
    this.player_.controlBar.playToggle.onPlay();
    this.player_.onPlay();
    
    if(this.apiMedia.playerState === chrome.cast.media.PlayerState.PLAYING) {
    } else {
    }
}

vjs.ChromeCastComponent.prototype.onMediaError = function(castError){
    vjs.log('Media Error: ' + JSON.stringify(castError));
}

vjs.ChromeCastComponent.prototype.onMediaStatusUpdate = function(e){
    if (this.progressFlag) {
        //vjs.log(parseInt(100 * this.apiMedia.currentTime / this.apiMedia.media.duration) + "%");
        vjs.log(this.apiMedia.currentTime + "/" + this.apiMedia.media.duration);
    }
    vjs.log(this.apiMedia.playerState);
    vjs.ChromeCastComponent.prototype.currentMediaTime = this.apiMedia.currentTime;
}

vjs.ChromeCastComponent.prototype.startProgressTimer = function(callback) {
    if(this.timer) {
        clearInterval(this.timer);
        this.timer = null;
    }
    vjs.log('starting timer...');
    // start progress timer
    this.timer = setInterval(callback.bind(this), this.timerStep);
};

/**
 * play media
 */
vjs.ChromeCastComponent.prototype.playMedia = function() {
  if(!this.apiMedia) 
    return;

  if(!this.playing) {
    this.apiMedia.play(null,
      this.mediaCommandSuccessCallback.bind(this,"playing started for " + this.apiMedia.sessionId),
      this.onError.bind(this));
      this.apiMedia.addUpdateListener(this.onMediaStatusUpdate.bind(this));
      this.player_.controlBar.playToggle.onPlay();
      this.player_.onPlay();
      this.playing = true;
  }
  else {
      this.apiMedia.pause(null,
        this.mediaCommandSuccessCallback.bind(this,"paused " + this.apiMedia.sessionId),
        this.onError.bind(this));

      this.player_.controlBar.playToggle.onPause();
      this.player_.onPause();
      this.playing = false;
  }
}

vjs.ChromeCastComponent.prototype.incrementMediaTime = function() {
  if (this.apiMedia.playerState === chrome.cast.media.PlayerState.PLAYING) {
    if (this.currentMediaTime < this.apiMedia.media.duration) {
      this.currentMediaTime += 1;
      this.updateProgressBarByTimer();
    }
    else {
      this.currentMediaTime = 0;
      clearInterval(this.timer);
    }
  }
};

vjs.ChromeCastComponent.prototype.updateProgressBarByTimer = function(){
    //vjs.log(this.currentMediaTime);
    var bufferedPercent = parseInt(100 * this.currentMediaTime / this.apiMedia.media.duration);
    //vjs.log(bufferedPercent + "%");
    if (this.player_.controlBar.progressControl.seekBar.bar.el_.style) { this.player_.controlBar.progressControl.seekBar.bar.el_.style.width = vjs.round(bufferedPercent, 2) + '%'; }
    if (this.player_.controlBar.progressControl.seekBar.seekHandle.el_.style) { this.player_.controlBar.progressControl.seekBar.seekHandle.el_.style.left = vjs.round(bufferedPercent, 2) + '%'; }
    this.player_.controlBar.currentTimeDisplay.content.innerHTML = '<span class="vjs-control-text">Current Time </span>' + vjs.formatTime(this.currentMediaTime);
}

/**
 * Callback function for media command success 
 */
vjs.ChromeCastComponent.prototype.mediaCommandSuccessCallback = function(info, e) {
  vjs.log(info);
};

vjs.ChromeCastComponent.prototype.onError = function() {
  vjs.log("error");
};


vjs.ChromeCastComponent.prototype.disableNativeControls = function(){

    this.player_.pause();

    this.player_.posterImage.off("click");
    this.player_.posterImage.show();

    this.player_.controlBar.progressControl.seekBar.off('mousedown');
    this.player_.controlBar.progressControl.seekBar.off('touchstart');
    this.player_.controlBar.progressControl.seekBar.off('click');
    this.player_.controlBar.playToggle.off('click');
    this.player_.controlBar.playToggle.off('focus');
    this.player_.controlBar.playToggle.off('blur');

    this.player_.controlBar.playToggle.on('click', this.playMedia.bind(this));
    /*this.player_.controlBar.progressControl.seekBar.on('mousedown');
    this.player_.controlBar.progressControl.seekBar.on('touchstart');
    this.player_.controlBar.progressControl.seekBar.on('click');*/   
};

vjs.ChromeCastComponent.prototype.enableNativeControls = function(){
    this.player_.controlBar.progressControl.seekBar.on('mousedown',  player.controlBar.progressControl.seekBar.onMouseDown);
    this.player_.controlBar.progressControl.seekBar.on('touchstart', player.controlBar.progressControl.seekBar.onMouseDown);
    this.player_.controlBar.progressControl.seekBar.on('click', player.controlBar.progressControl.seekBar.onClick);
};

vjs.ChromeCastComponent.prototype.buildCSSClass = function(){
  return this.className + vjs.Button.prototype.buildCSSClass.call(this);
};

vjs.ChromeCastComponent.prototype.createEl = function (type, props) {
    var el = vjs.Button.prototype.createEl.call(this, 'div');
    return el;
};

vjs.ChromeCastComponent.prototype.onClick = function (){
    vjs.Button.prototype.onClick.call(this);
    
    this.doLaunch();
};

vjs.ChromeCastBanner = vjs.Component.extend({
    /** @constructor */
    init: function (player, options) {
        vjs.Component.call(this, player, options);
    }

});

vjs.ChromeCastBanner.prototype.createEl = function(type, props){
  props = vjs.obj.merge({
    className: this.buildCSSClass(),
    innerHTML: '',
    tabIndex: 0
  }, props);

  return vjs.Component.prototype.createEl.call(this, type, props);

};

vjs.ChromeCastBanner.prototype.buildCSSClass = function(){
  // TODO: Change vjs-control to vjs-button?
  return 'vjs-currentlyCasting';
};
