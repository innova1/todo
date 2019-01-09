const util = require('./utilController');
const { MongoClient } = require('mongodb');
const log4js = require('log4js');
const debug = require('debug')('app:LogController');

log4js.configure({
  appenders: { 'out': { type: 'stdout', layout: { type: 'pattern', pattern: '%d %X{ip} %m' } } },
  categories: { default: { appenders: ['out'], level: 'info' } }
});

var logger = log4js.getLogger(); 
logger.level = 'info';

exports.inCount = (req, res) => {
    console.log('user is ' + "not know yet");
    try{    
        debug("query with email: " + email);
        const dbParams = await util.setupDB();
        const inCount = await dbParams.collection.find( { "fbkee.email": email } ).sort({ dueDate: -1 }).count();
        const outCount = await dbParams.collection.find( { "fbkor.email": email } ).sort({ dueDate: -1 }).count();
    }
    return(inCount);
};
