'use strict';

angular.module('liveApp')
  .controller('AddLinkCtrl', function ($scope, $firebase, md5) {
    
    var linkRef = new Firebase("https://livelink-submission.firebaseio.com/links/");
    $scope.links = $firebase(linkRef);

    $scope.alerts = [];
    $scope.addAlert = function(type, message) {
      //type: success, danger
      $scope.alerts.push({type: type, msg: message});
    };

    $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
    };

    $scope.linkPrompt = '';

    $scope.is_valid_url = function(url){
      url = String(url);
      var matches = url.match(/^(ht|f)tps?:\/\/[a-z0-9-\.]+\.[a-z]{2,4}\/?([^\s<>\#%"\,\{\}\\|\\\^\[\]`]+)?$/);
      if(matches != null){
        return true;
      }else{
        return false;
      }
    }

    $scope.addLink = function() {
      $scope.links.$add({url: $scope.linkSearch.$, added_at: new Date().getTime()});
      $scope.addAlert('success', '謝謝您提供的資訊！');
    }
  });
