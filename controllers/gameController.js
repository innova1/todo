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
    return(5);
};
