/**
 * 清除db.json中内容为空的post
 **/
var fs = require('fs-extra'),
	colors = require('colors'),
	jschardet = require('jschardet');
module.exports = function(option){
	var cwd = option.cwd,
		argv = option.argv,
		dirname = option.dirname;
	var Model = require(dirname+'/lib/model/model.js');
	var model = new Model(cwd+"/db.json");
	var posts =	model.listPost();
	var cleanPosts = [];
	for(var i in posts){
		//md文件
		try {
	　　	var txt = fs.readFileSync(cwd+posts[i].source);
			var fmt =jschardet.detect(txt);
			fmt = fmt.encoding === null?'utf-8':fmt.encoding;
			var txt = fs.readFileSync(cwd+posts[i].source,fmt);
			if(txt == ""){
				//Markdown file is empty"
				remove(i,"文章md文件为空");
				continue;
			}
	　　} catch(error) {
			//File read error
			remove(i,"文件读取错误");
			continue;
	　　}
		cleanPosts.push(posts[i]);
	}
	model.db.posts = cleanPosts;
	model.save();
	function remove(i,reason){
		console.log("----------------");
		//DELETE:
		console.log("删除:".red+String(posts[i].source).cyan);
		//title:
		console.log("文章标题:  "+String(posts[i].title).cyan);
		console.log(String(reason).red);
		console.log("");
		fs.removeSync(cwd+posts[i].source);
	}
}