/**
 * Created by su on 2017/10/12.
 */
//一级回复表
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shortid = require('shortid');
//将基础的方法引入进来
const BaseModel = require('./base_model');
const ReplySchema = new Schema({
    //留言的ID
    _id: {
        type: String,
        default: shortid.generate
    },
    //留言的内容
    content: {
        type: String,
        require: true
    },
    //留言的人
    author: {
        type: String,
        ref: 'User'
    },
    //留言的时间
    create_time: {
        type: Date,
        default: Date.now
    },
    //二级回复的ID
    reply_id: {
        type: String
    },
    //对应的问题
    question_id: {
        type: String,
        ref: 'Question'
    },
    //喜欢该留言的人的数组
    likes: {
        type: [String],
        ref: 'User'
    },
    //踩该留言的人的数组
    unlikes: {
        type: [String],
        ref: 'User'
    },
    //二级回复的数量
    comment_num: {
        type: Number,
        default: 0
    }
})
//当前的模型就会有BaseModel里面的方法了
ReplySchema.plugin(BaseModel);
ReplySchema.statics = {
    //获取所有回复
    getRepliesByQuestionId: (question_id, callback) => {
        Reply.find({'question_id': question_id}).sort({'create_time': 1}).populate('author').exec(callback);
    },
    //获取前五条回复
    getFiveRepliesByQuestionId: (question_id, callback) => {
        Reply.find({'question_id': question_id}).sort({'create_time': 1}).limit(5).populate('author').exec(callback);
    },
    //通过id获取一条回复
    getReplyById: (reply_id, callback) => {
        Reply.findOne({'_id': reply_id}).exec(callback);
    }
}

const Reply = mongoose.model('Reply', ReplySchema);
module.exports = Reply;