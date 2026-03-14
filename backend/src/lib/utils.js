import jwt from 'jsonwebtoken';

export const generateToken = (user , res) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });

    res.cookie("jwt",token,{
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true, //prevent XSS attacks
        sameSite: 'strict',  // CSRF attacks
        secure: process.env.NODE_ENV === 'production', // Set secure flag in production
    })
    return token;
}