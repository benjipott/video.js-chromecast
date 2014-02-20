/*! videojs-chromeCast - v0.1.0 - 2014-02-20
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
        enabled: true,
        namespace: '',
        title: '',
        description: ''
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

        //this.chromeCastTech = new vjs.ChromecastTech(this, settings);
        //console.log(window['videojs']);
        //this.player.loadTech('ChromecastTech');

        /*var that = this;
        setTimeout(function() {
            that.player.loadTech('ChromecastTech');
        }, 20000);*/

        /*setTimeout(function() {
            that.player.loadTech('Html5', settings);
        }, 40000);*/

        //this.player.loadTech('ChromecastTech', function() {});
    });


})();/**
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
    init: function(player, options) {
        this.settings = options;
        vjs.Button.call(this, player, options);

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

vjs.ChromeCastComponent.prototype.casting = false;
vjs.ChromeCastComponent.prototype.progressFlag = 1;
vjs.ChromeCastComponent.prototype.timer = null;
vjs.ChromeCastComponent.prototype.timerStep = 1000;

vjs.ChromeCastComponent.prototype.currentMediaTime = 0;
vjs.ChromeCastComponent.prototype.paused = true;
vjs.ChromeCastComponent.prototype.seeking = false;
vjs.ChromeCastComponent.prototype.currentVolume = 1;
vjs.ChromeCastComponent.prototype.muted = false;

vjs.ChromeCastComponent.boundEvents = {};


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
    if ('available' === availability) {
        this.show();
    }
};

vjs.ChromeCastComponent.prototype.initializeApi = function() {
    vjs.log('ChromeCastComponent initializeApi');

    if (!vjs.IS_CHROME) {
        return;
    }

    if (!chrome.cast || !chrome.cast.isAvailable) {
        vjs.log("Cast APIs not Available. Retrying...");
        setTimeout(this.initializeApi.bind(this), 1000);
        return;
    }

    console.log(this.settings.appId);
    var sessionRequest;
    if (this.settings.appId) {
        var sessionRequest = new chrome.cast.SessionRequest(this.settings.appId);
    } else {
        var sessionRequest = new chrome.cast.SessionRequest(chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);
    }

    var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
        this.sessionJoinedListener.bind(this),
        this.receiverListener.bind(this));
    chrome.cast.initialize(apiConfig, this.onInitSuccess.bind(this), this.onInitError.bind(this));
};

vjs.ChromeCastComponent.prototype.doLaunch = function() {
    vjs.log("Cast video : " + this.player_.currentSrc());

    if (this.apiInitialized) {
        chrome.cast.requestSession(
            // Success
            this.onSessionSuccess.bind(this),
            // Error
            function(castError) {
                vjs.log("session_established ERROR: " + JSON.stringify(castError));
            });
    } else {
        vjs.log("session_established NOT INITIALIZED");
    }
};

vjs.ChromeCastComponent.prototype.onSessionSuccess = function(session) {
    this.apiSession = session;
    vjs.log("session_established YES - " + session.sessionId);

    this.addClass("connected");

    /*this.player_.pause();
    this.player_.chromeCastComponent.disableNativeControls();*/

    var mediaInfo = new chrome.cast.media.MediaInfo(this.player_.currentSrc(), "video/mp4");
    //vjs.log("## MediaInfo('" + url + "', '" + mime + "')");
    var loadRequest = new chrome.cast.media.LoadRequest(mediaInfo);
    loadRequest.autoplay = true;

    vjs.log('Sending Load Request: ');
    vjs.log(loadRequest);

    loadRequest.currentTime = this.player_.currentTime();

    this.apiSession.loadMedia(loadRequest, this.onMediaDiscovered.bind(this), this.onMediaError.bind(this));
}

vjs.ChromeCastComponent.prototype.onMediaDiscovered = function(media) {
    // chrome.cast.media.Media object
    this.apiMedia = media;
    this.apiMedia.addUpdateListener(this.onMediaStatusUpdate.bind(this));

    vjs.log("Got media object");
    this.startProgressTimer(this.incrementMediaTime.bind(this));

    vjs.log("play!!!!");
    this.paused = false;
    this.player_.loadTech('ChromecastTech', {});
    this.player_.userActive(true);
    this.casting = true;

    /*this.player_.controlBar.playToggle.onPlay();
    this.player_.onPlay();*/

    if (this.apiMedia.playerState === chrome.cast.media.PlayerState.PLAYING) {} else {}
}

vjs.ChromeCastComponent.prototype.onMediaError = function(castError) {
    vjs.log('Media Error: ' + JSON.stringify(castError));
}

vjs.ChromeCastComponent.prototype.onMediaStatusUpdate = function(e) {

    if (!this.apiMedia) {
        return;
    }

    if (this.progressFlag) {
        //vjs.log(parseInt(100 * this.apiMedia.currentTime / this.apiMedia.media.duration) + "%");
        vjs.log(this.apiMedia.currentTime + "/" + this.apiMedia.media.duration);
    }

    vjs.ChromeCastComponent.prototype.currentMediaTime = this.apiMedia.currentTime;

    vjs.log(this.apiMedia.playerState);
    if (this.apiMedia.playerState == "IDLE") {
        this.currentMediaTime = 0;
        this.trigger("timeupdate");
        this.onStopAppSuccess();
    }
}

vjs.ChromeCastComponent.prototype.startProgressTimer = function(callback) {
    if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
    }
    vjs.log('starting timer...');
    // start progress timer
    this.timer = setInterval(callback.bind(this), this.timerStep);
};

vjs.ChromeCastComponent.prototype.duration = function() {
    if (!this.apiMedia) {
        return 0;
    }

    return this.apiMedia.media.duration;
};

/**
 * play media
 */


vjs.ChromeCastComponent.prototype.play = function() {
    if (!this.apiMedia) {
        return;
    }

    if (this.paused) {
        this.apiMedia.play(null,
            this.mediaCommandSuccessCallback.bind(this, "playing started for " + this.apiMedia.sessionId),
            this.onError.bind(this));
        this.apiMedia.addUpdateListener(this.onMediaStatusUpdate.bind(this));
        //this.player_.controlBar.playToggle.onPlay();
        //this.player_.onPlay();
        this.paused = false;
    }
};

vjs.ChromeCastComponent.prototype.pause = function() {
    if (!this.apiMedia) {
        return;
    }

    if (!this.paused) {
        this.apiMedia.pause(null,
            this.mediaCommandSuccessCallback.bind(this, "paused " + this.apiMedia.sessionId),
            this.onError.bind(this));

        /*this.player_.controlBar.playToggle.onPause();
        this.player_.onPause();*/
        this.paused = true;
    }
};

/**
 * seek media position
 * @param {Number} pos A number to indicate percent
 */
vjs.ChromeCastComponent.prototype.seekMedia = function(pos) {
    /*console.log('Seeking ' + currentMediaSession.sessionId + ':' +
        currentMediaSession.mediaSessionId + ' to ' + pos + "%");*/
    //progressFlag = 0;
    var request = new chrome.cast.media.SeekRequest();
    request.currentTime = pos;
    this.apiMedia.seek(request,
        this.onSeekSuccess.bind(this, pos),
        this.onError);
};


vjs.ChromeCastComponent.prototype.onSeekSuccess = function(pos) {
    this.currentMediaTime = pos;
    //appendMessage(info);
    /*setTimeout(function() {
        progressFlag = 1
    }, 1500);*/
}

vjs.ChromeCastComponent.prototype.setMediaVolume = function(level, mute) {
    if (!this.apiMedia)
        return;

    var volume = new chrome.cast.Volume();
    volume.level = level;
    this.currentVolume = volume.level;
    volume.muted = mute;
    this.muted = mute;
    var request = new chrome.cast.media.VolumeRequest();
    request.volume = volume;
    this.apiMedia.setVolume(request,
        this.mediaCommandSuccessCallback.bind(this, 'media set-volume done'),
        this.onError);
    this.player_.trigger('volumechange');
}

vjs.ChromeCastComponent.prototype.incrementMediaTime = function() {
    if (this.apiMedia.playerState === chrome.cast.media.PlayerState.PLAYING) {
        if (this.currentMediaTime < this.apiMedia.media.duration) {
            this.currentMediaTime += 1;
            this.trigger("timeupdate");
            //this.updateProgressBarByTimer();
        } else {
            this.currentMediaTime = 0;
            clearInterval(this.timer);
        }
    }
};

vjs.ChromeCastComponent.prototype.updateProgressBarByTimer = function() {
    //vjs.log(this.currentMediaTime);
    var bufferedPercent = parseInt(100 * this.currentMediaTime / this.apiMedia.media.duration);
    //vjs.log(bufferedPercent + "%");
    if (this.player_.controlBar.progressControl.seekBar.bar.el_.style) {
        this.player_.controlBar.progressControl.seekBar.bar.el_.style.width = vjs.round(bufferedPercent, 2) + '%';
    }
    if (this.player_.controlBar.progressControl.seekBar.seekHandle.el_.style) {
        this.player_.controlBar.progressControl.seekBar.seekHandle.el_.style.left = vjs.round(bufferedPercent, 2) + '%';
    }
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

/**
 * Stops the running receiver application associated with the session.
 */
vjs.ChromeCastComponent.prototype.stopCasting = function() {
    this.apiSession.stop(this.onStopAppSuccess.bind(this),
        this.onError.bind(this));
};

/**
 * Callback function for stop app success
 */
vjs.ChromeCastComponent.prototype.onStopAppSuccess = function() {
    clearInterval(this.timer);
    this.casting = false;
    this.removeClass("connected");
    this.player_.src(this.player_.options_['sources']);
    vjs.insertFirst(this.player_.tech.el_, this.player_.el());
    if (this.apiMedia.playerState == "IDLE") {
        this.player_.currentTime(0);
        this.player_.onPause();
    } else {
        this.player_.currentTime(this.currentMediaTime);
        if (!this.paused) {
            this.player_.play();
        }
    }
    this.apiMedia = null;
};

vjs.ChromeCastComponent.prototype.buildCSSClass = function() {
    return this.className + vjs.Button.prototype.buildCSSClass.call(this);
};

vjs.ChromeCastComponent.prototype.createEl = function(type, props) {
    var el = vjs.Button.prototype.createEl.call(this, 'div');
    return el;
};

vjs.ChromeCastComponent.prototype.onClick = function() {
    vjs.Button.prototype.onClick.call(this);

    if (this.casting) {
        this.stopCasting();
    } else {
        this.doLaunch();
    }
};

vjs.ChromeCastBanner = vjs.Component.extend({
    /** @constructor */
    init: function(player, options) {
        vjs.Component.call(this, player, options);
    }

});

vjs.ChromeCastBanner.prototype.createEl = function(type, props) {
    props = vjs.obj.merge({
        className: this.buildCSSClass(),
        innerHTML: '',
        tabIndex: 0
    }, props);

    return vjs.Component.prototype.createEl.call(this, type, props);

};

vjs.ChromeCastBanner.prototype.buildCSSClass = function() {
    // TODO: Change vjs-control to vjs-button?
    return 'vjs-currentlyCasting';
};vjs.ChromecastTech = vjs.MediaTechController.extend({
    /** @constructor */
    init: function(player, options, ready) {

        this.features['volumeControl'] = true;
        this.features['movingMediaElementInDOM'] = false;
        this.features['fullscreenResize'] = false;
        this.features['progressEvents'] = true;
        this.features['timeupdateEvents'] = true;

        vjs.MediaTechController.call(this, player, options, ready);
        //this.setupTriggers();

        var source = options['source'];

        vjs.log("ChromecastTech initialized...");

        this.el_ = videojs.Component.prototype.createEl('div', {
            id: 'myId',
            className: 'vjs-tech',
            innerHTML: '<img src="' + this.player_.options_.poster + '" class="backgroundImage"/><div class="currentlyCasting"><h2 class="castingLabel">Casting to device</h2></div>'
        });
        vjs.insertFirst(this.el_, this.player_.el());
        this.triggerReady();


        // If the element source is already set, we may have missed the loadstart event, and want to trigger it.
        // We don't want to set the source again and interrupt playback.
        /*if (source) {
            player.trigger('loadstart');
        }*/

        // Determine if native controls should be used
        // Our goal should be to get the custom controls on mobile solid everywhere
        // so we can remove this all together. Right now this will block custom
        // controls on touch enabled laptops like the Chrome Pixel
        /*if (vjs.TOUCH_ENABLED && player.options()['nativeControlsForTouch'] !== false) {
	  this.useNativeControls();
	}*/

        //this.triggerReady();
    }
});

vjs.ChromecastTech.apiSession = {};
vjs.ChromecastTech.apiMedia = {};

vjs.ChromecastTech.isSupported = function() {
    vjs.log("isSupported");
    return this.player_.chromeCastComponent.apiInitialized;
};

videojs.ChromecastTech.canPlaySource = function(srcObj) {
    vjs.log("canPlaySource");
    return (srcObj.type == 'video/mp4');
};

vjs.ChromecastTech.prototype.dispose = function() {
    vjs.MediaTechController.prototype.dispose.call(this);
};

vjs.ChromecastTech.prototype.play = function() {
    vjs.log("play");
    //this.player_.trigger("play");
    this.player_.chromeCastComponent.play();
    this.player_.onPlay();
};

vjs.ChromecastTech.prototype.pause = function() {
    vjs.log("pause");
    this.player_.chromeCastComponent.pause();
    this.player_.onPause();
};

vjs.ChromecastTech.prototype.paused = function() {
    vjs.log("paused?");
    return this.player_.chromeCastComponent.paused;
};

vjs.ChromecastTech.prototype.currentTime = function() {
    //vjs.log("currentTime?");
    return this.player_.chromeCastComponent.currentMediaTime;
};

vjs.ChromecastTech.prototype.setCurrentTime = function(seconds) {
    vjs.log("setCurrentTime: " + seconds);
    this.player_.chromeCastComponent.seekMedia(seconds);
    /*
    try {
        this.el_.currentTime = seconds;
    } catch (e) {
        vjs.log(e, 'Video is not ready. (Video.js)');
        // this.warning(VideoJS.warnings.videoNotReady);
    }*/
};

vjs.ChromecastTech.prototype.duration = function() {
    vjs.log("duration");
    return 0;
};

vjs.ChromecastTech.prototype.buffered = function() {
    vjs.log("buffered");
    return {
        length: 0
    };
};

vjs.ChromecastTech.prototype.volume = function() {
    /*return this.el_.volume;*/
    return this.player_.chromeCastComponent.currentVolume;
};

vjs.ChromecastTech.prototype.setVolume = function(percentAsDecimal) {
    vjs.log("setVolume: " + percentAsDecimal);
    this.player_.chromeCastComponent.setMediaVolume(percentAsDecimal, false);
    /*this.el_.volume = percentAsDecimal;*/
};

vjs.ChromecastTech.prototype.muted = function() {
    vjs.log("muted?");
    return this.player_.chromeCastComponent.muted;
};

vjs.ChromecastTech.prototype.setMuted = function(muted) {
    vjs.log("setMuted: " + muted);
    this.player_.chromeCastComponent.setMediaVolume(this.player_.chromeCastComponent.currentVolume, muted);
    /*this.el_.muted = muted;*/
};

vjs.ChromecastTech.prototype.supportsFullScreen = function() {
    vjs.log("supportsFullScreen?");
    return false;
};

vjs.ChromecastTech.prototype.enterFullScreen = function() {
    vjs.log("enterFullScreen");
};

vjs.ChromecastTech.prototype.exitFullScreen = function() {
    vjs.log("exitFullScreen");
};

vjs.ChromecastTech.prototype.src = function(src) {
    vjs.log("ChromecastTech src: " + src);
};

vjs.ChromecastTech.prototype.load = function() {
    vjs.log("load");
};

vjs.ChromecastTech.prototype.currentSrc = function() {
    vjs.log("currentSrc?");
    return "";
};

vjs.ChromecastTech.prototype.poster = function() {
    vjs.log("poster?");
    /*return this.el_.poster;*/
};

vjs.ChromecastTech.prototype.setPoster = function(val) {
    /*this.el_.poster = val;*/
    vjs.log("setPoster: " + val);
};

vjs.ChromecastTech.prototype.preload = function() {
    vjs.log("preload?");
    return true;
};

vjs.ChromecastTech.prototype.setPreload = function(val) {
    vjs.log("setPreload: " + val);
    /*this.el_.preload = val;*/
};

vjs.ChromecastTech.prototype.autoplay = function() {
    /*return this.el_.autoplay;*/
    vjs.log("autoplay?");
    return true;
};

vjs.ChromecastTech.prototype.setAutoplay = function(val) {
    /*this.el_.autoplay = val;*/
};

vjs.ChromecastTech.prototype.controls = function() {
    vjs.log("controls?");
    return true;
};

vjs.ChromecastTech.prototype.setControls = function(val) {
    vjs.log("setControls: " + val);
};

vjs.ChromecastTech.prototype.loop = false;
vjs.ChromecastTech.prototype.setLoop = function(val) {};

vjs.ChromecastTech.prototype.error = function() {
    return false;
};

vjs.ChromecastTech.prototype.seeking = function() {
    vjs.log("seeking?");
    return false;
};

vjs.ChromecastTech.prototype.ended = function() {
    vjs.log("ended?");
    return false;
};

vjs.ChromecastTech.prototype.defaultMuted = false;