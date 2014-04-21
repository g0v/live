'use strict';

angular
  .module('liveApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'firebase',
    'ui.utils',
    'ui.bootstrap',
    'angular-md5'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/addLink', {
        templateUrl: 'views/addLink.html',
        controller: 'AddLinkCtrl'
      })
      .when('/manageLinks', {
        templateUrl: 'views/manageLinks.html',
        controller: 'ManageLinksCtrl'
      })
      .otherwise({
        redirectTo: '/addLink'
      });
  });
