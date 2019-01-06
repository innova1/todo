const log4js = require('log4js');
const debug = require('debug')('app:LogController');

var logger = log4js.getLogger(); 
logger.level = 'debug';

exports.testLog = (req, res) => {
    console.log('Hello');
    logger.info('info from log4js');
    res.render('logTest', { title: 'Testing logging' });
};
