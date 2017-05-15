/**
 * Created by Administrator on 2017/3/20.
 */
var express=require("express");
var app=express();
//var db=require("./model/db.js");
//var md5=require("./model/md5.js");
var session = require('express-session');
var router=require("./router");

//使用session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

app.set("view engine","ejs");
app.use(express.static('./public'));

app.get(/^\/index$|(^\/$)/,router.showIndex);                      //显示首页
app.get("/login",router.showLogin);                                 //显示登录页面，给出列表
app.get("/userlogin",router.doLogin);                                //操作：用户登录
app.get("/userregist",router.doRegister);                          //操作：用户注册
app.get("/outLogin",router.doOutLogin);                           //操作：退出登录
app.get("/social/list",router.getSocialList);                         //操作：获取信息社会板块列表
app.get("/articleList",router.getArticleList);                        //操作：获取各个板块的文章列表
app.get("/articleContent",router.showArticleContent);          //显示文章架构
app.get("/getArticleContent",router.getArticleContent);          //获取文章内容
app.get("/newTopic",router.showNewTopic);                    //显示新话题页面
app.get("/social/newTopic",router.doNewTopic);             //操作：提交新话题内容
app.get("/social/articleList",router.getSocialArticleList);   //获取信息社会某一板块下的文章列表
app.post("/social/reply",router.doNewReply);             //操作：提交新话题内容
/*app.get("/articleContent",router.showArticleContent);*/



//app.get("/visit",function(req,res){
//    res.render("visit",{page:"浏览","username":req.session.username});
//});

app.listen("3000",function(){
    console.log("打开3000端口");
});



