/**
 * Created by Lilian on 2017/3/24.
 */
var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');


// 连接数据库
function _connect(){
    var url = 'mongodb://localhost:27017/userpwd';

    // Use connect method to connect to the Server
    var promise=new Promise(function(resolve,reject){
        MongoClient.connect(url,function(err,db){
            if(err){
                reject(err);
            }else{
                resolve(db);
            }
        })
    });
    return promise;
}

exports.find=function(collectionName,json,args,callback){                            //查找
    //  args={"pageth":1,"pageNums":10}
    var result=[];
    if(arguments.length==3){
        callback=args;
        args={"pageth":1,"pageNums":0,"sort":{}};
    }else if(arguments.length==2){
        callback=json;
        args={"pageth":1,"pageNums":0,"sort":{}};
        json={};
    }else if(arguments.length==4){
        var a=args.pageth||1;
        var b=args.pageNums||0;
        var c=args.sort||{};

        args={"pageth":a,"pageNums":b,"sort":c};

    }else if(arguments.length==1){
        throw new Error("参数传入错误");
    }

    //console.log("collectionName:"+collectionName);
    _connect().then((db)=>{
        //console.log(db);
        var collection = db.collection(collectionName);
        var cur=collection.find(json).skip((args.pageth-1)*args.pageNums).limit(args.pageNums).sort(args.sort);

        cur.each((err,doc)=>{
            if (err) {
                callback(err, null);
                db.close(); //关闭数据库
                return;
            }
            if (doc != null) {
                result.push(doc);   //放入结果数组
            } else {
                //遍历结束，没有更多的文档了
                callback(null, result);
                db.close(); //关闭数据库
            }
        })
    },(err,db)=>{
        console.log("到then没成功");
        throw  err;
    });
};

exports.insertOne=function(collectionName,json,callback){                   //可以是json 数组
     _connect().then((db)=>{
             var collection = db.collection(collectionName);
             var promise=new Promise(function(resolve,reject){
                 collection.insertOne(json, function(err, result) {
                     if(err){
                         reject(err);
                     }else{
                         resolve(result);
                     }
                 });
             })

            return promise;
     },(err)=>{
         console.log("插入失败:"+err);
     }).then((result)=>{
         callback(err, result);
         console.log("Inserted 1 documents into the document collection");
         db.close(); //关闭数据库
     },(err)=>{
         console.log("插入失败:"+err);
     });

};

exports.updateOne=function(collectionName,jsonSrc,jsonDest,callback){
    _connect().then((db)=>{
            var collection = db.collection(collectionName);
            var promise=new Promise(function(resolve,reject){
                collection.updateOne(jsonSrc, { $set: jsonDest }, function(err, result) {
                    if(err){
                        reject(err);
                    }else{
                        resolve(result);
                    }
                });
            })
            return promise;
    },(err)=>{
        console.log("更新出错啦："+err)
    }).then((result)=>{
        console.log("Updated");
        callback(null,result);
        db.close(); //关闭数据库
    },(err)=>{
        console.log("更新出错啦："+err)
    });

}














