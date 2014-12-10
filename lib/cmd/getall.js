/**
 * 从github获取README新建文章
 **/
var fs = require('fs-extra'),
	colors = require('colors'),
	request = require("request");
module.exports = function(option){
	var cwd = option.cwd,
		argv = option.argv,
		dirname = option.dirname;
	var	config = require(cwd+'/config.json');
	var Model = require(dirname+'/lib/model/model.js'),
		repos = require(cwd+'/repos.json').repos,
		db = require(cwd+'/db.json'),
		model = new Model(cwd+"/db.json");
	var has_posts = [];
	var get_posts = {};

	//匹配文章描述的正则表达式
	var descRE = new RegExp("^(?:(?:\r\n|\n)?.*){0,"+config.desc_line+"}");

	for(var n in db.posts){
		has_posts.push(db.posts[n].github_fullname);
	}
	for(var i in repos){
		if(has_posts.indexOf(repos[i]) !== -1){
			console.log(repos[i]+"已经存在");
			continue;
		}
		(function(fullname){
			var url = "https://raw.githubusercontent.com/"+fullname+"/master/README.md";
			request(url, function (error, response, body) {
			  console.log("============");
			  if (!error && response.statusCode == 200) {
			  	if(body == ""){
			  		//Failed: Markdown file is empty!
			  		console.log(String(fullname+":错误,文件内容为空！"));
			  	}else{
					var now = new Date().getTime();
					//为描述生成html
					var desc = descRE.exec(body)[0];
			  		//取md文件第一行作为文章标题
			  		var title = body.split(/\r?\n/ig)[0];
			  		//删除第一行中的"#"
			  		title = title.replace(/^#+/,"");
			  		//取github中的用户名作为用户名
			  		var author = /.*raw\.githubusercontent\.com\/([^\/]+)\/.*/.exec(url)[1];
			  		var mdfile = now+'.md';
					for(var i =1;fs.existsSync(cwd+'/source/_posts/'+mdfile);i++){
						mdfile = now+"_"+i+'.md';
					}
					//新建md文件
					fs.outputFileSync(cwd+'/source/_posts/'+mdfile,body);
					console.log(String(fullname+":文章已生成,"+cwd+'/source/_posts/'+mdfile).green);
					//将信息保存到db.json中					
					model.addPost({
						"title": title,
						"source": '/source/_posts/'+mdfile,
						"author": author === undefined?"":author,
						"date": now,
						"desc": desc,
						"github": url,
						"github_fullname": fullname
					});
					model.save();
			  	}
			     
			  }else if(response.statusCode == 404){
			  	console.log(String(fullname+":错误,github文件未找到!"));
			  }
			});
		})(repos[i]);
	}
}

