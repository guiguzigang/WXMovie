'use strict'

const path = require('path')
const util = require('../libs/util')
const WeChat = require('../weChat/weChat')
const weChat_file = path.join(__dirname, '../config/weChat.txt')
const weChat_ticket_file = path.join(__dirname, '../config/weChatTicket.txt')

const config = {
    weChat: {
        appID: 'wx7dfb09a7fabef898', // 测试账号
        appSecret: 'd51baec8420b786b1898944fcac85601',
        token: 'guiguzigangdeveloper',
        url: 'http://fzpkxb.natappfree.cc/',
        getAccessToken() {
            return util.readFileAsync(weChat_file)
        },
        saveAccessToken(data) {
            data = JSON.stringify(data)
            return util.writeFileAsync(weChat_file, data)
        },
        getTicket() {
            return util.readFileAsync(weChat_ticket_file)
        },
        saveTicket(data) {
            data = JSON.stringify(data)
            return util.writeFileAsync(weChat_ticket_file, data)
        },
    }
}

exports.weChatOptions = config

// 初始获取access_token
exports.getWeChat = _ => {
    return new WeChat(config.weChat)
}
