const router = require('express').Router();
const User = require("../models/userModel");
const {validateEmail, validatePassword} = require('../utils/validators');
const Token = require("../models/tokenModel");
const nodemailer = require('nodemailer');
const crypto = require("crypto");
const bcrypt = require("bcrypt");

router.post("/", async(req,res) => {
    try {
        const {error} = validateEmail(req.body.email);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
  
        const user= await User.findOne({email: req.body.email});
        if (!user) {
            return res.status(404).send("User does not exist");
        }

        const token = await Token.findOne({userId: user._id});
        if(token) {
            await token.deleteOne();
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const hash = await bcrypt.hash(resetToken, (saltOrRounds = 10));

        await new Token({
            userId: user._id,
            token: hash,
            createdAt: Date.now(),
        }).save();

        const resetLink = `${process.env.APP_URL}/api/v1/forgot-password?token=${resetToken}&id=${user._id}`;

        const mailOptions = {
            from: process.env.USER_EMAIL,
            to: req.body.email,
            cc: [],
            bcc: [],
            subject: "Password Reset Request",
            html: `<h1>Forgot your password?</h1>
            <p>We recieved a request to reset the password for your account</p>
            <br/>
            <p>Please, click the link below to reset your password</p>
            <a href="${resetLink}">Reset Password</a>`,
        };
        
        const transporter = nodemailer.createTransport({
            host: "smtp-relay.sendinblue.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.USER_PASS,
            }
        });

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err);
            } else {
                return res.status(200).json({Message: "Email sent sucessfully", Link: resetLink });
            }
        });
        
    } catch(e) {
        return res.status(500).json({Error: e.message});
    }
});

router.put("/", async (req, res) => {
    try {
        const passwordResetToken = await Token.findOne({userId: req.query.id });
        if (!passwordResetToken) {
            return res.status(404).json("Invalid or expired password reset token");
        }
        
        const isValid = await bcrypt.compare(req.query.token, passwordResetToken.token);
        if (!isValid) {
            return res.status(404).json("Invalid or expired password reset token");
        }
        
        const { password } = req.body;
        
        const { error } = validatePassword(req.body.password);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const hashedPassword = await bcrypt.hash(password, (saltOrRounds = 10));
    
        await User.updateOne(
            { _id: req.query.id },
            { $set: { password: hashedPassword } },
            { new: true }
        );
        
        const user = await User.findById({ _id: req.query.id });

        const mailOptions = {
            from: process.env.USER_EMAIL,
            to: user.email,
            cc: [],
            bcc: [],
            subject: "Password Reset Successfully",
            html: `<p>Your password has been changed successfully</p>`,
        };
        
        const transporter = nodemailer.createTransport({
            host: "smtp-relay.sendinblue.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.USER_PASS,
            }
        });

        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                console.log(err);
            } 
        });

        await passwordResetToken.deleteOne();
        return res.status(200).json("Password changed sucessfully");
        
    } catch (e) {
      return res.status(500).json({ Error: e.message });
    }
  });
module.exports = router;