vjs.ChromecastTech = vjs.MediaTechController.extend({
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
            innerHTML: '<span>ChromeCastTech element</span>'
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
    vjs.log("currentTime?");
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