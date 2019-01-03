const { MongoClient, ObjectId } = require('mongodb');
const util = require('./utilController');
const debug = require('debug')('app:loginsController');

exports.loginPage = (req, res) => {
    redirectUrl = req.cookies.redirectUrl;
    console.log("redirectUrl from cookie is " + redirectUrl);
    res.render('loginPage', { title: 'Find your name and enter your password', redirectUrl: redirectUrl });
};

exports.login = async (req, res) => {

    //set this cookie only if a password check works
    res.cookie('username', req.body.fbker, {});
    const user = req.body;
    console.log("fbker: " + user.fbker + ", pwd: " + user.fbkerPwd);
    
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
        const foundUser = await dbParams.collection.find({ emailname: 'tom.boulet@gmail.com' } );

        //get dbhash and salt out of user. do localhash and compare and redirect as needed
        const shortname = foundUser.shortname;

        console.log("found " + foundUser.shortname + ", about to redirect to " + req.body.redirectUrl);
        res.render('loginPage', { tester: 'something' } );
        //res.redirect(req.body.redirectUrl, { usershortname: foundUser.shortname, tester: 'something' } );
        dbParams.client.close();
    }
        
    catch(err) {
        debug(err);
    }
};
