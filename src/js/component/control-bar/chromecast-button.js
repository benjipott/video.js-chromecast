/**
 * @file chromecast-button.js
 */
import videojs from 'video.js';

const Component = videojs.getComponent('Component');
const ControlBar = videojs.getComponent('ControlBar');
const Button = videojs.getComponent('Button');

/**
 * The base class for buttons that toggle chromecast video
 *
 * @param {Player|Object} player
 * @param {Object=} options
 * @extends Button
 * @class ChromeCastButton
 */
class ChromeCastButton extends Button {

    constructor (player, options) {
        super(player, options);
        this.hide();
        this.initializeApi();
        options.appId = player.options_.chromecast.appId;
        player.chromecast = this;
    }

    /**
     * Init chromecast sdk api
     *
     * @method initializeApi
     */

    initializeApi () {
        let apiConfig;
        let appId;
        let sessionRequest;

        if (!videojs.browser.IS_CHROME || videojs.browser.IS_EDGE) {
            return;
        }
        if (!chrome.cast || !chrome.cast.isAvailable) {
            videojs.log('Cast APIs not available');
            if (this.tryingReconnect < 10) {
                this.setTimeout(this.initializeApi, 1000);
                ++this.tryingReconnect;
            }
            videojs.log('Cast APIs not available. Max reconnect attempt');
            return;
        }

        videojs.log('Cast APIs are available');
        appId = this.options_.appId || chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
        sessionRequest = new chrome.cast.SessionRequest(appId);
        apiConfig = new chrome.cast.ApiConfig(sessionRequest, ::this.sessionJoinedListener, ::this.receiverListener);
        return chrome.cast.initialize(apiConfig, ::this.onInitSuccess, ::this.castError);
    }

    castError (castError) {

        let error = {
            code: castError.code,
            message: castError.description
        };

        switch (castError.code) {
            case chrome.cast.ErrorCode.API_NOT_INITIALIZED:
            case chrome.cast.ErrorCode.EXTENSION_MISSING:
            case chrome.cast.ErrorCode.EXTENSION_NOT_COMPATIBLE:
            case chrome.cast.ErrorCode.INVALID_PARAMETER:
            case chrome.cast.ErrorCode.LOAD_MEDIA_FAILED:
            case chrome.cast.ErrorCode.RECEIVER_UNAVAILABLE:
            case chrome.cast.ErrorCode.SESSION_ERROR:
            case chrome.cast.ErrorCode.CHANNEL_ERROR:
            case chrome.cast.ErrorCode.TIMEOUT:
                this.addClass('error');
                break;
            case chrome.cast.ErrorCode.CANCEL:
                break;
            default:
                this.player_.error(error);
                break;
        }
        return videojs.log('Cast Error: ' + (JSON.stringify(castError)));
    }

    onInitSuccess () {
        return this.apiInitialized = true;
    }

    sessionJoinedListener (session) {
        if (session.media.length) {
            this.apiSession = session;
            this.onMediaDiscovered(session.media[0]);
        }
        return console.log('Session joined');
    }

    receiverListener (availability) {
        if (availability === 'available') {
            return this.show();
        }
    }

    doLaunch () {
        videojs.log('Cast video: ' + (this.player_.cache_.src));
        if (this.apiInitialized) {
            return chrome.cast.requestSession(::this.onSessionSuccess, ::this.castError);
        } else {
            return videojs.log('Session not initialized');
        }
    }

    onSessionSuccess (session) {
        let image;
        let key;
        let loadRequest;
        let mediaInfo;
        let ref;
        let value;


        this.apiSession = session;
        const source = this.player_.cache_.src;
        const type = this.player_.currentType();

        videojs.log('Session initialized: ' + session.sessionId + ' source : ' + source + ' type : ' + type);

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
        const poster = this.player().poster();
        if (poster) {
            image = new chrome.cast.Image(poster);
            mediaInfo.metadata.images = [image];
        }

        // Load/Add caption tracks
        let plTracks = this.player().textTracks();
        const remotePlTracks = this.player().remoteTextTrackEls();
        let tracks = [];
        let i = 0;
        let remotePlTrack;
        let plTrack;
        let trackId = 0;
        let track;
        if (plTracks) {
            for (i = 0; i < plTracks.length; i++) {
                plTrack = plTracks.tracks_[i];
                remotePlTrack = remotePlTracks && remotePlTracks.trackElements_ && remotePlTracks.trackElements_[i];
                trackId++;
                track = new chrome.cast.media.Track(trackId, chrome.cast.media.TrackType.TEXT);
                track.trackContentId = remotePlTrack ? remotePlTrack.src : 'caption_' + plTrack.language;
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
        }
        // Load/Add audio tracks

        try {
            plTracks = this.player().audioTracks();
            if (plTracks) {
                for (i = 0; i < plTracks.length; i++) {
                    plTrack = plTracks.tracks_[i];
                    trackId++;
                    track = new chrome.cast.media.Track(trackId, chrome.cast.media.TrackType.AUDIO);
                    track.subtype = null;
                    track.name = plTrack.label;
                    track.language = plTrack.language;
                    track.customData = null;
                    tracks.push(track);
                }
            }
        } catch (e) {
            videojs.log('get player audioTracks fail' + e);
        }

        if (tracks.length) {
            mediaInfo.tracks = tracks;
        }

        // Request load media source
        loadRequest = new chrome.cast.media.LoadRequest(mediaInfo);

        loadRequest.autoplay = true;
        loadRequest.currentTime = this.player_.currentTime();

        this.apiSession.loadMedia(loadRequest, ::this.onMediaDiscovered, ::this.castError);
        this.apiSession.addUpdateListener(::this.onSessionUpdate);
    }

    onMediaDiscovered (media) {
        this.player_.loadTech_('Chromecast', {
            type: 'cast',
            apiMedia: media,
            apiSession: this.apiSession
        });

        this.casting = true;
        this.inactivityTimeout = this.player_.options_.inactivityTimeout;
        this.player_.options_.inactivityTimeout = 0;
        this.player_.userActive(true);
        this.addClass('connected');
        this.removeClass('error');
    }

    onSessionUpdate (isAlive) {
        if (!this.player_.apiMedia) {
            return;
        }
        if (!isAlive) {
            return this.onStopAppSuccess();
        }
    }

    stopCasting () {
        return this.apiSession.stop(::this.onStopAppSuccess, ::this.castError);
    }

    onStopAppSuccess () {
        this.casting = false;
        let time = this.player_.currentTime();
        this.removeClass('connected');
        this.player_.src(this.player_.options_['sources']);
        if (!this.player_.paused()) {
            this.player_.one('seeked', function () {
                return this.player_.play();
            });
        }
        this.player_.currentTime(time);
        this.player_.options_.inactivityTimeout = this.inactivityTimeout;
        return this.apiSession = null;
    }

    /**
     * Allow sub components to stack CSS class names
     *
     * @return {String} The constructed class name
     * @method buildCSSClass
     */
    buildCSSClass () {
        return `vjs-chromecast-button ${super.buildCSSClass()}`;
    }

    /**
     * Handle click on mute
     * @method handleClick
     */
    handleClick () {
        super.handleClick();
        if (this.casting) {
            return this.stopCasting();
        } else {
            return this.doLaunch();
        }
    }
}

ChromeCastButton.prototype.tryingReconnect = 0;

ChromeCastButton.prototype.inactivityTimeout = 2000;

ChromeCastButton.prototype.controlText_ = 'Chromecast';

//Replace videojs CaptionButton child with this one
ControlBar.prototype.options_.children.splice(ControlBar.prototype.options_.children.length - 1, 0, 'chromeCastButton');

Component.registerComponent('ChromeCastButton', ChromeCastButton);
export default ChromeCastButton;
