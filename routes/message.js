/**
 * Created by su on 2017/10/12.
 */
//静态资源的对象
const mapping = require('../static');
const Message = require('../model/Message');
const Question = require('../model/Question');
const User = require('../model/User');
const _ = require('lodash');
//消息列表的处理函数
exports.index = (req, res, next) => {
    let mission1 = new Promise((resolve, reject) => {
        Message.getUnReadMessages(req.session.user._id, (err, undatalist) => {
            if(err) {
                reject(err);
            }
            else {
                resolve(undatalist);
            }
        })
    })
    let mission2 = new Promise((resolve, reject) => {
        Message.getReadMessages(req.session.user._id, (err, datalist) => {
            if(err) {
                reject(err);
            }
            else {
                resolve(datalist);
            }
        })
    })
    Promise.all([mission1, mission2]).then((result) => {
        let read = result[1];
        let no_read = result[0];
        res.render('messages', {
            title: '消息',
            layout: 'indexTemplate',
            resource: mapping.messages,
            no_read: no_read,
            read: read,
            readLength: read.length
        })
    }).catch(err => {
        console.log(err);
    })
}


//更新某个消息的处理函数
exports.updateMessage = (req, res, next) => {
    let id = req.params.id;
    Message.updateMessage(id, (err, result) => {
        if(err) {
            return res.end(err);
        }
        res.end('success');
    })
}
//已读所有消息的处理函数
exports.updateAllMessage = (req, res, next) => {
    let user_id = req.session.user._id;
    Message.updateAllMessage(user_id, (err, result) => {
        if(err) {
            return res.end(err);
        }
        res.end('success');
    })
}