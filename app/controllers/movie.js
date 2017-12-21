'use strict'

const mongoose = require('mongoose')
const Movie = mongoose.model('Movie')
const Category = mongoose.model('Category')
const Comment = mongoose.model('Comment')
const _ = require('lodash')
const fs = require('fs')
const path = require('path')

// detail page
exports.detail = async (ctx, next) => {
    const id = ctx.params.id

    Movie.update({ _id: id }, { $inc: { pv: 1 } }).exec()

    const movie = await Movie.findOne({ _id: id}).exec()
    const comments = await Comment.find({movie: id}).populate('from', 'name').populate('reply.from reply.to', 'name').exec()

    await ctx.render('pages/detail', {
        title: 'movie 详情页',
        movie: movie,
        comments: comments
    })
}

// admin new page
exports.new = async (ctx, next) => {
    const categories = await Category.find({}).exec()
    await ctx.render('pages/admin', {
        title: 'movie 后台录入页',
        categories: categories,
        movie: {}
    })
}

// admin update page
exports.update = async (ctx, next) => {
    const id = ctx.params.id

    if (id) {
        const movie = await Movie.findOne({ _id: id}).exec()
        const categories = await Category.find({}).exec()
        await ctx.render('pages/admin', {
            title: 'movie 后台更新页',
            movie: movie,
            categories: categories
        })
    }
}

const util = require('../../libs/util')

// admin poster
exports.savePoster = async (ctx, next) => {
    const posterData = ctx.request.body.files.uploadPoster
    const filePath = posterData.path
    const name = posterData.name

    if (name) {
        const data = await util.readFileAsync(filePath)
        const timestamp = Date.now()
        const type = posterData.type.split('/')[1]
        const poster = timestamp + '.' + type
        const newPath = path.join(__dirname, '../../', '/public/upload/' + poster)
        console.log(data, newPath, 'data, newPath')
        await util.writeFileAsync(newPath, data)
        ctx.poster = poster
    }
    await next()
}

// admin post movie
exports.save = async (ctx, next) => {
    // 表单域
    const movieObj = ctx.request.body.fields || {}
    let _movie
    // console.log(movieObj , 'movieObj ')
    if (ctx.poster) {
        movieObj.poster = ctx.poster
    }
    // console.log(movieObj._id, movieObj, 'movieObj._id')
    if (movieObj._id) {
        const movie = await Movie.findOne({ _id: movieObj._id}).exec()
        // _movie = _.extend(movie, movieObj)
        _movie = Object.assign(movie, movieObj)
        await _movie.save()
        ctx.redirect('/movie/' + movie._id)
    } else {
        _movie = new Movie(movieObj)

        const categoryId = movieObj.category
        const categoryName = movieObj.categoryName

        let movie = await _movie.save()
        if (categoryId) {
            const category = await Category.findOne({ _id: categoryId}).exec()

            category.movies.push(movie._id)
            await category.save()

            ctx.redirect('/movie/' + movie._id)
        } else if (categoryName) {
            let category = new Category({
                name: categoryName,
                movies: [movie._id]
            })

            category = await category.save()
            movie.category = category._id
            movie = await movie.save()
            ctx.redirect('/movie/' + movie._id)
        }
    }
}

// list page
exports.list = async (ctx, next) => {
    const movies = await Movie.find({}).populate('category', 'name').exec()
    await ctx.render('pages/list', {
        title: 'movie 列表页',
        movies: movies
    })
}

// list page
exports.del = async (ctx, next) => {
    const id = ctx.query.id

    if (id) {
        try {
            await Movie.remove({_id: id}).exec()
            ctx.body = {success: 1}
        } catch (err) {
            ctx.body = {success: 0}
        }
    }
}
