'use strict'

const mongoose = require('mongoose')
const User = mongoose.model('User')

// signup
exports.showSignup = async (ctx, next)  => {
    await ctx.render('pages/signup', {title: '注册页面'})
}

exports.showSignin = async (ctx, next)  => {
    await ctx.render('pages/signin', {title: '登录页面'})
}

exports.signup = async (ctx, next)  => {
    const _user = ctx.request.body.user

    let user = await User.findOne({ name: _user.name }).exec()

    if (user) {
        ctx.redirect('/signin')
    } else {
        user = new User(_user)
        await user.save()

        ctx.session.user = user

        ctx.redirect('/')
    }
}

// signin
exports.signin = async (ctx, next) => {
    const _user = ctx.request.body.user
    const name = _user.name
    const password = _user.password

    let user = await User.findOne({ name: name }).exec()
    if (!user) {
        ctx.redirect('/signup')
        return await next()
    }

    // 验证密码
    const isMatch = await user.comparePassword(password, user.password)

    if (isMatch) {
        ctx.session.user = user
        ctx.redirect('/')
    } else {
        ctx.redirect('/signin')
    }
}

// logout
exports.logout = async (ctx, next) => {
    delete ctx.session.user
    //delete app.locals.user

    ctx.redirect('/')
}

// userlist page
exports.list = async (ctx, next) => {
    const users = await User.fetch({})
    await ctx.render('pages/userlist', {
        title: 'movie 用户列表页',
        users: users
    })
}

// midware for user
exports.signinRequired = async (ctx, next) => {
    const user = ctx.session.user
    // console.log(!user)
    if (!user) {
        return ctx.redirect('/signin')
    }
    await next()
}

exports.adminRequired = async (ctx, next) => {
    const user = ctx.session.user
    console.log(user)
    if (user && user.role <= 10) { // 小于10 说明不是管理员
        return ctx.redirect('/signin')
    }
    await next()
}
