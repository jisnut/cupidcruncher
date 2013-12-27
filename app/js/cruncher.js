'use strict';

angular.module('cruncher', [
  'ngRoute', 'ngAnimate',
  'cruncher.filters',
  'cruncher.services',
  'cruncher.directives',
  'cruncher.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/partners', {templateUrl: 'partials/partners.html', controller: 'partnersCtrl'});
  $routeProvider.when('/questions', {templateUrl: 'partials/questions.html', controller: 'questionsCtrl'});
  $routeProvider.when('/configuration', {templateUrl: 'partials/configuration.html', controller: 'configurationCtrl'});
  $routeProvider.when('/setup', {templateUrl: 'partials/setup.html', controller: 'setupCtrl', controllerAs: 'config'});
  $routeProvider.when('/eventDetails', {templateUrl: 'partials/eventDetails.html', controller: 'eventDetailsCtrl', controllerAs: 'eventDetails'});
  $routeProvider.when('/participants', {templateUrl: 'partials/participants.html', controller: 'participantsCtrl', controllerAs: 'participants'});
  $routeProvider.when('/questions', {templateUrl: 'partials/questions.html', controller: 'questionsCtrl', controllerAs: 'questions'});
  $routeProvider.when('/reports', {templateUrl: 'partials/reports.html', controller: 'reportsCtrl', controllerAs: 'reports'});
  $routeProvider.when('/stats', {templateUrl: 'partials/stats.html', controller: 'statsCtrl', controllerAs: 'stats'});
  $routeProvider.when('/links', {templateUrl: 'partials/links.html', controller: 'linksCtrl', controllerAs: 'links'});
  $routeProvider.otherwise({redirectTo: '/partners'});
}]);

function initializeApp() {
  window.onresize=resizeAppContainer;
  resizeAppContainer();
};

var wOffset = 50, hOffset = 50;
function resizeAppContainer() {
  var w = parseInt(window.innerWidth),
      h = parseInt(window.innerHeight),
      c = $('.app-container')[0];
      c.style.width=(w-wOffset)+'px';
      c.style.height=(h-hOffset)+'px';
};
