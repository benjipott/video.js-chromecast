/**
 * @file chromecast.js
 * Chromecast Media Controller - Wrapper for HTML5 Media API
 */
import videojs from 'video.js';

const Component = videojs.getComponent('Component');
const Tech = videojs.getComponent('Tech');

/**
 * Chromecast Media Controller - Wrapper for HTML5 Media API
 *
 * @param {Object=} options Object of option names and values
 * @param {Function=} ready Ready callback function
 * @extends Tech
 * @class Chromecast
 */

class Chromecast extends Tech {
    constructor (options, ready) {
        super(options, ready);
        this.apiMedia = this.options_.source.apiMedia;
        this.apiSession = this.options_.source.apiSession;
        this.receiver = this.apiSession.receiver.friendlyName;

        let mediaStatusUpdateHandler = ::this.onMediaStatusUpdate;
        let sessionUpdateHanlder = ::this.onSessionUpdate;

        this.apiMedia.addUpdateListener(mediaStatusUpdateHandler);
        this.apiSession.addUpdateListener(sessionUpdateHanlder);

        this.on('dispose', () => {
          this.apiMedia.removeUpdateListener(mediaStatusUpdateHandler);
          this.apiSession.removeUpdateListener(sessionUpdateHanlder);
          this.onMediaStatusUpdate()
          this.onSessionUpdate(false);
        });

        let tracks = this.textTracks();
        if (tracks) {
            let changeHandler = ::this.handleTextTracksChange;

            tracks.addEventListener('change', changeHandler);
            this.on('dispose', function () {
                tracks.removeEventListener('change', changeHandler);
            });

            this.handleTextTracksChange();
        }

        try {
            tracks = this.audioTracks();
            if (tracks) {
                let changeHandler = ::this.handleAudioTracksChange;

                tracks.addEventListener('change', changeHandler);
                this.on('dispose', function () {
                    tracks.removeEventListener('change', changeHandler);
                });

            }
        } catch (e) {
            videojs.log('get player audioTracks fail' + e);
        }

        try {
            tracks = this.videoTracks();
            if (tracks) {
                let changeHandler = ::this.handleVideoTracksChange;

                tracks.addEventListener('change', changeHandler);
                this.on('dispose', function () {
                    tracks.removeEventListener('change', changeHandler);
                });

            }
        } catch (e) {
            videojs.log('get player videoTracks fail' + e);
        }

        this.update();
        this.triggerReady();

    }

    createEl () {
        let el = videojs.createEl('div', {
            id: this.options_.techId,
            className: 'vjs-tech vjs-tech-chromecast'
        });
        return el;
    }

    update () {
        this.el_.innerHTML = `<div class="casting-image" style="background-image: url('${this.options_.poster}')"></div><div class="casting-overlay"><div class="casting-information"><div class="casting-icon"></div><div class="casting-description"><small>${this.localize('CASTING TO')}</small><br>${this.receiver}</div></div></div>`;
    }

    onSessionUpdate (isAlive) {
        if (!this.apiMedia) {
            return;
        }
        if (!isAlive) {
            return this.onStopAppSuccess();
        }
    }

    onStopAppSuccess () {
        this.stopTrackingCurrentTime();
        this.apiMedia = null;
    }

    onMediaStatusUpdate () {
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
                this.trigger('playing');
                this.trigger('play');
                this.paused_ = false;
                break;
        }
    }


    /**
     * Set video
     *
     * @param {Object=} src Source object
     * @method setSrc
     */
    src (src) {
        //do nothing
    }

    currentSrc () {
        if (!this.apiMedia) {
            return;
        }
        return this.apiMedia.media.contentId;
    }

    handleAudioTracksChange () {
        let trackInfo = [];
        let tTracks = this.textTracks();
        let tracks = this.audioTracks();

        if (!tracks) {
            return;
        }

        for (let i = 0; i < tracks.length; i++) {
            let track = tracks[i];
            if (track['enabled']) {
                //set id of cuurentTrack audio
                trackInfo.push((i + 1) + tTracks.length);
            }
        }

        if (this.apiMedia && trackInfo.length) {
            this.tracksInfoRequest = new chrome.cast.media.EditTracksInfoRequest(trackInfo);
            return this.apiMedia.editTracksInfo(this.tracksInfoRequest, ::this.onTrackSuccess, ::this.onTrackError);
        }
    }

    handleVideoTracksChange () {

    }

    handleTextTracksChange () {
        let trackInfo = [];
        let tracks = this.textTracks();

        if (!tracks) {
            return;
        }

        for (let i = 0; i < tracks.length; i++) {
            let track = tracks[i];
            if (track['mode'] === 'showing') {
                trackInfo.push(i + 1);
            }
        }

        if (this.apiMedia && trackInfo.length) {
            this.tracksInfoRequest = new chrome.cast.media.EditTracksInfoRequest(trackInfo);
            return this.apiMedia.editTracksInfo(this.tracksInfoRequest, ::this.onTrackSuccess, ::this.onTrackError);
        }
    }

    onTrackSuccess () {
        return videojs.log('track added');
    }

    onTrackError (e) {
        return videojs.log('Cast track Error: ' + JSON.stringify(e));
    }

    castError (e) {
        return videojs.log('Cast Error: ' + JSON.stringify(e));
    }

    play () {
        if (!this.apiMedia) {
            return;
        }
        if (this.paused_) {
            this.apiMedia.play(null, this.mediaCommandSuccessCallback.bind(this, 'Playing: ' + this.apiMedia.sessionId), ::this.castError);
        }
        return this.paused_ = false;
    }

    pause () {
        if (!this.apiMedia) {
            return;
        }
        if (!this.paused_) {
            this.apiMedia.pause(null, this.mediaCommandSuccessCallback.bind(this, 'Paused: ' + this.apiMedia.sessionId), ::this.castError);
            return this.paused_ = true;
        }
    }

    paused () {
        return this.paused_;
    }

    currentTime () {
        if (!this.apiMedia) {
            return 0;
        }
        return this.apiMedia.getEstimatedTime();
    }

    setCurrentTime (position) {

        if (!this.apiMedia) {
            return 0;
        }
        let request;
        request = new chrome.cast.media.SeekRequest();
        request.currentTime = position;
        //if (this.player_.controlBar.progressControl.seekBar.videoWasPlaying) {
        //  request.resumeState = chrome.cast.media.ResumeState.PLAYBACK_START;
        //}
        return this.apiMedia.seek(request, this.onSeekSuccess.bind(this, position), ::this.castError);
    }

    onSeekSuccess (position) {
        videojs.log('seek success' + position);
    }

    volume () {
        return this.volume_;
    }

    duration () {
        if (!this.apiMedia) {
            return 0;
        }
        return this.apiMedia.media.duration || Infinity;
    }

    controls () {
        return false;
    }

    setVolume (level, mute = false) {
        let request;
        let volume;
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
        this.apiMedia.setVolume(request, this.mediaCommandSuccessCallback.bind(this, 'Volume changed'), ::this.castError);
        return this.trigger('volumechange');
    }

    mediaCommandSuccessCallback (information) {
        videojs.log(information);
    }

    muted () {
        return this.muted_;
    }

    setMuted (muted) {
        return this.setVolume(this.volume_, muted);
    }

    supportsFullScreen () {
        return false;
    }


    resetSrc_ (callback) {
        callback();
    }

    dispose () {
        this.resetSrc_(Function.prototype);
        super.dispose(this);
    }

}

Chromecast.prototype.paused_ = false;

Chromecast.prototype.options_ = {};

Chromecast.prototype.timerStep = 1000;

/* Chromecast Support Testing -------------------------------------------------------- */

Chromecast.isSupported = function () {
    return true;
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

    const dashTypeRE = /^application\/(?:dash\+xml|(x-|vnd\.apple\.)mpegurl)/i;
    const dashExtRE = /^video\/(mpd|mp4|webm|m3u8)/i;

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
Chromecast.nativeSourceHandler.dispose = function () {
};

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
 * Set the tech's timeupdate event support status
 * (this disables the manual timeupdate events of the Tech)
 */
Chromecast.prototype['featuresTimeupdateEvents'] = false;

/*
 * Set the tech's progress event support status
 * (this disables the manual progress events of the Tech)
 */
Chromecast.prototype['featuresProgressEvents'] = false;

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


videojs.options.chromecast = {};

Component.registerComponent('Chromecast', Chromecast);
Tech.registerTech('Chromecast', Chromecast);
export default Chromecast;
