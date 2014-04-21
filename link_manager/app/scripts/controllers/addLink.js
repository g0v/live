'use strict';

angular.module('liveApp')
  .controller('AddLinkCtrl', function ($scope, $firebase, md5) {

    $scope.alerts = [];
    $scope.addAlert = function(type, message) {
      //type: success, danger
      $scope.alerts.push({type: type, msg: message});
    };

    $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
    };

    var indexRef = new Firebase("https://livelink.firebaseio.com/index/");
    $scope.index = $firebase(indexRef);

    $scope.linkPrompt = '';

    $scope.is_valid_url = function(url){
      return url.match(/^(ht|f)tps?:\/\/[a-z0-9-\.]+\.[a-z]{2,4}\/?([^\s<>\#%"\,\{\}\\|\\\^\[\]`]+)?$/);
    }

    $scope.CheckDepucate = function(evt) {
      if($scope.is_valid_url($scope.url)){
        var dataRef = new Firebase("https://livelink.firebaseio.com/links/"+md5.createHash($scope.url));
        dataRef.on('value', function(snapshot) {
          if(snapshot.val() == null){
            $scope.linkPrompt = '還沒有人回報過';
          }else{
            $scope.linkDepucated = true;
            $scope.linkPrompt = '已經有人回報過';
            console.log(snapshot.val());
          }
        });
      }else{
        $scope.linkPrompt = '格式錯誤';
      }
    };

    $scope.addLink = function() {
      var linkRef = new Firebase("https://livelink.firebaseio.com/links/"+md5.createHash($scope.url));
      $scope.links = $firebase(linkRef);
      $scope.links.$add({title: $scope.title, url: $scope.url, timestamp: new Date().getTime()});
      $scope.index.$add(md5.createHash($scope.url));
      $scope.addAlert('', '謝謝您提供的資訊！');
    }

  });
