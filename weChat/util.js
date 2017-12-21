'use strict'

const xml2js = require('xml2js')
const Promise = require('bluebird')
const template = require('./template')

/**
 * [parseXMLAsync 将xml格式的数据转换成json格式]
 * @param  {[type]} xml [description]
 * @return {[type]}     [description]
 */
exports.parseXMLAsync = xml => {
    return new Promise((resolve, reject) => {
        xml2js.parseString(xml, { trim: true }, (err, content) => {
            if(err) {
                reject(err)
            } else {
                resolve(content)
            }
        })
    })
}

/**
 * [formatMassage 将xml转换成json的数据继续格式化成可以使用的正常的json数据]
 * @param  {[type]} result [description]
 * @return {[type]}        [description]
 */
const formatMassage = result => {
    const message = {}
    if(typeof result === 'object') {
        const keys = Object.keys(result)
        for(let i = 0; i < keys.length; i++) {
            const item = result[keys[i]]
            const key = keys[i]

            if(!(item instanceof Array) || item.length === 0) {
                continue
            }
            if(item.length === 1) {
                const val = item[0]
                if(typeof val === 'object') {
                    message[key] = formatMassage(val)
                } else {
                    message[key] = (val || '').trim()
                }
            } else {
                message[key] = []
                for(let j = 0, k = item.length; j < k; j++) {
                    message[key].push(formatMassage(item[j]))
                }
            }
        }
    }

    return message
}

exports.formatMassage = formatMassage

/**
 * [tpl 将json格式的数据转成xml格式的数据，并返回]
 * @param  {[type]} content [回复的内容]
 * @param  {[type]} message [消息类型等]
 * @return {[type]}         [description]
 */
exports.tpl = (content, message) => {
    const info = {}
    let type = 'text'
    const toUserName = message.ToUserName
    const fromUserName = message.FromUserName

    if(Array.isArray(content)) {
        type = 'news'
    }
    console.log(content, 'content util')
    type = content && content.type || type
    info.content = content
    info.createTime = Date.now()
    info.msgType = type
    info.toUserName = fromUserName
    info.fromUserName = toUserName

    return template.compiled(info)
}
