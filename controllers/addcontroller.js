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
    try {
        const buf = crypto.randomBytes(16);
        debug(`${buf.length} bytes of random data: ${buf.toString('hex')}`);
        return buf.toString('hex');
    } catch(err) {
        debug(err);
    }
}

function hash(pwd, salt) {
    debug("in hash()");
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
        
        if(email === 'tom.boulet@exxonmobil.com') {
            res.render('addFbk2', { users, title: 'Adding some feedback 2', username: un, shortname: shortname, email: email, loggedInEmail: un });
        } else {
            res.render('addFbk', { users, title: 'Adding some feedback', username: un, shortname: shortname, email: email, loggedInEmail: un });
        }
        
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
        logger.info("feedback added: " + tempfbk.fbkee.email);
        dbParams.client.close();
        res.redirect('/');
    } catch(err) {
        debug(err);
    }
};

exports.addUserPage = async (req, res) => {
    try {
        const type = "add";
        const role = await getRole(req, res);
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
        tempUser.createDate = new Date();
        hashed = hash(password, salt);
        debug("took " + password + " and hashed to " + hashed);
        tempUser.password = hashed;
    try {
        const user = tempUser;
        const dbParams = await util.setupUserDB();
        await dbParams.collection.insertOne(user);
        dbParams.client.close();
        res.redirect('/');
    }

    catch(err) {
        debug(err);
    }
};

exports.changePasswordPage = async (req, res) => {
    try {
        const un = req.cookies.username;
        const shortname = un.split(",")[0]
        const emailname = un.split(",")[1]
        const type = "change";
        res.render('changePassword', { title: 'Change password', type: type, shortname: shortname, emailname: emailname });
    } catch(err) {
        debug(err);
    }
};

exports.savePassword = async (req, res) => {
    try {
        tempUser = req.body;
        var password = tempUser.password;
        //add salt and hash password
        salt = grindSalt();
        debug("salt returned");
        tempUser.salt = salt;
        debug("salt set in temp");
        tempUser.createDate = new Date();
        debug("new date created");
        hashed = hash(password, salt);
        debug("took " + password + " and hashed to " + hashed);
        tempUser.password = hashed;
        const user = tempUser; 
        const dbParams = await util.setupUserDB();
        
        await dbParams.collection.findOneAndUpdate(
            { _id: new ObjectId(id) }, 
            { "modDate": new Date() },
            { "password": tempUser.password },
            { "shortname": tempUser.shortname }
        );
        dbParams.client.close();
        res.redirect('/');
    }

    catch(err) {
        debug(err);
    }
};