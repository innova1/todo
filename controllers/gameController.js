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
            totalRating = totalRating + parseInt(rec.rating); //outArray[index].rating;
            //debug("fn--index: " + index + ", rating:" + rec.rating + ", totalRating:" + totalRating );
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
        totalRating = totalRating + parseInt(rec.rating); //outArray[index].rating;
        //debug("fn--index: " + index + ", rating:" + rec.rating + ", totalRating:" + totalRating );
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

exports.getAvgInScore = async function(email) {
    debug("in getAvgInScore--email:" + email);
    try {
        const dbParams = await util.setupDB();
        //first try getting output values for myIn and myOut
        const aggIn = await dbParams.collection.aggregate( [
            { 
                $match: { 'fbkee.email': email }
            },
            {    $group: { 
                    _id: { month: { $month: ISODate("$createDate") }, day: { $dayOfMonth: ISODate("$createDate") }, year: { $year: ISODate("$createDate") } },
                    count: { $sum: 1 }
                } 
            }
        ] );
        aggIn.forEach( (doc) => {
            debug("object: " + JSON.stringify(doc) );
        });
        
        const aggOut = await dbParams.collection.aggregate( [
            { 
                $match: { 'fbkor.email': email }
            },
            {    $group: { 
                    _id: '$fbkor.email',
                    count: { $sum: 1 }
                } 
            }
        ] );
        aggOut.forEach( (doc) => {
            debug("object: " + JSON.stringify(doc) );
        });
    } catch(err) {
        debug(err);
    }
};

exports.getAvgOutScore = async function(email) {
    
};