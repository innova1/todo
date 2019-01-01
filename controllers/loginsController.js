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
    
    try {
        /*
        const user = req.body;
        const dbParams = await util.setupUserDB();
        await dbParams.collection.updateOne( 
            { emailname:  },
            { $set}
                                           );
        dbParams.client.close();
        */
        
        console.log("about to redirect to " + req.body.redirectUrl);
        res.redirect(req.body.redirectUrl);
    }

  catch(err) {
    debug(err);
  }

};
