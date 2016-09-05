[![Build Status](https://travis-ci.org/benjipott/video.js-chromecast.svg?branch=master)](https://travis-ci.org/benjipott/video.js-chromecast)

# Chromecast Plugin for video.js 5.*

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Installation](#installation)
- [Inclusion](#inclusion)
- [Basic Usage](#basic-usage)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

Install videojs-chromecast via npm (preferred):

```sh
$ npm install videojs-chromecast
```

Or Bower:

```sh
$ bower install videojs-chromecast
```

## Inclusion

Include videojs-chromecast on your website using the tool(s) of your choice.

The simplest method of inclusion is a `<script>` tag after the video.js `<script>` tag:

```html
<script src="path/to/video.js/dist/video.js"></script>
<script src="path/to/videojs-chromecast/dist/videojs-chromecast.js"></script>
```

When installed via npm, videojs-chromecast supports Browserify-based workflows out of the box.

## Basic Usage

For full details on how to use the playlist plugin can be found in [the API documentation](docs/api.md).

```js
var player = videojs('video');
```

## License

Apache-2.0. Copyright (c) Benjipott, Inc.
