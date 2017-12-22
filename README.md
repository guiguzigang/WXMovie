##### 使用NodeJs koa mongodb mongoose jade完成的微信公众号的开发
##### 本地必须安装 NodeJs（需要7.6版以上，支持async/await 语法） 与 mongodb
##### 使用 natapp 做外网映射 => http://×××××.natappfree.cc
##### 使用时需要将 wx/index的url改成natapp生成的外网映射（http://×××××.natappfree.cc），以及appID、appSecret、token修改成自己的
####  微信配置
##### 微信接口配置url             => http://×××××.natappfree.cc/wx/
##### JS接口安全域名              => ×××××.natappfree.cc    这里只写域名
##### 网页授权获取用户基本信息     => ×××××.natappfree.cc    这里只写域名
##### 设置管理员 role 的值大于 10
    db.users.update({name: 'name'}, {$set: {role: 11}})
```
├─app                           // 与数据库相关的操作
│  ├─api
│  │      movie.js              // 与数据库相关的操作
│  │      
│  ├─controllers                // 操作数据库，渲染模板
│  │      category.js
│  │      comment.js
│  │      game.js
│  │      index.js
│  │      movie.js
│  │      user.js
│  │      weChat.js
│  │      
│  ├─models                     // mongoose 的 models
│  │      category.js           
│  │      comment.js
│  │      movie.js
│  │      user.js
│  │      
│  ├─schemas                   // mongoose 的 schemas   
│  │      category.js
│  │      comment.js
│  │      movie.js
│  │      user.js
│  │      
│  └─views                     // 模板   
│      │  .DS_Store
│      │  layout.jade
│      │  weChat.jade
│      │  
│      ├─includes
│      │      footer.jade
│      │      head.jade
│      │      header.jade
│      │      weChatHead.jade
│      │      
│      ├─pages
│      │      admin.jade
│      │      categorylist.jade
│      │      category_admin.jade
│      │      detail.jade
│      │      index.jade
│      │      list.jade
│      │      results.jade
│      │      signin.jade
│      │      signup.jade
│      │      userlist.jade
│      │      
│      └─weChat
│              game.jade
│              movie.jade   
├─config                            
│      routes.js                        // 路由配置
│      serverUrl.js                     // 域名url
│      weChat.txt                       // 存放access_token
│      weChatTicket.txt                 // 存放ticket
├─libs
│      util.js                          // 公用方法文件
├─public
│  └─upload                             // 上传文件的存放位置
│          1513760608179.jpeg
│          1513761696132.jpeg
├─weChat
│      generator.js                     // 关注微信公众号后的主入口
│      template.js                      // 解析xml模板
│      util.js
│      weChat.js                        // 微信服务器中转请求
└─wx
|      index.js                         // 微信公众号开发配置页面
|      menu.js                          // 配置菜单
|      reply.js                         // 微信回复相关的操作
| app.js                // 主入口文件
```

##### 全部网页
###### 用户    
    http://×××××.natappfree.cc/user/signup
    http://×××××.natappfree.cc/user/signin
    http://×××××.natappfree.cc/signup
    http://×××××.natappfree.cc/signin
    http://×××××.natappfree.cc/logout
    http://×××××.natappfree.cc/admin/user/list
###### 微信   
    http://×××××.natappfree.cc/weChat/movie
###### 电影
    http://×××××.natappfree.cc/movie/:id
    http://×××××.natappfree.cc/admin/movie/new
    http://×××××.natappfree.cc/admin/movie/update/:id
    http://×××××.natappfree.cc/admin/movie/list
###### 分类
    http://×××××.natappfree.cc/admin/category/new
    http://×××××.natappfree.cc/admin/category/list
###### 搜索结果
    http://×××××.natappfree.cc/results

```
npm install
npm start
```
