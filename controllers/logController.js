const log4js = require('log4js');
const debug = require('debug')('app:LogController');

//var logger = log4js.getLogger(); //test

exports.testLog = (req, res) => {
    console.log('Hello');
    res.render('logTest', { title: 'Testing logging' });
};
