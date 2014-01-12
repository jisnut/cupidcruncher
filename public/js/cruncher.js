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
  questions.splice(0, 0, {"number": "0", "text": "This is not a question.", "note": "This is a placeholder!"});
  return questions;
};

function generateMatchReport(thisParticipant, participants, config) {
  var matchedPartners = [];
  if(thisParticipant.partners) {
    for(var i=0; i<thisParticipant.partners.length; i++) {
      var partner = getParticipant(thisParticipant.partners[i], thisParticipant.partners[i].number, participants);
      var responses = getPartnersResponses(thisParticipant.number, partner.number, participants);
      if(responses) {
        var matchedYeses = [], matchedMaybes = [];
        if(thisParticipant.partners[i].yeses) {
          for(var j=0; j<thisParticipant.partners[i].yeses.length; j++){
            var myYesQuestion = thisParticipant.partners[i].yeses[j];
            if(responses.yeses){
              for(var k=0; k<responses.yeses.length; k++){
                if(responses.yeses[k] == myYesQuestion) {
                  matchedYeses.push(myYesQuestion);
                }
              }
            }
            if(responses.maybes && config.event.maybes.matchesYeses){
              for(var k=0; k<responses.maybes.length; k++){
                if(responses.maybes[k] == myYesQuestion) {
                  matchedMaybes.push(myYesQuestion);
                }
              }
            }
          }
        }
        if(thisParticipant.partners[i].maybes) {
          for(var j=0; j<thisParticipant.partners[i].maybes.length; j++){
            var myMaybeQuestion = thisParticipant.partners[i].maybes[j];
            if(responses.yeses && config.event.maybes.matchesYeses){
              for(var k=0; k<responses.yeses.length; k++){
                if(responses.yeses[k] == myMaybeQuestion) {
                  matchedYeses.push(myMaybeQuestion);
                }
              }
            }
            if(responses.maybes){
              for(var k=0; k<responses.maybes.length; k++){
                if(responses.maybes[k] == myMaybeQuestion) {
                  matchedMaybes.push(myMaybeQuestion);
                }
              }
            }
          }
        }
        matchedPartners.push({partner: partner, matches: {yeses: matchedYeses, maybes: matchedMaybes}});
      }
    }
  }
  return matchedPartners;
};

function getPartnersResponses(thisParticipantsNumber, partnersNumber, participants) {
  for(var i=0; i<participants.length; i++){
    if(participants[i].number == partnersNumber) {
      if(participants[i].partners) {
        for(var j=0; j<participants[i].partners.length; j++){
          if(participants[i].partners[j].number == thisParticipantsNumber) {
            return {
              yeses: participants[i].partners[j].yeses,
              maybes: participants[i].partners[j].maybes
            };
          }
        }
      }
    }
  }
  return null;
};

function getParticipant(target, participantNumber, participants) {
  for(var i=0; i<participants.length; i++) {
    if(participants[i].number == participantNumber){
      target.number = participants[i].number,
      target.name = participants[i].name,
      target.nameMatchesOk = participants[i].nameMatchesOk,
      target.email = participants[i].email,
      target.emailMatchesOk = participants[i].emailMatchesOk
      return target;
    }
  }
}

function recordPartnerAnswer(participant, questionNumber, answer, partnerNumber, participants){
  var partner = null;
  for(var i=0; i<participant.partners.length; i++) {
    if(participant.partners[i].number == partnerNumber){
      // This IS the partner object we want, but we also want to make sure that we have the most recent participant info.
      // ...so, look them up in the master participant list.
      partner = getParticipant(participant.partners[i], partnerNumber, participants);
    }
  }
  if(!partner) {
    partner = getParticipant({}, partnerNumber, participants);
    participant.partners.push(partner);
  }
  if(partner) {
    if(!partner.yeses){partner.yeses = [];}
    if(!partner.maybes){partner.maybes = [];}
    if(!partner.nos){partner.nos = [];}
    var inYeses = $.inArray(questionNumber, partner.yeses);
    var inMaybes = $.inArray(questionNumber, partner.maybes);
//  var inNos = $.inArray($scope.question.number, partner.nos);
    if(answer === 'yes') {
      if(inYeses<0){                                           // if not already in the yeses array
        partner.yeses.push(questionNumber);            // put it in.
      }
      if(inMaybes>=0){                                         // if already in the maybes array
        partner.maybes.splice(inMaybes, 1);                    // take it out.
      }
    }
    if(answer === 'maybe') {
      if(inYeses>=0){                                          // if already in the yeses array
        partner.yeses.splice(inYeses, 1);                      // take it out.
      }
      if(inMaybes<0){                                          // if not already in the maybes array
        partner.maybes.push(questionNumber);           // put it in.
      }
    }
  }
};