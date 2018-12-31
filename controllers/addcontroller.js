const { MongoClient, ObjectId } = require('mongodb');
const util = require('./utilController');
const debug = require('debug')('app:addController');

exports.addTask = (req, res) => {
    res.render('addTask', { title: 'Adding some feedback' });
};

exports.addFbk = (req, res) => {
    //res.cookie('username', 'josephine', {});
    //const un = req.cookies.username;
    //res.render('addFbk', { title: 'Adding some feedback', username: un });
    res.render('addFbk', { title: 'Adding some feedback' });
};

exports.addFbk2 = (req, res) => {
    res.cookie('username', 'josephine', {});
    const un = req.cookies.username;
    res.render('addFbk', { title: 'Adding some feedback', username: un });
};

exports.saveTask = async (req, res) => {
  try {
    const task = req.body;
    const dbParams = await util.setupDB();
    await dbParams.collection.insertOne(task);
    dbParams.client.close();
    res.redirect('/');
  }

  catch(err) {
    debug(err);
  }
};

exports.addUser = async (req, res) => {
  res.render('addUser', { title: 'Adding a user' });
};

exports.saveUser = async (req, res) => {
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