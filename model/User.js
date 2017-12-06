/**
 * Created by su on 2017/10/12.
 */
const mongoose = require('mongoose');
const shortid = require('shortid');
const Schema = mongoose.Schema;
const BaseModel = require('./base_model');
const UserSchema = new Schema({
    //定义字段
    _id: {
        type: String,
        default: shortid.generate
    },
    //用户名
    name: {
        type: String,
        required: true
    },
    //密码
    password: {
        type: String,
        required:true
    },
    //邮箱
    email: {
        type: String
    },
    //个人简介
    motto: {
        type: String,
        default: '这家伙很懒, 什么都没有留下...'
    },
    //个人头像
    avatar: {
        type: String,
        default: '/images/default-avatar.jpg'
    },
    //创建时间
    create_time: {
        type: Date,
        default: Date.now
    },
    //修改时间
    update_time: {
        type: Date,
        default: Date.now
    },
    //用户积分
    score: {
        type: Number,
        default: 0
    },
    //用户发表的文章数量
    article_count: {
        type: Number,
        default: 0
    },
    //用户回复的数量
    reply_count:{
        type: Number,
        default: 0
    },
    //用户关注的人
    follow: {
        type: [String],
        ref: 'User'
    },
    //关注用户的人
    beFollowed: {
        type: [String],
        ref: 'User'
    },
    //用户关注的文章
    followQuestion: {
        type: [String],
        ref: 'Question'
    }
})
//给这个User表添加静态方法
UserSchema.statics = {
    getUser: (condition, callback) => {
        User.find({'_id': {$nin: [condition]}}).sort({'score': -1}).limit(5).exec(callback);
    },
    getAllUser: (condition, num, callback) => {
        User.find().limit(num).sort({'score': -1}).exec(callback);
    },
    getUserByName:(name,callback)=>{
        User.findOne({name:name}).exec(callback);
    },
    getUserByEmail:(email,callback)=>{
        User.findOne({email:email},callback)
    },
    getUserById:(id,callback)=>{
        User.findOne({_id:id},callback)
    },
    getUserByNames: (names, callback) => {
        if(names.length == 0) {
            return callback(null, []);
        }
        User.find({name: {$in: names}}, callback);
    },
    getUserByNamePopulater: (name, callback) => {
        User.findOne({name:name}).populate('follow').populate('beFollowed').exec(callback);
    }
}
//当前的模型就会有BaseModel里面的方法了
UserSchema.plugin(BaseModel);
const User = mongoose.model('User', UserSchema);
module.exports = User;
