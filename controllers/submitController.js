const Submit = require('../models/submitModal');
const User = require('../models/userModal');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const fs = require('fs');
const path = require('path');


exports.createSubmit = catchAsync(async (req, res, next) => {
  const { testid, userid, answer, remainingtime, warning,fullscreenwarning } = req.body;

  // Create a submission
  const submit = await Submit.create({
    testid,
    userid,
    answer,
    remainingtime: parseInt(remainingtime),
    warning: parseInt(warning),
    fullscreenwarning:parseInt(fullscreenwarning)
  });
  await User.findByIdAndUpdate(userid, { testgiven: true });

  res.status(200).json({
    status: 'success',
    data: {
      submit,
    },
  });
});


exports.getSubmit = catchAsync(async (req, res, next) => {
  const submit = await Submit.find();
  res.status(200).json({
    status: 'success',
    length: submit.length,
    data: {
      submit,
    },
  });
});

exports.deleteSubmit = catchAsync(async (req, res, next) => {
  const submit = await Submit.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: 'success',
    data: {
      submit,
    },
  });
});

exports.updateSubmit = catchAsync(async (req, res, next) => {
  const status = req.body.status
  

  const submit = await Submit.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!submit) {
    return next(new AppError('No doc found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      submit,
    },
  });
});

exports.getSubmitId = catchAsync(async (req, res, next) => {
  const submit = await Submit.findById(req.params.id);
  if (!submit) {
    return next(new AppError('No submit found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      test: submit,
    },
  });
});

exports.getshow = catchAsync(async (req, res, next) => {
  const status = req.body.status;
  console.log(status)
  const submit = await Submit.find({ status:status }).populate("userid").populate({path:'testid',select:"questions"})


  res.status(200).json({
    status: 'success',
    data: {
      test: submit,
    }
  });
});