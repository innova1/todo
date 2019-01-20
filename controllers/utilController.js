const { MongoClient, ObjectId } = require('mongodb');
const crypto = require('crypto');
const debug = require('debug')('app:utilController');

exports.setupDB = async function () {
    const url = process.env.DB_URL;
    debug(`attempting to connect to database at ${url}`);
    const dbName = 'tasks';
    try {
        const client = await MongoClient.connect(url, { useNewUrlParser: true });
        const db = client.db(dbName);
        const collection = await db.collection('tasks');
        return ({ client: client, collection: collection });
    }

    catch (err) {
        debug(err);
    }
};

exports.setupUserDB = async function () {
    //crypto.DEFAULT_ENCODING = 'hex';
    const url = process.env.DB_URL;
    debug(`attempting to connect to database at ${url}`);
    const dbName = 'tasks';
    try {
        const client = await MongoClient.connect(url, { useNewUrlParser: true });
        const db = client.db(dbName);
        const collection = await db.collection('users');
        return ({ client: client, collection: collection });
    }

    catch (err) {
        debug(err);
    }
};

exports.setupFAQDB = async function () {
    //crypto.DEFAULT_ENCODING = 'hex';
    const url = process.env.DB_URL;
    debug(`attempting to connect to database at ${url}`);
    const dbName = 'tasks';
    try {
        const client = await MongoClient.connect(url, { useNewUrlParser: true });
        const db = client.db(dbName);
        const collection = await db.collection('FAQs');
        return ({ client: client, collection: collection });
    }

    catch (err) {
        debug(err);
    }
};