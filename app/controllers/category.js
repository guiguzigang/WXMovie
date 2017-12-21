'use strict'

const mongoose = require('mongoose')
const Category = mongoose.model('Category')

// admin new page
exports.new = async (ctx, next) => {

    await ctx.render('pages/category_admin', {
        title: 'movie 后台分类录入页',
        category: {}
    })
}

// admin post movie
exports.save = async (ctx, next) => {
    const _category = ctx.request.body.category
    const category = new Category(_category)
    console.log(11111)
    await category.save()

    ctx.redirect('/admin/category/list')
}

// catelist page
exports.list = async (ctx, next) => {
    const catetories = await Category.fetch()
    await ctx.render('pages/categorylist', {
        title: 'movie 分类列表页',
        catetories: catetories
    })
}
