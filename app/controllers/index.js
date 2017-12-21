const Movie = require('../api/movie')

// index page
exports.index = async (ctx, next) => {
    const categories = await Movie.findAll()

    await ctx.render('pages/index', {
        title: 'movie 首页',
        categories: categories
    })
}

// search page
exports.search = async (ctx, next) => {
    // console.log(ctx.query)
    const catId = ctx.query.cat
    const q = ctx.query.q
    const page = parseInt(ctx.query.p, 10) || 0
    const count = 2
    const index = page * count

    if (catId) {
        const categories = await Movie.searchByCategory(catId)
        const category = categories[0] || {}
        const movies = category.movies || []
        const results = movies.slice(index, index + count)

        await ctx.render('pages/results', {
            title: 'imooc 结果列表页面',
            keyword: category.name,
            currentPage: (page + 1),
            query: 'cat=' + catId,
            totalPage: Math.ceil(movies.length / count),
            movies: results
        })
    } else {
        const movies = await Movie.searchByName(encodeURIComponent( q ))
        const results = movies.slice(index, index + count)

        await ctx.render('pages/results', {
            title: 'imooc 结果列表页面',
            keyword: q,
            currentPage: (page + 1),
            query: 'q=' + q,
            totalPage: Math.ceil(movies.length / count),
            movies: results
        })
    }
}
