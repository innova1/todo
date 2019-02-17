const { MongoClient, ObjectId } = require('mongodb');
const util = require('./utilController');
const crypto = require('crypto');
const log4js = require('log4js');
const debug = require('debug')('app:loginsController');

log4js.configure({
  appenders: { 'useractivity': { type: 'file', filename: 'user.log', layout: { type: 'pattern', pattern: '%d %X{ip} %m' } } },
  categories: { default: { appenders: ['useractivity'], level: 'info' } }
});

var logger = log4js.getLogger(); 
logger.level = 'info';

function hash(pwd, salt) {
    //crypto.DEFAULT_ENCODING = 'hex'; <-- causes typeerror and db connection freeze up until app restart
    const key = crypto.pbkdf2Sync(pwd, salt, 100000, 64, 'sha512');
    debug("hashed string is " + key.toString('hex'));  // '3745e48...08d59ae'
    return key.toString('hex');
}

exports.loginPage = (req, res) => {
    redirectUrl = req.cookies.redirectUrl;
    debug("redirectUrl from cookie is " + redirectUrl);
    res.render('loginPage', { title: 'Find your name and enter your password', changeUser: false, loginAttempt: 1, redirectUrl: redirectUrl });
};

exports.login = async (req, res) => {

    const user = req.body;
    debug("email before was " + user.email);
    const email = user.email.trim().toLowerCase();;
    debug("email is now " + email);
    const userPwd = user.userPwd;
    const redirectUrl = user.redirectUrl;
    temploginAttempt = parseInt(user.loginAttempt);
    const loginAttempt = temploginAttempt+1;
    logger.addContext('ip', req.ip);

    try {

        const dbParams = await util.setupUserDB();
        
        const foundUser = await dbParams.collection.findOne( { emailname: email } );
        
        if( !foundUser ) {
            res.render('loginPage', { title: 'Email not found: Please re-enter your name and password', changeUser: false, loginAttempt: loginAttempt, redirectUrl: redirectUrl });
        } else {
            //get dbhash and salt out of user. do localhash and compare and redirect as needed
            const dbPwdHash = foundUser.password;
            const salt = foundUser.salt;

            //hash it
            const userPwdHash = hash(userPwd, salt);

            if( dbPwdHash == userPwdHash ) {
                debug("entered pwd " + userPwdHash + " is the same as db password " + dbPwdHash + ", about to redirect to " + redirectUrl);
                logger.info("successful login: " + email);
                shortname = foundUser.shortname;
                //set this cookie only if a password check works
                res.cookie('username', shortname + "," + email, { expires: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)) });
                res.redirect(req.body.redirectUrl);
            } else {
                debug("entered pwd " + userPwdHash + " is NOT the same as db password " + dbPwdHash + ", about to redirect back to login page for try # " + loginAttempt);
                logger.info("login failed: " + email + ", " + userPwd);
                res.render('loginPage', { title: 'Login failed: Please re-enter your name and password', changeUser: false, loginAttempt: loginAttempt, redirectUrl: redirectUrl });
            }

            dbParams.client.close();
        }
        /*
        res.cookie('username', 'Tom' + "," + email, { expires: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)) }); // <-- temp HEEERE
        res.redirect(req.body.redirectUrl);
        */
    }

    catch(err) {
        debug(err);
    }
};

exports.changeUserPage = (req, res) => {
    redirectUrl = req.cookies.redirectUrl;
    debug("redirectUrl from cookie is " + redirectUrl);
    res.render('loginPage', { title: 'Find your name and enter your password', changeUser: true, loginAttempt: 1, redirectUrl: redirectUrl });
};

exports.changeUser = (req, res) => {
    const user = req.body;
    const fbkor = user.fbkor;
    const fbkorPwd = user.fbkorPwd;
    const redirectUrl = user.redirectUrl;
    temploginAttempt = parseInt(user.loginAttempt);
    const loginAttempt = temploginAttempt+1;
    debug("redirectUrl from cookie is " + redirectUrl);
    res.clearCookie('username');
    res.cookie('username', fbkor, { expires: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)) });
    //success -- only one implemented right now -- not yet checking password
    res.redirect(req.body.redirectUrl);
    //res.render('loginPage', { title: 'Login failed: Please re-enter your name and password', changeUser: true, loginAttempt: loginAttempt, redirectUrl: redirectUrl });
};

exports.logout = (req, res) => {
    logger.addContext('ip', req.ip);
    logger.info("logging out: " + email);
    res.clearCookie('username');
    res.redirect('/');
};
