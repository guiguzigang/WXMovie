'use strict'

const fs = require('fs')
const Promise = require('bluebird')

/**
 * [writeFileAsync 将内容写入文件]
 * @param  {[type]} fpath   [文件路径]
 * @param  {[type]} content [将写入文件的内容]
 * @return {[type]}         [description]
 */
exports.readFileAsync = (fpath, encoding) => {
    return new Promise( (resolve, reject) => {
        fs.readFile(fpath, encoding, (err, content) => {
            if(err) {
                reject(err)
            } else {
                resolve(content)
            }
        })
    })
}

/**
 * [writeFileAsync 将内容写入文件]
 * @param  {[type]} fpath   [文件路径]
 * @param  {[type]} content [将写入文件的内容]
 * @return {[type]}         [description]
 */
exports.writeFileAsync = (fpath, content) => {
    return new Promise( (resolve, reject) => {
        fs.writeFile(fpath, content, err => {
            if(err) {
                reject(err)
            } else {
                resolve()
            }
        })
    })
}




const crypto = require('crypto')
// 生成随机字符串
const createNonce = _ => {
    return Math.random().toString(36).substr(2, 15)
}
// 生成时间戳
const createTimestamp = _ => {
    return parseInt(new Date().getTime() / 1000, 10) + ''
}

const _createSignature = (noncestr, ticket, timestamp, url) => {
    const params = [`noncestr=${noncestr}`, `jsapi_ticket=${ticket}`, `timestamp=${timestamp}`, `url=${url}`]
    const str = params.sort().join('&')
    const shasum = crypto.createHash('sha1')
    // 进行sha1签名
    shasum.update(str)
    return shasum.digest('hex')
}

exports.createSignature = (ticket, url) => {
    const noncestr = createNonce()
    const timestamp = createTimestamp()
    const signature = _createSignature(noncestr, ticket, timestamp, url)
    // console.log(noncestr, ticket, timestamp, url, 'noncestr, ticket, timestamp, url')
    return {
        noncestr,
        timestamp,
        signature
    }
}
