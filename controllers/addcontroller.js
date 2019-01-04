const { MongoClient, ObjectId } = require('mongodb');
const util = require('./utilController');
const crypto = require('crypto');
const debug = require('debug')('app:addController');

function grindSalt() {
    const buf = crypto.randomBytes(16);
    debug(`${buf.length} bytes of random data: ${buf.toString('hex')}`);
    return buf;
}

function hash(pwd, salt) {
    //crypto.DEFAULT_ENCODING = 'hex';
    const key = crypto.pbkdf2Sync(pwd, salt, 100000, 64, 'sha512');
    debug("hashed string is " + key.toString('hex'));  // '3745e48...08d59ae'
    return key;
}

exports.addTask = (req, res) => {
    res.render('addTask', { title: 'Adding some feedback' });
};

exports.addFbkx = (req, res) => {
    //res.cookie('username', 'josephine', {});
    const un = "undefined";
    res.render('addFbk', { title: 'Adding some feedback', username: un, shortname: "", email: "" });
};

exports.addFbk = (req, res) => {
    const un = req.cookies.username;
    const shortname = un.split(",")[0]
    const email = un.split(",")[1]
    res.render('addFbk', { title: 'Adding some feedback', username: un, shortname: shortname, email: email });
};

exports.saveTask = async (req, res) => {
    try {
        var tempfbk = req.body;
        tempfbk.fbkee = { 'shortname': tempfbk.fbkee.split(",")[0], 'email': tempfbk.fbkee.split(",")[1] };
        tempfbk.fbkor = { 'shortname': tempfbk.fbkor.split(",")[0], 'email': tempfbk.fbkor.split(",")[1] };
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

exports.addUserPage = async (req, res) => {
  res.render('addUser', { title: 'Adding a user' });
};

exports.addUser = async (req, res) => {
        tempUser = req.body;
        var password = tempUser.password;
        //add salt and hash password
        salt = grindSalt();
        tempUser.salt = salt;
        hashed = hash(password, salt);
        debug("took " + password + " and hashed to " + hashed);
        tempUser.password = hashed;
    try {
        const user = tempUser; //doing this because it seems these variables need to be const for some reason
        const dbParams = await util.setupUserDB();
        await dbParams.collection.insertOne(user);
        dbParams.client.close();
        res.redirect('/');
    }

    catch(err) {
        debug(err);
    }
};