const jwt = require('jsonwebtoken');
const User = require('../users/user.model')
const generateToken = async (userId) => {
    const JWT_SECRET = process.env.JWT_SECRET_KEY;
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }


        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    
    return token; 
    
    } catch (error) {

    }
};

module.exports = generateToken;