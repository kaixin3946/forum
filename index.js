/**
 * Created by Administrator on 2017/3/20.
 */
var express=require("express");
var app=express();
var db=require("./model/db.js");
var md5=require("./model/md5.js");
var session = require('express-session');

//使用session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

app.set("view engine","ejs");
app.use(express.static('./public'));

app.get("/",function(req,res){
    res.render("index",{layout:"nav",page:"首页","username":req.session.username});
});

app.get("/index",function(req,res){
    res.render("index",{layout:"nav",page:"首页","username":req.session.username});
});


app.get("/login",function(req,res){
    db.find("userpwd",{},function(err,result){
        res.render("login",{
            layout:"nav",
            userList:result,
            "username":req.session.username
        });
    })
});
app.get("/userlogin",function(req,res){                            /* 登录 */
    //从数据库提取
    var username=req.query.username;
    var json1=[{"username":req.query.username,"pwd":req.query.pwd}];

    db.find("userpwd",{"username":req.query.username},function(err,result){

        if(err) {
            console.log("查询出错");
        };

        console.log(result);

        if(result.length==0){
            console.log("用户名不存在");
            res.send({"result":0});
        }else{
            if(result[0].pwd==req.query.pwd){
                console.log("匹配成功，可以登录");
                req.session.login="1";
                req.session.username=username;
                res.send({"result":1,"username":username});
            }else{
                console.log("用户名不存在或密码错误");
                res.send({"result":-1});
            }
        }
    })
});

app.get("/userregist",function(req,res){                /* 注册 */
    //这是要存入数据库
    var pwd=req.query.pwd;
    var username=req.query.username;
    pwd=md5(md5(pwd)+2);
    var json1=[{"username":username,"pwd":pwd}];

    db.find("userpwd",{"username":req.query.username},function(err,result){

        if(err) {
            console.log("查询出错");
        };

        //console.log("result:"+result);
        if(result.length==0){
            db.insertOne("userpwd",json1,function(err,result){              //这个json1是json数组
                if(err) {
                    //console.log("没有存入数据库");
                    res.send({"result":-1});
                };

                //console.log("已经存入数据库");
                req.session.login="1";
                req.session.username=username;
                res.send({"result":1,"username":username});
            })
        }else{
            res.send({"result":0});
        }
    })
});

app.get("/outLogin",function(req,res){                            /* 退出登录 */
    //从数据库提取
    req.session.login="0";
    req.session.username=null;
    res.send({success:true});
});


app.get("/social/list",function(req,res){                            /* 信息社会  social/list*/
    //从数据库提取

    var blockNum=parseInt(req.query.blockNum);
    db.find("social",{"blockNum":blockNum},function(err,result){

        if(err) {
            console.log("查询出错");
        };
        console.log(result);

        if(result.length==0){
            res.send({"result":0});
        }else{
            console.log("返回");
            res.send({"result":result[0]});
        }
    })
});
app.get("/articleList",function(req,res){                                               /*  这个接口是有先后关系的,不然上一个返回来不能进入这个页面里 */
    res.render("articleList",{layout:"nav","username":req.session.username,page:"文章列表"});
});

app.get("/visit",function(req,res){
    res.render("visit",{page:"浏览","username":req.session.username});
});


app.listen("3000",function(){
    console.log("打开3000端口");
});



