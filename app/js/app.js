'use strict';

angular.module('cruncher', [
  'ngRoute',
  'cruncher.filters',
  'cruncher.services',
  'cruncher.directives',
  'cruncher.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'MyCtrl1'});
  $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
  $routeProvider.otherwise({redirectTo: '/view1'});
}]);

