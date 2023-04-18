const express = require('express');
const { getUsers, addUser, getUserById, editUser, deleteUser } = require('../controllers/userController');

const router = express.Router();

router.get('/', getUsers);
router.post('/add', addUser);
router.get('/edit/:id', getUserById);
router.put('/edit/:id', editUser);
router.delete('/delete/:id', deleteUser);

module.exports = router;
