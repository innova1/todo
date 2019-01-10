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
    
};

exports.setRating = async (req, res) => {
    try {
        debug("in set rating. rating:" + req.param("rating") + ", id:" + req.param("id"));
        const rating = req.param("rating");
        const id = req.param("id");
        debug("updating id: " + id + " with rating " + rating);
        const dbParams = await util.setupDB();
        const inCount = await dbParams.collection.findOneAndUpdate( { 
            query: { _id: new ObjectId(id) }, 
            update: { $set: { rating: rating } }
        });
        res.redirect("/");
        dbParams.client.close();
        
    } catch(err) {
        debug(err);
    }
};