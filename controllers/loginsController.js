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
    const user = await dbParams.collection.find({ email: "tom.boulet@gmail.com" } );
    dbParams.client.close();

    //get dbhash and salt out of user. do localhash and compare and redirect as needed

    console.log("found " + user.shortname + ", about to redirect to " + req.body.redirectUrl);
    res.redirect(req.body.redirectUrl);
}
    catch(err) {
        debug(err);
};
