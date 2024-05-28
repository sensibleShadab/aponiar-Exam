const User = require('../models/userModal');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const multer = require('multer');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/cv');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `cv-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith('image') ||
    file.mimetype === 'application/pdf'
  ) {
    cb(null, true);
  } else {
    cb(
      new AppError('Unsupported file type. Please upload images or PDFs', 400),
      false,
    );
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
exports.uploadPhotoAndPdf = upload.fields([
  { name: 'cv', maxCount: 1 }
]);

exports.getUser = catchAsync(async (req, res, next) => {
    const user = await User.find()
 
    res.status(200).json({
        status: 'success',
        length:user.length,
        data: {
          user,
        },
      });
})


exports.getUserId = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  });

  exports.deleteUser=catchAsync(async (req, res, next) => {
    const user=await User.findByIdAndDelete(req.params.id)
    if(!user){
        return next(new AppError('No user found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
          test: user,
        },
      });

  })

  const filterObj = (obj, ...allowedfeilds) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
      if (allowedfeilds.includes(el)) {
        newObj[el] = obj[el];
      }
    });
    return newObj;
  };

  exports.updateUser = catchAsync(async (req, res, next) => {
   console.log(req.body,"body")
    console.log(req.files,"cvvvvv")
    let filteredBody;
    let updatedUser;
    if( req.files && req.files.cv && req.files.cv[0]){
      filteredBody = filterObj(req.body, 'firstname', 'lastname', 'email', 'phone', 'cv','college');
       updatedUser = await User.findByIdAndUpdate(req.params.id, { cv: req.files['cv'][0].filename, ...filteredBody }, {
          new: true,
          runValidators: true,
      });
    }else{
      filteredBody = filterObj(req.body, 'firstname', 'lastname', 'email', 'phone',"college");
      updatedUser = await User.findByIdAndUpdate(req.params.id, {...filteredBody }, {
        new: true,
        runValidators: true,
    });
    }
  
  
    res.status(201).json({
      status: 'success',
      data: {
       user : updatedUser,
      },
    });
});

  
exports.patchAdminUser = catchAsync(async (req, res, next) => {
  const { email, startAt, endAt } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('No user found with that email', 404));
  }
  user.startAt = startAt;
  user.endAt = endAt;

  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});


exports.getShowUser = catchAsync(async (req, res, next) => {
  const { date} =req.body
  const maxdate= date+86400000
  const users = await User.find({
    startAt: { $gte: date, $lte: maxdate }
  }).populate({ path: 'testid', select: 'name' });

  res.status(200).json({
    status: 'success',
    data: {
      users
    }
  });



})