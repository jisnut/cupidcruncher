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
    var partnerResource = $resource('/partner' + '/:id', {id: '@_id'}, {'update': {method: 'PUT' }});
    $scope.questionsPerSet = 5;     // TODO: make this a configuration value in the DB
    $scope.questions = [];
    $scope.question = {};
    $scope.partner = {
      yeses: [],
      maybes: [],
      nos: []
    };
    var answerYes = $('#answerYes');
    var answerMaybe = $('#answerMaybe');
    var answerNo = $('#answerNo');
    function errorMessage(err) {
      $scope.message = err;
    };
    $scope.listQuestions = function() {
      questionResource.query(function(data) {
        $scope.questions = data;
        $scope.questionsSetTotal = Math.ceil(data.length / $scope.questionsPerSet);
      }, errorMessage);
    };
    $scope.listQuestions();
    $scope.showSwitchPartner = function() {
      $('#question').hide(); $('#partner').show();
    }
    $scope.showSwitchQuestionSet = function() {
      $('#question').hide(); $('#questionSet').show();
    }
    $scope.switchPartner = function() {
      if($scope.partner.number){
          // TODO: validate the participant with $scope.partner.number exists 
        $('#partner').hide(); $('#questionSet').show();
      } else {
        $('#partnerNumber').effect('pulsate', 700);
      }
    };
    $scope.switchQuestionSet = function() {
      if($scope.questionSet && $scope.questionSet.number && $scope.questionSet.number <= $scope.questionsSetTotal){
        $scope.question = $scope.questions[($scope.questionSet.number-1) * $scope.questionsPerSet];
        if($scope.question.note){
          $('#questionNote').show('fade', 2000);
        }
        $('#questionSet').hide();
        $('#question').show();
      } else {
        $('#questionSetNumber').effect('pulsate', 700);
      }
    };
    $scope.yes = function() {
      $scope.question.answer = 'Yes!';
      $('#answerButtons').hide(); $('#navigationButtons').show();
      answerYes.show('fade', 300);
      setTimeout(function() {answerYes.effect('puff', 1000);}, 2000);
    };
    $scope.maybe = function() {
      $scope.question.answer = 'Maybe?';
      $('#answerButtons').hide(); $('#navigationButtons').show();
      answerMaybe.show('fade', 300);
      setTimeout(function() {answerMaybe.effect('puff', 1000);}, 2000);
    };
    $scope.no = function() {
      $scope.question.answer = 'No.';
      $('#answerButtons').hide(); $('#navigationButtons').show();
      answerNo.show('fade', 300);
      setTimeout(function() {answerNo.effect('puff', 1000);}, 2000);
    };
    $scope.change = function() {
      $scope.question.answer = null;
      $('#navigationButtons').hide(); $('#answerButtons').show();
    };
    $scope.saveParticipantAnswer = function() {
      if($scope.question.answer === 'Yes!') {
        $scope.partner.yeses.push($scope.question.number);    
        // Actually, we should immediattely push this participant's number into their current 
        // partner's yesses/nos/maybes arrays respectively for easy correlation and report 
        // generation later. This could be done server side.
      }
      if($scope.question.answer === 'Maybe?') {
        $scope.partner.maybes.push($scope.question.number);
      }
      if($scope.question.answer === 'No.') {
        $scope.partner.nos.push($scope.question.number);
      }
//      partnerResource.update(function(data) {
        // switch to next question
        $scope.question = $scope.questions[parseInt($scope.question.number) + 1];
        $('#navigationButtons').hide();
        $('#answerButtons').show();
//      }, errorMessage);
    };
/*
$scope.switchPartner()      partner.number
$scope.switchQuestionSet()  questionSet.number

question.number
question.text
question.note

*/
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
