[![Build Status](https://travis-ci.org/benjipott/video.js-chromecast.svg?branch=master)](https://travis-ci.org/benjipott/video.js-chromecast)

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://paypal.me/pools/c/81gnn8kAtv)

# Chromecast Plugin for video.js 5.*
![Alt text](https://cloud.githubusercontent.com/assets/3854951/22416418/c6ef4b6a-e6ce-11e6-95dd-e8f04719d68f.png "Sample image")

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
<head data-cast-api-enabled="true"> <!-- allow chromecast extention -->
<script src="http://www.gstatic.com/cv/js/sender/v1/cast_sender.js"></script> <!-- add chromecast sdk -->
<script src="path/to/video.js/dist/video.js"></script><!-- add video.js sdk -->
<script src="path/to/videojs-chromecast/dist/videojs-chromecast.js"></script><!-- add plugin -->
```

When installed via npm, videojs-chromecast supports Browserify-based workflows out of the box.

## Basic Usage

For full details on how to use chromecast in [the API documentation](docs/api.md).

```js
var player = videojs('video',{
  chromecast:{
     appId:'APP-ID'
  }
});
```
## Options

Chromecast sdk mediaInfo use poster image 

```
options :{
  chromecast:{
     appId:'APP-ID',
     metadata:{
       title:'Title display on tech wrapper',
       subtitle:'Synopsis display on tech wrapper',
     }
  }
}
```

## License

Apache-2.0. Copyright (c) Benjipott, Inc.
