/**
 * 列出所有文章
 **/
var fs = require('fs-extra'),
	colors = require('colors'),
	dateFormat = require('dateformat'),
	request = require("request");
module.exports = function(option){
	var cwd = option.cwd,
		argv = option.argv,
		dirname = option.dirname;
	var Model = require(dirname+'/lib/model/model.js');
	console.log("POSTS LIST".cyan);
	var model = new Model(cwd+"/db.json");
	var posts =	model.listPost();
	if(argv.table){
		//显示模式为table
		console.log("文章标题  |  作者  |  文件目录  |  创建日期".cyan);
		console.log("");
		for(var i in posts){
			var msg = posts[i].title+"  |  "+posts[i].author+"  |  "+posts[i].source+"  |  "+dateFormat(posts[i].date,"yyyy-mm-dd h:MM:ss");
			if(i%2 === 0){
				console.log(msg.yellow);
			}else{
				console.log(msg);
			}
		}
	}else{
		for(var i in posts){
			console.log("----------------");
			console.log("标题:  "+String(posts[i].title).red);
			console.log("作者: "+String(posts[i].author).green);
			console.log("文件目录: "+String(posts[i].source).cyan);
			console.log("创建日期:   "+String(dateFormat(posts[i].date,"yyyy-mm-dd h:MM:ss")).green);
			console.log("");
		}
	}
}