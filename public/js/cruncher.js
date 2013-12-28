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

var resizable_containers;
function initializeApp() {
  resizable_containers = $('.resizable-container');
  resizable_containers.each(function(index, value) {
    if(value.id=='adminContainer') {
      value.wOffset = 50; value.hOffset = 50;
    }
    if(value.id=='adminTabContainer') {
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

var registrationConfirmationDialog = $('#registrationConfirmationDialog').dialog({
  autoOpen: false,
  resizable: false,
  modal: true,
  height: 330,
  width: 660,
  open: function(){
//      if($('#divDeploymentRequests').is(':visible')){
//        $('#drsCanceledWarning').show();
//      }
  },
  close: function(){
//    $('#drsCanceledWarning').hide();
  },
  buttons: {
    Next: function(){
//      setReleasePhaseSlider(true, 0); // Rollback to Dev
//        updateRelease({projectEnvironment: selectedProject.projectEnvironments[0]});
      $(this).dialog('close');
    }
  }
});
