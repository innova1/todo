const { MongoClient, ObjectId } = require('mongodb');
const util = require('./utilController');
const debug = require('debug')('app:loginsController');

exports.loginPage = (req, res) => {
    redirectUrl = req.cookies.redirectUrl;
    debug("redirectUrl from cookie is " + redirectUrl);
    res.render('loginPage', { title: 'Find your name and enter your password', changeUser: false, loginAttempt: 1, redirectUrl: redirectUrl });
};

exports.login = async (req, res) => {

    const user = req.body;
    const fbker = user.fbker;
    const fbkerPwd = user.fbkerPwd;
    const redirectUrl = user.redirectUrl;
    temploginAttempt = parseInt(user.loginAttempt);
    const loginAttempt = temploginAttempt+1;
    
    debug("fbker: " + fbker + ", pwd: " + fbkerPwd);
    
    try {
        /*
            take password and do hash and use this result to compare with db
        */
        //const dbParams = await util.setupUserDB();
        /*
            look email address
            get password dbhash back
            compare with localhash above
            if match then true and go to redirectUrl else false and return to login page with "not match" message
        */
        //const foundUser = await dbParams.collection.findOne( { emailname: "tomboulet@gmail.com" } );

        //get dbhash and salt out of user. do localhash and compare and redirect as needed
        //const dbPwd = foundUser.password;
        
        //if( dbPwd == fbkerPwd ) {
            //debug("entered pwd " + fbkerPwd + " is the same as db password " + dbPwd + ", about to redirect to " + redirectUrl);
            //set this cookie only if a password check works
            res.cookie('username', fbker, {});
            res.redirect(req.body.redirectUrl);
        //} else {
           // debug("entered pwd " + fbkerPwd + " is NOT the same as db password " + dbPwd + ", about to redirect back to login page for try # " + loginAttempt);
            //res.render('loginPage', { title: 'Login failed: Please re-enter your name and password', changeUser: false, loginAttempt: loginAttempt, redirectUrl: redirectUrl });
        //}
        /*
        debug("found " + password + ", about to redirect to " + req.body.redirectUrl);
        res.redirect(req.body.redirectUrl)
        */
        //dbParams.client.close();
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
    const fbker = user.fbker;
    const fbkerPwd = user.fbkerPwd;
    const redirectUrl = user.redirectUrl;
    temploginAttempt = parseInt(user.loginAttempt);
    const loginAttempt = temploginAttempt+1;
    debug("redirectUrl from cookie is " + redirectUrl);
    res.clearCookie('username');
    res.cookie('username', fbker, {});
    //success -- only one implemented right now -- not yet checking password
    res.redirect(req.body.redirectUrl);
    //res.render('loginPage', { title: 'Login failed: Please re-enter your name and password', changeUser: true, loginAttempt: loginAttempt, redirectUrl: redirectUrl });
};
