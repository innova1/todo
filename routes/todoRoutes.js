let express = require('express');
let router = express.Router();

const showController = require('../controllers/showController');
const exportController = require('../controllers/exportController');
const addController = require('../controllers/addcontroller');
const editController = require('../controllers/editController');
const deleteController = require('../controllers/deletecontroller');
const completeController = require('../controllers/completeController');
const loginsController = require('../controllers/loginsController');
const logController = require('../controllers/logController');
const gameController = require('../controllers/gameController');

router.get('/testlogging', logController.testLog);

router.get('/user/add', addController.addUserPage);
router.post('/user/add', addController.addUser);

router.get('/fbk/edit/:id', editController.fixDatePage);
router.post('/fbk/edit/:id', editController.fixDate);

router.post('/task/complete/:id', completeController.commitComplete);
router.get('/task/delete/:id', deleteController.deleteTask);
router.post('/task/delete/:id', deleteController.confirmDelete);
router.get('/task/edit/:id', editController.editFbk);
router.post('/task/edit/:id', editController.commitEdit);
router.get('/task/add/', addController.addFbk);
router.get('/task/addx/', addController.addFbkx);
router.post('/task/add/', addController.saveTask);
router.get('/export', exportController.exportFbks);
router.get('/exportJSON', exportController.exportJSONFbks);
router.get('/scoreboard', showController.showScoreboard);
router.get('/login', loginsController.loginPage);
router.post('/login', loginsController.login);
router.get('/logout', loginsController.logout);
router.get('/user/change/', loginsController.changeUserPage);
router.post('/user/change/', loginsController.changeUser);
router.get('/user/changePassword/', addController.changePasswordPage);
router.post('/user/changePassword/', addController.savePassword);
router.get('/all', showController.showFbks); //<-- temp, remove after testing
router.get('/', showController.showMyFbks);
router.get('/filter', showController.showMyFilteredFbks);
router.get('/fbk/rate/:rating/id/:id', gameController.setRating);
router.get('/faq', showController.showFAQ);

module.exports = router;
