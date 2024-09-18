const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: true, message: "Token required" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) {
            return res.status(403).json({ error: true, message: "Invalid token" });
        }
        req.user = payload;  // Attach the payload to req.user
        next();
    });
}

module.exports = { authenticateToken };
