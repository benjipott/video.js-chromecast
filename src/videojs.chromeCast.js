(function() {
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
