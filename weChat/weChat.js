'use strict'

const fs = require('fs')
const Promise = require('bluebird')
const request = Promise.promisify(require('request'))
const util = require('./util')
// 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET'
const prefix = 'https://api.weixin.qq.com/cgi-bin/'
const mpPrefix = 'https://mp.weixin.qq.com/cgi-bin/'
const semanticUrl = 'https://api.weixin.qq.com/semantic/semproxy/search'
const api = {
    semanticUrl,
    accessToken: `${prefix}token?grant_type=client_credential`,
    temporary: {
        // 新增临时素材 http请求方式：POST/FORM，使用https https://api.weixin.qq.com/cgi-bin/media/upload?access_token=ACCESS_TOKEN&type=TYPE
        upload: `${prefix}media/upload?`,
        // 获取临时素材 请求方式: GET https://api.weixin.qq.com/cgi-bin/media/get?access_token=ACCESS_TOKEN&media_id=MEDIA_ID
        fetch: `${prefix}media/get?`
    },
    permanent: {
        // 新增其他类型永久素材  https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=ACCESS_TOKEN&type=TYPE
        upload: `${prefix}material/add_material?`,
        // 获取永久素材 请求方式: POST https://api.weixin.qq.com/cgi-bin/material/get_material?access_token=ACCESS_TOKEN
        fetch: `${prefix}material/get_material?`,
        // 新增永久图文素材  https://api.weixin.qq.com/cgi-bin/material/add_news?access_token=ACCESS_TOKEN
        uploadNews: `${prefix}material/add_news?`,
        // 上传图文消息内的图片获取URL  https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token=ACCESS_TOKEN
        uploadNewsPic: `${prefix}media/uploadimg?`,
        // 删除永久素材  https://api.weixin.qq.com/cgi-bin/material/del_material?access_token=ACCESS_TOKEN
        del: `${prefix}material/del_material?`,
        // 修改永久图文素材  https://api.weixin.qq.com/cgi-bin/material/update_news?access_token=ACCESS_TOKEN
        update: `${prefix}material/update_material?`,
        // 获取素材总数 请求方式: GET  https://api.weixin.qq.com/cgi-bin/material/get_materialcount?access_token=ACCESS_TOKEN
        count: `${prefix}material/get_materialcount?`,
        // 获取素材列表  https://api.weixin.qq.com/cgi-bin/material/batchget_material?access_token=ACCESS_TOKEN
        batch: `${prefix}material/batchget_material?`,
        // 获取media_id，群发时使用  https://api.weixin.qq.com/cgi-bin/media/uploadvideo?access_token=ACCESS_TOKEN
        uploadVideo: `${prefix}media/uploadvideo?`,
    },
    tag: {
        //  创建标签  https://api.weixin.qq.com/cgi-bin/tags/create?access_token=ACCESS_TOKEN
        create: `${prefix}tags/create?`,
        // 获取公众号已创建的标签  请求方式: GET   https://api.weixin.qq.com/cgi-bin/tags/get?access_token=ACCESS_TOKEN
        getTags: `${prefix}tags/get?`,
        // 编辑标签  https://api.weixin.qq.com/cgi-bin/tags/update?access_token=ACCESS_TOKEN
        update: `${prefix}tags/update?`,
        // 删除标签  https://api.weixin.qq.com/cgi-bin/tags/delete?access_token=ACCESS_TOKEN
        del: `${prefix}tags/delete?`,
        // 获取标签下粉丝列表  请求方式: GET  https://api.weixin.qq.com/cgi-bin/user/tag/get?access_token=ACCESS_TOKEN
        getUser: `${prefix}user/tag/get?`,
        // 批量为用户打标签 https://api.weixin.qq.com/cgi-bin/tags/members/batchtagging?access_token=ACCESS_TOKEN
        batchtagging: `${prefix}tags/members/batchtagging?`,
        // 批量为用户取消标签 https://api.weixin.qq.com/cgi-bin/tags/members/batchuntagging?access_token=ACCESS_TOKEN
        batchuntagging: `${prefix}tags/members/batchuntagging?`,
        // 获取用户身上的标签列表  https://api.weixin.qq.com/cgi-bin/tags/getidlist?access\_token=ACCESS\_TOKEN
        userTagsList: `${prefix}tags/getidlist?`,
    },
    user: {
        // 设置用户备注名  https://api.weixin.qq.com/cgi-bin/user/info/updateremark?access\_token=ACCESS\_TOKEN
        remark: `${prefix}user/info/updateremark?`,
        // 获取用户基本信息  http请求方式: GET https://api.weixin.qq.com/cgi-bin/user/info?access\_token=ACCESS\_TOKEN&openid=OPENID&lang=zh\_CN
        fetch: `${prefix}user/info?`,
        // 批量获取用户基本信息  https://api.weixin.qq.com/cgi-bin/user/info/batchget?access\_token=ACCESS\_TOKEN
        batchFetch: `${prefix}user/info/batchget?`,
        // 获取用户列表 http请求方式: GET  https://api.weixin.qq.com/cgi-bin/user/get?access\_token=ACCESS\_TOKEN&next\_openid=NEXT\_OPENID
        list: `${prefix}user/get?`,
    },
    mass: {
        // 根据标签进行群发  https://api.weixin.qq.com/cgi-bin/message/mass/sendall?access_token=ACCESS_TOKEN
        tag: `${prefix}message/mass/sendall?`,
        // 根据标签进行群发  https://api.weixin.qq.com/cgi-bin/message/mass/send?access_token=ACCESS_TOKEN
        openId: `${prefix}message/mass/send?`,
        // 删除群发  https://api.weixin.qq.com/cgi-bin/message/mass/delete?access_token=ACCESS_TOKEN
        del: `${prefix}message/mass/delete?`,
        // 预览接口  https://api.weixin.qq.com/cgi-bin/message/mass/preview?access_token=ACCESS_TOKEN
        preview: `${prefix}message/mass/preview?`,
        // 查询群发消息发送状态  https://api.weixin.qq.com/cgi-bin/message/mass/get?access_token=ACCESS_TOKEN
        check: `${prefix}message/mass/get?`,
    },
    menu: {
        // 自定义菜单创建接口  https://api.weixin.qq.com/cgi-bin/menu/create?access_token=ACCESS_TOKEN
        create: `${prefix}menu/create?`,
        // 获取自定义菜单配置接口 http请求方式: GET  https://api.weixin.qq.com/cgi-bin/menu/get?access_token=ACCESS_TOKEN
        get: `${prefix}menu/get?`,
        // 获取自定义菜单配置接口 http请求方式: GET  https://api.weixin.qq.com/cgi-bin/menu/delete?access_token=ACCESS_TOKEN
        del: `${prefix}menu/delete?`,
        // 获取自定义菜单配置接口 http请求方式: GET  https://api.weixin.qq.com/cgi-bin/get_current_selfmenu_info?access_token=ACCESS_TOKEN
        current: `${prefix}get_current_selfmenu_info?`,
        // 创建个性化菜单  https://api.weixin.qq.com/cgi-bin/menu/addconditional?access_token=ACCESS_TOKEN
        addconditional: `${prefix}menu/addconditional?`,
        // 删除个性化菜单  https://api.weixin.qq.com/cgi-bin/menu/delconditional?access_token=ACCESS_TOKEN
        delconditional: `${prefix}menu/delconditional?`,
        // 测试个性化菜单匹配结果 http请求方式: GET  https://api.weixin.qq.com/cgi-bin/menu/trymatch?access_token=ACCESS_TOKEN
        trymatch: `${prefix}menu/trymatch?`,
    },
    qrcode: {
        // 创建二维码ticket  https://api.weixin.qq.com/cgi-bin/qrcode/create?access\_token=TOKENPOST
        create: `${prefix}qrcode/create?`,
        // 通过ticket换取二维码  HTTP GET请求（请使用https协议）https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=TICKET
        show: `${mpPrefix}showqrcode?`
    },
    shortUrl: {
        // 长链接转短链接接口  https://api.weixin.qq.com/cgi-bin/shorturl?access\_token=ACCESS\_TOKEN
        create: `${prefix}shorturl?`
    },
    ticket: {
        // 获取jsapi_ticket  https://api.weixin.qq.com/cgi-bin/ticket/getticket?access\_token=ACCESS\_TOKEN&type=jsapi
        get: `${prefix}ticket/getticket?`,
    }
}

class WeChat {
    constructor(opts) {
        this.appID = opts.appID
        this.appSecret = opts.appSecret
        this.getAccessToken = opts.getAccessToken
        this.saveAccessToken = opts.saveAccessToken
        this.getTicket = opts.getTicket
        this.saveTicket = opts.saveTicket
        this.getAccessToken()
            .then( data => {
                try {
                    data = JSON.parse(data)
                } catch(e) {
                    return this.updateAccessToken()
                }

                if(this.isValidAccessToken(data)) {
                    return Promise.resolve(data)  // 这里不return 下面data为undefined
                } else {
                    return this.updateAccessToken()
                }
            })
            .then( data => {
                this.access_token = data.access_token
                this.expires_in = data.expires_in
                this.saveAccessToken(data)
            })
    }

    /**
     * [isValidAccessToken 验证token是否合法]
     * @param  {[type]}  data [description]
     * @return {Boolean}      [description]
     */
    isValidAccessToken(data) {
        if(!data || !data.access_token || !data.expires_in) {
            return false
        }
        const access_token = data.access_token
        const expires_in = data.expires_in
        const now = Date.now()

        return now < expires_in
    }

    /**
     * [updateAccessToken access_token没有或过期则更新]
     * @return {[type]} [description]
     */
    updateAccessToken() {
        const appID = this.appID
        const appSecret = this.appSecret
        const url = `${api.accessToken}&appid=${appID}&secret=${appSecret}`

        return new Promise((resolve, reject) => {
            request({ url, json: true }).then( response => {
                const data = response.body
                const now = Date.now()
                const expires_in = now + (data.expires_in - 20) * 1000    // -20为提前20秒刷新，以防网络延迟或其他因素的影响

                data.expires_in = expires_in
                // console.log(data)
                resolve(data)
            })
        })
    }

    // 获取access_token
    fetchAccessToken() {
        if(this.access_token && this.expires_in) {
            if(this.isValidAccessToken(this)) {
                return Promise.resolve(this)
            }
        }
        /*return new Promise((resolve, reject) => {
            this.getAccessToken()
            .then( data => {
                try {
                    data = JSON.parse(data)
                } catch(e) {
                    return Promise.resolve( this.updateAccessToken() )
                }
                if(this.isValidAccessToken(data)) {
                    return Promise.resolve(data)  // 这里不return 下面data为undefined
                } else {
                    return Promise.resolve( this.updateAccessToken() )
                }
            })
            .then( data => {

                this.access_token = data.access_token
                this.expires_in = data.expires_in
                this.saveAccessToken(data)

                return resolve(data)
            })
        })*/
        return this.getAccessToken()
            .then( data => {
                try {
                    data = JSON.parse(data)
                } catch(e) {
                    return this.updateAccessToken()
                }
                if(this.isValidAccessToken(data)) {
                    return Promise.resolve(data)  // 这里不return 下面data为undefined
                } else {
                    return this.updateAccessToken()
                }
            })
            .then( data => {
                // this.access_token = data.access_token
                // this.expires_in = data.expires_in
                this.saveAccessToken(data)

                return Promise.resolve(data)
            })
    }

    // 获取jsapi_ticket
    fetchTicket(access_token) {
        return this.getTicket()
            .then( data => {
                try {
                    data = JSON.parse(data)
                } catch(e) {
                    return this.updateTicket(access_token)
                }
                if(this.isValidTicket(data)) {
                    return Promise.resolve(data)  // 这里不return 下面data为undefined
                } else {
                    return this.updateTicket(access_token)
                }
            })
            .then( data => {
                this.saveTicket(data)

                return Promise.resolve(data)
            })
    }

    // 更新ticket
    updateTicket() {
        const url = `${api.ticket.get}access_token=${this.access_token}&type=jsapi`
        return new Promise((resolve, reject) => {
            request({ url, json: true }).then( response => {
                const data = response.body
                const now = Date.now()
                const expires_in = now + (data.expires_in - 20) * 1000    // -20为提前20秒刷新，以防网络延迟或其他因素的影响

                data.expires_in = expires_in
                // console.log(data)
                resolve(data)
            })
        })
    }

    //
    isValidTicket(data) {
        if(!data || !data.ticket || !data.expires_in) {
            return false
        }
        const ticket = data.ticket
        const expires_in = data.expires_in
        const now = Date.now()

        return ticket && (now < expires_in)
    }

    /**
     * [uploadMaterial 上传素材]
     * @param  {[type]} type      [素材类型]
     * @param  {[type]} material  [素材：素材类型为图文 =》数组， 素材类型图片或其他 =》路径]
     * @param  {[type]} permanent [临时素材不需要此参数，永久素材]
     * @return {[type]}           [description]
     */
    uploadMaterial(type, material, permanent) {
        let form = {}
        let uploadUrl = api.temporary.upload  // 默认为新增临时素材url
        if(permanent) {
            uploadUrl = api.permanent.upload
            form = {...permanent}
        }
        if(type === 'pic') {
            uploadUrl = api.permanent.uploadNewsPic
        }
        if(type === 'news') {
            uploadUrl = api.permanent.uploadNews
            form = {...material}  // 图文 material为数组
        } else {
            form.media = fs.createReadStream(material) // 图片、视频或其他素材为 路径
        }

        const appTD = this.appID
        const appSecret = this.appSecret

        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then(data => {
                    let url = `${uploadUrl}access_token=${data.access_token}`
                    if(!permanent) {
                        url += `&type=${type}`
                    } else {
                        if(type !== 'news' && type !== 'pic') {
                            url += `&type=${type}`
                        }
                        form.access_token = data.access_token
                    }
                    let options = {
                        method: 'POST',
                        url: url,
                        json: true
                    }
                    if(type === 'news') {
                        options.body = form  // application/x-www-form-urlencoded
                    } else {
                        options.formData = form  // 传文件要用 multipart/form-data
                    }

                    request(options).then( response => {
                        const _data = response.body

                        if(_data) {
                            resolve(_data)
                        } else {
                            throw new Error('Upload material fails')
                        }
                    }).catch(err => {
                        reject(err)
                    })
                }).catch(err => {
                    reject(err)
                })
        })
    }

    /**
     * [uploadVideo 获取media_id，群发时使用]
     * @param  {[type]} media_id    [description]
     * @param  {[type]} title       [description]
     * @param  {[type]} description [description]
     * @return {[type]}             [description]
     */
    uploadVideo(media_id, title, description) {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then( data => {
                    const url = `${api.permanent.uploadVideo}access_token=${data.access_token}`
                    const options = { media_id, title, description }
                    request({method: 'POST', url: url, body: options, json: true})
                        .then( response => {
                            const _data = response.body

                            if(_data) {
                                resolve(_data)
                            } else {
                                throw new Error ('get user tag list  fails')
                            }
                        }).catch(err => {
                            reject(err)
                        })
                }).catch(err => {
                    reject(err)
                })
        })
    }

    /**
     * [fetchMaterial 获取素材]
     * @param  {[string]} mediaId   [素材id]
     * @param  {[string]} type      [素材类型]
     * @param  {[type]} permanent [临时素材不需要此参数，永久素材]
     * @return {[type]}           [description]
     */
    fetchMaterial(mediaId, type, permanent) {
        let fetchUrl = api.temporary.fetch  // 默认为临时素材url
        if(permanent) {
            fetchUrl = api.permanent.fetch
        }

        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then(data => {
                    let url = `${fetchUrl}access_token=${data.access_token}`
                    let form = {}
                    let options = { method: 'POST', url: url, json: true}

                    if(permanent) {
                        form.media_id = mediaId
                        form.access_token = data.access_token
                        options.body = form
                    } else {
                        if(type === 'video') {
                            // 请注意，视频文件不支持https下载，调用该接口需http协议。
                            url = url.replace('https://', 'http://')
                        }
                        url += `&media_id=${mediaId}`
                    }

                    if(type === 'news' || type === 'vedio') {
                        request(options).then( response => {
                            const _data = response.body
                            if(_data) {
                                resolve(_data)
                            } else {
                                throw new Error('Fetch material fails')
                            }
                        }).catch( err => {
                            reject(err)
                        })
                    } else {
                        resolve(url)
                    }
                }).catch(err => {
                    reject(err)
                })
        })
    }

    /**
     * [deleteMaterial 删除永久素材]
     * @param  {[string]} mediaId [素材id]
     * @return {[type]}         [description]
     */
    deleteMaterial(mediaId) {
        const form = { media_id: mediaId }
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then(data => {
                    let url = `${api.permanent.del}access_token=${data.access_token}&media_id=${mediaId}`
                    if(!permanent && type === 'video') {
                        // 请注意，视频文件不支持https下载，调用该接口需http协议。
                        url = url.replace('https://', 'http://')
                    }

                    request({method: 'POST', url: url, body: form, json: true})
                        .then( response => {
                            const _data = response.body
                            if(_data) {
                                resolve(_data)
                            } else {
                                throw new Error('Delete material fails')
                            }
                        }).catch(err => {
                            reject(err)
                        })
                }).catch(err => {
                    reject(err)
                })
        })
    }

    /**
     * [updateMaterial 更新或修改图文素材]
     * @param  {[string]} mediaId [素材ID]
     * @param  {[object]} news    [修改或更新的内容]
     * @return {[type]}         [description]
     */
    updateMaterial(mediaId, news) {
        let form = { media_id: mediaId }
        form = {...news}

        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then(data => {
                    let url = `${api.permanent.update}access_token=${data.access_token}&media_id=${mediaId}`

                    request({method: 'POST', url: url, body: form, json: true})
                        .then( response => {
                            const _data = response.body
                            if(_data) {
                                resolve(_data)
                            } else {
                                throw new Error('Update material fails')
                            }
                        }).catch(err => {
                            reject(err)
                        })
                }).catch(err => {
                    reject(err)
                })
        })
    }

    // 获取素材总数
    countMaterial() {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then(data => {
                    let url = `${api.permanent.count}access_token=${data.access_token}`

                    request({method: 'GET', url: url, json: true})
                        .then( response => {
                            const _data = response.body
                            if(_data) {
                                resolve(_data)
                            } else {
                                throw new Error('Count material fails')
                            }
                        }).catch(err => {
                            reject(err)
                        })
                }).catch(err => {
                    reject(err)
                })
        })
    }

    // 获取素材列表
    batchMaterial(options = {}) {
        options.type = options.type || 'image'
        options.offset = options.offset || 0
        options.count = options.count || 1

        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then(data => {
                    let url = `${api.permanent.batch}access_token=${data.access_token}`

                    request({method: 'POST', url: url, body: options, json: true})
                        .then( response => {
                            const _data = response.body
                            if(_data) {
                                resolve(_data)
                            } else {
                                throw new Error('Count material fails')
                            }
                        }).catch(err => {
                            reject(err)
                        })
                }).catch(err => {
                    reject(err)
                })
        })
    }

    /**
     * [createTag 创建标签]
     * @param  {[string]} name [标签名]
     * @return {[type]}      [description]
     */
    createTag(name) {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then( data => {
                    const url = `${api.tag.create}access_token=${data.access_token}`
                    const options = {
                        tag: {
                            name: name
                        }
                    }
                    request({method: 'POST', url: url, body: options, json: true})
                        .then( response => {
                            const _data = response.body

                            if(_data) {
                                resolve(_data)
                            } else {
                                throw new Error ('Create tag fails')
                            }
                        }).catch(err => {
                            reject(err)
                        })
                }).catch(err => {
                    reject(err)
                })
        })
    }

    // 获取公众号已创建的标签  对应fetchGroup
    getTags() {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then( data => {
                    const url = `${api.tag.getTags}access_token=${data.access_token}`
                    request({url: url, json: true})
                        .then( response => {
                            const _data = response.body

                            if(_data) {
                                resolve(_data)
                            } else {
                                throw new Error ('get tags fails')
                            }
                        }).catch(err => {
                            reject(err)
                        })
                }).catch(err => {
                    reject(err)
                })
        })
    }

    /**
     * [updateTags 编辑标签]
     * @param  {[type]} id   [标签id]
     * @param  {[string]} name [标签名]
     * @return {[type]}      [description]
     */
    updateTag(id, name) {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then( data => {
                    const url = `${api.tag.update}access_token=${data.access_token}`
                    const options = { tag: {id, name} }

                    request({method: 'POST', url: url, body: options, json: true})
                        .then( response => {
                            const _data = response.body

                            if(_data) {
                                resolve(_data)
                            } else {
                                throw new Error ('get tags fails')
                            }
                        }).catch(err => {
                            reject(err)
                        })
                }).catch(err => {
                    reject(err)
                })
        })
    }

    /**
     * [delTag 删除标签]  对应delGroup
     * @param  {[type]} id [标签id]
     * @return {[type]}    [description]
     */
    deleteTag(id) {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then( data => {
                    const url = `${api.tag.del}access_token=${data.access_token}`
                    const options = { tag: { id } }
                    request({method: 'POST', url: url, body: options, json: true})
                        .then( response => {
                            const _data = response.body

                            if(_data) {
                                resolve(_data)
                            } else {
                                throw new Error ('get user tag list  fails')
                            }
                        }).catch(err => {
                            reject(err)
                        })
                }).catch(err => {
                    reject(err)
                })
        })
    }

    /**
     * [getUser 获取标签下粉丝列表]
     * @param  {[type]} tagid       [标签id]
     * @param  {[type]} next_openid [第一个拉取的OPENID，不填默认从头开始拉取]
     * @return {[type]}             [description]
     */
    getUser(tagid, next_openid = '') {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then( data => {
                    const url = `${api.tag.getUser}access_token=${data.access_token}`
                    const options = { tagid, next_openid }
                    request({method: 'POST', url: url, body: options, json: true})
                        .then( response => {
                            const _data = response.body

                            if(_data) {
                                resolve(_data)
                            } else {
                                throw new Error ('Get a list of fans under the tag fails')
                            }
                        }).catch(err => {
                            reject(err)
                        })
                }).catch(err => {
                    reject(err)
                })
        })
    }

    /**
     * [batchtagging 批量为用户打标签]
     * @param  {[array]} openid_list [粉丝id列表]
     * @param  {[type]} tagid       [标签id]
     * @return {[type]}             [description]
     */
    batchtagging(openid_list, tagid) {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then( data => {
                    const url = `${api.tag.batchtagging}access_token=${data.access_token}`
                    const options = { openid_list, tagid }
                    request({method: 'POST', url: url, body: options, json: true})
                        .then( response => {
                            const _data = response.body

                            if(_data) {
                                resolve(_data)
                            } else {
                                throw new Error ('Unbatch to label users fails')
                            }
                        }).catch(err => {
                            reject(err)
                        })
                }).catch(err => {
                    reject(err)
                })
        })
    }

    /**
     * [batchuntagging 批量为用户取消标签]
     * @param  {[array]} openid_list [粉丝id列表]
     * @param  {[type]} tagid       [标签id]
     * @return {[type]}             [description]
     */
    batchuntagging(openid_list, tagid) {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then( data => {
                    const url = `${api.tag.batchuntagging}access_token=${data.access_token}`
                    const options = { openid_list, tagid }
                    request({method: 'POST', url: url, body: options, json: true})
                        .then( response => {
                            const _data = response.body

                            if(_data) {
                                resolve(_data)
                            } else {
                                throw new Error ('Batch to label users fails')
                            }
                        }).catch(err => {
                            reject(err)
                        })
                }).catch(err => {
                    reject(err)
                })
        })
    }

    // 获取用户身上的标签列表   对应checkGroup
    getUserTagsList(openid) {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then( data => {
                    const url = `${api.tag.userTagsList}access_token=${data.access_token}`
                    const options = { openid }
                    request({method: 'POST', url: url, body: options, json: true})
                        .then( response => {
                            const _data = response.body

                            if(_data) {
                                resolve(_data)
                            } else {
                                throw new Error ('Gets a list of tags on the user fails')
                            }
                        }).catch(err => {
                            reject(err)
                        })
                }).catch(err => {
                    reject(err)
                })
        })
    }

    /**
     * [remarkUser 设置用户备注名]
     * @param  {[type]} openid [用户id]
     * @param  {[type]} remark [新的备注名]
     * @return {[type]}        [description]
     */
    remarkUser(openid, remark) {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then( data => {
                    const url = `${api.user.remark}access_token=${data.access_token}`
                    const options = { openid, remark }
                    request({method: 'POST', url: url, body: options, json: true})
                        .then( response => {
                            const _data = response.body

                            if(_data) {
                                resolve(_data)
                            } else {
                                throw new Error ('Remark user fails')
                            }
                        }).catch(err => {
                            reject(err)
                        })
                }).catch(err => {
                    reject(err)
                })
        })
    }

    /**
     * [batchFetchUsers 获取用户基本信息]
     * @param  {[array & string]} openids [
     * array: 批量获取用户基本信息 [ {"openid": "otvxTs4dckWG7imySrJd6jSi0CWE",  "lang": "zh_CN"}, {...}],
     * string: 获取单个用户基本信息 'otvxTs4dckWG7imySrJd6jSi0CWE' ]
     * @param  {[type]} lang    [openids为string时使用， 默认值为 'zh_CN']
     * @return {[type]}         [description]
     */
    fetchUsers(openids, lang = "zh_CN") {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then( data => {
                    let options = {json: true}
                    if(Array.isArray(openids)) {
                        options.url = `${api.user.batchFetch}access_token=${data.access_token}`
                        options.method = 'POST'
                        options.body = { user_list: openids }
                    } else {
                        options.url = `${api.user.fetch}access_token=${data.access_token}&openid=${openids}&lang=${lang}`
                    }

                    request(options).then( response => {
                        const _data = response.body

                        if(_data) {
                            resolve(_data)
                        } else {
                            throw new Error ('Fetch user fails')
                        }
                    }).catch(err => {
                        reject(err)
                    })
                }).catch(err => {
                    reject(err)
                })
        })
    }

    /**
     * [listUsers 获取用户列表]  一次拉取调用最多拉取10000个关注者的OpenID
     * @param  {[type]} next_openid [第一个拉取的OPENID，不填默认从头开始拉取]
     * @return {[type]}             [description]
     */
    listUsers(next_openid) {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then( data => {
                    let url = `${api.user.list}access_token=${data.access_token}`
                    if(next_openid) {
                        url += `&next_openid=${next_openid}`
                    }
                    request({url: url, json: true}).then( response => {
                        const _data = response.body

                        if(_data) {
                            resolve(_data)
                        } else {
                            throw new Error ('List user fails')
                        }
                    }).catch(err => {
                        reject(err)
                    })
                }).catch(err => {
                    reject(err)
                })
        })
    }

    /**
     * [sendByTag 根据标签进行群发]
     * @param  {[type]} type    [群发消息类型：mpnews，text，voice，mpvideo，wxcard]
     * @param  {[type]} message [消息内容]
     * @param  {[type]} tag_id  [标签ID]
     * @param  {[type]} send_ignore_reprint  [默认为0, 图文消息(mpnews)被判定为转载时，是否继续群发。1为继续群发（转载），0为停止群发]
     * @return {[type]}         [description]
     */
    sendByTag(type, message, tag_id, send_ignore_reprint = 0) {
        const msg = {
            filter: {},
            [type]: message,
            msgtype: type,

        }
        // clientmsgid: 开发者侧群发msgid，长度限制64字节，如不填，则后台默认以群发范围和群发内容的摘要值做为clientmsgid

        if(type === 'mpnews') {
            msg.send_ignore_reprint = send_ignore_reprint
        }

        if(!tag_id) {
            msg.filter.is_to_all = true  // 群发给所有的用户
        } else {
            msg.filter = {
                is_to_all: false,
                tag_id
            }
        }
        console.log(JSON.stringify(msg), type, message)
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then( data => {
                    const url = `${api.mass.tag}access_token=${data.access_token}`

                    request({method: 'POST', url: url, body: msg, json: true}).then( response => {
                        const _data = response.body

                        if(_data) {
                            resolve(_data)
                        } else {
                            throw new Error ('Send by tag fails')
                        }
                    }).catch(err => {
                        reject(err)
                    })
                }).catch(err => {
                    reject(err)
                })
        })
    }

    /**
     * [sendByOpenId 根据OpenID列表群发]
     * @param  {[type]} type    [群发消息类型：mpnews，text，voice，mpvideo，wxcard]
     * @param  {[type]} message [消息内容]
     * @param  {[array]} openids [一个openid的数组，最少2个，最多10000个]
     * @param  {[type]} send_ignore_reprint  [默认为0, 图文消息(mpnews)被判定为转载时，是否继续群发。1为继续群发（转载），0为停止群发]
     * @return {[type]}         [description]
     */
    sendByOpenId(type, message, openids, send_ignore_reprint = 0) {
        const msg = {
            touser: openids,
            [type]: message,
            msgtype: type
        }

        if(type === 'mpnews') {
            msg.send_ignore_reprint = send_ignore_reprint
        }

        console.log(JSON.stringify(msg), type, message)
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then( data => {
                    const url = `${api.mass.openId}access_token=${data.access_token}`

                    request({method: 'POST', url: url, body: msg, json: true}).then( response => {
                        const _data = response.body

                        if(_data) {
                            resolve(_data)
                        } else {
                            throw new Error ('Send  by openId fails')
                        }
                    }).catch(err => {
                        reject(err)
                    })
                }).catch(err => {
                    reject(err)
                })
        })
    }

    /**
     * [previewMass 预览群发]
     * @param  {[type]} type    [群发消息类型：mpnews，text，voice，mpvideo，wxcard]
     * @param  {[type]} message [消息内容]
     * @param  {[array]} openid [description]
     * @return {[type]}         [description]
     */
    previewMass(type, message, openid) {
        const msg = {
            touser: openid,
            [type]: message,
            msgtype: type
        }

        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then( data => {
                    const url = `${api.mass.preview}access_token=${data.access_token}`

                    request({method: 'POST', url: url, body: msg, json: true}).then( response => {
                        const _data = response.body

                        if(_data) {
                            resolve(_data)
                        } else {
                            throw new Error ('Preview mass fails')
                        }
                    }).catch(err => {
                        reject(err)
                    })
                }).catch(err => {
                    reject(err)
                })
        })
    }

    /**
     * [deleteMass 删除群发]  删除群发消息只能删除图文消息和视频消息，其他类型的消息一经发送，无法删除
     * @param  {[type]} msg_id          [发送出去的消息ID]
     * @param  {Number} [article_idx=0] [要删除的文章在图文消息中的位置，第一篇编号为1，该字段不填或填0会删除全部文章]
     * @return {[type]}                 [description]
     */
    deleteMass(msg_id, article_idx = 0) {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then( data => {
                    const url = `${api.mass.del}access_token=${data.access_token}`
                    const options = { msg_id, article_idx }
                    request({method: 'POST', url: url, body: options, json: true}).then( response => {
                        const _data = response.body

                        if(_data) {
                            resolve(_data)
                        } else {
                            throw new Error ('Delete mass message fails')
                        }
                    }).catch(err => {
                        reject(err)
                    })
                }).catch(err => {
                    reject(err)
                })
        })
    }

    /**
     * [checkMass description]
     * @param  {[type]} msg_id          [description]
     * @return {[type]}                 [description]
     */
    checkMass(msg_id) {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then( data => {
                    const url = `${api.mass.check}access_token=${data.access_token}`
                    const options = { msg_id }
                    request({method: 'POST', url: url, body: options, json: true})
                        .then( response => {
                            const _data = response.body

                            if(_data) {
                                resolve(_data)
                            } else {
                                throw new Error ('Check mass message fails')
                            }
                        }).catch(err => {
                            reject(err)
                        })
                }).catch(err => {
                    reject(err)
                })
        })
    }

    /**
     * [createMenu 创建菜单]
     * @param  {[type]} menu         [description]
     * @return {[type]}              [description]
     */
    createMenu(menu) {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then( data => {
                    // menu.matchrule 有值时为  个性化菜单
                    const url = menu.matchrule
                                ? `${api.menu.addconditional}access_token=${data.access_token}`
                                : `${api.menu.create}access_token=${data.access_token}`
                    request({method: 'POST', url: url, body: menu, json: true})
                        .then( response => {
                            const _data = response.body

                            if(_data) {
                                resolve(_data)
                            } else {
                                throw new Error ('Create Menu fails')
                            }
                        }).catch(err => {
                            reject(err)
                        })
                }).catch(err => {
                    reject(err)
                })
        })
    }

    /**
     * [getMenu 查询菜单]
     * @return {[type]}      [description]
     */
    getMenu() {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then( data => {
                    const url = `${api.menu.get}access_token=${data.access_token}`
                    request({url: url, json: true})
                        .then( response => {
                            const _data = response.body

                            if(_data) {
                                resolve(_data)
                            } else {
                                throw new Error ('Get Menu fails')
                            }
                        }).catch(err => {
                            reject(err)
                        })
                }).catch(err => {
                    reject(err)
                })
        })
    }

    /**
     * [deleteMenu 删除默认菜单及全部个性化菜单]
     * @param  {[type]} menuid         [菜单id, 有menuid时为删除个性化菜单]
     * @return {[type]}                [description]
     */
    deleteMenu(menuid) {
        // console.log(this.fetchAccessToken())
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then( data => {
                    let url
                    let options = {json: true}
                    if(menuid) {
                        options.url = `${api.menu.delconditional}access_token=${data.access_token}`
                    }else {
                        options.url = `${api.menu.del}access_token=${data.access_token}`
                        options.method = 'POST'
                        options.body = { menuid }
                    }

                    request(options)
                        .then( response => {
                            const _data = response.body

                            if(_data) {
                                resolve(_data)
                            } else {
                                throw new Error ('Delete Menu fails')
                            }
                        }).catch(err => {
                            reject(err)
                        })
                }).catch(err => {
                    reject(err)
                })
            })
    }

    /**
     * [getCurrentMenu 获取自定义菜单配置]
     * @return {[type]} [description]
     */
    getCurrentMenu() {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then( data => {
                    const url = `${api.menu.current}access_token=${data.access_token}`
                    request({url: url, json: true})
                        .then( response => {
                            const _data = response.body

                            if(_data) {
                                resolve(_data)
                            } else {
                                throw new Error ('Get current Menu fails')
                            }
                        }).catch(err => {
                            reject(err)
                        })
                }).catch(err => {
                    reject(err)
                })
        })
    }

    /**
     * [tryMatchMenu 测试个性化菜单匹配结果]
     * @param  {[type]} user_id [user_id可以是粉丝的OpenID，也可以是粉丝的微信号。]
     * @return {[type]}         [description]
     */
    tryMatchMenu(user_id) {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then( data => {
                    const url = `${api.menu.trymatch}access_token=${data.access_token}`

                    request({method: 'POST', url: url, body: { user_id }, json: true})
                        .then( response => {
                            const _data = response.body

                            if(_data) {
                                resolve(_data)
                            } else {
                                throw new Error ('Try match Menu fails')
                            }
                        }).catch(err => {
                            reject(err)
                        })
                }).catch(err => {
                    reject(err)
                })
            })
    }

    /**
     * [createQrcode 生成带参数的二维码]
     * @param  {[type]} qr [临时二维码或永久二维码]
     * @return {[type]}    [description]
     */
    createQrcode(qr) {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then( data => {
                    const url = `${api.qrcode.create}access_token=${data.access_token}`
                    request({method: 'POST', url: url, body: qr, json: true})
                        .then( response => {
                            const _data = response.body

                            if(_data) {
                                resolve(_data)
                            } else {
                                throw new Error ('Create qrcode fails')
                            }
                        }).catch(err => {
                            reject(err)
                        })
                }).catch(err => {
                    reject(err)
                })
        })
    }

    /**
     * [showQrcode 通过ticket换取二维码图片]
     * @param  {[type]} ticket [TICKET记得进行UrlEncode]
     * @return {[type]}        [description]
     */
    showQrcode(ticket) {
        return `${api.qrcode.show}ticket=${encodeURI(ticket)}`
    }

    /**
     * [createShortUrl 长链接转短链接]
     * @param  {[type]} long_url              [长链接]
     * @param  {String} [action='long2short'] [	此处填long2short，代表长链接转短链接]
     * @return {[type]}                       [description]
     */
    createShortUrl(long_url, action = 'long2short') {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then( data => {
                    const url = `${api.shortUrl.create}access_token=${data.access_token}`
                    const options = {action, long_url}
                    request({method: 'POST', url: url, body: options, json: true})
                        .then( response => {
                            const _data = response.body

                            if(_data) {
                                resolve(_data)
                            } else {
                                throw new Error ('Create short url fails')
                            }
                        }).catch(err => {
                            reject(err)
                        })
                }).catch(err => {
                    reject(err)
                })
        })
    }

    /**
     * [semantic 语义理解]
     * @param  {[type]} semanticData [description]
     * @return {[type]}              [description]
     */
    semantic(semanticData) {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then( data => {
                    console.log(data)
                    const url = `${api.semanticUrl}access_token=${data.access_token}`
                    semanticData.appid = data.appID
                    semanticData.access_token = data.access_token
                    console.log(semanticData)
                    request({method: 'POST', url: url, body: semanticData, json: true})
                        .then( response => {
                            const _data = response.body

                            if(_data) {
                                resolve(_data)
                            } else {
                                throw new Error ('Semantic fails')
                            }
                        }).catch(err => {
                            reject(err)
                        })
                }).catch(err => {
                    reject(err)
                })
        })
    }

    /**
     * [reply 回复消息]
     * @return {[type]} [description]
     */
    reply() {
        // 这里的this为 generator 里面的 async 中的ctx
        const content = this.body
        const message = this.weixinMsg

        const xml = util.tpl(content, message)

        // console.log(xml)
        this.status = 200
        this.type = 'application/xml'
        this.body = xml
    }
}

module.exports = WeChat
