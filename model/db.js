/**
 * Created by Lilian on 2017/3/24.
 */
var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');


/* 连接数据库 */
function _connect(callback){
    // Connection URL
    var url = 'mongodb://localhost:27017/userpwd';

    // Use connect method to connect to the Server
    MongoClient.connect(url, function(err, db) {
        //assert.equal(null, err);
        if(err){
            callback(err,null)
        }else{
            //console.log("Connected correctly to server");
            callback(err, db);
        }

        //db.close();
    });
}

exports.insertOne=function(collectionName,json,callback){                   //可以是json 数组
    _connect(function(err,db){
        var collection = db.collection(collectionName);

        collection.insertMany(json, function(err, result) {
            //assert.equal(err, null);
            console.log("Inserted 1 documents into the document collection");

            callback(err, result);
            db.close(); //关闭数据库
        });
    });

};

exports.find=function(collectionName,json,callback){
    _connect(function(err,db){
        var collection = db.collection(collectionName);
        var cur=collection.find(json);
        var result=[];

        cur.each(function(err,doc){
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


    });
}


