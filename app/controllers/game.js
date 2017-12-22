'use strict'
const koa_request = require('koa-request')
const Promise = require('bluebird')
const request = Promise.promisify(require('request'))
const mongoose = require('mongoose')
const User = mongoose.model('User')
const Comment = mongoose.model('Comment')
const util = require('../../libs/util')
const wx = require('../../wx/index')
const Movie = require('../api/movie')

exports.guess = async (ctx, next) => {
    const weChatApi = wx.getWeChat()
    const data = await weChatApi.fetchAccessToken()
    // console.log(data)
    const access_token = data.access_token
    const ticketData = await weChatApi.fetchTicket(access_token)
    const ticket = ticketData.ticket
    const url = ctx.href
    const params = util.createSignature(ticket, url)

    // ctx.body = await ctx.render('weChat/game', params)
    await ctx.render('weChat/game', Object.assign(params, {appID: wx.weChatOptions.weChat.appID}))
}

/**
 * [jump 微信网页授权 重定向链接地址]
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {Promise}       [description]
 */
exports.jump = async (ctx, next) => {
    const movieId = ctx.params.id
    const redirect = `${wx.weChatOptions.weChat.url}weChat/movie/${movieId}`
    // console.log(redirect)
    // scope为 snsapi_base
    // const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${wx.weChatOptions.weChat.appID}&redirect_uri=${redirect}&response_type=code&scope=snsapi_base&state=${movieId}#wechat_redirect`
    // scope为 snsapi_userinfo
    const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${wx.weChatOptions.weChat.appID}&redirect_uri=${redirect}&response_type=code&scope=snsapi_userinfo&state=${movieId}#wechat_redirect`

    ctx.redirect(url)
}

exports.find = async (ctx, next) => {
    // 用户同意授权后， 页面将跳转至 redirect_uri/?code=CODE&state=STATE。
    const code = ctx.query.code
    const openUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${wx.weChatOptions.weChat.appID}&secret=${wx.weChatOptions.weChat.appSecret}&code=${code}&grant_type=authorization_code`
    console.log(openUrl)
    const body = await request({ url: openUrl, json: true }).then( response => Promise.resolve( response.body ))
    console.log(body, 'game body')
    const openid = body.openid

    let user = await User.findOne({ openid }).exec()

    if( !user || !user.name ) {
        // 网页授权的access_token
        const web_access_token = body.access_token
        const userinfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${web_access_token}&openid=${openid}&lang=zh_CN`
        const userinfo = await request({ url: userinfoUrl, json: true }).then( response => Promise.resolve( response.body ))
        user = new User({
            openid,
            // nickname: userinfo.nickname,
            sex: userinfo.sex,  // 值为1时是男性，值为2时是女性，值为0时是未知
            province: userinfo.province,
            city: userinfo.city,
            country: userinfo.country,
            headimgurl: userinfo.headimgurl,
            privilege: userinfo.privilege, // 用户特权信息，json 数组，如微信沃卡用户为（chinaunicom）
            unionid: userinfo.unionid, // 用户特权信息，json 数组，如微信沃卡用户为（chinaunicom）
            password: '123456', // 初始密码
            name: userinfo.nickname // 初始用户名
            // name: Math.random().toString(36).substr(2) // 初始用户名
        })
        user = await user.save()
    }

    ctx.session.user = user
    ctx.state.user = user

    const id = ctx.params.id
    const weChatApi = wx.getWeChat()
    const data = await weChatApi.fetchAccessToken()
    // console.log(data)
    const access_token = data.access_token
    const ticketData = await weChatApi.fetchTicket(access_token)
    const ticket = ticketData.ticket
    const url = ctx.href
    const params = util.createSignature(ticket, url)
    const movie = await Movie.searchById(id)
    const comments = await Comment.find({movie: id}).populate('from', 'name').populate('reply.from reply.to', 'name').exec()
    console.log(comments)
    params.movie = movie
    params.comments = comments
    // ctx.body = await ctx.render('weChat/game', params)
    await ctx.render('weChat/movie', params)
}
