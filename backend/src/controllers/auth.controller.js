import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

async function sendTokenResponse(user, res, message) {

    const token = jwt.sign(
        { id: user._id },
        config.JWT_SECRET,
        {
            expiresIn: "7d",
        }
    );

    res.cookie("token", token);

    return res.status(201).json({
        message,
        success: true,
        user: {
            id: user._id,
            email: user.email,
            contact: user.contact,
            fullname: user.fullname,
            role: user.role,
        }
    });
}

export const register = async (req, res) => {

    const { email, contact, password, fullname, isSeller } = req.body;

    try {

        const existingUser = await userModel.findOne({
            $or: [{ email }, { contact }]
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User with this email or contact number already exists"
            });
        }

        const user = await userModel.create({
            email,
            contact,
            password,
            fullname,
            role: isSeller ? "seller" : "buyer"
        });

        return await sendTokenResponse(
            user,
            res,
            "User registered successfully"
        );

    } catch (error) {

        console.error("Error registering user:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const login = async (req, res) => {

    const { email, password } = req.body;

    try {

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        return await sendTokenResponse(
            user,
            res,
            "Login successful"
        );

    } catch (error) {

        console.error("Error logging in user:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const googleCallback = async (req, res) => {
    try {
        const { emails, displayName } = req.user;
        const email = emails && emails[0] ? emails[0].value : "";

        if (!email) {
            return res.redirect("http://localhost:5173/login?error=no_email");
        }

        let user = await userModel.findOne({ email });

        if (!user) {
            user = await userModel.create({
                email,
                fullname: displayName || "Google User",
                contact: "Not Provided",
                password: Math.random().toString(36).slice(-10) + "A1!"
            });
        }

        const token = jwt.sign(
            { id: user._id },
            config.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token);
        res.redirect("http://localhost:5173/dashboard");

    } catch (error) {
        console.error("Error in googleCallback:", error);
        res.redirect("http://localhost:5173/login?error=auth_failed");
    }
}