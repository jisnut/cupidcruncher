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
//  $routeProvider.otherwise({redirectTo: '/question'});
}]);

var resizable_containers;
var playspacer;
function initializeApp() {
  initializeResizableContainers();

};

function initializeResizableContainers() {
  playspacer = $('.play-spacer');
  resizable_containers = $('.resizable-container');
  resizable_containers.each(function(index, value) {
    if(value.id=='appContainer') {
      value.wOffset = 55; value.hOffset = 105;
    }
    if(value.id=='adminTabContainer') {
      value.wOffset = 60; value.hOffset = 150;
    }
    if(value.id=='questionContainer') {
      value.wOffset = 80; // hOffset conditionally set below
    }
    if(value.id=='questionText') {
      value.wOffset = 80; // hOffset conditionally set below
    }
  });
  window.onresize=resizeAppContainer;
  resizeAppContainer();
};

function resizeAppContainer() {
  var w = parseInt(window.innerWidth),
      h = parseInt(window.innerHeight);
  if(resizable_containers[1] && resizable_containers[2]){
    if(w<700){
      resizable_containers[1].hOffset = 420;
      resizable_containers[2].hOffset = 450;
      playspacer.show();
    } else {
      resizable_containers[1].hOffset = 360;
      resizable_containers[2].hOffset = 390;
      playspacer.hide();
    }
  }
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
