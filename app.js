const express = require('express')
const app = express()
const port = 8080
const path = require('path');
app.use(express.static('public'))
var cors = require('cors')
app.use(cors())

var session = require('express-session');
var FileStore = require('session-file-store')(session);
var identityKey = 'skey';
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
const request = require('request');
app.use(session({
    name: identityKey,
    secret: 'chyingp',
    store: new FileStore(),
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 1000 * 1000
    }
    
    }));

app.use(function (req, res, next) {
    if (req.session.loginUser) {  // 判断用户是否登录
        next();
    } else {
        // 解析用户请求的路径
        var arr = req.url.split('/');
        // 去除 GET 请求路径上携带的参数
        for (var i = 0, length = arr.length; i < length; i++) {
        arr[i] = arr[i].split('?')[0];
        }
        // 判断请求路径是否为根、登录、注册、登出，如果是不做拦截
        if (arr.length > 1 && arr[1] == '') {
        next();
        } else if(arr.length > 1 && arr[1] == 'login') {
            next();
        }
        
        else{  // 登录拦截
        req.session.originalUrl = req.originalUrl ? req.originalUrl : null;  // 记录用户原始请求路径
        res.redirect('/');  // 将用户重定向到登录页面
        }
    }
});
app.get('/logout', function(req, res, next){

    req.session.destroy(function(err) {
    if(err){
        res.json({ret_code: 2, ret_msg: '退出登录失败'});
        return;
    }
    
// req.session.loginUser = null;
    res.clearCookie(identityKey);
    res.redirect('/');
    });
    });

app.post('/login', function(req, res, next){
    console.log("We are trying to login");
    var sess = req.session;
    
    var email = req.body.email;
    var passwd = req.body.passwd;
    // $.ajax({
    //     url:`http://fe80::908c:f4bf:10b5:6fee:8080/login?email=${email}&passwd=${passwd}`,
    //     type: 'POST',
    //     success: function(result) {
    //         if (result) {
    //             req.session.regenerate(function(err){
    //                 if (err) {
    //                     return res.json({res: 2, msg: 'Fail login'});
    //                 }
    //                 req.session.loginUser = result.email;
    //                 res.json({res:0, msg:'Login Success'});
    //             });
    //         } else {
    //             res.json({res: 1, msg: 'Password is not correct'});
    //         }
    //     }

    // });
    
    var url = `http://fe80::908c:f4bf:10b5:6fee:8080/user/login?email=${email}&passwd=${passwd}`;
    request.post(url, function (error, response, body) {

  if (!error && response.statusCode == 200) {
      console.log(body);
       var data = JSON.parse(body);
       console.log(data.returnValue);
               if (data.returnValue == 0) {
                req.session.regenerate(function(err){
                    if (err) {
                        return res.json({res: 2, msg: 'Fail login'});
                    }
                    req.session.loginUser = data.email;
                    res.json({res:0, msg:'Login Success'});
                });
            } else {
                res.json({res: 1, msg: 'Password is not correct'});
            }
     
  }
    });
})
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public', '/login.html'));
})
app.listen(port, () => {
  console.log(`Example app listening at http://fe80::908c:f4bf:10b5:6fee:${port}`)
})
app.get('/home', function (req, res) {
    res.sendFile(path.join(__dirname, './public', '/homepage.html'));
})
app.get('/dataset', function (req, res) {
    res.sendFile(path.join(__dirname, './public', '/secondPage.html'));
});

app.get('/dataset/badge', function (req, res) {
    res.sendFile(path.join(__dirname, './public', '/table.html'));
});

app.get('/movement',function(req,res){
    res.sendFile(path.join(__dirname, './public', '/movement.html'));
});

app.get('/movementState',function(req,res){
    res.sendFile(path.join(__dirname, './public', '/movementState.html'));
});

app.get('/voice',function(req,res){
    res.sendFile(path.join(__dirname, './public', '/voice.html'));
});

app.get('/relationship',function(req,res){
    res.sendFile(path.join(__dirname, './public', '/relationship.html'));
});

app.get('/group',function(req,res){
    res.sendFile(path.join(__dirname, './public', '/group.html'));
});