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
            /*<xml>
                <ToUserName><![CDATA[gh_eda0f88df83c]]></ToUserName>
                <FromUserName><![CDATA[oDVEn1AIhUMQaybpRNEyzJqLj3kY]]></FromUserName>
                <CreateTime>1512976806</CreateTime>
                <MsgType><![CDATA[event]]></MsgType>
                <Event><![CDATA[subscribe]]></Event>
                <EventKey><![CDATA[]]></EventKey>
            </xml>*/
            // 将 XML 格式的数据转为 JSON
            const content = await util.parseXMLAsync(data)
            console.log( content, 'content' )
            /*{
                xml: {
                    ToUserName: [ 'gh_eda0f88df83c' ],
                    FromUserName: [ 'oDVEn1AIhUMQaybpRNEyzJqLj3kY' ],
                    CreateTime: [ '1512976806' ],
                    MsgType: [ 'event' ],
                    Event: [ 'subscribe' ],
                    EventKey: [ '' ]
                 }
             }*/

            const message = util.formatMassage(content.xml)
            console.log(message, 'message')

            ctx.weixinMsg = message

            await handler.call(ctx, next)

            weChat.reply.call(ctx)
            /*if(message.MsgType === 'event') {
                if(message.Event === 'subscribe') { // 订阅事件
                    const now = Date.now()
                    const reply = `<xml>
                        <ToUserName><![CDATA[${message.FromUserName}]]></ToUserName>
                        <FromUserName><![CDATA[${message.ToUserName}]]></FromUserName>
                        <CreateTime>${now}</CreateTime>
                        <MsgType><![CDATA[text]]></MsgType>
                        <Content><![CDATA[欢迎您的关注]]></Content>
                    </xml>`
                    ctx.status = 200
                    ctx.type = 'application/xml'
                    ctx.body = reply
                    // console.log(ctx.response.body, 'ctx.response.body')
                    return
                }
            } else {
                const now = Date.now()
                ctx.status = 200
                ctx.type = 'application/xml'
                ctx.body = `<xml>
                    <ToUserName><![CDATA[${message.FromUserName}]]></ToUserName>
                    <FromUserName><![CDATA[${message.ToUserName}]]></FromUserName>
                    <CreateTime>${now}</CreateTime>
                    <MsgType><![CDATA[text]]></MsgType>
                    <Content><![CDATA[你好， ^_^]]></Content>
                    <MsgId><![CDATA[${message.MsgId}]]></MsgId>
                </xml>`
            }*/
        }
    }
}
