const { ObjectId } = require('mongodb');
const util = require('./utilController');
const log4js = require('log4js');
const debug = require('debug')('app:deleteController');

log4js.configure({
  appenders: { 'useractivity': { type: 'file', filename: 'user.log', layout: { type: 'pattern', pattern: '%d %X{ip} %m%n' } } },
  categories: { default: { appenders: ['useractivity'], level: 'info' } }
});

var logger = log4js.getLogger(); 
logger.level = 'info';

exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const dbParams = await util.setupDB();
        const fbk = await dbParams.collection.findOne({ _id: new ObjectId(id) });
        dbParams.client.close();
        res.render('confirmDelete', { fbk, title: 'Confirm Delete' });
    }

    catch (err) {
        debug(err);
    }
};

exports.confirmDelete = async (req, res) => {
    logger.addContext('ip', req.ip);
    try {
        const { id } = req.params;
        const dbParams = await util.setupDB();
        const fbk = await dbParams.collection.deleteOne({ _id: new ObjectId(id) });
        logger.info("deleted fbk: " + email);
        //const tasks = await dbParams.collection.find({}).sort({ dueDate: 1 }).toArray();
        dbParams.client.close();
        res.redirect('/');
    }

    catch (err) {
        debug(err);
    };
};