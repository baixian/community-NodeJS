/**
 * Created by su on 2017/10/12.
 */
//静态资源的对象
const mapping = require('../static');
const formidable = require('formidable');
const moment = require('moment');
const fs = require('fs');
const gm = require('gm');
const _ = require('lodash');
const User = require('../model/User');
const Question = require('../model/Question');
const Reply = require('../model/Reply');
const Message = require('../model/Message');
const validator = require('validator');
//个人设置的处理函数
exports.setting = (req, res, next) => {
    res.render('setting', {
        title: '用户设置页面',
        layout: 'indexTemplate',
        resource: mapping.setting
    })
}
//更新头像的处理函数
exports.updateImage = (req, res, next) => {
    let form = new formidable.IncomingForm();
    form.uploadDir = 'public/upload/images/';
    let updatePath = 'public/upload/images/';
    let smallImgPath = "public/upload/smallimgs/";
    let files = [];
    let fields = [];
    form.on('field',function(field,value){
        fields.push([field,value]);
    }).on('file',function(field,file){
        files.push([field,file]);
        let type = file.name.split('.')[1];
        let date = new Date();
        let ms = moment(date).format('YYYYMMDDHHmmss').toString();
        let newFileName = 'img' + ms + '.' + type;
        fs.rename(file.path,updatePath + newFileName,function(err){
            var input = updatePath + newFileName;
            var out = smallImgPath + newFileName;
            gm(input).resize(100,100,'!').autoOrient().write(out, function (err) {
                if(err){
                    console.log(err);
                }else{
                    return res.json({
                        error:'',
                        initialPreview:['<img src="' + '/upload/smallimgs/' + newFileName + '">'],
                        url:out
                    })
                }
            });
        })
    })
    form.parse(req);
}
//更新个人资料的处理函数
exports.updateUser = (req, res, next) => {
    let id = req.params.id;
    let motto = req.body.motto;
    let avatar = req.body.avatar;
    let error;
    if(!validator.isLength('motto', 0)) {
        error = '个性签名不能为空';
    }
    if(!validator.isLength('avatar', 0)) {
        error = '头像地址不能为空';
    }
    if(error) {
        res.end(error);
    }
    else {
        //查询数据库对应的用户信息
        User.getUserById(id, (err, user) => {
            if(err) {
                return res.end(err);
            }
            if(!user) {
                console.log(user);
                return res.end('用户不存在');
            }
            user.update_time = new Date();
            user.motto = motto;
            user.avatar = avatar;
            user.save().then((user) => {
                req.session.user = user;
                return res.end('success');
            }).catch((err) => {
                return res.end(err);
            })
        })
    }
}
//用户排名
exports.all = (req, res, next) => {
    let condition = null;
    User.getAllUser(condition, condition, (err, userNum) => {
        User.getAllUser(condition, 5, (err, users) => {
            let msg = [];
            if(req.session.user) {
                users.forEach(function (user, index) {
                    if (_.includes(user.beFollowed, req.session.user._id) == true) {
                        msg.push('follow');
                    }
                    else {
                        msg.push('unfollow');
                    }
                })
            }
            res.render('users', {
                title: '用户列表',
                layout: 'indexTemplate',
                resource: mapping.users,
                users: users,
                userNum: userNum,
                msg: msg
            })
        })
    });
}
//用户排名页面分页
exports.page = (req, res, next) => {
    let page = req.params.page;
    User.find().limit(5).skip((page - 1) * 5).then(users => {
        console.log(users);
        res.render('users-page', {
            users: users,
            pageNum: page
        });
    })
}
//个人信息
exports.index = (req, res, next) => {
    let userName = req.params.name;
    User.getUserByName(userName, (err, person) => {
        if(!person) {
            return res.render('error',{
                error:'',
                message:'该用户不存在'
            })

        }
        Question.getQuestionsByAuthor(person._id, (err, questions) => {
            if(err) {
                return res.end(err);
            }
            Message.geAllMessagesByUserId(person._id, (err, message) => {
                let msg = null;
                if(req.session.user) {
                    if (_.includes(person.beFollowed, req.session.user._id) == true) {
                        msg = 'follow';
                    }
                    else {
                        msg = 'unfollow';
                    }
                }
                User.getUserByNamePopulater(userName, (err, personPopulater) => {
                    Question.find({}).populate('author').then(results => {
                        let followQuestion = [];
                        let dynamic = [];
                        results.forEach(function (result, index) {
                            if(_.includes(result.beFollowed, person._id) == true) {
                                followQuestion.push(result);
                            }
                            if(_.includes(person.follow, result.author._id)) {
                                dynamic.push(result);
                            }
                        })
                        dynamic = _.sortBy(dynamic, [function (o) {
                            return -o.update_time;
                        }]);
                        res.render('myCenter', {
                            title: '个人中心',
                            layout: 'indexTemplate',
                            resource: mapping.myCenter,
                            person: person,
                            personPopulater: personPopulater,
                            questions: questions,
                            message: message,
                            msg: msg,
                            followQuestion: followQuestion,
                            dynamic: dynamic
                        })
                    })
                })
            })

        })
    })
}
//发布问题列表
exports.questions = (req, res, next) => {
    let userName = req.params.name;
    User.getUserByName(userName, (err, person) => {
        if(err) {
            return res.end(err);
        }
        Question.getQuestionsByAuthor(person._id, (err, questions) => {
            if(err) {
                return res.end(err);
            }
            res.render('questions', {
                title: '发问',
                layout: 'indexTemplate',
                resource: mapping.questions,
                person: person,
                questions: questions
            })
        })
    })
}
//回复问题列表
exports.replys = (req, res, next) => {
    let userName = req.params.name;
    User.getUserByName(userName, (err, person) => {
        if(err) {
            return res.end(err);
        }
        Message.geAllMessagesByUserId(person._id, (err, messages) => {
            res.render('replys', {
                title: '回复',
                layout: 'indexTemplate',
                resource: mapping.replys,
                person: person,
                messages: messages
            })
        })
    })
}
//关注人列表
exports.follow = (req, res ,next) => {
    let name = req.params.name;
    User.getUserByNamePopulater(name, (err, user) => {
        res.render('follow-list', {
            users: user.follow
        })
    })
}
//被关注人列表
exports.beFollowed = (req, res, next) => {
    let name = req.params.name;
    User.getUserByNamePopulater(name, (err, user) => {
        res.render('beFollowed-list', {
            users: user.beFollowed
        })
    })
}
