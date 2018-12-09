const { MongoClient, ObjectId } = require('mongodb');
const util = require('./utilController');
const debug = require('debug')('app:addController');

exports.loginPage = (req, res) => {
    res.render('loginPage', { title: 'Find your name and enter your password' });
};

exports.login = async (req, res) => {
  try {
    const user = req.body;
    const dbParams = await util.setupUserDB();
    await dbParams.collection.insertOne(user);
    dbParams.client.close();
    res.redirect('/');
  }

  catch(err) {
    debug(err);
  }
};