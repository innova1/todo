let express = require('express');
let router = express.Router();

const showController = require('../controllers/showController');
const exportController = require('../controllers/exportController');
const addController = require('../controllers/addcontroller');
const editController = require('../controllers/editController');
const deleteController = require('../controllers/deletecontroller');
const completeController = require('../controllers/completeController');
const loginsController = require('../controllers/loginsController');

router.get('/user/add', addController.addUser);
router.post('/user/add', addController.saveUser);

router.post('/task/complete/:id', completeController.commitComplete);
router.get('/task/delete/:id', deleteController.deleteTask);
router.post('/task/delete/:id', deleteController.confirmDelete);
router.get('/task/edit/:id', editController.editFbk);
router.post('/task/edit/:id', editController.commitEdit);
router.get('/task/addx/', addController.addTask);
router.get('/task/add/', addController.addFbk);
router.get('/task/add2/'), addController.addFbk2);
router.post('/task/add/', addController.saveTask);
router.get('/export', exportController.exportFbks);
router.get('/login', loginsController.loginPage);
router.post('/login', loginsController.login);
router.get('/', showController.showFbks);

module.exports = router;
