'use strict';

angular.module('cruncher', [
  'ngRoute', 'ngAnimate',
  'cruncher.filters',
  'cruncher.services',
  'cruncher.directives',
  'cruncher.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/partners', {templateUrl: 'participant/partners.html', controller: 'partnersCtrl'});
  $routeProvider.when('/question', {templateUrl: 'participant/question.html', controller: 'questionCtrl'});
  $routeProvider.when('/configuration', {templateUrl: 'participant/configuration.html', controller: 'configurationCtrl'});
  $routeProvider.when('/setup', {templateUrl: 'admin/setup.html', controller: 'setupCtrl', controllerAs: 'config'});
  $routeProvider.when('/eventDetails', {templateUrl: 'admin/eventDetails.html', controller: 'eventDetailsCtrl', controllerAs: 'eventDetails'});
  $routeProvider.when('/participants', {templateUrl: 'admin/participants.html', controller: 'participantsCtrl', controllerAs: 'participants'});
  $routeProvider.when('/questions', {templateUrl: 'admin/questions.html', controller: 'questionsCtrl', controllerAs: 'questions'});
  $routeProvider.when('/reports', {templateUrl: 'admin/reports.html', controller: 'reportsCtrl', controllerAs: 'reports'});
  $routeProvider.when('/stats', {templateUrl: 'admin/stats.html', controller: 'statsCtrl', controllerAs: 'stats'});
  $routeProvider.when('/links', {templateUrl: 'admin/links.html', controller: 'linksCtrl', controllerAs: 'links'});
  $routeProvider.otherwise({redirectTo: '/question'});
}]);

var resizable_containers;
function initializeApp() {
  initializeResizableContainers();

};

function initializeResizableContainers() {
  resizable_containers = $('.resizable-container');
  resizable_containers.each(function(index, value) {
    if(value.id=='appContainer') {
      value.wOffset = 55; value.hOffset = 105;
    }
    if(value.id=='adminTabContainer') {
      value.wOffset = 60; value.hOffset = 150;
    }
//    if(value.id=='playTabContainer') {
//      value.wOffset = 50; value.hOffset = 300;
//    }
    if(value.id=='questionContainer') {
      value.wOffset = 130; value.hOffset = 430;
    }
    if(value.id=='questionText') {
      value.wOffset = 140; value.hOffset = 500;
    }
  });
  window.onresize=resizeAppContainer;
  resizeAppContainer();
};

function resizeAppContainer() {
  var w = parseInt(window.innerWidth),
      h = parseInt(window.innerHeight);
  resizable_containers.each(function(index, value) {
    value.style.width=(w-value.wOffset)+'px';
    value.style.height=(h-value.hOffset)+'px';
  });
};

function parseNoWorkshopQuestions(spreadsheetData) {
  var headings=[], questions=[];
  if(spreadsheetData.feed){
    var col=0, row=0;
    $(spreadsheetData.feed.entry).each(function(i, value) {
      //console.log(i + ") "+ value.title.$t +": " + value.content.$t);
      col = value.title.$t.charCodeAt(0)-65;
      row = parseInt(value.title.$t.substr(1));
      if(row == 1){
        headings.push(value.content.$t);
      } else {
        row -= 2;
        if(!questions[row]){
          questions[row] = {};
        }
        questions[row][headings[col]] = value.content.$t;
      }
    });
  }
  return questions;
};
