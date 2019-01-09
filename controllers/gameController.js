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

exports.inCount = async (req, res, email) => {
    console.log('user is ' + email);
    try {    
        email = 'tom.boulet@exxonmobil.com';
        debug("query with email: " + email);
        const dbParams = await util.setupDB();
        const inCountp = await dbParams.collection.find( { "fbkee.email": email } ).count();
        const outCountp = await dbParams.collection.find( { "fbkor.email": email } ).count();
        let inCount = await inCountp;
        return(inCount);
        dbParams.client.close();
        
    } catch (err) {
        debug(err);
    }
};
