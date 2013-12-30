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
  $routeProvider.otherwise({redirectTo: 'participant/partners'});
}]);

var resizable_containers;
function initializeApp() {
  resizable_containers = $('.resizable-container');
  resizable_containers.each(function(index, value) {
    if(value.id=='appContainer') {
      value.wOffset = 55; value.hOffset = 105;
    }
    if(value.id=='adminTabContainer') {
      value.wOffset = 60; value.hOffset = 270;
    }



    if(value.id=='playTabContainer') {
      value.wOffset = 50; value.hOffset = 300;
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
  var totalColumns=0, col=0, row=0, headings=[], questions=[];
  console.log(spreadsheetData);
  if(spreadsheetData.feed){
    $(spreadsheetData.feed.entry).each(function(i, value) {
console.log(i + ") "+ value.title.$t +": " + value.content.$t);
      row = parseInt(value.title.$t.substr(1));
      if(row == 1){
        headings.push(value.content.$t);
        totalColumns++;
      } else {
        row -= 2;
        if(!questions[row]){
          questions[row] = {};
        }
        questions[row][headings[col]] = value.content.$t;
        col++;
        if(col % totalColumns == 0){    //every cell must be filled for this to work
          col = 0;
        }
      }
    });
  }
  return questions;
};
