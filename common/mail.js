/**
 * Created by su on 2017/10/12.
 */
const nodemailler = require('nodemailer');
const setting = require('../setting');
const mail = {
    sendEmail:(type,regMsg,callback)=>{
        let name = regMsg.name;
        let email = regMsg.email;
        let transporter = nodemailler.createTransport({
            service:'qq',
            auth:{
                user:'1325165625@qq.com',
                pass:'wozbgwmsuxvbbadd'
            }
        })
        let mailOptions = {
            from:setting.mail_opts.auth.user,
            to:email,
            subject:`恭喜${setting.mail_opts.auth.user}大白社区会员注册成功`,
            text:`${name}你好`,
            html:'<b>您已经注册成功</b>'
        }
        transporter.sendMail(mailOptions,(error,info)=>{
            if(error){
                callback(error);
            }
            callback(info);
        })
    }
}
module.exports = mail