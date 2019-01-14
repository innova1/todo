const { MongoClient, ObjectId } = require('mongodb');
const util = require('./utilController');
const crypto = require('crypto');
const log4js = require('log4js');
const debug = require('debug')('app:addController');

log4js.configure({
  appenders: { 'useractivity': { type: 'file', filename: 'user.log', layout: { type: 'pattern', pattern: '%d %X{ip} %m' } } },
  categories: { default: { appenders: ['useractivity'], level: 'info' } }
});

var logger = log4js.getLogger(); 
logger.level = 'info';

function grindSalt() {
    const buf = crypto.randomBytes(16);
    debug(`${buf.length} bytes of random data: ${buf.toString('hex')}`);
    return buf.toString('hex');
}

function hash(pwd, salt) {
    //crypto.DEFAULT_ENCODING = 'hex';
    const key = crypto.pbkdf2Sync(pwd, salt, 100000, 64, 'sha512');
    debug("hashed string is " + key.toString('hex'));  // '3745e48...08d59ae'
    return key.toString('hex');
}

async function getRole(req, res) {
    try {
        const un = req.cookies.username;
        const email = un.split(",")[1]
        const dbParams = await util.setupUserDB();
        debug("about to call find in db");
        const foundUser = await dbParams.collection.findOne( { emailname: email } );
        dbParams.client.close();
        return foundUser.role;
    } catch(err) {
        debug(err);
    }
}

exports.addTask = (req, res) => {
    res.render('addTask', { title: 'Adding some feedback' });
};

exports.addFbkx = (req, res) => {
    //res.cookie('username', 'josephine', {});
    const un = "undefined";
    res.render('addFbk', { title: 'Adding some feedback', username: un, shortname: "", email: "" });
};

exports.addFbk = async (req, res) => {
    const un = req.cookies.username;
    const shortname = un.split(",")[0]
    const email = un.split(",")[1]
    
    try {
        const dbParams = await util.setupUserDB();
        const users = await dbParams.collection.find().sort({ shortname: 1 }).toArray();

        res.render('addFbk', { users, title: 'Adding some feedback', username: un, shortname: shortname, email: email });
        
    }
    
    catch(err) {
        debug(err);
    }
};

exports.saveTask = async (req, res) => {
    logger.addContext('ip', req.ip);
    try {
        var tempfbk = req.body;
        tempfbk.createDate = new Date();
        tempfbk.rating = '-1';
        tempfbk.fbkee = { 'shortname': tempfbk.fbkee.split(",")[0], 'email': tempfbk.fbkee.split(",")[1] };
        tempfbk.fbkor = { 'shortname': tempfbk.fbkor.split(",")[0], 'email': tempfbk.fbkor.split(",")[1] };
        const task = req.body;
        const dbParams = await util.setupDB();
        await dbParams.collection.insertOne(task);
        logger.info("feedback added: " + email);
        dbParams.client.close();
        res.redirect('/');
    } catch(err) {
        debug(err);
    }
};

exports.addUserPage = async (req, res) => {
    try {
        role = await getRole(req, res);
        debug("in addUser page, role is " + role);
        if(role=="admin") {
           res.render('addUser', { title: 'Adding a user' });
        } else {
            debug("role is not admin redirecting to /");
           res.redirect('/');
        }
    }
    catch(err) {
        debug(err);
    }
  
};

exports.addUser = async (req, res) => {
        tempUser = req.body;
        var password = tempUser.password;
        //add salt and hash password
        salt = grindSalt();
        tempUser.salt = salt;
        tempUser.createdDate = new Date('2018-10-10');
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