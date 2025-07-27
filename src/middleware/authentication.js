const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');
require('dotenv').config();
const user = require('../models/user');

async function authentication(req, res, next) {
    try {
        // PENTING: Pastikan secret key yang digunakan untuk verify SAMA dengan yang digunakan untuk sign
        // Jika Anda di app.js menggunakan process.env.JWT_SECRET untuk sign, gunakan itu juga di sini
        const JWT_SECRET = process.env.JWT_SECRET || "secret"; // Ganti "secret" dengan process.env.JWT_SECRET jika sudah yakin .env terload

        console.log("--- Authentication Middleware ---");
        console.log("Request Headers:", req.headers);

        if (!req.headers.authorization) {
            console.log("Error: No Authorization header.");
            throw { name: "Invalid Token" };
        }

        let [type, token] = req.headers.authorization.split(" ");
        console.log("Token Type:", type);
        console.log("Token Value:", token);

        if (type !== "Bearer") {
            console.log("Error: Token type is not Bearer.");
            throw { name: "Invalid Token" };
        }

        const blacklisted = await redisClient.get(`blacklisted:${token}`);
        
        if(blacklisted) {
            return res.status(401).json({ message: "Token is Blocked"});
        }

        let payload = jwt.verify(token, JWT_SECRET);
        console.log("Decoded Payload:", payload); // Ini akan menampilkan payload jika verifikasi berhasil

        if (!payload || !payload.id) {
            console.log("Error: Payload is missing or id is missing from payload.");
            throw { name: "Invalid Token" };
        }

        let user1 = await user.findByPk(payload.id);
        console.log("User found from DB:", user1 ? user1.id : "None");

        if (!user1) {
            console.log("Error: User not found in database for ID:", payload.id);
            throw { name: "Invalid Token" };
        }

        req.user = { id: user1.id };
        next();
    } catch (error) {
        console.error("--- Authentication Error Detail ---");
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        // Ini sangat penting untuk JWT:
        if (error.name === 'TokenExpiredError') {
            console.error('JWT Error: Token is expired.');
            // Anda bisa melempar error khusus di sini jika ingin respons yang berbeda
            // throw { name: "TokenExpiredError", message: "Your token has expired. Please log in again." };
        } else if (error.name === 'JsonWebTokenError') {
            console.error('JWT Error: Invalid token signature or malformed token.');
            // throw { name: "JsonWebTokenError", message: "Invalid or malformed token." };
        }
        console.error("-----------------------------------");
        next(error); // Melewatkan error ke error handler global
    }
}


module.exports = authentication;