'use strict'

const defaultMenu = {
    'button': [
        {
            name: '排行榜',
            sub_button: [
                {
                    name: '最热的',
                    type: 'click',
                    key: 'movie_hot'
                },
                {
                    name: '最冷的',
                    type: 'click',
                    key: 'movie_cold'
                }
            ]
        }, {
            name: '电影分类',
            sub_button: [
                {
                    name: '犯罪片',
                    type: 'click',
                    key: 'movie_crime'
                }, {
                    name: '动画片',
                    type: 'click',
                    key: 'movie_cartoon'
                }, {
                    name: '战争片',
                    type: 'click',
                    key: 'movie_war'
                }, {
                    name: '历史片',
                    type: 'click',
                    key: 'movie_history'
                }, {
                    name: '爱情片',
                    type: 'click',
                    key: 'movie_love'
                }
            ]
        }, {
            name: '帮助',
            type: 'click',
            key: 'help'
        }
    ]
}

const conditionalMenu = {
    button: [
        {
            name: '点击事件',
            type: 'click',
            key: 'menu_click'
        }, {
            name: '点击事件2',
            type: 'click',
            key: 'menu_click'
        },
    ],
    matchrule: {  // matchrule共六个字段，均可为空，但不能全部为空，至少要有一个匹配信息是不为空的
        tag_id: '100',  //  用户标签的id，可通过用户标签管理接口获取
        sex: '' ,// 性别：男（1）女（2），不填则不做匹配
        client_platform_type: '',  // 客户端版本，当前只具体到系统型号：IOS(1), Android(2),Others(3)，不填则不做匹配
        country: '',  // 地区信息从大到小验证，小的可以不填，即若填写了省份信息，则国家信息也必填并且匹配，城市信息可以不填。 例如 “中国 广东省 广州市”、“中国 广东省”都是合法的地域信息，而“中国 广州市”则不合法，因为填写了城市信息但没有填写省份信息
        province: '',
        city: '',
        language: '',
    }
}

/*export default {
    defaultMenu,
    conditionalMenu
}*/
module.exports = {
    defaultMenu,
    conditionalMenu
}
