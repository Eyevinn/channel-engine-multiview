'use strict';

angular.module('channelEngineMultiview')
	.component('channelEngineVideo', {
		templateUrl: 'components/channel-engine-video.template.html',
    bindings: {
      videoindex: '@',
      out: '&',
    },
		controller: function ChannelEngineVideoController($scope, $element) {
			var self = this;
			self.highlighted = false;
			self.sessionId = null;
			self.selected = false;
			//self.playlistId = 'random';
			// self.hls = new Hls({capLevelToPlayerSize: true, abrBandWidthUpFactor: 0.001});
			self.hls = new Hls();
			self.videoElement = $element.find('video')[0];
			self.$postLink = function() {
				self.playStream();
			};
			self.stopStream = function() {
				self.hls.detachMedia();
			};

			self.playStream = function() {
				var params = parseQueryParams(location.search);
				var uri;
				var eventStreamUri;
				if (params['dev']) {
					uri = 'http://localhost:8000/live/master.m3u8';
					eventStreamUri = 'http://localhost:8000/eventstream';
				} else {
					uri = 'https://ott-channel-engine.herokuapp.com/live/master.m3u8';
					eventStreamUri = 'https://ott-channel-engine.herokuapp.com/eventstream';
				}
				initiatePlayer(self, uri, self.videoElement, self.playlistId, params['noresume'], params['id'])
				.then(function(videoElement) {
					self.videoElement.muted = true;
					var playPromise = self.videoElement.play();
					if (playPromise !== undefined) {
						playPromise.catch(function(error) {
						  // Autplay was prevented
						  // return initiateControllers(videoElement, false);
						}).then(function() {
							// return initiateControllers(videoElement, true);
						});
				    }
				})
        .catch(function(err) {
					console.log(err);
					displayErrorDlg(err);
				});
			};

			self.updatePlaylist = function() {
				console.log(self.playlistId);
				self.stopStream();
				self.playStream();
			};

			self.toggleMuted = function() {
				self.videoElement.muted = !self.videoElement.muted;
        console.log('will call');
			};

			self.showVideoDetails = function() {
				self.selected = true;
				self.highlighted = true;
			};

			self.hideVideoDetails = function() {
				self.selected = false;
				self.highlighted = false;
			};

      self.testOutput = function() {
        debugger
      };
		},

	});

function initiatePlayer(controller, hlsUri, videoElement, playlist, noresume, id) {
  return new Promise(function(resolve, reject) {
    var sessionId = controller.sessionId;
    var queryParams = {};
    console.log("session id " , sessionId);
    if (sessionId && !noresume && !id) {
      queryParams['session'] = sessionId;
    }
    if (playlist) {
      queryParams['playlist'] = playlist;
    }
    if (id) {
      queryParams['startWithId'] = id;
    }

    if (Object.keys(queryParams).length > 0) {
      hlsUri += '?' + Object.keys(queryParams).map(function(key) {
        return [key, queryParams[key]].map(encodeURIComponent).join("=");
      }).join("&");
    }

    if (Hls.isSupported() && !isMobileDevice()) {
      var hls = controller.hls;
      hls.attachMedia(videoElement);
      hls.on(Hls.Events.MEDIA_ATTACHED, function () {
        hls.loadSource(hlsUri);
      });
      hls.on(Hls.Events.MANIFEST_LOADED, function(event, data) {
        var sessionId = data.networkDetails.getResponseHeader('X-Session-Id');
        console.log('GOT SESSION ID ', sessionId);
        controller.sessionId = sessionId;
      });
      hls.on(Hls.Events.MANIFEST_PARSED, function() {
        resolve(videoElement);
      });
      hls.on(Hls.Events.ERROR, function(event, data) {
        if (data.fatal) {
          console.log("ERROR", data);
          switch (data.type) {
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("fatal media error encountered, try to recover");
              hls.recoverMediaError();
              break;
            default:
              console.log("cannot recover");
              hls.destroy();
              console.log("Fatal error playing back stream");
              break;
          }
        }
      });
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = hlsUri;
      videoElement.addEventListener('canplay', function() {
      });
      resolve(videoElement);
    } else {
      reject('Unsupported device');
    }
  });
}

function parseQueryParams(search) {
  var re = /[?&]([^=&]+)(=?)([^&]*)/g;
  var params = {};
  var m;
  while (m = re.exec(search)) {
    params[decodeURIComponent(m[1])] = (m[2] == '=' ? decodeURIComponent(m[3]) : true);
  }
  return params;
}

function isMobileDevice() {
  var userAgent = window.navigator.userAgent;
  return /iphone|ipod|ipad|android|blackberry|windows phone|iemobile|wpdesktop/
      .test(userAgent.toLowerCase()) &&
      !(/crkey/).test(userAgent.toLowerCase());
}
