# videojs-chromeCast

Display a chromecast Button on Control Bar video.js players.

![videojs-chromeCast](http://benjipott.fr/images/video.js-chromecast.jpg)

## ChromeCast Api Reference
https://developers.google.com/cast/ (doc)
https://developers.google.com/cast/whitelisting (whitelisting)

This plugin was tested on video.js 4.1.0 4.2.0 and 4.2.1.

## Getting Started
Download [videojs](http://www.videojs.com/) and [videojs.ga](https://github.com/benjipott/videojs-chromeCast)

Allow your cast by clicking four times in the bottom left corner of the icon cast
![videojs-chromeCast](http://benjipott.fr/images/video.js-chromecast-allow.jpg)

In your web page:
```html
<html data-cast-api-enabled="true">
<script src="video.js"></script>
<script src="dist/videojs.chromeCast.min.js"></script>
<link rel="stylesheet" href="dist/videojs.chromeCast.css" type="text/css" />
<video id="video" src="movie.mp4" controls></video>
<script>

    videojs('video', {
        'plugins': {
               'chromecast': {
                    enabled : true,
                    appId : 'your-chromecast-app-id',
                    namespace : 'your-chromecast-namespace',
                    title : 'video title',
                    description : 'video desc'
                    }
               }
        }
    );
</script>
```

## Options

    enabled : true,
    appId : 'your-chromecast-app-id',
    namespace : 'your-namesapace',
    title:'',
    description:''