'use strict'

const sha1 = require('sha1')
const getRawBody = require('raw-body')
const WeChat = require('./weChat')
const util = require('./util')

module.exports = (opts, handler) => {
    // 获取 access_token
    const weChat = new WeChat(opts)

    return async (ctx, next) => {
        await next()
        // console.log(ctx.query, ctx)
        const signature = ctx.query.signature
        const token = opts.token
        const nonce = ctx.query.nonce
        const timestamp = ctx.query.timestamp
        const echostr = ctx.query.echostr
        const str = [token, timestamp, nonce].sort().join('')
        const sha = sha1(str)

        // 如果是微信服务器过来的请求
        if(ctx.method === 'GET') {
            if(sha === signature) {
                ctx.body = echostr + ''
            } else {
                ctx.body = 'wrong'
            }
        } else if(ctx.method === 'POST') { // 用户发起的请求, 数据格式为 XML
            if(sha !== signature) { // 如果请求不合法
                ctx.body = 'wrong'
                return false
            }
            const data = await getRawBody(ctx.req, {
                length: ctx.length,
                limit: '1mb',  // 数据最大值
                encoding: ctx.charset
            })
            console.log(data.toString())
            // 将 XML 格式的数据转为 JSON
            const content = await util.parseXMLAsync(data)
            console.log( content, 'content' )

            const message = util.formatMassage(content.xml)
            console.log(message, 'message')

            ctx.weixinMsg = message

            await handler.call(ctx, next)

            weChat.reply.call(ctx)
        }
    }
}
