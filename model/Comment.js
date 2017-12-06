/**
 * Created by su on 2017/10/12.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const BaseModel = require('./base_model');
const shortid = require('shortid');
const CommentSchema = new Schema({
    _id: {
        type: String,
        default: shortid.generate
    },
    //上级, 对应的上级一级回复ID
    reply_id: {
        type: String,
        ref: 'Reply'
    },
    //二级回复的作者
    author: {
        type: String,
        ref: 'User'
    },
    //回复对应的人
    comment_target_id: {
        type: String,
        ref: 'User'
    },
    //问题的ID
    question_id: {
        type: String,
        ref: 'Question'
    },
    //内容
    content: {
        type: String
    },
    //发布时间
    create_time: {
        type: Date,
        default: Date.now
    },
    //点赞的人
    likes: {
        type: [String],
        ref: 'User'
    },
    //踩该留言的人的数组
    unlikes: {
        type: [String],
        ref: 'User'
    },
})
//当前的模型就会有BaseModel里面的方法了
CommentSchema.statics = {
    getCommentsByReplyId: (reply_id, callback) => {
        Comment.find({'reply_id': reply_id}, '', {sort: 'create_time'}).limit(5).populate('comment_target_id')
            .populate('question_id').populate('author').exec(callback);
    },
    getFiveCommentsByReplyId: (reply_id, pageNum, callback) => {
        Comment.find({'reply_id': reply_id}, '', {sort: 'create_time'}).limit(5).skip((pageNum - 1) * 5 ).populate('comment_target_id')
            .populate('question_id').populate('author').exec(callback);
    },
    getCommentsById: (comment_id, callback) => {
        Comment.findOne({'_id': comment_id}).populate().populate('comment_target_id')
            .populate('question_id').populate('author').exec(callback);
    }
}
CommentSchema.plugin(BaseModel);
const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;