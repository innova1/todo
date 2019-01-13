const util = require('./utilController');
const { ObjectId } = require('mongodb');
const debug = require('debug')('app:editController');

exports.editFbk = async (req, res) => {
  try {
    console.log("Hello Newman 1!");
    const { id } = req.params;
    const dbParams = await util.setupDB();
    const task = await dbParams.collection.findOne({ _id: new ObjectId(id) });
    dbParams.client.close();
    res.render('editFbk', { task, id, title: 'Save Changes' });
  }

  catch (err) {
    debug(err);
  }
};

exports.fixDatePage = async (req, res) => {
  try {
    const { id } = req.params;
    const dbParams = await util.setupDB();
    const fbk = await dbParams.collection.findOne({ _id: new ObjectId(id) });
    dbParams.client.close();
    res.render('editFbk', { fbk, id, title: 'Save Changes' });
  } catch (err) {
    debug(err);
  }
};

exports.fixDate = async (req, res) => {
    try {
        const { id } = req.params;
        const fbk = req.body;
        fbk.createDate = new Date(fbk.dueDate);
        const dbParams = await util.setupDB();
        await dbParams.collection.findOneAndUpdate({ _id: new ObjectId(id) }, 
        {
            $set: {
                createDate: new Date(fbk.dueDate)
            }
        });
        dbParams.client.close();
        res.redirect('/');
    } catch (err) {
        debug(err);
    }
};

exports.commitEdit = async (req, res) => {
  try {
    const { id } = req.params;
    const task = req.body;
    const dbParams = await util.setupDB();
    await dbParams.collection.findOneAndUpdate({ _id: new ObjectId(id) }, task);
    dbParams.client.close();
    res.redirect('/');
  } catch (err) {
    debug(err);
  }
};
