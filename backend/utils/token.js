import jwt from 'jsonwebtoken'

export const createAuthToken = (userId,expiresIn = process.env.JWT_EXPIRES_IN || '1d')=>{
    return jwt.sign({id:userId},process.env.JWT_SECERET,{expiresIn})
}

export const createResetToken = (userId,expiresIn = process.env.RESET_TOKEN_EXPIRES_IN || '1m')=>{
    return jwt.sign({id:userId},process.env.JWT_SECERET,{expiresIn})
}

export const verifyToken = (token) =>{
    return jwt.verify(token,process.env.JWT_SECERET)
}