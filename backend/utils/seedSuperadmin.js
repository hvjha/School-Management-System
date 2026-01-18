import userModel from "../models/user/userModel.js"
import bcrypt from 'bcryptjs'
const seedSuperadmin = async(req,res)=>{
    try {
        const exists = await userModel.findOne({role:'superadmin'})
        if(exists) return;

        const password = 'SuperAdmin123!';
        const securityAnswer = '01-01-1998';
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password,salt);
        const securityAnswerHash = await bcrypt.hash(securityAnswer,salt);

        const user = new userModel({
            name:'Super Admin',
            email:'superadmin@example.com',
            password:hashPassword,
            role:'superadmin',
            securityQuestion:'What is your DOB?',
            securityAnswerHash
        })
        await user.save();

        console.log('superadmin -> ',user.name,user.email,user.role);
        
    } catch (error) {
        console.error('superadmin error: ', error.message)
    }
}

export default seedSuperadmin;