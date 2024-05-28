const Test =require("../models/testModal");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.createTest = catchAsync(async (req, res, next) => {
    console.log(req.body)
    if(req.body.questions.length < 1){
        return next(new AppError('Please provide a Question', 404));
    }
    const newTest = await Test.create(req.body);
  
    res.status(200).json({
        status: 'success',
        data: {
          newTest,
        },
      });
  });

  exports.getTestId = catchAsync(async (req, res, next) => {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return next(new AppError('No test found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        test,
      },
    });
  });

  exports.getTest = catchAsync(async (req, res, next) => {
    const test = await Test.find();
    res.status(200).json({
      status: 'success',
      length:test.length,
      data: {
        test,
      },
    });
  });
  

  exports.deleteTest=catchAsync(async (req, res, next) => {
    const test=await Test.findByIdAndDelete(req.params.id)
    if(!test){
        return next(new AppError('No test found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
          test,
        },
      });

  })

  exports.updateTest = catchAsync(async (req, res, next) => {
   
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
  
    if (!test) {
      return next(new AppError('No doc found with that ID', 404));
    }
  
    res.status(200).json({
      status: 'success',
      data: {
        test,
      },
    });
  });