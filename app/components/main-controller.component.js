'use strict';

angular.module('channelEngineMultiview')
	.component('mainController', {
		templateUrl: 'components/main-controller.template.html',

		controller: function() {
			self.testValue = "erwan gilles";
			self.selectedVideoIndex = null;
			self.udpateSelectedVideo = function(videoIndex) {
				console.log('i m called with video index ' + videoIndex);
				alert(videoIndex);
			};
		},
	});