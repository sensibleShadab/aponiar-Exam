const express = require('express');
const authController = require('../controllers/authController.js');
const userController = require('../controllers/userController.js');
const photoController = require('../controllers/photoController.js');

const router = express.Router();

router.post('/adduser',authController.protect,  authController.restrictTo('admin'), authController.createMany);
router.post('/login', authController.login);
router.get('/authenticated', authController.isLoggedIn);
router.patch('/photo',authController.protect, photoController.uploadPhoto,photoController.resizePhoto('public/img/user'),photoController.patchPhoto)
router
  .route('/:id')
  .get(authController.protect,  authController.restrictTo('admin'),userController.getUserId)
  .delete(authController.protect,  authController.restrictTo('admin'),userController.deleteUser)
  .patch(authController.protect,  userController.uploadPhotoAndPdf,  userController.updateUser);

router.route('/').get(authController.protect,  authController.restrictTo('admin'), userController.getUser).patch(authController.protect,  authController.restrictTo('admin'), userController.patchAdminUser)
router.route('/show').post(authController.protect,  authController.restrictTo('admin'), userController.getShowUser)



module.exports = router;
