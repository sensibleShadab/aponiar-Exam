const express = require('express');
const submitController = require('../controllers/submitController.js');
const authController = require('../controllers/authController.js');

const router = express.Router();

router
  .route('/')
  .post(authController.protect,submitController.createSubmit)
  .get(authController.protect,  authController.restrictTo('admin'), submitController.getSubmit);
router
  .route('/:id')
  .delete(authController.protect,  authController.restrictTo('admin'),submitController.deleteSubmit)
  .patch(authController.protect,  authController.restrictTo('admin'),submitController.updateSubmit)
  .get(authController.protect,  authController.restrictTo('admin'),submitController.getSubmitId);

  router.route('/show').post(authController.protect,  authController.restrictTo('admin'),submitController.getshow)

module.exports = router;
