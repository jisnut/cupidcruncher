#!/usr/bin/env node
var DEFAULT_PORT = process.env.PORT || 5000;
var db = null,
    util = require('util'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    url = require('url'),
    events = require('events'),
    express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    logfmt = require('logfmt'),
    os = require('os'),
    mongo = require('mongodb'),
    monk = require('monk'),
    app = express();

/*
var configuration;  // Configuration data that is loaded once upon app startup from the database
var initializeGlobalCollections = function() {
  configuration = db.get('configuration');
  configuration.find({},{},function(e,docs){
    configuration = docs;
// Put something more useful in here...
console.log("question set size: "+configuration.questionSetSize);
  })
};
*/

var MONGODB_URL = process.env['MONGOLAB_URI'];
// For local setup set this environment variable in your .bashrc
// export MONGOLAB_URI="mongodb://cupidcruncherlocaldev:<PASSWORD>@ds053218.mongolab.com:53218/heroku_app20014113"
if(!MONGODB_URL){
  console.log("Error: MONGOLAB_URI is " + MONGODB_URL);
  return -1;
} else {
  console.log("Connecting to: " + MONGODB_URL);
  try{
    db = monk(MONGODB_URL);
//    initializeGlobalCollections();
  } catch (e) {
    console.log("Error: Database connection could not be established.");
    console.log(e);
    return -1;
  }
  if(!db){
    console.log("Error: Database connection could not be established.");
    return -1;
  }
}

app.use(logfmt.requestLogger());
app.set('port', DEFAULT_PORT);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// These don't seem to be accessible in the templates
//app.set('title', 'Cupid Cruncher');
//app.set('appTitle', 'Cupid Cruncher');
//app.set('appVersion', 'v0.2');

app.use(express.favicon(path.join(__dirname, 'public/app/img/favicon.ico')));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/qr', routes.qr);
app.get('/rules', routes.rules);
app.get('/login', routes.login);
app.get('/admin', routes.admin);
app.get('/registration', routes.registration);
app.get('/registrationLoop', routes.registrationLoop);
app.get('/play', routes.play);

app.get('/users', user.list);
app.get('/userlist', routes.userlist(db));
app.get('/newuser', routes.newuser);
app.get('/newParticipant', routes.newParticipant);
app.post('/adduser', routes.adduser(db));

app.post('/register', routes.register(db));


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


/*
function main(argv) {
  if(!MONGODB_URL){
    console.log("Error: MONGOLAB_URI is " + MONGODB_URL);
    return -1;
  } else {
    console.log("Connecting to: " + MONGODB_URL);
    try{
      db = monk(MONGODB_URL);
      initializeGlobalCollections();
    } catch (e) {
      console.log("Error: Database connection could not be established.");
      console.log(e);
      return -1;
    }
    if(!db){
      console.log("Error: Database connection could not be established.");
      return -1;
    }
  }
  new HttpServer({
    'GET': createServlet(StaticServlet),
    'POST': createServlet(StaticServlet),
    'DELETE': createServlet(StaticServlet),
    'HEAD': createServlet(StaticServlet)
  }).start(Number(argv[2]) || DEFAULT_PORT);
}

function escapeHtml(value) {
  return value.toString().
    replace('<', '&lt;').
    replace('>', '&gt;').
    replace('"', '&quot;');
}

function createServlet(Class) {
  var servlet = new Class();
  return servlet.handleRequest.bind(servlet);
}


// * An Http server implementation that uses a map of methods to decide
// * action routing.
// *
// * @param {Object} Map of method => Handler function

function HttpServer(handlers) {
  this.handlers = handlers;
  this.server = http.createServer(this.handleRequest_.bind(this));
}

HttpServer.prototype.start = function(port) {
  this.port = port;
  this.server.listen(port);
  util.puts('Http Server running on port:' + port + '/');
  console.log("Listening on " + port);

  console.log("Hostname: " + os.hostname());
};

HttpServer.prototype.parseUrl_ = function(urlString) {
  var parsed = url.parse(urlString);
  parsed.pathname = url.resolve('/', parsed.pathname);
  return url.parse(url.format(parsed), true);
};

HttpServer.prototype.handleRequest_ = function(req, res) {
  var logEntry = req.method + ' ' + req.url;
  if (req.headers['user-agent']) {
    logEntry += ' ' + req.headers['user-agent'];
  }
  util.puts(logEntry);
  req.url = this.parseUrl_(req.url);
  var handler = this.handlers[req.method];
  if (!handler) {
    res.writeHead(501);
    res.end();
  } else {
    handler.call(this, req, res);
  }
};

// Handles static content.
function StaticServlet() {}

StaticServlet.MimeMap = {
  'txt': 'text/plain',
  'html': 'text/html',
  'css': 'text/css',
  'xml': 'application/xml',
  'json': 'application/json',
  'js': 'application/javascript',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'gif': 'image/gif',
  'png': 'image/png',
  'svg': 'image/svg+xml'
};

StaticServlet.prototype.handleRequest = function(req, res) {
  var self = this;
  var path = ('./' + req.url.pathname).replace('//','/').replace(/%(..)/g, function(match, hex){
    return String.fromCharCode(parseInt(hex, 16));
  });
  var parts = path.split('/');
  if (parts[parts.length-1].charAt(0) === '.') {
    return self.sendForbidden_(req, res, path);
  }
  if (req.url.pathname === '/data') {
    return self.sendData_(req, res);
  }
  if (req.url.pathname === '/app/participant/register') {
    return self.registerParticipant_(req, res);
  }
  if (req.url.pathname === '/app/admin/login') {
    return self.authenticateAdmin_(req, res);
  }
  fs.stat(path, function(err, stat) {
    if (err)
      return self.sendMissing_(req, res, path);
    if (stat.isDirectory())
      return self.sendDirectory_(req, res, path);
    return self.sendFile_(req, res, path);
  });
}

StaticServlet.prototype.sendError_ = function(req, res, error) {
  res.writeHead(500, {
      'Content-Type': 'text/html'
  });
  res.write('<!doctype html>\n');
  res.write('<title>Internal Server Error</title>\n');
  res.write('<h1>Internal Server Error</h1>');
  res.write('<pre>' + escapeHtml(util.inspect(error)) + '</pre>');
  util.puts('500 Internal Server Error');
  util.puts(util.inspect(error));
};

StaticServlet.prototype.sendMissing_ = function(req, res, path) {
  path = path.substring(1);
  res.writeHead(404, {
      'Content-Type': 'text/html'
  });
  res.write('<!doctype html>\n');
  res.write('<title>404 Not Found</title>\n');
  res.write('<h1>Not Found</h1>');
  res.write(
    '<p>The requested URL ' +
    escapeHtml(path) +
    ' was not found on this server.</p>'
  );
  res.end();
  util.puts('404 Not Found: ' + path);
};

StaticServlet.prototype.sendForbidden_ = function(req, res, path) {
  path = path.substring(1);
  res.writeHead(403, {
      'Content-Type': 'text/html'
  });
  res.write('<!doctype html>\n');
  res.write('<title>403 Forbidden</title>\n');
  res.write('<h1>Forbidden</h1>');
  res.write(
    '<p>You do not have permission to access ' +
    escapeHtml(path) + ' on this server.</p>'
  );
  res.end();
  util.puts('403 Forbidden: ' + path);
};

StaticServlet.prototype.sendRedirect_ = function(req, res, redirectUrl) {
  res.writeHead(301, {
      'Content-Type': 'text/html',
      'Location': redirectUrl
  });
  res.write('<!doctype html>\n');
  res.write('<title>301 Moved Permanently</title>\n');
  res.write('<h1>Moved Permanently</h1>');
  res.write(
    '<p>The document has moved <a href="' +
    redirectUrl +
    '">here</a>.</p>'
  );
  res.end();
  util.puts('301 Moved Permanently: ' + redirectUrl);
};

StaticServlet.prototype.sendData_ = function(req, res) {
  var self = this;
//  var respObj = {};
  if(!isAuthorized(req)){
    res.writeHead(403, {
      'Content-Type': 'text/html'
    });
    res.write('{"error":"Unauthorized access."}');
    res.end();
    return;
  }
  res.writeHead(200, {
    'Content-Type': 'application/json'
  });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  if (req.url.query.json) {
    var reqObj = null;
    try{
      reqObj = JSON.parse(req.url.query.json);
    } catch (e) {
      invalidDataRequestError(res, req.url.query.json);
    }
    if(reqObj && reqObj.o){
      var dataPar = reqObj.p ? reqObj.p : {};
      var dataReq = req.method.toLowerCase()+reqObj.o+'(dataPar, res);';
      try{
        var promise = eval(dataReq); // might want to inspect this a little more to see if we should do anything with it might be good for catching errors/bugs
      } catch (e) {
        invalidDataRequestError(res, dataReq);
      }
    }
  }
};

StaticServlet.prototype.sendFile_ = function(req, res, path) {
  var self = this;
  var file = fs.createReadStream(path);
  res.writeHead(200, {
    'Content-Type': StaticServlet.
      MimeMap[path.split('.').pop()] || 'text/plain'
  });
  if (req.method === 'HEAD') {
    res.end();
  } else {
    file.on('data', res.write.bind(res));
    file.on('close', function() {
      res.end();
    });
    file.on('error', function(error) {
      self.sendError_(req, res, error);
    });
  }
};

StaticServlet.prototype.sendDirectory_ = function(req, res, path) {
  var self = this;
  if (path.match(/[^\/]$/)) {
    req.url.pathname += '/';
    var redirectUrl = url.format(url.parse(url.format(req.url)));
    return self.sendRedirect_(req, res, redirectUrl);
  }
  fs.readdir(path, function(err, files) {
    if (err)
      return self.sendError_(req, res, error);

    if (!files.length)
      return self.writeDirectoryIndex_(req, res, path, []);

    var remaining = files.length;
    files.forEach(function(fileName, index) {
      if(fileName == 'index.html'){
	    return self.sendFile_(req, res, path + fileName);
      }
      fs.stat(path + '/' + fileName, function(err, stat) {
        if (err)
          return self.sendError_(req, res, err);
        if (stat.isDirectory()) {
          files[index] = fileName + '/';
        }
        if (!(--remaining))
          return self.writeDirectoryIndex_(req, res, path, files);
      });
    });
  });
};

StaticServlet.prototype.writeDirectoryIndex_ = function(req, res, path, files) {
  path = path.substring(1);
  res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  res.write('<!doctype html>\n');
  res.write('<title>' + escapeHtml(path) + '</title>\n');
  res.write('<style>\n');
  res.write('  ol { list-style-type: none; font-size: 1.2em; }\n');
  res.write('</style>\n');
  res.write('<h1>Directory: ' + escapeHtml(path) + '</h1>');
  res.write('<ol>');
  files.forEach(function(fileName) {
    if (fileName.charAt(0) !== '.') {
      res.write('<li><a href="' +
        escapeHtml(fileName) + '">' +
        escapeHtml(fileName) + '</a></li>');
    }
  });
  res.write('</ol>');
  res.end();
};

StaticServlet.prototype.registerParticipant_ = function(req, res) {
  var self = this;
  var participant = {
    eventName: req.url.query.eventName,
    name: req.url.query.name,
    nameMatchesOk: req.url.query.nameMatchesOk === 'on' ? true : false,
    email: req.url.query.email,
    emailMatchesOk: req.url.query.emailMatchesOk === 'on' ? true : false,
    number: req.url.query.number
  };
  // ...definitely some validation (certainly to make sure the number isn't already in use)

// TODO: save it to the participant collection

//  return self.sendFile_(req, res, "./app/participant/play.html");
  res.write('{"registration":"Successful.", "number":"42"}');
  res.end();
};

StaticServlet.prototype.authenticateAdmin_ = function(req, res) {
  var self = this;
  if((req.url.query.username === "justin" && req.url.query.password === "nibor") ||
     (req.url.query.username === "robin" && req.url.query.password === "jisnut")) {
// TODO: create some sort of "session"
    return self.sendFile_(req, res, "./app/admin/index.html");
  }
  res.writeHead(403, {
    'Content-Type': 'text/html'
  });
  res.write('{"error":"Unauthorized access."}');  // Need a better failed login page than this
  res.end();
  return;
};

function isAuthorized(req){
  //implement this
  //check req.<user?>
  return true;
};

function invalidDataRequestError(res, dReq) {
  var errMsg = 'Invalid data request: '+dReq;
  util.puts(errMsg);
  res.write('{"error":"'+errMsg+'"}');
  res.end();
};

function writeDataResponse(res, docs) {
//  console.log(docs);
  res.write(JSON.stringify(docs));
  res.end();
};

function initializeGlobalCollections() {
  configuration = db.get('configuration');
};

//***** Data Request Methods *****
function getConfiguration(query, res) {
  return configuration.findOne(query,{},
    function(e,docs){
      writeDataResponse(res, docs);
    });
};

function getQuestionList(query, res) {
  return db.get('questions').find({},{},
    function(e,docs){
      writeDataResponse(res, docs);
    });
};

function getPartnerList(query, res) {
  return db.get('partners').find({},{},
    function(e,docs){
      writeDataResponse(res, docs);
    });
};





// Must be last,
main(process.argv);
*/
