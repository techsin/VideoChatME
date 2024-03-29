var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var lessMiddleware = require('less-middleware');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var io = require('socket.io');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/node-auth', { useMongoClient: true })
.then(() =>  console.log('connection succesful'))
.catch((err) => console.error(err));

var index = require('./routes/index');

var app = express();





// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));



 

//passportjs
let sessionMiddleware = session({
  secret: 'sdlkfj salkjflksajfl ;skadjf389838h',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({mongooseConnection: mongoose.connection, ttl: 14 * 24 * 60 * 60 })
});

let socketio = require('./bin/websocket');
socketio.attachSession(sessionMiddleware);


app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

var User = require('./models/User');
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function (req, res, next) {
  res.locals.authenticated = req.isAuthenticated();
  res.locals.user = req.user;
  next();
});


app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
