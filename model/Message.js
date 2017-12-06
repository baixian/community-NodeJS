/**
 * Created by su on 2017/10/12.
 */
//用户消息
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shortid = require('shortid');
const BaseModel = require('./base_model');
const MessageSchema = new Schema({
    _id: {
        type: String,
        default: shortid.generate
    },
    type: {
        type: String,
        require: true
    },
    target_id: {
        type: String,
        require: true,
        ref: 'User'
    },
    author_id: {
        type: String,
        require: true,
        ref: 'User'
    },
    question_id: {
        type: String,
        require: true,
        ref: 'Question'
    },
    reply_id: {
        type: String,
        require: true,
        ref: 'Reply'
    },
    comment_id: {
        type: String,
        ref: 'Comment'
    },
    has_read: {
        type: Boolean,
        default: false
    },
    create_time: {
        type: Date,
        default: Date.now
    }
})

MessageSchema.statics = {
    //获取未读消息的数量
    getMessagesNoReadCount: (id, callback) => {
        Message.count({'target_id': id, 'has_read': false}, callback);
    },
    //读取未读消息
    getUnReadMessages: (id, callback) => {
        Message.find({'target_id': id, 'has_read': false}, null, {sort: '-create_time'}).populate('author_id').populate('target_id')
            .populate('question_id').populate('reply_id').exec(callback);
    },
    //读取已读消息
    getReadMessages: (id, callback) => {
        Message.find({'target_id': id, 'has_read': true}, null, {sort: '-create_time', limit: 20}).populate('author_id')
            .populate('target_id').populate('question_id').populate('reply_id').exec(callback);
    },
    //更新某条消息为已读
    updateMessage: (id, callback) => {
        Message.update({'_id': id}, {$set: {'has_read': true}}).exec(callback);
    },
    //更新某个用户所有未读消息
    updateAllMessage: (user_id, callback) => {
        Message.update({'target_id': user_id}, {$set: {'has_read': true}}, {multi: true}).exec(callback);
    },
    geAllMessagesByUserId: (userId, limit, callback) => {
        if(typeof limit == 'function') {
            callback = limit;
            limit = null;
        }
        Message.find({'target_id': userId, 'type': 'reply'}).sort({'create_time': 1}).limit(limit).populate('comment_id').populate('reply_id')
            .populate('question_id').populate('author_id').exec(callback);
    }
}

MessageSchema.plugin(BaseModel);
const Message = mongoose.model('Message', MessageSchema);
module.exports = Message;