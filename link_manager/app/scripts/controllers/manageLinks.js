'use strict';

angular.module('liveApp')
  .controller('ManageLinksCtrl', function ($scope, $firebase, md5) {
     var indexRef = new Firebase("https://livelink.firebaseio.com/index/");
     $scope.index = $firebase(indexRef);

    $scope.getLinks = function(index){
      var linkRef = new Firebase("https://livelink.firebaseio.com/links/"+index);
      var link = $firebase(linkRef);
      return link;
    }
  });
