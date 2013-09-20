/**
 * Button pour envoyer le flux a ChromeCast
 *
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
var cast = cast || {};

vjs.Player.prototype.chromeCastComponent = {};

vjs.ChromeCastComponent = vjs.TextTrackButton.extend({
    /** @constructor */
    init: function (player, options, ready) {
        vjs.TextTrackButton.call(this, player, options, ready);

        if (!player.controls()) {
            this.disable();
        }

        this.hide();

        if (cast && cast.isAvailable) { // Cast is known to be available initializeApi(); } else {
            // Wait for API to post a message to us
            this.initializeApi();
        } else {
            window.addEventListener("message", vjs.bind(this, this.windowsMessage));

            if (typeof window.cast !== "undefined" && window.cast.isAvailable) {
                this.initializeApi();
            }

            this.onReceiverList( [{name:'Receiver 1'},{name: 'receiver 2'}]);
        }
    }

});

vjs.ChromeCastComponent.prototype.kind_ = 'chromecast';
vjs.ChromeCastComponent.prototype.buttonText = 'Chromecast';
vjs.ChromeCastComponent.prototype.className = 'vjs-chromecast-button';

vjs.ChromeCastComponent.prototype.receiver;

vjs.ChromeCastComponent.prototype.cast_api;

vjs.ChromeCastComponent.prototype.cv_activity;

vjs.ChromeCastComponent.prototype.windowsMessage = function (event) {
    if (event.source == window && event.data && event.data.source == "CastApi" && event.data.event == "Hello")
        this.initializeApi();
};

vjs.ChromeCastComponent.prototype.initializeApi = function () {
    vjs.log('ChromeCastComponent initializeApi');
    this.cast_api = new cast.Api();
    this.cast_api.addReceiverListener("YouTube", vjs.bind(this, this.onReceiverList));

};

vjs.ChromeCastComponent.prototype.onReceiverList = function (list) {
    vjs.log('ChromeCastComponent onReceiverList');
    this.populateMenu(list, this.player_);

};

vjs.ChromeCastComponent.prototype.doLaunch = function () {
    this.stopPlayback();
    vjs.log("Cast video : " + this.player_.currentSrc());
    var lr = new cast.LaunchRequest(this.options_.appId, this.receiver);

    // lr.parameters = 'v=' + videoId;
    lr.parameters = 'v=abcdefg';
    lr.description = new cast.LaunchDescription();
    lr.description.text = this.player_.options_.description;
    // lr.description.url = this.player_.currentSrc();
    lr.description.url = '...';
    this.cast_api.launch(lr, vjs.bind(this, this.onLaunch));
};

vjs.ChromeCastComponent.prototype.onLaunch = function (activity) {
    if (activity.status == "running") {
        vjs.log("Chromecast running");
        this.cv_activity = activity;
        var videoUrl = this.extractUrl();
        this.playVideo(videoUrl, {}, true, this.options_.title);

    } else if (activity.status == "error") {
        vjs.log("error lunch chromecast");
        this.cv_activity = null;
    }
};

vjs.ChromeCastComponent.prototype.extractUrl = function (srcType) {
    return  this.player_.currentSrc();
};

vjs.ChromeCastComponent.prototype.playVideo = function (url, contentInfo, autoplay, title) {
    var request = new cast.MediaLoadRequest(url);
    request.contentInfo = contentInfo;
    request.autoplay = autoplay;
    request.title = title;
    vjs.log("loadMedia:", request);
    this.cast_api.loadMedia(this.cv_activity.activityId, request, vjs.bind(this, this.mediaLoaded));
    vjs.log("post load media");
};

vjs.ChromeCastComponent.prototype.mediaLoaded = function (stuff) {
    vjs.log("mediaLoaded callback:", stuff);
    var request = cast.MediaPlayRequest();
    this.cast_api.playMedia(this.cv_activity.activityId, request, vjs.bind(this, this.mediaPlaying));
};

vjs.ChromeCastComponent.prototype.mediaPlaying = function (stuff) {
    vjs.log("mediaPlaying callback:", stuff);
};

vjs.ChromeCastComponent.prototype.stopPlayback = function () {
    if (this.cv_activity) {
        this.cast_api.stopActivity(this.cv_activity.activityId, function () {
        });
    }
};
// Add Buttons to controlBar
vjs.ChromeCastComponent.prototype.createEl = function (type, props) {
    var el = vjs.TextTrackButton.prototype.createEl.call(this, 'div');
    this.player_.controlBar.el_.appendChild(el);
    return el;
};
// Add Buttons to controlBar
vjs.ChromeCastComponent.prototype.populateMenu = function (list, player) {
    var menu = this.menu, items = this.items = [];

    vjs.obj.each(list, function (key, val) {
        if (val) {
            var mi = new vjs.ChromeCastComponentMenuItem(player, val);
            items.push(mi);
            menu.addItem(mi);
        }
    });

    if (this.items.length > 0) {
        this.show();
    }
};

vjs.ChromeCastComponent.prototype.createMenu = function () {

    var menu = this.menu = new vjs.Menu(this.player_), items = this.items = [];

    menu.el_.appendChild(vjs.createEl('li', {
        className: 'vjs-menu-title',
        tabindex: -1
    }));

    if (this.items.length > 0) {
        this.show();
    }

    return menu;
};
/**
 * @constructor
 */
vjs.ChromeCastComponentMenuItem = vjs.MenuItem.extend({
    /** @constructor */
    init: function (player, options) {
        // Modify options for parent MenuItem class's init.
        vjs.MenuItem.call(this, player, options);
    }
});

/** @inheritDoc */
vjs.ChromeCastComponentMenuItem.prototype.createEl = function (type, props) {
    return vjs.Button.prototype.createEl.call(this, 'li', vjs.obj.merge({
        className: 'vjs-menu-item',
        innerHTML: this.options_['name']
    }, props));
};

vjs.ChromeCastComponentMenuItem.prototype.onClick = function () {
    vjs.MenuItem.prototype.onClick.call(this);
    // ON Click on push sur le device
    this.player_.chromeCastComponent.receiver = this.options_;
    this.player_.chromeCastComponent.doLaunch();
};
