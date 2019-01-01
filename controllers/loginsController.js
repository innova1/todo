const { MongoClient, ObjectId } = require('mongodb');
const util = require('./utilController');
const debug = require('debug')('app:loginsController');

exports.loginPage = (req, res) => {
    console.log("req.origUrl is " + req.origUrl + ", res.origUrl is " + res.origUrl);
    res.render('loginPage', { title: 'Find your name and enter your password', redirectUrl: req.origUrl });
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
        
        res.redirect(req.body.origUrl);
    }

  catch(err) {
    debug(err);
  }

};
