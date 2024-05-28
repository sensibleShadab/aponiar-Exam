const express = require('express');
const testController = require('../controllers/testController.js');
const authController =require("../controllers/authController.js")

const router = express.Router();

router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    testController.createTest
  )
  .get(authController.protect,authController.restrictTo('admin'), testController.getTest);

router
  .route('/:id')
  .get(authController.protect, testController.getTestId)
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    testController.deleteTest
  )
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    testController.updateTest
  );

module.exports = router;
