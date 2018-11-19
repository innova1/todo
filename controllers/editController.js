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

exports.commitEdit = async (req, res) => {
  try {
    console.log("Hello Newman 2!");
    const { id } = req.params;
    console.log("Hello Newman 3!");
    const task = req.body;
    console.log("Hello Newman 4!");
    const dbParams = await util.setupDB();
    console.log("Hello Newman 5! with id: " + id + ":" + task);
    await dbParams.collection.findOneAndUpdate({ _id: new ObjectId(id) }, task);
    console.log("Hello Newman 6!");
    dbParams.client.close();
    res.redirect('/');
  }

  catch (err) {
    debug(err);
  }
};
