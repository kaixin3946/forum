var db=require("./model/db.js");
var md5=require("./model/md5.js");
var session = require('express-session');
var formidable = require("formidable");

var arrCatalog=["","考研专版","毕业生找工作","职场人生","安居乐业","学习交流区","飞跃重洋","认证考试","深圳邮人家","创业交流","金融投资","跳蚤市场","天气预报"];
var arrSocial=["","kyzb_list","bysz_list","zcrs_list","ajly_list","xxjl_list","fycy_list","rzks_list","szyr_list","cyjl_list","jrtz_list","tzsc_list","tqyb_list"];

exports.showIndex=function(req,res){
    db.find("social",{},function(err,result){

        if(err) {
            console.log("查询出错");
        };

        res.render("index",{layout:"nav",page:"首页","username":req.session.username,"result":result});
    })
}

exports.showLogin=function(req,res){
    db.find("userpwd",{},function(err,result){
        console.log("userpwd");
        res.render("login",{
            layout:"nav",
            userList:result,
            "username":req.session.username
        });
    })
}

exports.doLogin=function(req,res){                            //用户登录，查询数据库
    //从数据库提取
    var username=req.query.username;
    var pwd=md5(md5(req.query.pwd)+2);
    var json1={"username":req.query.username,"pwd":pwd};

    db.find("userpwd",{"username":req.query.username},function(err,result){
        console.log("login");
        if(err) {
            console.log("查询出错");
        };

        //console.log(result);

        if(result.length==0){
            console.log("用户名不存在");
            res.send({"result":0});
        }else{
            if(result[0].pwd==pwd){
                console.log("匹配成功，可以登录");
                req.session.login="1";
                req.session.username=username;
                res.send({"result":1,"username":username});
            }else{
                console.log("密码错误");
                res.send({"result":-1});
            }
        }
    })
}

exports.doRegister=function(req,res){                //操作：用户注册，md5加密
    //这是要存入数据库
    var pwd=req.query.pwd;
    var username=req.query.username;
    pwd=md5(md5(pwd)+2);
    var json1={"username":username,"pwd":pwd};

    db.find("userpwd",{"username":req.query.username},function(err,result){
        console.log("register");
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
}

exports.doOutLogin=function(req,res){                            // 退出登录
    //从数据库提取
    req.session.login="0";
    req.session.username=null;
    res.send({success:true});
}

exports.getSocialList=function(req,res){                            /* 信息社会  social/list*/
    //从数据库提取

    var blockNum=parseInt(req.query.blockNum);
    db.find("social",{"blockNum":blockNum},function(err,result){
        console.log("social/list");
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
}

exports.getArticleList=function(req,res){                                               /*  这个接口是有先后关系的,不然上一个返回来不能进入这个页面里 */
    var blockNum=parseInt(req.query.blockNum);
    console.log("blockNum:"+blockNum);
    db.find("social",{"blockNum":blockNum},function(err,result){
        console.log("article/list");
        if(err) {
            console.log("查询出错");
        };

        var catalog1="信息社会";
        //console.log("result:"+JSON.stringify(result));
        res.render("articleList",{layout:"nav","username":req.session.username,"blockNum":blockNum,"catalog1":catalog1,"catalog2":arrCatalog[blockNum]});
    })

}

exports.showArticleContent=function(req,res){                                               /*  显示文章内容*/
    var blockNum=parseInt(req.query.blockNum);
    var rid=parseInt(req.query.rid);

    res.render("articleContent",{layout:"nav","username":req.session.username,"blockNum":blockNum,"catalog1":"信息社会","catalog2":arrCatalog[blockNum]})

}

exports.getArticleContent=function(req,res){                                               /*  显示文章内容*/
    var blockNum=parseInt(req.query.blockNum);
    var rid=parseInt(req.query.rid);

    db.find(arrSocial[blockNum],{"rid":rid},function(err,result){
        if(err) {
            console.log("查询出错");
        };

        //console.log("result:"+JSON.stringify(result));
        res.send({layout:"nav","username":req.session.username,"blockNum":blockNum,"result":result[0],"catalog1":"信息社会","catalog2":arrCatalog[blockNum]});
    })

}

exports.showNewTopic=function(req,res){                                                 //1:显示新话题,0:显示新回复
    var isTopic=parseInt(req.query.isTopic);
    var blockNum=parseInt(req.query.blockNum);


    if(!!isTopic){
        res.render("newTopic",{layout:"nav","username":req.session.username,"blockNum":blockNum,"isTopic":true,"catalog1":"信息社会","catalog2":arrCatalog[blockNum]});
    }else{
        var rid=parseInt(req.query.rid);
        db.find(arrSocial[blockNum],{"rid":rid},{"sort":{"time":-1},"limit":20},function(err,result){

            if(err) {
                console.log("查询出错");
            };

            res.render("newTopic",{layout:"nav","username":req.session.username,"blockNum":blockNum,"isTopic":false,"title":result[0].title,"catalog1":"信息社会","catalog2":arrCatalog[blockNum]});

        })

    }

}

exports.doNewTopic=function(req,res){                /* social 发表新话题 */
    //这是要存入数据库
    var blockNum=parseInt(req.query.blockNum);
    var title=req.query.title;
    var state=req.query.state;
    var content=req.query.content;
    var username=req.query.username;
    var time=new Date().getTime();

    var json1={"blockNum":blockNum,"title":title,"state":state,"content":content,"username":username,"time":time};



    db.find(arrSocial[blockNum],{},{"sort":{"rid":-1},"limit":1},function(err,result){
        //console.log("newTopic");
        if(err) {
            console.log("查询出错");
        };

        //console.log("result:"+result);
        if(result.length==0){
            json1.rid=1;
            db.insertOne(arrSocial[blockNum],json1,function(err,result){              //这个json1是json数组
                if(err) {
                    //console.log("没有存入数据库");
                    res.send({"result":-1});
                };
                db.updateOne("social",{"blockNum":blockNum},{"latestRid":json1.rid,"latestText":title},function(){
                    res.send({"result":1,"username":username});
                });
            })
        }else{
            json1.rid=result[0].rid+1;
            db.insertOne(arrSocial[blockNum],json1,function(err,result){              //这个json1是json数组
                if(err) {
                    //console.log("没有存入数据库");
                    res.send({"result":-1});
                };
                db.updateOne("social",{"blockNum":blockNum},{"latestRid":json1.rid,"latestText":title},function(){
                    console.log("首页更新成功");
                    res.send({"result":1,"username":username});
                });
            })
        }

    })
}

exports.getSocialArticleList=function(req,res){                /* social 获取信息社会某一板块下的文章列表 */
    //这是要存入数据库
    var blockNum=req.query.blockNum;

    //console.log("blockNum12:"+blockNum);

    db.find(arrSocial[blockNum],{},{"sort":{"time":-1},"limit":20},function(err,result){
        //console.log("social/articlelist");
        if(err) {
            console.log("查询出错");
        };

        //console.log("专题列表result:"+JSON.stringify(result));
        res.send({"success":true,"result":result,"username":req.session.username});

    })
}


exports.doNewReply=function(req,res){                /* social 发表新话题 */

    if (req.method.toLowerCase() == 'post') {
        // parse a file upload
        var form = new formidable.IncomingForm();

        form.parse(req, function(err, fields, files) {
            //这是要存入数据库
            var blockNum=parseInt(fields.blockNum);
            var title=fields.title;
            var state=fields.state;
            var content=fields.content;
            var username=fields.username;
            var time=new Date().getTime();
            var rid=parseInt(fields.rid);

            var json1={"rid":rid};
            var json2={"blockNum":blockNum,"title":title,"state":state,"content":content,"username":username,"time":time};

            db.find(arrSocial[blockNum],json1,{sort:{"tid":-1}},function(err,result){                     //tid 倒叙查找
                var needUpdate=[];
                if(result[0].reply==null){
                    needUpdate.push(json2);
                }else{
                    needUpdate=result[0].reply;
                    needUpdate.unshift(json2);
                }

                if(needUpdate[0].tid==null||needUpdate[0].tid.isNaN||needUpdate[0].tid==undefined){
                    needUpdate[0].tid=1;
                }else{
                    needUpdate[0].tid=needUpdate[0].tid+1;
                }

                db.updateOne(arrSocial[blockNum],json1,{"reply":needUpdate},function(err,result){              //最新回复更新回复列表
                    if(err) {
                        console.log(err);
                        res.send({"result":-1});
                    }else{
                        console.log("插入一个");
                        res.send({"result":1,"username":username});
                    }
                })

            })
        });

        return;
    }
}

