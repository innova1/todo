var createError = require('http-errors');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
var morgan = require('morgan');
var debug = require('debug')('app');

const todoRouter = require('./routes/todoRoutes');

var app = express();

function checkLogin(req, res, next) {
    console.log("in checkLogin in app.js");
    if( isLoggedIn(req, res, next) ) {
        next();
    } else {
        res.redirect("/login");
    }
}

function isLoggedIn(req, res, next) {
    const un = req.cookies.username;
    if(typeof un.username === undefined) {
        return false;
    } else {
        console.log("username is " + un + " in app.js");
        return true;
    }
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use('/css', express.static(__dirname + '/public/stylesheets'));
app.use('/webfonts', express.static(__dirname + '/public/fonts/webfonts/')); 
app.use('/export', checkLogin, function(req, res, next) {
    next();
});

app.get('/', todoRouter);
app.get('/export', todoRouter);
app.post('/task/complete/:id', todoRouter);
app.get('/task/edit/:id', todoRouter);
app.post('/task/edit/:id', todoRouter);
app.get('/task/delete/:id', todoRouter);
app.post('/task/delete/:id', todoRouter);
app.get('/task/complete/:id', todoRouter);
app.get('/task/add/', todoRouter);
app.get('/task/add2/', todoRouter);
app.post('/task/add/', todoRouter);

app.get('/user/add/', todoRouter);
app.post('/user/add/', todoRouter);

app.get('/login', todoRouter);
app.post('/login', todoRouter);

// catch favicon requests and respond
app.use('/favicon.ico', (req, res) => res.status(204));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
