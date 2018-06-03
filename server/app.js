var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var models = require('./models');


var app = express();

// Set up sequelize
var Sequelize = require('sequelize');
const sequelize = new Sequelize('node_redux_example', 'root', '', {
  dialect: 'mysql'
});
sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
})
.catch(err => {
  console.error('Unable to connect to the database:', err);
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// passport initialization
app.use(passport.initialize());
const localSignupStrategy = require('./passport/local-signup');
const localLoginStrategy = require('./passport/local-login');
passport.use('local-signup', localSignupStrategy);
passport.use('local-login', localLoginStrategy);

// Routes
app.use('/api', require('./routes/api'));
app.use('/auth', require('./routes/auth'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.log('Error acquired: ', err);

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

// Server here
models.sequelize.sync().then(function() {
  var http = require('http');
  module.exports = app;
  var server = http.createServer(app);
  server.listen(4000);
  console.log("Listening to port 4000");

  // Web sockets
  var io = require('socket.io')(server);
  io.sockets.on('connection', function(socket) {
    
    socket.on('login', data => {
      console.log('User ' + data.username + ' logged in');
      socket.join(data.username);
    });

    socket.on('send_message', data => {
      console.log('Sending message now to', data.username);
      io.sockets.in(data.username).emit('receive_message', {message: 'hi'});
    });
  });
});