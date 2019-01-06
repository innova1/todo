const log4js = require('log4js');
const debug = require('debug')('app:LogController');

log4js.configure({
  appenders: { 'out': { type: 'stdout', layout: { type: 'pattern', pattern: '%d %x{ip} %m%n' } } },
  categories: { default: { appenders: ['out'], level: 'info' } }
});

var logger = log4js.getLogger(); 
logger.level = 'info';

exports.testLog = (req, res) => {
    console.log('Hello');
    logger.addContext('ip', req.ip);
    logger.info('info from log4js');
    res.render('logTest', { title: 'Testing logging' });
};
