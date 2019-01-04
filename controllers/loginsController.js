const { MongoClient, ObjectId } = require('mongodb');
const util = require('./utilController');
const debug = require('debug')('app:loginsController');

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
    const fbkor = user.fbkor;
    const email = user.email;
    const fbkorPwd = user.fbkorPwd;
    const redirectUrl = user.redirectUrl;
    temploginAttempt = parseInt(user.loginAttempt);
    const loginAttempt = temploginAttempt+1;

    debug("fbkor: " + fbkor + ", pwd: " + fbkorPwd);

    try {
        /*
        take password and do hash and use this result to compare with db
        */
        const dbParams = await util.setupUserDB();
        /*
        look email address
        get password dbhash back
        compare with localhash above
        if match then true and go to redirectUrl else false and return to login page with "not match" message
        */
        const foundUser = await dbParams.collection.findOne( { emailname: email } );

        //get dbhash and salt out of user. do localhash and compare and redirect as needed
        const dbPwdHash = foundUser.password;
        const salt = foundUser.salt;
        
        //hash it
        const fbkorPwdHash = hash(fbkorPwd, salt);

        if( dbPwdHash == fbkorPwdHash ) {
            debug("entered pwd " + fbkorPwd + " is the same as db password " + dbPwd + ", about to redirect to " + redirectUrl);
            //set this cookie only if a password check works
            res.cookie('username', fbkor, { expires: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)) });
            res.redirect(req.body.redirectUrl);
        } else {
            debug("entered pwd " + fbkorPwd + " is NOT the same as db password " + dbPwd + ", about to redirect back to login page for try # " + loginAttempt);
            res.render('loginPage', { title: 'Login failed: Please re-enter your name and password', changeUser: false, loginAttempt: loginAttempt, redirectUrl: redirectUrl });
        }
        
        dbParams.client.close();
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
    res.clearCookie('username');
    res.redirect('/');
};
