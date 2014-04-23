'use strict';

angular.module('liveApp')
  .controller('AddLinkCtrl', function ($scope, $firebase, md5) {

    $scope.prompt = '已收集的連結';

    $scope.updatePrompt = function(){
      if($scope.linkSearch.$.length == 0){
        $scope.prompt = '已收集的連結';
      }else{
        $scope.prompt = '網址相似的連結';
      }
    }

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
      if($scope.is_valid_url($scope.linkSearch.$)){
        $scope.links.$add({url: $scope.linkSearch.$, added_at: new Date().getTime()});
        $scope.addAlert('success', '我們已經收到網址'+$scope.linkSearch.$);
        $scope.linkSearch.$ = '';
        $scope.prompt = '已收集的連結';
      }else{
        $scope.addAlert('danger', '網址格式有誤！');
      }
    }
  });
