const util = require('./utilController');
const { MongoClient } = require('mongodb');
const os = require("os");
const debug = require('debug')('app:showController');

async function getRole(req, res) {
    try {
        const un = req.cookies.username;
        const email = un.split(",")[1]
        const dbParams = await util.setupUserDB();
        debug("about to call find in db");
        const foundUser = await dbParams.collection.findOne( { emailname: email } );
        dbParams.client.close();
        return foundUser.role;
    } catch(err) {
        debug(err);
    }
}

exports.exportFbks = async function (req, res) {
    try {
        role = await getRole(req, res);
        debug("in addUser page, role is " + role);
        if(role=="admin") {
            const dbParams = await util.setupDB();
            const fbks = await dbParams.collection.find({}).sort({ dueDate: -1 }).toArray();
            const hostname = os.hostname();
            res.render('exportFbks', { fbks, title: 'Export of Feedback List', hostname });
            dbParams.client.close();
        } else {
            debug("role is not admin, redirecting to /")
            res.redirect('/');
        }
    } catch (err) {
        debug(err);
    }
};

exports.exportJSONFbks = async function (req, res) {
    try {
        role = await getRole(req, res);
        debug("in addUser page, role is " + role);
        if(role=="admin") {
            const dbParams = await util.setupDB();
            const fbks = await dbParams.collection.find({}).sort({ dueDate: -1 }).toArray();
            const hostname = os.hostname();
            const fbksJSON = JSON.stringify(fbks);
            res.render('exportJSONFbks', { fbksJSON, title: 'Export of Feedback List', hostname });
            dbParams.client.close();
        } else {
            debug("role is not admin, redirecting to /")
            res.redirect('/');
        }
    } catch (err) {
        debug(err);
    }
};