const jwt = require('jsonwebtoken');
const User = require('../models/userModal');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const { promisify } = require('util');
const Email = require('../utils/email');

const signToken = (id) => {
  console.log(process.env.JWT_SECRET, 'sdsdsd');
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    signed: true,
  };

  // console.log(cookieOption)

  res.cookie('jwt', token, cookieOption);

  user.password = undefined;

  res.setHeader('Authorization', `Bearer ${token}`);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};

exports.createMany = catchAsync(async (req, res, next) => {
  const usersData = req.body;
  
 
  const loginURl=process.env.FRONTEND_URL
  console.log("🚀 ~ exports.createMany=catchAsync ~ loginURl:", loginURl)
  for (const item of usersData) {
    const user = await User.create({
      email: item.email,
      password: item.password,
      testid: item.testid,
      startAt:item.startAt,
      endAt:item.endAt,
    });
    await new Email(item, loginURl).sendPassword();
    
  }
  res.status(201).json({
    status: 'success',
    message: 'Users created and emails sent successfully',
  });
});


exports.login = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email && !password) {
    return next(new AppError('please prove email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new AppError('User Not found'));
  }

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  createSendToken(user, 200, req, res);
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

exports.protect = catchAsync(async (req, res, next) => {
  
  console.log(req.body)
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }else{
   token= req.headers.authorization
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401)
    );
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  // console.log(currentUser)
  if (!currentUser) {
    return next(
      new AppError('The user belgoning to this token does not exist.', 401)
    );
  }
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'The user recentely changed their password! please log in again.',
        401
      )
    );
  }

  req.user = currentUser;
  res.locals.user = currentUser;

  next();
});

exports.isLoggedIn = async (req, res, next) => {
  console.log(req.authorization,"authorization")
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        isAuthorized: false,
      });
    }

    // Verify token
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET // This should match the secret used when signing the cookie
    );

    // Check if user exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if password was changed
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({ message: 'Password changed' });
    }

    // User is authenticated, continue with the request
    res.status(200).json({
      user: currentUser,
      isAuthorized: true,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
