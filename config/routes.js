'use strict'

const Index = require('../app/controllers/index')
const User = require('../app/controllers/user')
const Movie = require('../app/controllers/movie')
const Game = require('../app/controllers/game')
const WeChat = require('../app/controllers/weChat')
const Comment = require('../app/controllers/comment')
const Category = require('../app/controllers/category')
// const multipart = require('connect-multiparty')
// const mutipartMiddleware = multipart()
const koaBody = require('koa-body')

module.exports = function(router) {
    // Index
    router.get('/', Index.index)

    // User
    router.post('/user/signup', User.signup)
    router.post('/user/signin', User.signin)
    router.get('/signin', User.showSignin)
    router.get('/signup', User.showSignup)
    router.get('/logout', User.logout)
    router.get('/admin/user/list', User.signinRequired, User.adminRequired, User.list)

    // weChat
    router.get('/weChat/movie', Game.guess)
    router.get('/weChat/movie/:id', Game.find)
    router.get('/weChat/jump/:id', Game.jump)
    router.get('/wx', WeChat.hear)
    router.post('/wx', WeChat.hear)


    // Movie
    router.get('/movie/:id', Movie.detail)
    router.get('/admin/movie/new', User.signinRequired, User.adminRequired, Movie.new)
    router.get('/admin/movie/update/:id', User.signinRequired, User.adminRequired, Movie.update)
    // router.post('/admin/movie', mutipartMiddleware, User.signinRequired, User.adminRequired, Movie.savePoster, Movie.save)
    router.post('/admin/movie', User.signinRequired, User.adminRequired, koaBody({multipart: true}), Movie.savePoster, Movie.save)
    router.get('/admin/movie/list', User.signinRequired, User.adminRequired, Movie.list)
    router.delete('/admin/movie/list', User.signinRequired, User.adminRequired, Movie.del)

    // Comment
    router.post('/user/comment', User.signinRequired, Comment.save)

    // Category
    router.get('/admin/category/new', User.signinRequired, User.adminRequired, Category.new)
    router.post('/admin/category', User.signinRequired, User.adminRequired, Category.save)
    router.get('/admin/category/list', User.signinRequired, User.adminRequired, Category.list)

    // results
    router.get('/results', Index.search)
}
