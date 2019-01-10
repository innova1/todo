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
        const dbParams = await util.setupDB();
        //sum of count of fbk out plus sum of ratings for fbk out
        const myFbksOut = await dbParams.collection.find( { "fbkor.email": email } ).sort({ dueDate: -1 }).toArray();
        //count fbk out
        outCount = myFbksOut.length;
        //sum of ratings of fbk out
        var totalRating;
        myFbksOut.forEach(totalRatingf);
        debug("My total rating: " + totalRating);
        //count of fbk in
        const inCount = await dbParams.collection.find( { "fbkee.email": email } ).count();
    } catch (err) {
        debug(err);
    }
};

function totalRatingf(total, index, outArray) {
    debug("fn--index: " + index + ", rating:" + outArray[index].rating + ", total:" + JSON.stringify(total) );
    total = total + 1; //outArray[index].rating;
}

/*
var txt = "";
var numbers = [45, 4, 9, 16, 25];
numbers.forEach(myFunction);

function myFunction(value, index, array) {
  txt = txt + value + "<br>"; 
}
*/

exports.setRating = async (req, res) => {
    try {
        debug("in set rating. rating:" + req.params.rating + ", id:" + req.params.id);
        const rating = req.params.rating;
        const id = req.params.id;
        debug("updating id: " + id + " with rating " + rating);
        const dbParams = await util.setupDB();
        const inCount = await dbParams.collection.findOneAndUpdate(
            { "_id": new ObjectId(id) }, 
            { $set: { "rating": rating } }
        );
        res.redirect("/");
        dbParams.client.close();
        
    } catch(err) {
        debug(err);
    }
};