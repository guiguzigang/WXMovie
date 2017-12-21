const mongoose = require('mongoose')
const Comment = mongoose.model('Comment')

// comment
exports.save = async (ctx, next) => {
    const _comment = ctx.request.body.comment
    const movieId = _comment.movie
    console.log(_comment)
    if (_comment.cid) {
        const comment = await Comment.findOne({_id: _comment.cid}).exec()
        const reply = {
            from: _comment.from,
            to: _comment.tid,
            content: _comment.content
        }
        comment.reply.push(reply)
        await comment.save()

        // ctx.redirect('/movie/' + movieId)
        ctx.body = {success: 1}
    } else {
        // const comment = new Comment(_comment)
        const comment = new Comment({
            movie: _comment.movie,
            from: _comment.from,
            content: _comment.content,
        })

        await comment.save()

        // ctx.redirect('/movie/' + movieId)
        ctx.body = {success: 1}
    }
}
