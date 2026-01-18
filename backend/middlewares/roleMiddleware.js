export const permit = (...allowed)=>{
    return (req,res,next)=>{
        if(!req.user){
            return res.status(401).json({
                success:false,
                message:'Not authorized'
            })
        }
        if(!allowed.includes(req.user.role)){
            return res.status(403).json({
                success:false,
                message:'Forbidden : insufficient rights'
            })
        }
        next()
    }
}