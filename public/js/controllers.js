'use strict';
var application = {
 version: '0.2',
 title: 'Cupid Cruncher',
 event: 'The "No" Workshop',
 description: 'Application description',
 about: 'Application about',
 author: 'Justin Cleveland',
 email: 'justin.j.cleveland@gmail.com'
};

/* Controllers */

angular.module('cruncher.controllers', ['ngCookies', 'ngResource'])

  .controller('registrationCtrl', function($scope, $http, $cookieStore, $location, $routeParams) {
    $scope.application = application;
    $scope.loop = false;
    var loopStr = '?registryLoop=true';
    if(window.location.search === loopStr){
      $scope.loop = 'true';
      $('.registration').attr('action', '/').attr('href', '/registration'+loopStr).attr('method', 'get');
      $('.registrationCancel').attr('href', '/'+loopStr);
      $('#registrationForm').attr('autocomplete', 'off');
    }
    $scope.register = function() {
      if(this.participant){
        $('#registerButton').attr('disabled', 'disabled');
        console.log('Registering: '+$scope.participant.name);
        $http.post('register', $scope.participant).success(function(data) {
          if(data.success){
            $('#registrationForm').hide();
            $('#registrationConfirmation').show();
            console.log(data.success + ' Participant #:' + data.participant.number);
            $scope.participant = data.participant;
            $cookieStore.put('participant', $scope.participant);
            $('.message-reminder').effect('pulsate', 700);
            $('#registerButton').removeAttr("disabled");
          }
        }).
        error(function(data, status) {
          $scope.data = data || "Request failed";
          $scope.status = status;
          $('#registerButton').removeAttr('disabled');
        });
      }
    };
  })

  .controller('loginCtrl', function($scope) {
    $scope.application = application;
    $scope.adminLogin = function() {
      console.log("Logging in admin: "); // ...admin user name
      // maybe some validation?
    }
  })

  .controller('adminCtrl', function($scope) {
    $scope.application = application;
  })

  .controller('cruncherCtrl', function($scope, $http, $cookieStore) {
    $scope.application = application;
    $scope.participant = $cookieStore.get('participant');
    console.log($scope.participant);

  })

// Participant controller functions
  .controller('partnersCtrl', function($scope, $http) {
    $http.get('data/partners.json').success(function(data) {
      $scope.partners = data;
    });
  })

  .controller('questionCtrl', function($scope, $http, $resource) {
    initializeResizableContainers();
    var questionResource = $resource('/questions' + '/:id', {id: '@_id'}, {'update': {method: 'PUT' }});
    var participantResource = $resource('/participants' + '/:id', {id: '@_id'}, {'update': {method: 'PUT' }});
    $scope.questionsPerSet = 5;     // TODO: make this a configuration value in the DB
    $scope.questions = [];
    $scope.question = {};
    $scope.participants = [];
    var answerYes = $('#answerYes');
    var answerMaybe = $('#answerMaybe');
    var answerNo = $('#answerNo');
    function errorMessage(err) {
      $scope.message = err;
    };
    function clearErrorMessage() {
      $scope.message = '';
    };
    $scope.listQuestions = function() {
      questionResource.query(function(data) {
        $scope.questions = data;
        $scope.questionsSetTotal = Math.ceil(data.length / $scope.questionsPerSet);
      }, errorMessage);
    };
    $scope.listQuestions(); // Initialize our list of questions.
    $scope.listParticipants = function() {
      participantResource.query(function(data) {
        $scope.participants = data;
      }, errorMessage);
    };
    $scope.listParticipants(); // Initialize our list of participants.
    $scope.showSwitchPartner = function() {
      // Refresh our list of participants.
      $scope.listParticipants();
      $('#question').hide(); $('#partner').show();
    };
    $scope.showSwitchQuestionSet = function() {
      $('#question').hide(); $('#questionSet').show();
    };
    function getPartner(num){
      var partner = null;
      if($scope.participant.partners){ // First search this participant's existing list of partners and return anything we find
        for(var i=0; i<$scope.participant.partners.length; i++){
          if($scope.participant.partners[i].number == num){
            return $scope.participant.partners[i];
          }
        }
      } // If we don't find an existing partner they've been with, we fall through to here and search the full list
      for(var i=0; i<$scope.participants.length; i++){
        if($scope.participants[i].number == num){
          partner = $scope.participants[i];
        }
      }
      return partner;
    };
    $scope.switchPartner = function() {
      if($scope.participant.partner.number){
        var num = $scope.participant.partner.number;
        if(num == $scope.participant.number){
          errorMessage("That's YOUR number sillyhead!\n\nEnter your PARTNER'S number below!\n");
          return;
        }
        $scope.participant.partner = getPartner(num);
        if(!$scope.participant.partner){
          errorMessage("Participant #"+num+" has not been registered.\n\nVerify this with your workshop coordinator and try again.\n");
          return;
        }
        clearErrorMessage();
        $('#partner').hide(); $('#questionSet').show();
        if(!$scope.participant.partners){
          $scope.participant.partners = [];
        }
        $scope.participant.partners.push($scope.participant.partner);
      } else {
        $('#partnerNumber').effect('pulsate', 700);
      }
    };
    $scope.switchQuestionSet = function() {
      if($scope.questionSet && $scope.questionSet.number && $scope.questionSet.number <= $scope.questionsSetTotal){
        $('#questionNote').hide();
        $scope.question = $scope.questions[($scope.questionSet.number-1) * $scope.questionsPerSet]; // THIS is NOT working right
        if($scope.question.note){
          setTimeout(function() {$('#questionNote').show('fade', {easing:'easeInElastic'}, 1000)}, 500);
        }
        $('#questionSet').hide();
        $('#question').show();
      } else {
        $('#questionSetNumber').effect('pulsate', 700);
      }
    };
    $scope.yes = function() {
      $scope.participant.partner.answer = 'Yes!';
      $('#answerButtons').hide(); $('#navigationButtons').show();
      answerYes.show('fade', 300);
      setTimeout(function() {answerYes.effect('puff', 1000);}, 2000);
    };
    $scope.maybe = function() {
      $scope.participant.partner.answer = 'Maybe?';
      $('#answerButtons').hide(); $('#navigationButtons').show();
      answerMaybe.show('fade', 300);
      setTimeout(function() {answerMaybe.effect('puff', 1000);}, 2000);
    };
    $scope.no = function() {
      $scope.participant.partner.answer = 'No.';
      $('#answerButtons').hide(); $('#navigationButtons').show();
      answerNo.show('fade', 300);
      setTimeout(function() {answerNo.effect('puff', 1000);}, 2000);
    };
    $scope.change = function() {
      $scope.participant.partner.answer = null;
      $('#navigationButtons').hide(); $('#answerButtons').show();
    };
    $scope.saveParticipantAnswer = function() {
      if($scope.participant.partner.answer === 'Yes!') {
        if(!$scope.participant.partner.yeses){
          $scope.participant.partner.yeses = [];
        }
        $scope.participant.partner.yeses.push($scope.question.number);    
      }
      if($scope.participant.partner.answer === 'Maybe?') {
        if(!$scope.participant.partner.maybes){
          $scope.participant.partner.maybes = [];
        }
        $scope.participant.partner.maybes.push($scope.question.number);
      }
      if($scope.participant.partner.answer === 'No.') {
        if(!$scope.participant.partner.nos){
          $scope.participant.partner.nos = [];
        }
        $scope.participant.partner.nos.push($scope.question.number);
      }
// Do we still need to search for that pre-existing participant in their list????
      $scope.participant.partner.questionNumber = question.number;
      participantResource.update($scope.participant, function(data) {
        // Answer recorded... Switch to next question!
        var nextQuestionNumber = parseInt($scope.question.number) + 1;
        if(nextQuestionNumber % $scope.questionsPerSet == 0){
          $scope.questionSet.number++;
        }
        $scope.question = $scope.questions[nextQuestionNumber];
        $('#navigationButtons').hide();
        $('#answerButtons').show();
      }, errorMessage);
    };
  })

  .controller('configurationCtrl', function($scope, $http) {
    $http.get('data/configuration.json').success(function(data) {
      $scope.configuration = data;
    });
  })

// Admin controller functions
  .controller('setupCtrl', function($scope, $http, $routeParams) {
    $scope.setup={};
    $scope.setup.participantCounterStart=1;
    $scope.questionsPreviewLabel='Preview Questions:';
    $scope.setup.driveSpreadsheetUrl=
      'https://spreadsheets.google.com/feeds/cells/0AonL0RA7C8fwdHhFNVpyQTFnTkw5VXNxS3Z2X1hFamc/od6/public/basic?alt=json-in-script&callback=JSON_CALLBACK';
    $scope.enableRegistration = function() {
      $http.post('enableRegistration', $scope.setup.enableRegistration).
      success(function(data) {
        if(data.success){
          $scope.status = data.success;
          $('#status').effect('pulsate', 700);
        }
      }).
      error(function(error, status) {
        $scope.error = error || "Request failed";
        $scope.status = status;
      });
    };
    $scope.resetParticipantCounter = function() {
      $http.post('resetParticipantCounter', {value: $scope.setup.participantCounterStart}).
      success(function(data) {
        if(data.success){
          $scope.status = data.success;
          $('#status').effect('pulsate', 700);
        }
      }).
      error(function(error, status) {
        $scope.error = error || "Request failed";
        $scope.status = status;
      });
    };
    $scope.dropParticipantsFromDB = function() {
      $('#dropParticipantsFromDbButton').attr('disabled', 'disabled');
      $http.post('dropParticipantsFromDB').
      success(function(data) {
        if(data.success){
          $scope.status = data.success;
          $('#status').effect('pulsate', 700);
          $('#dropParticipantsFromDbButton').removeAttr("disabled");
        }
      }).
      error(function(error, status) {
        $scope.error = error || "Request failed";
        $scope.status = status;
        $('#dropParticipantsFromDbButton').removeAttr('disabled');
      });
    };
    $scope.loadQuestionsFromDrive = function() {
      $('#loadQuestionsButton').attr('disabled', 'disabled');
      $http.jsonp($scope.setup.driveSpreadsheetUrl).
        success(function(data, status) {
          $('#questionsPreview').show();
          $scope.questions = parseNoWorkshopQuestions(data);
          $('#loadQuestionsButton').removeAttr("disabled");
        }).
        error(function(error, status) {
          $scope.error = error || "Request failed";
          $scope.status = status;
          $('#loadQuestionsButton').removeAttr("disabled");
        });
    };
    $scope.prettyPrintQuestions = function() {
      return JSON.stringify($scope.questions, undefined, ' ');
    };
    $scope.saveQuestionsToDB = function() {
      $('#saveQuestionsToDbButton').attr('disabled', 'disabled');
      $http.post('saveQuestionsToDb', $scope.questions).
      success(function(data) {
        if(data.success){
          $scope.questionsPreviewLabel = data.success;
          $('#questionsPreviewLabel').effect('pulsate', 700);
          $('#saveQuestionsToDbButton').removeAttr("disabled");
        }
      }).
      error(function(error, status) {
        $scope.error = error || "Request failed";
        $scope.status = status;
        $('#saveQuestionsToDbButton').removeAttr('disabled');
      });
    };
    $scope.dropQuestionsFromDB = function() {
      $('#dropQuestionsFromDbButton').attr('disabled', 'disabled');
      $http.post('dropQuestionsFromDb').
      success(function(data) {
        if(data.success){
          $scope.status = data.success;
          $('#status').effect('pulsate', 700);
          $('#dropQuestionsFromDbButton').removeAttr("disabled");
        }
      }).
      error(function(error, status) {
        $scope.error = error || "Request failed";
        $scope.status = status;
        $('#dropQuestionsFromDbButton').removeAttr('disabled');
      });
    };
  })

  .controller('eventDetailsCtrl', function($scope, $http) {

  })

  .controller('participantsCtrl', function($scope, $http, $resource) {
    $scope.participants = [];
    $scope.participant = {};
    var participantResource = $resource('/participants' + '/:id', {id: '@_id'}, {'update': {method: 'PUT' }});
    function errorMessage(err) {
      $scope.message = err;
    };
    $scope.listParticipants = function() {
      participantResource.query(function(data) {
        $scope.participants = data;
      }, errorMessage);
    };
    $scope.listParticipants();
  })

  .controller('questionsCtrl', function($scope, $http, $resource) {
    $scope.questions = [];
    $scope.question = {};
//    $scope.view = '/questions.html';
    var questionResource = $resource('/questions' + '/:id', {id: '@_id'}, {'update': {method: 'PUT' }});
    function errorMessage(err) {
      $scope.message = err;
    };
    $scope.listQuestions = function() {
//      $scope.view = '/questions.html';
      questionResource.query(function(data) {
        $scope.questions = data;
      }, errorMessage);
    };
    $scope.listQuestions();
  })

  .controller('reportsCtrl', function($scope, $http) {

  })

  .controller('statsCtrl', function($scope, $http) {

  })

  .controller('linksCtrl', function($scope, $http) {

  });
