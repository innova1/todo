const util = require('./utilController');
const { ObjectId } = require('mongodb');
const log4js = require('log4js');
const debug = require('debug')('app:gameController');

log4js.configure({
  appenders: { 'out': { type: 'stdout', layout: { type: 'pattern', pattern: '%d %X{ip} %m' } } },
  categories: { default: { appenders: ['out'], level: 'info' } }
});

var logger = log4js.getLogger(); 
logger.level = 'info';

exports.getCounts = async function(email) {
    try {     
        debug("query with email: " + email);
        const dbParams = await util.setupDB();
        const inCount = await dbParams.collection.find( { "fbkee.email": email } ).count();
        const outCount = await dbParams.collection.find( { "fbkor.email": email } ).count();
        return( { inCount: inCount, outCount: outCount } );
        dbParams.client.close();
        
    } catch (err) {
        debug(err);
    }
};



exports.getScore = async function(email) {
    try {
        var totalRating = 0;
        function totalRatingf(rec, index) {
            if( rec.rating !== null && rec.rating !== '' ) {
                totalRating = totalRating + parseInt(rec.rating); //outArray[index].rating;
                //debug("fn--index: " + index + ", rating:" + rec.rating + ", totalRating:" + totalRating );
            }
        }
        const dbParams = await util.setupDB();
        //sum of count of fbk out plus sum of ratings for fbk out
        const myFbksOut = await dbParams.collection.find( { "fbkor.email": email } ).sort({ dueDate: -1 }).toArray();
        //count fbk out
        outCount = myFbksOut.length;
        //sum of ratings of fbk out
        totalRating = 0;
        myFbksOut.forEach(totalRatingf);
        //count of fbk in
        const inCount = await dbParams.collection.find( { "fbkee.email": email } ).count();
        //add rating sum to fbkin
        const score = totalRating + inCount;
        debug("My total rating: " + totalRating + ", in count: " + inCount + ", score: " + score);
        //TODO -- subtract absolute value of chits (need to save this to user doc, later)
        return ( score );
    } catch (err) {
        debug(err);
    }
};

exports.setRating = async (req, res) => {
    try {
        debug("base url: " + req.baseUrl);
        debug("in set rating. rating:" + req.params.rating + ", id:" + req.params.id);
        const rating = parseInt(req.params.rating) - 1;
        const id = req.params.id;
        debug("updating id: " + id + " with rating " + rating);
        const dbParams = await util.setupDB();
        const inCount = await dbParams.collection.findOneAndUpdate(
            { "_id": new ObjectId(id) }, 
            { $set: { "rating": rating.toString() } }
        );
        res.redirect("/");
        dbParams.client.close();
        
    } catch(err) {
        debug(err);
    }
};


exports.getBalance = async function(email) {
    var totalRating = 0;
    function totalRatingf(rec, index) {
        if ( rec.rating !== null && rec.rating !== '' ) {
            totalRating = totalRating + parseInt(rec.rating); //outArray[index].rating;
            //debug("fn--index: " + index + ", rating:" + rec.rating + ", totalRating:" + totalRating );
        }
    }
    /*
        total rating given - total rating received = balance 
    */
    try {
        const dbParams = await util.setupDB();
        //get total rating given (add up all ratings on feedback with email = fbkor)
        const myFbksOut = await dbParams.collection.find( { "fbkor.email": email } ).sort({ dueDate: -1 }).toArray();
        totalRating = 0;
        myFbksOut.forEach(totalRatingf);
        debug("after out rating sum, totalRating: " + totalRating);
        trg = totalRating;

        //get total rating received (add up all ratings on feedback with email = fbkee)
        const myFbksIn = await dbParams.collection.find( { "fbkee.email": email } ).sort({ dueDate: -1 }).toArray();
        totalRating = 0;
        myFbksIn.forEach(totalRatingf);
        debug("after In rating sum, totalRating: " + totalRating);
        trr = totalRating;

        //subtract trg from trr
        const balance = trg - trr;
        return balance;
    } catch(err) {
        debug(err);
    }
};

/*
    db.orders.aggregate( [
        { $match: { status: "A" } },
        { $group: { _id: "$cust_id", total: { $sum: "$amount" } } }
    ] )
*/



exports.getAvgScores = async function(email) {
    debug("in getAvgScores w/email:" + email);
    var score = 0;
    try {
        const dbParams = await util.setupDB();

        const fbkInAgg = await dbParams.collection.aggregate( [
            { 
                $match: { 'fbkee.email': email, 'rating': { $ne: '' } }
            },
            {
                $addFields: { outRating: { $toInt: "$rating"} }
            },
            {    $group: { 
                    _id: { month: { $month: "$createDate" }, day: { $dayOfMonth: "$createDate" }, year: { $year: "$createDate" } },
                    sumInRating: { $sum: '$outRating' },
                    countInForDay: { $sum: 1 }
                } 
            },
            {
                $group: {
                    _id: null,
                    sumAllInRating: { $sum: '$sumInRating' },
                    avgInPerDay: { $avg: '$countInForDay' },
                    totalInFbks: { $sum: '$countInForDay' }
                }
            },
            {
                $project: { _id: false, score: { $multiply: [ { $divide: [ '$sumAllInRating', '$totalInFbks' ] }, '$avgInPerDay' ] } }
            }
        ] );
        
        const fbkOutAgg = await dbParams.collection.aggregate( [
            { 
                $match: { 'fbkor.email': email, 'rating': { $ne: '' } }
            },
            {
                $addFields: { inRating: { $toInt: "$rating"} }
            },
            {    $group: { 
                    _id: { month: { $month: "$createDate" }, day: { $dayOfMonth: "$createDate" }, year: { $year: "$createDate" } },
                    sumOutRating: { $sum: '$inRating' },
                    countOutForDay: { $sum: 1 }
                } 
            },
            {
                $group: {
                    _id: null,
                    sumAllOutRating: { $sum: '$sumOutRating' },
                    avgOutPerDay: { $avg: '$countOutForDay' },
                    totalOutFbks: { $sum: '$countOutForDay' }
                }
            },
            {
                $project: { _id: false, score: { $multiply: [ { $divide: [ '$sumAllOutRating', '$totalOutFbks' ] }, '$avgOutPerDay' ] } }
            }
        ] );
        
        let aggOutArr = await fbkOutAgg.toArray();
        debug("fbk out: " + aggOutArr[0].score); //JSON.stringify(aggOutArr[0]));
        
        let aggInArr = await fbkInAgg.toArray();
        debug("fbk In: " + aggInArr[0].score); //JSON.stringify(aggInArr[0]));
        
        return { inScore: aggInArr[0].score.toFixed(2), outScore: aggOutArr[0].score.toFixed(2) };
        
        /*
        aggOutArr.forEach( (doc) => {
            score = doc.score;
            debug("fbk out2: " + JSON.stringify(doc)); // + ", outCount: " + oc + ", totalFbk: " + tf );
        });
        */
                
        /*
        debug("tf: " + tf + ", oc: " + oc);
        var avgFDout = tf/oc;
        var avgRatingOut = sr/tf;
        debug("avg fbk/day:" + avgFDout + ", avg rating: " + avgRatingOut);
        */
        
        dbParams.client.close();
    } catch(err) {
        debug(err);
    }
};

exports.isNoRating = async function(email) {
    try {
        const dbParams = await util.setupDB();
        
        let noRatingCountlk = await dbParams.collection.countDocuments( { 'fbkee.email': { $eq: email } ,  'rating': { $eq: '-1' } } );
        
        const noRatingCount = await noRatingCountlk;
        debug("noRatingCount: " + noRatingCount);
        if ( noRatingCount > 0 ) {
            noRating = true;
        } else {
            noRating = false;
        }
        
        debug("noRating: " + noRating);
        return noRating;
    } catch(err) {
     debug(err);
}
};

exports.getScoreboard = async function() {
    debug("in getScoreboard");
    let score = 0;
    try {
        const dbParams = await util.setupDB();
        
        const earliestDate = await dbParams.collection.find().sort({createDate: 1}).limit(1);
        
        const oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
        const firstDate = await new Date(earliestDate);
        const secondDate = new Date();
        const diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
        
        debug("diffDays: " + diffDays);
        
        const allUserFbksOutAgg = await dbParams.collection.aggregate( [
            {
                $addFields: { intRating: { $toInt: "$rating"}, fbkoremail: "$fbkor.email" }
            },
            {   $group: { 
                    _id: {  fbkoremail: "$fbkoremail" , month: { $month: "$createDate" }, day: { $dayOfMonth: "$createDate" }, year: { $year: "$createDate" } },
                    fbkoremail2: { $first: "$fbkoremail" },
                    numdays: { $first: "$numdays" },
                    sumOutRating: { $sum: '$intRating' },
                    countOutForDay: { $sum: 1 }
                } 
            }
            /*,
            {
                $group: {
                    _id: { fbkoremail: "$fbkoremail2" },
                    fbkoremail3: { $first: "$fbkoremail2" },
                    sumAllOutRating: { $sum: '$sumOutRating' },
                    avgOutPerDay: { $avg: '$countOutForDay' },
                    totalOutFbks: { $sum: '$countOutForDay' }
                }
            }
            ,
            {
                $project: {
                    _id: { fbkoremail: "$fbkoremail3" }, 
                    score: { $multiply: [ { $divide: [ '$sumAllOutRating', '$totalOutFbks' ] }, '$avgOutPerDay' ] } 
                }
            }*/
        ] );
        
/*
            {
                $project: { _id: { fbkor: { email: "$email" } }, score: { $multiply: [ { $divide: [ '$sumAllOutRating', '$totalOutFbks' ] }, '$avgOutPerDay' ] } }
            }
*/
        
/*
        let allUserFbksOutAggArr = await allUserFbksOutAgg.toArray();
        debug("fbk out: " + allUserFbksOutAggArr[0].score);
*/
        let c = 0;
        allUserFbksOutAgg.forEach( (doc) => {
            score = doc.score;
            debug(++c + " :scoreboard: " + JSON.stringify(doc)); // + ", outCount: " + oc + ", totalFbk: " + tf );
        });
        
    } catch(err) {
        debug(err);
    }
};

