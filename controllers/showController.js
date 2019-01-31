const util = require('./utilController');
const { MongoClient } = require('mongodb');
const os = require("os");
const gameCalc = require('./gameController');
const log4js = require('log4js');
const debug = require('debug')('app:showController');

log4js.configure({
  appenders: { 'useractivity': { type: 'file', filename: 'user.log', layout: { type: 'pattern', pattern: '%d %X{ip} %m' } } },
  categories: { default: { appenders: ['useractivity'], level: 'info' } }
});

var logger = log4js.getLogger(); 
logger.level = 'info';

    
function getSelectTagObj() {
    const selectTagsObj = {
        selectTextObjs: [
            { tagCode:"-1", tagValue:"Rate Feedback", isSelected:false },
            { tagCode:"0", tagValue:"0-Not helpful", isSelected:false },
            { tagCode:"1", tagValue:"1-Helpful", isSelected:false },
            { tagCode:"2", tagValue:"2-More helpful", isSelected:false },
            { tagCode:"3", tagValue:"3-Most helpful", isSelected:false }
        ],
        clearSelected: function() {
            //console.log("in clearSelected");
            let o = "";
            for ( i = 0; i < this.getNumOfSelects(); i++ ) {
                o = this.selectTextObjs[i];
                o.isSelected = false;
            }
        },
        setSelectedTag: function(s) {
            this.clearSelected();
            let o = "";
            for ( i = 0; i < this.getNumOfSelects(); i++ ) {
                o = this.selectTextObjs[i];
                if( o.tagCode == s ) {
                    o.isSelected = true;
                }
            }
        },
        getSelectedValue: function() {
            let val = "";
            let o = "";
            for ( i = 0; i < this.getNumOfSelects(); i++ ) {
                o = this.selectTextObjs[i];
                if( o.isSelected ) {
                    val = o.tagValue;
                }
            }
            return val;
        },
        getNumOfSelects: function() {
            return this.selectTextObjs.length;
        }
    }
    return selectTagsObj;
}


exports.showFbks = async function (req, res) {
  try {
    const dbParams = await util.setupDB();
    const fbks = await dbParams.collection.find({}).sort({ createDate: -1 }).toArray();
    const hostname = os.hostname();
    res.render('showFbks', { fbks, title: 'Feedback List', hostname });
    dbParams.client.close();
  }
  catch (err) {
    debug(err);
  }
};
    
exports.showMyFbks = async function (req, res) {
  // need: user fullname and email from cookie
    logger.addContext('ip', req.ip);
  try {
    username = req.cookies.username;
    if(typeof username === 'undefined') {
        email = "";
    } else {
        email = username.split(",")[1]
    }
    //const counts = await gameCalc.getCounts(email);
    //const score = await gameCalc.getScore(email);
    //const balance = await gameCalc.getBalance(email);
    const avgScores = await gameCalc.getAvgScores(email);
    //const scoreboard = await gameCalc.getScoreboard();
    
    const dbParams = await util.setupDB();
      
    const isNoRatingResults = await gameCalc.isNoRating(dbParams, email);
    const isNoRatingIn = isNoRatingResults.isNoRatingIn;
    
    const selectObj = getSelectTagObj();
    
    debug("query with email: " + email + ", username: " + username + ", isNoRatingIn: " + isNoRatingIn);
    const myFbksIn = await dbParams.collection.find( { "fbkee.email": email } ).sort({ createDate: -1 }).toArray();
    const myFbksOut = await dbParams.collection.find( { "fbkor.email": email } ).sort({ createDate: -1 }).toArray();
    const hostname = os.hostname();
      
    const inCount = await myFbksIn.length;
    const outCount = await myFbksOut.length;
      
    logger.info("viewing feedback: " + email );
    res.render('showFbks', { loggedInEmail: email, myFbksIn, myFbksOut, inCount, outCount, inScore: avgScores.inScore, outScore: avgScores.outScore, selectObj, isNoRatingIn, title: 'My Feedback List', hostname });
    dbParams.client.close();
  }
  catch (err) {
    debug(err);
  }
};

exports.showScoreboard = async function (req, res) {
  // need: user fullname and email from cookie
    logger.addContext('ip', req.ip);
    try {

        const scoreboard = await gameCalc.getScoreboard();
        //const temp = await scoreboard.noRating.isNoRatingIn;
        
        debug("in showScoreboard, length: " + scoreboard.length);

        let c = 0;
        scoreboard.forEach( (doc) => {
            debug(++c + "-scoreboard: " + JSON.stringify(doc)); // + ", outCount: " + oc + ", totalFbk: " + tf );
            //debug( "isNoRatingOut: " + scoreboard[0].noRating.isNoRatingIn);
        });

        res.render('showScoreboard', { scoreboard, title: 'Feedback Scoreboard' });
        
    } catch (err) {
        debug(err);
    }
};

exports.showFAQ = async function (req, res) {
    debug("in show FAQ");
    try {

        const dbParams = await util.setupFAQDB();
        
        const faqs = await dbParams.collection.find({ "hide": false }).sort({ order: 1 }).toArray();

        res.render('showFAQ', { faqs, title: 'Feedback FAQ' });
        
    } catch (err) {
        debug(err);
    }
};


