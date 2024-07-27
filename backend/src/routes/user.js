const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const authenticateUser = require('../services/authenticate');


router.post('/signup', userController.addUser);
router.post('/login', userController.getUser);
router.post('/account', authenticateUser, userController.createAccount);
router.get('/account', authenticateUser, userController.getAllAccounts);
router.put('/account/:accountNumber', authenticateUser, userController.updateAccountBalance);

module.exports = router;
