'use strict'

const Movie = require('../app/api/movie')
const serverUrl = require('../config/serverUrl')

const help = `回复 1，测试文字回复
回复 2，测试图文回复
回复 首页，进入电影首页
回复 电影名字，查询电影信息
回复 语音，查询电影信息
也可以点击 <a href="http://cpjp22.natappfree.cc/movie">语音查电影</a>
`

exports.reply = async function(next) {
    // await next()
    // 这里的this为 generator 里面的 async 中的ctx
    const message = this.weixinMsg

    if(message.MsgType === 'event') {
        switch(message.Event) {
            case 'subscribe':
                // this.body = '山无棱，天地合，都不许取关!^_^\r\n 消息ID：' + message.MsgId
                this.body = `山无棱，天地合，都不许取关! ^_^\n${help}`
                break;
            case 'unsubscribe':
                console.log('无情取关!')
                this.body = ' '
                break;
            case 'LOCATION':
                this.body = '您上报的位置是：' + message.Latitude + '/' + message.Longitude + '-' + message.Precision
                break;
            case 'SCAN':
                console.log('关注后扫二维码' + message.EventKey + ' ' + message.Ticket)
                this.body = '看到你少了一下哦'
                break;
            case 'CLICK':
                let news = []
                let isClickCategory = false
                let movies, categoryName, cate
                switch(message.EventKey) {
                    case 'movie_hot':
                        movies = await Movie.findHotMovies(-1, 8)
                        movies.forEach( movie => {
                            news.push({
                                title: movie.title,
                                discription: movie.title,
                                picUrl: movie.poster,
                                url: `${serverUrl.url}weChat/jump/${movie._id}`
                            })
                        })
                        break;
                    case 'movie_cold':
                        movies = await Movie.findHotMovies(1, 8)
                        movies.forEach( movie => {
                            news.push({
                                title: movie.title,
                                discription: movie.title,
                                picUrl: movie.poster,
                                url: `${serverUrl.url}weChat/jump/${movie._id}`
                            })
                        })
                        break;
                    case 'movie_crime':
                        categoryName = '犯罪'
                        isClickCategory = true
                        break;
                    case 'movie_cartoon':
                        categoryName = '动画'
                        isClickCategory = true
                        break;
                    case 'movie_history':
                        categoryName = '历史'
                        isClickCategory = true
                        break;
                    case 'movie_war':
                        categoryName = '战争'
                        isClickCategory = true
                        break;
                    case 'movie_love':
                        categoryName = '爱情'
                        isClickCategory = true
                        break;
                    case 'help':
                        news = help
                        break;
                    default:
                        break;
                }

                if(isClickCategory) {
                    cate = await Movie.findMoviesByCate(categoryName)
                    if(cate && cate.movies) {
                        cate.movies.forEach( movie => {
                            news.push({
                                title: movie.title,
                                discription: movie.title,
                                picUrl: movie.poster,
                                url: `${serverUrl.url}weChat/jump/${movie._id}`
                            })
                        })
                    } else {
                        news = '暂无数据'
                    }
                }
                this.body = news
                break;
            default:
                break;
        }
    } else if(message.MsgType === 'text') {
        const content = message.Content
        let reply = '额，你说的 ' + content + ' 太复杂了'
        // let data, mpnews, text, image, msgData, result
        switch(content) {
            case '1':
                reply = '文本内容回复测试成功'
                break;
            case '2':
                reply = [
                    {
                        title: 'Nodejs中文网',
                        description: 'Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行环境。',
                        picUrl: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1513057508576&di=b20ddee80b35dc0d0672a3ffe0efe6f6&imgtype=0&src=http%3A%2F%2Ffile.itnpc.com%2F20151215%2F93dd522963acb1f6f3ba853626c6de92.jpg',
                        url: 'http://nodejs.cn/'
                    }/*, {
                        title: '慕课网',
                        description: '程序员的梦工厂',
                        picUrl: 'https://www.imooc.com/static/img/index/logo_new.png',
                        url: 'https://www.imooc.com/'
                    }*/
                ]
                break;
            default:
                let movies = await Movie.searchByName(content)
                if(!movies || movies.length === 0) {
                    movies = await Movie.searchByDouban(content)
                }

                if(movies && movies.length > 0) {
                    reply = []
                    movies = movies.slice(0, 8)
                    movies.forEach( movie => {
                        reply.push({
                            title: movie.title,
                            description: movie.title,
                            picUrl: movie.poster,
                            url: `${serverUrl.url}weChat/jump/${movie._id}`
                        })
                    })
                } else {
                    reply = `没有查询到与“${content}”匹配的电影，要不要换一个名字试试`
                }
                break;
        }
        this.body = reply
    } else if(message.MsgType === 'voice') {
        let reply
        const voiceText = message.Recognition
        const movies = await Movie.searchByName(voiceText)
        if(!movies || movies.length === 0) {
            movies = await Movie.searchByDouban(voiceText)
        }

        if(movies && movies.length > 0) {
            reply = []
            movies = movies.slice(0, 8)
            movies.forEach( movie => {
                reply.push({
                    title: movie.title,
                    description: movie.title,
                    picUrl: movie.poster,
                    url: `${serverUrl.url}weChat/jump/${movie._id}`
                })
            })
        } else {
            reply = `没有查询到与“${content}”匹配的电影，要不要换一个名字试试`
        }
        this.body = reply
    }
}
