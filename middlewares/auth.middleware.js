import jwt from 'jsonwebtoken'

export const authenticationMiddleware = async function(req, res, next) {
    try {
    const tokenHeader = req.headers['authorization']

    if(!tokenHeader){
       return next();
    }

    if(!tokenHeader.startsWith('Bearer')){
       return res.status(400).json({ error: 'authorization header must start with bearer'})
    }

    const token = tokenHeader.split(' ')[1]

    const decoded =  jwt.verify(token, process.env.JWT_SECRET)

    req.user = decoded
    next();
    }  catch(error){

    }
}