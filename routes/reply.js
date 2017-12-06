/**
 * Created by su on 2017/10/12.
 */
const validator = require('validator');
const Reply = require('../model/Reply');
const Question = require('../model/Question');
const User = require('../model/User');
const at = require('../common/at');
const message = require('../common/message');
const _ = require('lodash');
exports.add = (req, res, next) => {
    let question_id = req.params.question_id;
    let content = req.body.content;
    content = validator.trim(String(content));
    if(content === '') {
        return res.end('内容不能为空');
    }
    else {
        let newReply = new Reply();
        newReply.content = content;
        newReply.question_id = question_id;
        newReply.author = req.session.user._id;
        newReply.save().then(reply => {
            let result = Reply.findOne({'_id': reply._id}).populate('question_id').populate('author');
            return result;
        }).then(reply => {
            reply.question_id.last_reply = reply._id;
            reply.question_id.last_reply_time = new Date();
            reply.question_id.last_reply_author = reply.author;
            reply.question_id.comment_num += 1;
            reply.question_id.save();
            return reply;
        }).then(reply => {
            User.findOne({'_id': reply.question_id.author}).then(author => {
                let author_name = author.name;
                let regex = new RegExp('@' + author_name + '\\b(?!\\])', 'g');
                let newContent = content.replace(regex,'');
                at.sendMessageToMentionUsers(newContent, reply.question_id._id, reply.author._id, reply._id, (err, msg) => {
                    if(err) {
                        res.end(err);
                    }
                })
            });
            return reply;
        }).then(reply => {
            reply.author.score += 5;
            reply.author.reply_count += 1;
            reply.author.save();
            req.session.user = reply.author;
            return reply;
        }).then(reply => {
            let question_author = reply.question_id.author;
            if(question_author != req.session.user._id) {
                message.sendReplyMessage(question_author, req.session.user._id, reply.question_id, reply._id, null);
            }
            return res.json({message: 'success'});
        }).catch(err => {
            console.log(err);
        })
    }
}
//一级回复点赞
exports.replyLike = (req, res, next) => {
    let reply_id = req.params.replyId;
    let userId = req.session.user._id;
    let replyAuthorId = req.query.replyId;
    Reply.getReplyById(reply_id, (err, reply) => {
        if (_.includes(reply.likes, userId) == false) {
            reply.likes.push(userId);
        }
        else {
            reply.likes.remove(userId);
        }
        reply.save();
        res.render('likes', {
            reply: reply
        });
    })
}
//一级回复踩
exports.replyUnLike = (req, res, next) => {
    let reply_id = req.params.replyId;
    let userId = req.session.user._id;
    let replyAuthorId = req.query.replyId;
    Reply.getReplyById(reply_id, (err, reply) => {
        if (_.includes(reply.unlikes, userId) == false && userId != null) {
            reply.unlikes.push(userId);
        }
        else {
            reply.unlikes.remove(userId);
        }
        reply.save();
        res.render('unlikes', {
            reply: reply
        });
    })
}
//关注用户
exports.followUser = (req, res, next) => {
    if(req.session.user) {
        let target_id = req.params.id;
        let user_id = req.session.user._id;
        let msg = null;
        if (target_id != user_id) {
            User.getUserById(target_id, (err, target) => {
                //更改被关注字段
                if (_.includes(target.beFollowed, user_id) == false && user_id != null) {
                    target.beFollowed.push(user_id);
                    msg = 'follow';
                }
                else {
                    target.beFollowed.remove(user_id);
                    msg = 'unfollow';
                }
                target.save();
                User.getUserById(user_id, (err, user) => {
                    //更改关注字段
                    if (_.includes(user.follow, target_id) == false && target_id != null) {
                        user.follow.push(target_id);
                    }
                    else {
                        user.follow.remove(target_id);
                    }
                    user.save();
                })
                res.end(msg);
            })
        }
        else {
            res.end('err');
        }
    }
    else res.end('login');
}
//关注问题
exports.followQuestion = (req, res, next) => {
    let target_id = req.params.id;
    let user_id = req.session.user._id;
    let questionAuthor = req.query.questionAuthor;
    if(user_id != questionAuthor) {
        User.getUserById(user_id, (err, user) => {
            let msg = null;
            if(_.includes(user.followQuestion, target_id) == false) {
                user.followQuestion.push(target_id);
                msg = 'follow';
            }
            else {
                user.followQuestion.remove(target_id);
                msg = 'unfollow';
            }
            user.save();
            Question.getQuestionById(target_id, (err, question) => {
                if(_.includes(question.beFollowed, user_id) == false) {
                    question.beFollowed.push(user_id);
                }
                else {
                    question.beFollowed.remove(user_id);
                }
                question.save();
                res.end(msg);
            })
        })
    }
    else {
        res.end('repeat');
    }
}