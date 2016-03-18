import window from 'global/window';
import QUnit from 'qunit';
import chromecastMaker from '../src/js/videojs-chromecast';
import playerProxy from './player-proxy';

QUnit.module('chromecast', {

  beforeEach() {
    this.oldTimeout = window.setTimeout;
    window.setTimeout = Function.prototype;
  },

  afterEach() {
    window.setTimeout = this.oldTimeout;
  }
});

QUnit.test(
  'chromecastMaker takes a player and returns a metrics',
  function (assert) {
    let chromecast = chromecastMaker(playerProxy(), {});

    assert.equal(typeof chromecast, 'object', 'metrics is an object');
  }
);


QUnit.test(
  'triger metrics',
  function (assert) {
    let xhr = this.sandbox.useFakeXMLHttpRequest();
    let requests = this.requests = [];

    let player = playerProxy();

    let chromecast = chromecastMaker(player, {});

    player.currentSrc = function () {
      return 'http://vjs.zencdn.net/v/oceans.mp4';
    };

    player.trigger('loadstart');

    assert.equal(requests.length(), 0, 'new currentItem is 0');

    player.trigger('firstplay');

    assert.equal(requests.length(), 1, 'new currentItem is 1');
  }
);
