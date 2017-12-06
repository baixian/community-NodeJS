/**
 * Created by su on 2017/10/12.
 */
const mapping = require('../static');
const validator = require('validator');
const User = require('../model/User');
const Question = require('../model/Question');
const DBSet = require('../model/db');
const setting = require('../setting');
const mail = require('../common/mail');
const auth = require('../common/auth');
//首页
exports.shouye = (req,res,next) => {
    res.render('shouye', {
        title: '首页',
    });
}
//社区中心的处理函数
exports.index = (req, res, next) => {
    Question.find({'deleted': false}).then(allQuestion => {
        return allQuestion;
    }).then(allQuestion => {
        let condition
        condition = null;
        User.getUser(condition, (err, users) => {
            Question.find({'deleted': false}).limit(5).populate('author').populate('last_reply')
                .populate('last_reply_author').then(questions => {
                    // console.log(questions);
                res.render('index', {
                    title: '社区中心',
                    //默认模板
                    layout: 'indexTemplate',
                    resource: mapping.index,
                    questions: questions,
                    users: users,
                    allQuestion: allQuestion
                });
            })
        });
    })
};
//社区中心的分页
exports.page = (req, res, next) => {
    let page = req.params.page;
    Question.find({'deleted': false}).limit(5).skip((page - 1) * 5).populate('author').populate('last_reply')
        .populate('last_reply_author').then(questions => {
        res.render('index-page', {
            questions: questions
        });
    })
}
//社区中心路由的分类
exports.category = (req, res, next) => {
    let category = req.params.category;
    Question.find({'deleted': false, 'category': category}).limit(5).populate('author').populate('last_reply')
        .populate('last_reply_author').then(questions => {
            Question.count({'deleted': false, 'category': category}).then(count => {
                res.render('index-category', {
                    questions: questions,
                    count: count,
                    category:category
                });
            })
    })
}
//社区中心路由的分页
exports.categoryPage = (req,res,next) =>{
    let category = req.params.category;
    let page = req.params.page;
    Question.find({'deleted': false,'category': category}).limit(5).skip((page - 1) * 5).populate('author').populate('last_reply')
        .populate('last_reply_author').then(questions => {
        res.render('index-askPage', {
            questions: questions,
        });
    })

}

//注册页面的处理函数
exports.register = (req, res, next) => {
    res.render('register', {
        title: '注册页面',
        resource: mapping.register
    })
}
//登陆页面的处理函数
exports.login = (req, res, next) => {
    res.render('login', {
        title: '登录页面',
        resource: mapping.login
    })
}
//注册行为的处理函数
exports.postRegister = (req, res, next) => {
    let name = req.body.name;
    let password = req.body.password;
    let email = req.body.email;
    let error;
    if(!validator.matches(name, /^[a-zA-Z][a-zA-Z0-9_]{4,11}$/)){
        error = '用户名不合法, 5-12位, 数字字母下划线, 请重新输入';
    }
    //密码
    if(!validator.matches(password, /(?!^\\d+$)(?!^[a-zA-Z]+$)(?!^[_#@]+$).{5,}/, 'g' || !validator.isLength(password, 6, 12))) {
        error = '密码不合法, 长度在5-12, 请重新输入';
    }
    if(!validator.isEmail(email)) {
        error = '邮箱格式不合法, 请重新输入';
    }
    if(error) {
        res.end(error);
    }
    else {
        let query = User.find().or([{name: name}, {email: email}]);
        query.exec().then(user => {
            if(user.length > 0) {
                error = '不允许重复注册, 请重新填写注册信息'
                res.end(error);
            }
            else {
                var regMsg = {name: name, email: email};
                mail.sendEmail('reg_mail', regMsg, (info) => {
                    console.log(info);
                })
                let newPSD = DBSet.encrypt(password, setting.psd);
                req.body.password = newPSD;
                DBSet.addOne(User, req, res, 'success');

            }
        }).catch(err => {
            res.end(err);
        })

    }

}
//登录行为的处理函数
exports.postLogin = (req, res, next) => {
    let name = req.body.name;
    let password = req.body.password;
    let getName;
    let getUser;
    let getEmail;
    let error;
    name.includes('@') ? getEmail = name : getName = name;
    if(getName) {
        if(!validator.matches(getName, /^[a-zA-Z][a-zA-Z0-9_]{4,11}$/,'g')) {
            error = '用户名不合法';
        }
    }
    if(getEmail) {
        if(!validator.isEmail(getEmail)) {
            error = '邮箱格式不正确';
        }
    }
    if(!validator.matches(password, /(?!^\\d+$)(?!^[a-zA-Z]+$)(?!^[_#@]+$).{5,}/,'g') ||
        !validator.isLength(password,6,12)) {
        error = '密码不合法, 长度在5-12位, 请重新输入';
    }
    if(error) {
        res.end(error);
    }
    else {
        if(getEmail) {
            getUser = User.getUserByEmail;
        }
        else {
            getUser = User.getUserByName;
        }
        getUser(name, (err, user) => {
            if(err) {
                res.end(err);
            }
            if(!user) {
                return res.end('该用户名/邮箱不存在');
            }
            let newPSD = DBSet.encrypt(password, setting.psd);
            if(user.password != newPSD) {
                return res.end('密码错误, 请重新输入');
            }
            auth.gen_session(user, res);

            return res.end('success');
        })
    }
}

//退出行为的处理函数
exports.logout = (req, res, next) => {
    req.session.destroy();
    res.clearCookie(setting.auth_name);
    res.redirect('/');
}


