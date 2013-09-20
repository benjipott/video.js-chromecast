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
};