const util = require('./utilController');
const { MongoClient } = require('mongodb');
const os = require("os");
const debug = require('debug')('app:showController');

exports.showFbks = async function (req, res) {
  try {
    const dbParams = await util.setupDB();
    const tasks = await dbParams.collection.find({}).sort({ dueDate: -1 }).toArray();
    const hostname = os.hostname();
    res.render('showFbks', { tasks, title: 'Feedback List', hostname });
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
    email = username.split(",")[1]
    const dbParams = await util.setupDB();
    const tasks = await dbParams.collection.find({ fbkee: username, email: email }).sort({ dueDate: -1 }).toArray();
    const hostname = os.hostname();
    res.render('showFbks', { tasks, title: 'Feedback List', hostname });
    dbParams.client.close();
  }
  catch (err) {
    debug(err);
  }
};