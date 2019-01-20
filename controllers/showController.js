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

function getSelectTagText() {
    var selectArr = new Array();
    selectArr[0] = { value:"Rate Feedback", selected:"" };
    selectArr[1] = { value:"0-Not helpful", selected:"" };
    selectArr[2] = { value:"1-Helpful", selected:"" };
    selectArr[3] = { value:"2-More helpful", selected:"" };
    selectArr[4] = { value:"3-Most helpful", selected:"" };
    return selectArr;
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
    const counts = await gameCalc.getCounts(email);
    const score = await gameCalc.getScore(email);
    const balance = await gameCalc.getBalance(email);
    const avgScores = await gameCalc.getAvgScores(email);
    //const scoreboard = await gameCalc.getScoreboard();
    
    const dbParams = await util.setupDB();
      
    const isNoRatingResults = await gameCalc.isNoRating(dbParams, email);
    const isNoRatingIn = isNoRatingResults.isNoRatingIn;
    
    const inCount = counts.inCount;
    const outCount = counts.outCount;
    const selectData = getSelectTagText();
    
    debug("query with email: " + email + ", username: " + username + ", isNoRatingIn: " + isNoRatingIn);
    const myFbksIn = await dbParams.collection.find( { "fbkee.email": email } ).sort({ createDate: -1 }).toArray();
    const myFbksOut = await dbParams.collection.find( { "fbkor.email": email } ).sort({ createDate: -1 }).toArray();
    const hostname = os.hostname();
      
    logger.info("viewing feedback: " + email );
    res.render('showFbks', { loggedInEmail: email, myFbksIn, myFbksOut, inCount, outCount, score, inScore: avgScores.inScore, outScore: avgScores.outScore, balance, selectData, isNoRatingIn, title: 'My Feedback List', hostname });
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

        let c = 0;
        scoreboard.forEach( (doc) => {
            debug(++c + "-scoreboard: " + JSON.stringify(doc)); // + ", outCount: " + oc + ", totalFbk: " + tf );
            debug( "isNoRatingOut: " + scoreboard[0].noRating.isNoRatingIn);
        });

        res.render('showScoreboard', { scoreboard, title: 'Feedback Scoreboard' });
        
    } catch (err) {
        debug(err);
    }
};


