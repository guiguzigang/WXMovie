'use strict'

const Koa = require('koa')
const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')

const dbUrl = 'mongodb://localhost/movie'

mongoose.Promise = global.Promise
mongoose.connect(dbUrl, {
    useMongoClient: true
})
// models loading
const models_path = __dirname + '/app/models'
const walk = function(path) {
    fs.readdirSync(path).forEach(file => {
        const newPath = path + '/' + file
        const stat = fs.statSync(newPath)

        if (stat.isFile()) {
            if (/(.*)\.(js|coffee)/.test(file)) {
                require(newPath)
            }
        } else if (stat.isDirectory()) {
            walk(newPath)
        }
    })
}
walk(models_path)

const menu = require('./wx/menu')
const wx = require('./wx/index')
const weChatApi = wx.getWeChat()

// 初始菜单，先删除所有菜单以防菜单定义初始有问题
weChatApi.deleteMenu().then( _ => {
    // console.log(menu.defaultMenu)
    return weChatApi.createMenu(menu.defaultMenu)
}).then( msg => {
    console.log(msg)
})

const app = new Koa()
const Router = require('koa-router')
const session = require('koa-session')
const bodyParser = require('koa-bodyparser')
const moment = require('moment')
const router = new Router()
const User = mongoose.model('User')
const PORT = 8058

const views = require('koa-views')
app.use(views(__dirname + '/app/views', {
    extension: 'jade',
    /*locals: {
        moment: moment
    }*/
}))

app.keys = ['wexin_dev']
app.use(session(app))
app.use(bodyParser())

app.use( async (ctx, next) => {
    // 设置全局变量
    ctx.state = Object.assign(ctx.state, {
        moment: moment
    })
    const user = ctx.session.user
    if(user && user._id) {
        ctx.session.user = await User.findOne({_id: user._id}).exec()
        ctx.state.user = ctx.session.user
    } else {
        ctx.state.user = null
    }
    await next()
})

require('./config/routes')(router)

/*
router.get('/movie', game.guess)
router.get('/movie/:id', game.find)
router.get('/wx', weChat.hear)
router.post('/wx', weChat.hear)*/

app.use(router.routes())
    .use(router.allowedMethods())

app.listen(PORT)
console.log('Listen on port: ' + PORT)
