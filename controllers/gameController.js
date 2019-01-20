const util = require('./utilController');
const { ObjectId } = require('mongodb');
const gameCalc = require('./gameController');
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
        debug("in getScore with email: " + email);
        var totalRating = 0;
        function totalRatingf(rec, index) {
            if( rec.rating !== null && rec.rating !== '' && rec.rating !== '-1' ) {
                totalRating = totalRating + parseInt(rec.rating); //outArray[index].rating;
                //debug("fn--index: " + index + ", rating:" + rec.rating + ", totalRating:" + totalRating );
            }
        }
        const dbParams = await util.setupDB();
        //sum of count of fbk out plus sum of ratings for fbk out
        const myFbksOut = await dbParams.collection.find( { "fbkor.email": email, "rating": { $ne: '-1' } } ).sort({ createDate: -1 }).toArray();
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
        if ( rec.rating !== null && rec.rating !== '' && rec.rating !== '-1' ) {
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
        const myFbksOut = await dbParams.collection.find( { "fbkor.email": email, "rating": { $ne: '-1'} } ).sort({ createDate: -1 }).toArray();
        totalRating = 0;
        myFbksOut.forEach(totalRatingf);
        debug("after out rating sum, totalRating: " + totalRating);
        trg = totalRating;

        //get total rating received (add up all ratings on feedback with email = fbkee)
        const myFbksIn = await dbParams.collection.find( { "fbkee.email": email } ).sort({ createDate: -1 }).toArray();
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
        
        //const earliestDate = await dbParams.collection.find().sort({createDate: 1}).limit(1).toArray();
        /*let c = 0;
        earliestDate.forEach( (doc) => {
            debug(++c + " dates: " + JSON.stringify(doc)); // + ", outCount: " + oc + ", totalFbk: " + tf );
        });*/
        
        const oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
        //const firstDate = await new Date(earliestDate[0].createDate); //used this as the REAL app beginning, but decided to use launch date of 1/16/19
        const firstDate = new Date('2019-01-16');
        const secondDate = new Date();
        const diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay))); 
        debug("diffDays: " + diffDays);
        const multiplier = 1; //was 100 but as we start sending more, this will be too high
        
        debug("in getavg scores--diffDays: " + diffDays);
        
        const fbkInAgg = await dbParams.collection.aggregate( [
            { 
                $match: { 'fbkee.email': email, 'rating': { $ne: '-1' } }
            },
            {
                $addFields: { inRating: { $toInt: "$rating"}, fbkeemail: "$fbkee.email" }
            },
            {    $group: { 
                    _id: { month: { $month: "$createDate" }, day: { $dayOfMonth: "$createDate" }, year: { $year: "$createDate" } },
                    fbkeemail: { $first: "$fbkeemail" },
                    sumInRating: { $sum: '$inRating' },
                    countInForDay: { $sum: 1 }
                } 
            },
            {
                $group: {
                    _id: null,
                    avgInPerDay: { $first: '$avgInPerDay' },
                    sumAllInRating: { $sum: '$sumInRating' },
                    totalInFbks: { $sum: '$countInForDay' }
                }
            },
            {
                $addFields: {   
                    avgInPerDay: { $divide: [ '$totalInFbks', diffDays ] },
                }
            },
            {
                $project: {
                    _id: { fbkeemail: "$fbkeemail" }, 
                    score: { $multiply: [ { $divide: [ '$sumAllInRating', '$totalInFbks' ] }, '$avgInPerDay', multiplier ] } 
                }
            }
        ] );
        
        const fbkOutAgg = await dbParams.collection.aggregate( [
            { 
                $match: { 'fbkor.email': email, 'rating': { $ne: '-1' } }
            },
            {
                $addFields: { outRating: { $toInt: "$rating"}, fbkoremail: "$fbkor.email" }
            },
            {    $group: { 
                    _id: { month: { $month: "$createDate" }, day: { $dayOfMonth: "$createDate" }, year: { $year: "$createDate" } },
                    fbkoremail: { $first: "$fbkoremail" },
                    sumOutRating: { $sum: '$outRating' },
                    countOutForDay: { $sum: 1 }
                } 
            },
            {
                $group: {
                    _id: null,
                    avgOutPerDay: { $first: "$avgOutPerDay" },
                    sumAllOutRating: { $sum: '$sumOutRating' },
                    totalOutFbks: { $sum: '$countOutForDay' }
                }
            },
            {
                $addFields: {  
                    avgOutPerDay: { $divide: [ '$totalOutFbks', diffDays ] },
                }
            },
            {
                $project: {
                    //_id: { fbkoremail: "$fbkoremail" }, 
                    _id: false,
                    score: { $multiply: [ { $divide: [ '$sumAllOutRating', '$totalOutFbks' ] }, '$avgOutPerDay', multiplier ] } 
                }
            }
        ] ); 
        
        let aggInArr = await fbkInAgg.toArray();
        let aggOutArr = await fbkOutAgg.toArray();
        
        if ( ( !Array.isArray(aggInArr) || !aggInArr.length ) || !Array.isArray(aggOutArr) || !aggOutArr.length  ) { // || (email != 'tom.boulet@exxonmobil.com') ) {
            if (typeof aggInArr === 'undefined') {
                debug("aggInArr is undefined");
            };
            if (typeof aggOutArr === 'undefined' ) {
                debug("aggOutArr is undefined");
            };
            if ( email != 'tom.boulet@exxonmobil.com') {
                debug("not tom");
            };
            
            aggInArr = [{ score: 0 }];
            aggOutArr = [ { score: 0 }];
            
            //return { inScore: 0, outScore: 0 };
        }
   
        debug("fbk In: " + aggInArr[0].score); //JSON.stringify(aggInArr[0]));
        debug("fbk out: " + aggOutArr[0].score); //JSON.stringify(aggOutArr[0]));

        aggOutArr.forEach( (doc) => {
            score = doc.score;
            debug("fbk out2: " + JSON.stringify(doc)); // + ", outCount: " + oc + ", totalFbk: " + tf );
        });

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

exports.isNoRating = async function ( dbParams, email ) {
    try {
        let noRatingInCountlk = await dbParams.collection.countDocuments( { 'fbkee.email': { $eq: email } ,  'rating': { $eq: '-1' } } );
        let noRatingOutCountlk = await dbParams.collection.countDocuments( { 'fbkor.email': { $eq: email } ,  'rating': { $eq: '-1' } } );

        const noRatingInCount = await noRatingInCountlk;
        const noRatingOutCount = await noRatingOutCountlk;
        if ( noRatingInCount > 0 ) {
            isNoRatingIn = true;
        } else {
            isNoRatingIn = false;
        }
        if ( noRatingOutCount > 0 ) {
            isNoRatingOut = true;
        } else {
            isNoRatingOut = false;
        }

        debug("In noRating function -- " + email + " noRatingInCount: " + noRatingInCount + ", noRatingOutCount: " + noRatingOutCount);
        debug("In noRating function -- isNoRatingIn: " + isNoRatingIn + ", isNoRatingOut: " + isNoRatingOut);
        return { isNoRatingIn: isNoRatingIn, noRatingInCount: noRatingInCount, isNoRatingOut: isNoRatingOut, noRatingOutCount: noRatingOutCount };
        dbParams.client.close();
    } catch(err) {
        debug(err);
    }
}

exports.getScoreboard = async function() {
    debug("in getScoreboard");
    let score = 0;
    try {
        const dbParams = await util.setupDB();
        
        //const earliestDate = await dbParams.collection.find().sort({createDate: 1}).limit(1).toArray();
        /*let c = 0;
        earliestDate.forEach( (doc) => {
            debug(++c + " dates: " + JSON.stringify(doc)); // + ", outCount: " + oc + ", totalFbk: " + tf );
        });*/
        
        const oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
        //const firstDate = await new Date(earliestDate[0].createDate); //used this as the REAL app beginning, but decided to use launch date of 1/16/19
        const firstDate = new Date('2019-01-16');
        const secondDate = new Date();
        const diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay))); 
        debug("diffDays: " + diffDays);
        const multiplier = 1; //was 100 but as we start sending more, this will be too high
        
        //debug("firstDate: " + firstDate.getTime() + ", secondDate: " + secondDate.getTime() + ", diffDays: " + diffDays);
        
        const allUserFbksOutAgg = await dbParams.collection.aggregate( [
            { 
                $match: { 'rating': { $ne: '-1' } }
            },
            {
                $sort: { 'createDate': -1 }
            },
            {
                $addFields: { outRating: { $toInt: "$rating"}, fbkoremail: "$fbkor.email", todayDate: new Date() }
            },
            {   $group: { 
                    _id: {  fbkoremail: "$fbkoremail" , month: { $month: "$createDate" }, day: { $dayOfMonth: "$createDate" }, year: { $year: "$createDate" } },
                    fbkoremail: { $first: "$fbkoremail" },
                    sumOutRating: { $sum: '$outRating' },
                    firstCreateDate: { $first: "$createDate"},
                    countOutForDay: { $sum: 1 }
                } 
            },
            {
                $group: {
                    _id: { fbkoremail: "$fbkoremail" },
                    fbkoremail: { $first: "$fbkoremail" },
                    sumAllOutRating: { $sum: '$sumOutRating' },
                    totalOutFbks: { $sum: '$countOutForDay' }
                }
            },
            {
                $addFields: {
                    //oneDay: oneDay,
                    //todayDate: "$todayDate",
                    //dateMinusDate: { $abs: {$subtract: [ '$firstCreateDate', '$todayDate' ] } },
                    //avgOutPerDay: { $divide: [ '$totalOutFbks', { $divide: [ { $abs: { $subtract: [ '$firstCreateDate', '$todayDate' ] } }, oneDay ] } ] }
                    avgOutPerDay: { $divide: [ '$totalOutFbks', diffDays ] },
                }
            },
            {
                $project: {
                    _id: { fbkoremail: "$fbkoremail" },
                    a: "$avgOutPerDay",
                    s: "$sumAllOutRating",
                    totalOut: "$totalOutFbks", 
                    score: { $multiply: [ { $divide: [ '$sumAllOutRating', '$totalOutFbks' ] }, '$avgOutPerDay', multiplier ] } 
                }
            }
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
        const outputArray = await allUserFbksOutAgg.toArray();
        
        let c = 0;
        outputArray.forEach( async function(doc) {
            //debug(++c + "-scoreboard: " + JSON.stringify(doc)); // + ", outCount: " + oc + ", totalFbk: " + tf );
            doc.noRating = await gameCalc.isNoRating(dbParams, doc._id.fbkoremail);
            debug("in forEach loop -- no rating in: " + doc.noRating.isNoRatingIn);
            c++;
        });
        
        await debug("after forEach loop: " + outputArray[0].noRating.isNoRatingIn);
        return await outputArray;
        dbParams.client.close();
        
    } catch(err) {
        debug(err);
    }
};

