const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");

/*
|--------------------------------------------------------------------------
| EMAIL TRANSPORTER
|--------------------------------------------------------------------------
*/

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/*
|--------------------------------------------------------------------------
| REGISTER
|--------------------------------------------------------------------------
*/

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| FORGOT PASSWORD
|--------------------------------------------------------------------------
*/

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    /*
     * Do not reveal whether an account exists.
     * This prevents account enumeration.
     */
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    /*
     * Generate secure random reset token.
     */
    const resetToken = crypto.randomBytes(32).toString("hex");

    /*
     * Store only the hashed token in MongoDB.
     */
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = hashedResetToken;

    /*
     * Token expires after 1 hour.
     */
    user.passwordResetExpires =
      Date.now() + 60 * 60 * 1000;

    await user.save();

    /*
     * Frontend reset-password page.
     *
     * Example:
     * http://localhost:5173/reset-password/abc123...
     */
    const frontendUrl =
      process.env.FRONTEND_URL || "http://localhost:5173";

    const resetUrl =
      `${frontendUrl}/reset-password/${resetToken}`;

    /*
     * Send reset email.
     */
    await transporter.sendMail({
      from: `"Global_Connect" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Global_Connect - Password Reset",
      text: `
Hello ${user.name},

We received a request to reset your Global_Connect password.

Use the following link to reset your password:

${resetUrl}

This password reset link will expire in 1 hour.

If you did not request a password reset, you can safely ignore this email.

Regards,
Global_Connect Team
      `.trim(),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px;">
          <h2 style="color: #2563eb;">Global_Connect</h2>

          <p>Hello ${user.name},</p>

          <p>
            We received a request to reset your Global_Connect password.
          </p>

          <p>
            Click the button below to create a new password:
          </p>

          <div style="margin: 30px 0;">
            <a
              href="${resetUrl}"
              style="
                display: inline-block;
                background: #2563eb;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
              "
            >
              Reset Password
            </a>
          </div>

          <p>
            This password reset link will expire in
            <strong>1 hour</strong>.
          </p>

          <p>
            If you did not request a password reset, you can safely ignore
            this email.
          </p>

          <p>
            Regards,<br />
            Global_Connect Team
          </p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send password reset email",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| RESET PASSWORD
|--------------------------------------------------------------------------
*/

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required",
      });
    }

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and confirm password are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters long",
      });
    }

    /*
     * Hash the token received from the reset URL.
     */
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    /*
     * Find user with:
     * 1. Matching reset token
     * 2. Token that has not expired
     */
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired password reset token",
      });
    }

    /*
     * Hash the new password.
     */
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    user.password = hashedPassword;

    /*
     * Clear reset token immediately.
     * This prevents reuse.
     */
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password reset successful. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
};