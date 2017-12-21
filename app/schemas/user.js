const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const SALT_WORK_FACTOR = 10

const UserSchema = new mongoose.Schema({
    name: {
        unique: true,
        type: String
    },
    password: String,
    openid: String,
    // 0: nomal user
    // 1: verified user
    // 2: professonal user
    // >10: admin
    // >50: super admin
    role: {
        type: Number,
        default: 0
    },
    meta: {
        createAt: {
            type: Date,
            default: Date.now()
        },
        updateAt: {
            type: Date,
            default: Date.now()
        }
    }
})

UserSchema.pre('save', function(next) {

    if (this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now()
    } else {
        this.meta.updateAt = Date.now()
    }

    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
        if (err) return next(err)

        bcrypt.hash(this.password, salt, (err, hash) => {
            if (err) return next(err)

            this.password = hash
            next()
        })
    })
})

UserSchema.methods = {
    comparePassword: function(_password, password) {
        return (cb) => {
            bcrypt.compare(_password, password, (err, isMatch) => {
                cb(null, isMatch)
            })
        }
    }
}

UserSchema.statics = {
    fetch: function(cb) {
        return this.find({}).sort('meta.updateAt').exec(cb)
    },
    findById: function(id, cb) {
        return this.findOne({_id: id}).exec(cb)
    }
}

module.exports = UserSchema
