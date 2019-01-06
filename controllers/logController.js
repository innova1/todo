//const log4js = require('log4js');
const debug = require('debug')('app:LogController');

var logger = log4js.getLogger();

exports.testLog = (req, res) => {
    log.console('Hello');
    res.render('logTest', { title: 'Testing logging' });
};
