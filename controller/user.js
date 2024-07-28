const express = require("express");
const User = require("../model/user");
const router = express.Router();
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const jwt = require("jsonwebtoken");
const { isAuthenticated } = require("../middleware/auth");
const Validator = require("fastest-validator");
const v = new Validator();
const bcrypt = require('bcrypt');

// User register
router.post("/register", async (req, res, next) => {
  const userSchema = {
    name: { type: "string", empty: false, max: 255 },
    outlet_name: { type: "string", empty: false, max: 255 },
    address: { type: "string", optional: true, max: 255 },
    phone: { type: "string", optional: true, max: 255 },
    email: { type: "email", empty: false },
    password: { type: "string", min: 8, empty: false },
    role: { type: "string", optional: true, max: 255 },
  };

  const { body } = req;

  // Validate input data
  const validationResponse = v.validate(body, userSchema);

  if (validationResponse !== true) {
    return res.status(400).json({
      code: 400,
      status: "error",
      data: {
        error: "Validation failed",
        details: validationResponse,
      },
    });
  }

  const isEmailUsed = await User.findOne({ email: body.email });

  if (isEmailUsed) {
    return res.status(400).json({
      code: 400,
      status: "error",
      data: {
        error: "Email has been used",
      },
    });
  }

  const hashedPassword = await bcrypt.hash(body.password, 10);

  try {
    const user = await User.create({ ...body, password: hashedPassword });
    return res.json({
      code: 200,
      status: "success",
      data: {
        id: user._id,
        name: user.name,
        outlet_name: user.outlet_name,
        address: user.address,
        phone: user.phone,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        created_by: user.created_by,
      },
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      status: "error",
      data: error.message,
    });
  }
});

// Login user
router.post("/login", async (req, res, next) => {
  const { body } = req;

  const loginSchema = {
    email: { type: "email", empty: false },
    password: { type: "string", min: 8, empty: false },
  };

  // Validate input
  const validationResponse = v.validate(body, loginSchema);
  if (validationResponse !== true) {
    return res.status(400).json({
      meta: {
        message: "Validation failed",
        code: 400,
        status: "error",
      },
      data: validationResponse,
    });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email: body.email });
    if (!user) {
      return res.status(401).json({
        meta: {
          message: "Authentication failed. Please ensure your email and password are correct.",
          code: 401,
          status: "error",
        },
        data: null,
      });
    }

    // Check password match
    const isPasswordCorrect = await bcrypt.compare(body.password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        meta: {
          message: "Authentication failed. Please ensure your email and password are correct.",
          code: 401,
          status: "error",
        },
        data: null,
      });
    }

    // Create JWT token
    const payload = {
      id: user._id,
      role: user.role,
    };

    const secret = process.env.JWT_SECRET_KEY;
    const expiresIn = "1h"; 

    const token = jwt.sign(payload, secret, { expiresIn });

    return res.status(200).json({
      meta: {
        message: "Authentication successful",
        code: 200,
        status: "success",
      },
      data: {
        id: user._id,
        name: user.name,
        address: user.address,
        phone: user.phone,
        email: user.email,
        role: user.role,
        token: token,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      meta: {
        message: "Internal Server Error",
        code: 500,
        status: "error",
      },
      data: error.message,
    });
  }
});

// All users
router.get(
  "/list",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const users = await User.find().sort({ created_at: -1 });

      const userData = await Promise.all(users.map(async (user) => {
        return {
          id: user._id,
          name: user.name,
          address: user.address,
          phone: user.phone,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
          created_by: user.created_by,
        };
      }));

      res.status(200).json({
        meta: {
          message: "Users retrieved successfully",
          code: 200,
          status: "success",
        },
        data: userData
      });
    } catch (error) {
      console.error("Error:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Delete user
router.delete(
  "/delete/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const userId = req.params.id;

      const user = await User.findByIdAndDelete(userId);

      if (!user) {
        return res.status(404).json({
          code: 404,
          message: 'User not found',
          data: null,
        });
      }

      return res.status(200).json({
        code: 200,
        message: 'User deleted successfully',
        data: null,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get user by ID
router.get(
  "/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const userId = req.params.id;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          code: 404,
          status: "error",
          data: {
            error: "User not found",
          },
        });
      }

      res.status(200).json({
        code: 200,
        status: "success",
        data: user 
        // {
        //   id: user._id,
        //   name: user.name,
        //   outlet_name: user.outlet_name,
        //   address: user.address,
        //   phone: user.phone,
        //   email: user.email,
        //   role: user.role,
        //   created_at: user.created_at,
        // },
      });
    } catch (error) {
      console.error("Error:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Update user by ID
router.put(
  "/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const userSchema = {
      name: { type: "string", optional: true, max: 255 },
      outlet_name: { type: "string", optional: true, max: 255 },
      address: { type: "string", optional: true, max: 255 },
      phone: { type: "string", optional: true, max: 255 },
      email: { type: "email", optional: true },
      password: { type: "string", min: 8, optional: true },
      role: { type: "string", optional: true, max: 255 },
    };

    const { body } = req;

    // Validate input data
    const validationResponse = v.validate(body, userSchema);

    if (validationResponse !== true) {
      return res.status(400).json({
        code: 400,
        status: "error",
        data: {
          error: "Validation failed",
          details: validationResponse,
        },
      });
    }

    try {
      const userId = req.params.id;
      const updates = { ...body };

      if (body.password) {
        updates.password = await bcrypt.hash(body.password, 10);
      }

      const user = await User.findByIdAndUpdate(userId, updates, { new: true });

      if (!user) {
        return res.status(404).json({
          code: 404,
          status: "error",
          data: {
            error: "User not found",
          },
        });
      }

      res.status(200).json({
        code: 200,
        status: "success",
        data: {
          id: user._id,
          name: user.name,
          outlet_name: user.outlet_name,
          address: user.address,
          phone: user.phone,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
        },
      });
    } catch (error) {
      console.error("Error:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
