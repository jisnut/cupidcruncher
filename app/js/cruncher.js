'use strict';

angular.module('cruncher', [
  'ngRoute',
  'cruncher.filters',
  'cruncher.services',
  'cruncher.directives',
  'cruncher.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/partners', {templateUrl: 'partials/partners.html', controller: 'partnersCtrl'});
  $routeProvider.when('/questions', {templateUrl: 'partials/questions.html', controller: 'questionsCtrl'});
  $routeProvider.when('/configuration', {templateUrl: 'partials/configuration.html', controller: 'configurationCtrl'});
  $routeProvider.otherwise({redirectTo: '/partners'});
}]);

