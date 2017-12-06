/**
 * Created by su on 2017/10/12.
 */
//用户的配置参数放到这个对象上, 暴露出来
module.exports = {
    //数据库连接的地址
    host: 'localhost',
    //数据库连接的端口号
    port: 27017,
    //数据库的名字
    db: 'ww',
    //加密的密码
    psd: 'askSystem',
    mail_opts:{
        //邮箱的服务器地址
        host:'smtp.qq.com',
        //权限授权码
        auth:{
            user:'1325165625@qq.com',
            pass:'wozbgwmsuxvbbadd'
        }
    },
    //cookie的名字
    auth_name: 'ask_system',
    //cookie的加密key值
    cookie_secret: 'bai',
    categorys: [
        ['ask', '精华'],
        ['share', '分享'],
        ['job', '问答']
    ]
}