const { MongoClient, ObjectId } = require('mongodb');
const util = require('./utilController');
const debug = require('debug')('app:loginsController');

exports.loginPage = (req, res) => {
    res.render('loginPage', { title: 'Find your name and enter your password' });
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
        console.log("about to redirect to reqOrig.url which is " + req.origUrl);
        res.redirect(req.origUrl);
    }

  catch(err) {
    debug(err);
  }

};
