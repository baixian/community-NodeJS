/**
 * Created by su on 2017/10/12.
 */
const express = require('express');
const router = express.Router();
const home = require('./routes/home');
const question = require('./routes/question');
const user = require('./routes/user');
const message = require('./routes/message');
const reply = require('./routes/reply');
const comment = require('./routes/comment');
const auth = require('./common/auth');

//**************************首页**************************//
//首页
router.get('/',home.shouye);
//社区页面的路由
router.get('/index', home.index);
//社区页面的分页
router.get('/index/:page', home.page);
//社区页面路由的分类
router.get('/index/questions/:category', home.category);
//社区页面路由的分类的分页
router.get('/index/questions/:category/:page', home.categoryPage);
//注册页面的路由
router.get('/register', auth.userNotRequired, home.register);
//登录页面的路由
router.get('/login', auth.userNotRequired, home.login);
//注册行为
router.post('/register', auth.userNotRequired, home.postRegister);
//登录行为
router.post('/login', auth.userNotRequired, home.postLogin);
//退出行为
router.get('/logout', home.logout);


//*****************************问题*************************//
//发布问题的页面
router.get('/question/create', auth.userRequired, question.create);
//发布问题的行为
router.post('/question/create', auth.userRequired, question.postCreate);
//编辑问题的页面
router.get('/question/:id/edit', auth.userRequired, question.edit);
//编辑问题的行为
router.post('/question/:id/edit', auth.userRequired, question.postEdit);
//删除问题的行为
router.get('/question/:id/delete', auth.userRequired, question.delete);
//问题页面
router.get('/question/:id', question.index);
//显示所有一级回复
router.get('/question/:id/showReply', question.show);

//***************************用户*************************
//个人设置页面
router.get('/setting', auth.userRequired, user.setting);
//更新头像
router.post('/updateImage', auth.userRequired, user.updateImage);
//更新个人资料
router.post('/updateUser/:id', auth.userRequired, user.updateUser);
//用户列表页面
router.get('/users', user.all);
//用户列表页面分页
router.get('/users/:page', user.page);
//个人中心页面
router.get('/user/:name', user.index);
//个人中心关注页面
router.get('/user/:name/follow', user.follow);
//个人中心被关注页面
router.get('/user/:name/beFollowed', user.beFollowed);
//用户发问列表
router.get('/user/:name/questions', user.questions);
//用户回复列表
router.get('/user/:name/replys', user.replys);

//****************************消息************************
//消息列表页面
router.get('/my/messages', auth.userRequired, message.index);
//确认已读行为
router.get('/updateMessage/:id', auth.userRequired, message.updateMessage);
//确认全部已读行为
router.get('/updateAllMessage', auth.userRequired, message.updateAllMessage);

//****************************回复************************
//一级回复
router.post('/:question_id/reply', auth.userRequired, reply.add);
//二级回复
router.post('/:question_id/comment', auth.userRequired, comment.add);
//显示二级回复
router.get('/:reply_id/showComments', comment.show);
//二级回复分页
router.get('/comments/:reply_id/:page', comment.page);

//一级回复点赞
router.get('/reply/like/:replyId', reply.replyLike);
//一级回复踩
router.get('/reply/unlike/:replyId', reply.replyUnLike);
//二级回复点赞
router.get('/comment/like/:commentId', comment.replyLike);
//二级回复踩
router.get('/comment/unlike/:commentId', comment.replyUnLike);
//关注用户
router.get('/follow/user/:id', reply.followUser);
//关注问题
router.get('/follow/question/:id', reply.followQuestion);



module.exports = router;