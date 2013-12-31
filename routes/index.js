var mainTitle = 'SEX+STL Cupid Cruncher';
exports.index = function(req, res){
  res.render('index', {title: mainTitle});
};
exports.qr = function(req, res){
  res.render('qr', {title: 'QR Code - '+mainTitle});
};
exports.rules = function(req, res){
  res.render('rules', {title: 'Rules - '+mainTitle});
};
exports.login = function(req, res){
  res.render('login', {title: 'Admin Login - '+mainTitle});
};
exports.admin = function(db) {
  return function(req, res){
    if((req.body.username === 'justin' && req.body.password === 'nibor') ||
      (req.body.username === 'robin' && req.body.password === 'jisnut')){
      res.render('admin', {title: 'Administration - '+mainTitle});
    } else {
      res.render('login', {title: 'LOGIN FAILED: Admin Login - '+mainTitle});
    }
  };
};
exports.registration = function(req, res){
  res.render('registration', {title: 'Registration - '+mainTitle});
};
exports.registrationLoop = function(req, res){
  var registryLoop = '<input type="hidden" id="registryLoop" name="registryLoop" value="false"></input>';
  res.render('registration', {title: 'Registration - '+mainTitle});
};
exports.register = function(db) {
  return function(req, res) {
    if(req.body){
      var participant = req.body;
      var counters = db.get('counters');
      var promise = counters.findAndModify({'query': {_id:'participantNumber'}, 'update': {'$inc': {'seq': 1}}, 'new':true});
      promise.success(function(doc){
        participant.number = doc.seq;
        var collection = db.get('participant');
        collection.insert(participant, function (err, doc) {
          if(err){
            console.error('DB Error: '+err);
            res.json(500, {error: 'There was a problem registering the participant in the database: '+err})
          } else {
            res.json({success:"Registered!", participant:doc});
          }
        });
      });
      promise.error(function(err){
        res.json(500, {error: 'There was a problem acquiring your participant number: '+err})
      });
    } else {
      // throw error
    }
  };
};
exports.play = function(db) {
  return function(req, res){
    res.render('play', {title: mainTitle});
  };
};



// Admin setup functions
exports.saveConfiguration = function(db) {
  return function(req, res) {
    if(req.body){
      var configPair = req.body;
      var collection = db.get('configuration');   // Client provides a key string identifying the configuration document to modify
      var promise = collection.findAndModify({'query': {_id: configPair.key}, 'update': configPair.configuration, 'new':true});
      promise.success(function(doc){
        res.json({success:"Configuration updated", participantNumber:doc});
      });
      promise.error(function(err){
        res.json(500, {error: 'There was a problem updating the configuration: '+err})
      });
    } else {
      // throw error
    }
  };
};
exports.resetParticipantCounter = function(db) {
  return function(req, res) {
    if(req.body){
      var value = req.body.value;
      var counters = db.get('counters');
      var promise = counters.findAndModify({'query': {_id:'participantNumber'}, 'update': {'seq': value}});
      promise.success(function(doc){
        res.json({success:"Participant number counter reset."});
      });
      promise.error(function(err){
        res.json(500, {error: 'There was a problem resetting the participant number counter: '+err})
      });
    } else {
      // throw error
    }
  };
};
exports.dropParticipantsFromDB = function(db) {
  return function(req, res) {
    var collection = db.get('participant');
    collection.drop(function (err, doc) {
      if(err){
        console.error('DB Error: '+err);
        res.json(500, {error: 'There was a problem dropping the participants collection from the database: '+err});
      } else {
        res.json({success:'All participants dropped from database!'});
      }
    });
  };
};
exports.saveQuestionsToDb = function(db) {
  return function(req, res) {
    if(req.body){
      var questions = req.body;
      var collection = db.get('questions');
      collection.insert(questions, function (err, doc) {
        if(err){
          console.error('DB Error: '+err);
          res.json(500, {error: 'There was a problem saving questions in the database: '+err});
        } else {
          res.json({success:'Questions saved to database!'});
        }
      });
    } else {
      // throw error
    }
  };
};
exports.dropQuestionsFromDb = function(db) {
  return function(req, res) {
    var collection = db.get('questions');
    collection.drop(function (err, doc) {
      if(err){
        console.error('DB Error: '+err);
        res.json(500, {error: 'There was a problem dropping the questions collection from the database: '+err});
      } else {
        res.json({success:'Questions dropped from database!'});
      }
    });
  };
};




exports.userlist = function(db) {
    return function(req, res) {
        var collection = db.get('usercollection');
        collection.find({},{},function(e,docs){
            res.render('userlist', {
                "userlist" : docs
            });
        });
    };
};
exports.newuser = function(req, res){
  res.render('newuser', { title: 'Add New User' });
};
exports.adduser = function(db) {
  return function(req, res) {
    // Get our form values. These rely on the "name" attributes
    var userName = req.body.username;
    var userEmail = req.body.useremail;
    // Set our collection
    var collection = db.get('usercollection');
    // Submit to the DB
    collection.insert({
      "username" : userName,
      "email" : userEmail
    }, function (err, doc) {
      if (err) {
        // If it failed, return error
        res.send("There was a problem adding the information to the database.");
      } else {
        // If it worked, set the header so the address bar doesn't still say /adduser
        res.location("userlist");
        // And forward to success page
        res.redirect("userlist");
      }
    });
  }
}
