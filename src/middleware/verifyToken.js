const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET_KEY;

const verifyToken = (req, res, next) => {
    try {
        const token = req.cookies.token;
        // const token = req.headers["authorization"].split(" ")[1]

        if (!token) {
            return res.status(401).send({ message: "Invalid Token" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded) {
            return res.status(401).send({ message: "Invalid Token or not valid" });
        }

        req.userId = decoded.userId;
        req.role = decoded.role;
        next();
    } catch (error) {
        console.error("Error while verifying token", error);
        res.status(401).send({ message: 'Error while verifying token' });
    }
};

module.exports = verifyToken;
