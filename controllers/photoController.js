const User = require('../models/userModal');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {

  
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image. Please upload images', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadPhoto = upload.single('photo');

exports.resizePhoto = (path) => {
  
  
  return catchAsync(async (req, res, next) => {
   
    if (!req.file) return next();
    const folderName = path.split('/').pop();
    req.file.filename = `${folderName}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
      // .resize(1200, 1600)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`${path}/${req.file.filename}`);
    next();
  });
};


exports.patchPhoto = catchAsync(async (req, res, next) => {
    // console.log(req.files,"files")
    // console.log(req.file,"file")
    // console.log(req.body)
    let photo;
    if (req.file) {
      photo = req.file.filename;
    }
    console.log(photo,"photo")
    const { email } = req.body;

   
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('No user found with that email', 404));
    }

  
    const newPhoto = photo;

    
    user.photo.push(newPhoto);

    
    await user.save();

    res.status(200).json({
        status: 'success',
        data: {
          user,
        },
      });
});