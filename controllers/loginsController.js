const { MongoClient, ObjectId } = require('mongodb');
const util = require('./utilController');
const debug = require('debug')('app:loginsController');

exports.loginPage = (req, res) => {
    redirectUrl = req.cookies.redirectUrl;
    debug("redirectUrl from cookie is " + redirectUrl);
    res.render('loginPage', { title: 'Find your name and enter your password', redirectUrl: redirectUrl });
};

exports.login = async (req, res) => {

    const user = req.body;
    const fbker = user.fbker;
    const fbkerPwd = user.fbkerPwd;
    debug("fbker: " + fbker + ", pwd: " + fbkerPwd);
    
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
        const foundUser = await dbParams.collection.findOne( { emailname: "tomboulet@gmail.com" } );

        //get dbhash and salt out of user. do localhash and compare and redirect as needed
        const dbPwd = foundUser.password;
        
        if( dbPwd == fbkerPwd ) {
            debug("entered pwd " + fbkerPwd + " is the same as db password " + dbPwd + ", about to redirect to " + req.body.redirectUrl);
            //set this cookie only if a password check works
            res.cookie('username', fbker, {});
            res.redirect(req.body.redirectUrl);
        } else {
            debug("entered pwd " + fbkerPwd + " is NOT the same as db password " + dbPwd + ", about to redirect back to login page");
            res.redirect(req.body.redirectUrl);
        }
        /*
        debug("found " + password + ", about to redirect to " + req.body.redirectUrl);
        res.redirect(req.body.redirectUrl)
        */
        dbParams.client.close();
    }
        
    catch(err) {
        debug(err);
    }
};
