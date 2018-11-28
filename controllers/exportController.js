const util = require('./utilController');
const { MongoClient } = require('mongodb');
const os = require("os");
const debug = require('debug')('app:showController');


exports.exportFbks = async function (req, res) {
  try {
    const dbParams = await util.setupDB();
    const tasks = await dbParams.collection.find({}).sort({ dueDate: -1 }).toArray();
    const hostname = os.hostname();
    res.render('exportFbks', { tasks, title: 'Export of Feedback List', hostname });
    dbParams.client.close();
  }
  
  catch (err) {
    debug(err);
  }
}