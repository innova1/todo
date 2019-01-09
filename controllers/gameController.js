const util = require('./utilController');
const { MongoClient } = require('mongodb');
const log4js = require('log4js');
const debug = require('debug')('app:gameController');

log4js.configure({
  appenders: { 'out': { type: 'stdout', layout: { type: 'pattern', pattern: '%d %X{ip} %m' } } },
  categories: { default: { appenders: ['out'], level: 'info' } }
});

var logger = log4js.getLogger(); 
logger.level = 'info';

exports.getCounts = async function(email) {
    console.log('user is ' + email);
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
