const mongoose = require('mongoose')
const koa_request = require('koa-request')
const Movie = mongoose.model('Movie')
const Category = mongoose.model('Category')
const Promise = require('bluebird')
const request = Promise.promisify(require('request'))

// index page
exports.findAll = async () => {
    const categories = await Category.find({}).populate({
        path: 'movies',
        select: 'title poster',
        options: {
            limit: 6
        }
    }).exec()
    return categories
}

// search page
exports.searchByCategory = async (catId) => {
    const categories = await Category.findOne({_id: catId})
                                .populate({path: 'movies', select: 'title poster'})
                                .exec()
    return categories
}

exports.searchByName = async (query) => {
    const movies = await Movie.find({ title: new RegExp(query + '.*', 'i') }).exec()
    return movies
}

exports.searchById = async (id) => {
    const movie = await Movie.findOne({ _id: id }).exec()
    return movie
}

/**
 * [findHotMovies 获取电影排行榜]
 * @param  {[type]}  hot   [热门电影 -1，或冷门电影 1]
 * @param  {[type]}  count [查询多少条]
 * @return {Promise}       [description]
 */
exports.findHotMovies = async (hot, count) => {
    const movies = await Movie.find({}).sort({'pv': hot}).limit(count).exec()
    return movies
}

/**
 * [findMoviesByCate 按类别获取电影]
 * @param  {[type]}  cat [类别名称]
 * @return {Promise}     [description]
 */
exports.findMoviesByCate = async (cat) => {
    console.log(cat)
    const category = await Category.findOne({name: cat}).populate({path: 'movies', select: 'title poster _id'}).exec()
    console.log(category)
    return category
}

/**
 * [updateMovies 更新电影]
 * @param  {[type]} movie [description]
 * @return {[type]}       [description]
 */
const updateMovies = movie => {
    const options = {
        url: `https://api.douban.com/v2/movie/subject/${movie.doubanId}`,
        json: true
    }
    request(options).then( response => {
        const data = response.body
        /*movie = {
            ...movie,
            country: data.countries[0],
            language: data.language,
            summary: data.summary
        }*/
        movie = Object.assign(movie, {
            country: data.countries[0],
            language: data.language,
            summary: data.summary
        })

        const genres = movie.genres
        const cateArray = []
        // 如果有分类
        if(genres && genres.length > 0) {
            genres.forEach( genre => {
                cateArray.push( (async () => {
                    let cat = await Category.findOne({name: genre}).exec()
                    if(cat) {
                        cat.movies.push(movie._id)
                        await cat.save()
                    } else {
                        cat = new Category({
                            name: genre,
                            movies: [movie._id]
                        })

                        cat = await cat.save()
                        movie.category = cat._id

                        await movie.save()
                    }
                })())
            })
            Promise.all(cateArray)
        } else {
            movie.save()
        }
        // console.log(movie.summary, movie, 'movie.summary, movie')
    })
}

exports.searchByDouban = async (query) => {
    const options = {
        url: 'https://api.douban.com/v2/movie/search?q=',
        json: true
    }
    options.url += encodeURIComponent( query )
    // const response = await koa_request(options)
    // const data = JSON.parse(response.body)
    const data = await request(options).then( response => Promise.resolve( response.body ))

    let subjects = []
    let movies = []

    if(data && data.subjects) {
        subjects = data.subjects
    }

    if(subjects.length > 0) {
        const queryArray = []
        subjects.forEach( item => {
            queryArray.push( (async () => {
                let movie = await Movie.findOne({ doubanId: item.id })
                // console.log(movie, 'movie')
                if(movie) { // 如果数据库中存在
                    movies.push(movie)
                } else {
                    const directors = item.directors || []
                    const director = directors[0] || {}

                    movie = new Movie({
                        director: director.name || '',
                        title: item.title,
                        doubanId: item.id,
                        poster: item.images.large,
                        year: item.year,
                        genres: item.genres || [], // 种类
                    })
                    movies.push(movie)
                    movie = await movie.save() // 存储到数据库
                }
            })())
        })
        await Promise.all(queryArray)
        movies.forEach( movie => {
            updateMovies(movie)
        })
    }
    return movies
}
