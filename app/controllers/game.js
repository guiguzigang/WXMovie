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
const serverUrl = require('../../config/serverUrl')

exports.guess = async (ctx, next) => {
    const weChatApi = wx.getWeChat()
    const data = await weChatApi.fetchAccessToken()
    console.log(data)
    const access_token = data.access_token
    const ticketData = await weChatApi.fetchTicket(access_token)
    const ticket = ticketData.ticket
    const url = ctx.href
    const params = util.createSignature(ticket, url)

    // ctx.body = await ctx.render('weChat/game', params)
    await ctx.render('weChat/game', params)
}

exports.jump = async (ctx, next) => {
    const movieId = ctx.params.id
    const redirect = `${serverUrl.url}weChat/movie/${movieId}`
    const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${wx.weChatOptions.weChat.appID}&redirect_uri=${redirect}&response_type=code&scope=snsapi_userinfo&state=${movieId}#wechat_redirect`

    ctx.redirect(url)
}

exports.find = async (ctx, next) => {
    const code = ctx.query.code
    const openUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${wx.weChatOptions.weChat.appID}&secret=${wx.weChatOptions.weChat.appSecret}&code=${code}&grant_type=authorization_code`

    // const response = await koa_request({ url: openUrl })
    // const body = JSON.parse(response.body)

    const body = await request({ url: openUrl, json: true }).then( response => Promise.resolve( response.body ))
    const openid = body.openid
    let user = await User.findOne({ openid }).exec()

    if( !user ) {
        user = new User({
            openid,
            password: '123456', // 初始密码
            name: Math.random().toString(36).substr(2) // 初始用户名
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
