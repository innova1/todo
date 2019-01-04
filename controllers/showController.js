const util = require('./utilController');
const { MongoClient } = require('mongodb');
const os = require("os");
const debug = require('debug')('app:showController');

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
  try {
    username = req.cookies.username;
    if(typeof username === 'undefined') {
        email = "";
    } else {
        email = username.split(",")[1]
    }
    
    debug("query with email: " + email + ", username: " + username);
    const dbParams = await util.setupDB();
    const myFbksIn = await dbParams.collection.find( { "fbkee.email": email } ).sort({ dueDate: -1 }).toArray();
    const myFbksOut = await dbParams.collection.find( { "fbkor.email": email } ).sort({ dueDate: -1 }).toArray();
    const hostname = os.hostname();
    res.render('showFbks', { myFbksIn, myFbksOut, title: 'My Feedback List', hostname });
    dbParams.client.close();
  }
  catch (err) {
    debug(err);
  }
};