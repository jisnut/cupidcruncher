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
exports.admin = function(req, res){
  res.render('admin', {title: 'Administration - '+mainTitle});
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
