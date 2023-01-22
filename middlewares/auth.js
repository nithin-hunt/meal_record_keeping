const jwt = require("jsonwebtoken");

const auth = async (req,res,next) => {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader) {
            return res.status(401).json({Error: "Access denied, Authorization header not found"});
        }

        const token = authHeader.split(" ")[1]; 
        if(!token) {
            return res.status(401).json({Error: "Access denied, no token provided"});
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, validToken) => {
            if (err) {
                return res.status(404).json({ message: "Invalid token" })
            } else {
                req.user = validToken;
                next();
            }
        })

    } catch (e) {
        return res.status(500).send(e);
    }
}

module.exports = auth;