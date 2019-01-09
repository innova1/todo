const util = require('./utilController');
const { MongoClient } = require('mongodb');
const os = require("os");
const gameCalc = require('./gameController');
const log4js = require('log4js');
const debug = require('debug')('app:showController');

log4js.configure({
  appenders: { 'useractivity': { type: 'file', filename: 'user.log', layout: { type: 'pattern', pattern: '%d %X{ip} %m' } } },
  categories: { default: { appenders: ['useractivity'], level: 'info' } }
});

var logger = log4js.getLogger(); 
logger.level = 'info';

exports.showFbks = async function (req, res) {
  try {
    const dbParams = await util.setupDB();
    const fbks = await dbParams.collection.find({}).sort({ dueDate: -1 }).toArray();
    const hostname = os.hostname();
    res.render('showFbks', { fbks, title: 'Feedback List', hostname });
    dbParams.client.close();
  }
  catch (err) {
    debug(err);
  }
};
    
exports.showMyFbks = async function (req, res) {
  // need: user fullname and email from cookie
    logger.addContext('ip', req.ip);
  try {
    username = req.cookies.username;
    if(typeof username === 'undefined') {
        email = "";
    } else {
        email = username.split(",")[1]
    }
    const inCount = gameCalc.inCount(email);
    
    debug("query with email: " + email + ", username: " + username);
    const dbParams = await util.setupDB();
    const myFbksIn = await dbParams.collection.find( { "fbkee.email": email } ).sort({ dueDate: -1 }).toArray();
    const myFbksOut = await dbParams.collection.find( { "fbkor.email": email } ).sort({ dueDate: -1 }).toArray();
    const hostname = os.hostname();
    logger.info("viewing feedback: " + email );
    res.render('showFbks', { loggedInEmail: email, myFbksIn, myFbksOut, inCount, title: 'My Feedback List', hostname });
    dbParams.client.close();
  }
  catch (err) {
    debug(err);
  }
};