'use strict'

const weChat = require('../../wechat/generator')
const weixin = require('../../wx/reply')
const wx = require('../../wx/index')

exports.hear = async (ctx, next) => {
    ctx.middle = weChat(wx.weChatOptions.weChat, weixin.reply)

    await ctx.middle(ctx, next)
}
