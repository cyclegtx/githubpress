/**
 * 从github获取最新README更新文章
 **/
var fs = require('fs-extra'),
	colors = require('colors'),
	request = require("request");
module.exports = function(option){
	var cwd = option.cwd,
		argv = option.argv,
		dirname = option.dirname;
	var	config = require(cwd+'/config.json');
	var Model = require(dirname+'/lib/model/model.js');

	var model = new Model(cwd+"/db.json");

	var name = argv._[1],
		title = argv._[2],
		author = argv._[3],
		now = new Date().getTime();
	//匹配文章描述的正则表达式
	var descRE = new RegExp("^(?:(?:\r\n|\n)?.*){0,"+config.desc_line+"}");

	if(name == "help"){
		help();
		return;
	}
	if(name == undefined){
		//如果为空则根据db.json中有github的获取README文件更新。
		for(var i in model.db.posts){
			if(model.db.posts[i]["github"] != ""){
				(function(index){
					getMD(index);
				})(i);
			}
		}
		return;
	}
	
	/*
	* 判断输入的github参数是否是完整的url地址
	* 1.如果是完整的README.md地址直接获取。
	* 2.如果是项目名称简写，判断url中不包含".md"如 cyclegtx/dynamic_background 则自动补齐 /master/README.md
	* 3.如果是项目目录内的README.md或者是非master分支的README.md, 判断url中包含".md"如 uedtianji/bootSplit/master/doc/icon/README.md
	*/
	var url = name;
	var fullname = "";
	if(!/^((https|http|ftp|rtsp|mms)?:\/\/)/.test(url)){
		//不是完整的url
		if(/.*(\.md).*/.test(url)){
			//包含".md"
			url = "https://raw.githubusercontent.com/"+url;
		}else{
			//不包含".md"
			fullname = url;
			url = "https://raw.githubusercontent.com/"+url+"/master/README.md";
		}
	}
	var exist = false;
	var index = '';
	for(var i in model.db.posts){
		if(model.db.posts[i]['github'] == url){
			exist = true;
			index = i;
		}
	}
	if(!exist){
		console.log("db.json中未找到输入的repos");
		return;
	}

	getMD(index);

	function getMD(index){
		var url = model.db.posts[index]["github"];
		request(url, function (error, response, body) {
		  if (!error && response.statusCode == 200) {

		  	if(body == ""){
		  		//Failed: Markdown file is empty!
		  		console.log("错误：文件内容为空！".red);
		  	}else{
		  		
		  		//取github中的用户名作为用户名
		  		//var mdAuthor = /.*raw\.githubusercontent\.com\/([^\/]+)\/.*/.exec(url)[1];

				fs.outputFileSync(cwd+model.db.posts[index]["source"],body);
				console.log(String("文章已更新： "+cwd+model.db.posts[index]["source"]).green);


				if(argv.title === true){
		  			//取md文件第一行作为文章标题
		  			var mdtitle = body.split(/\r?\n/ig)[0];
		  			//删除第一行中的"#"
		  			mdtitle = mdtitle.replace(/^#+/,"");
		  			model.db.posts[index]["title"] = mdtitle;
		  			
		  		}
		  		if(argv.desc === true){
		  			//为描述生成html
					var desc = descRE.exec(body)[0];
					model.db.posts[index]["desc"] = desc;
		  		}
		  		if(argv.title === true || argv.desc === true){
		  			model.save();
		  		}
				
		  	}
		     
		  }else if(response.statusCode == 404){
		  	console.log("错误: github文件未找到!".red);
		  }
		});
	}
	//命令使用帮助
	function help(){
		/*console.log("Usage: githubpress update [name] ".cyan);
		console.log("Arguments:");
		console.log("    "+"name".green+"   name of the repository.");
		*/
		console.log("使用方法: githubpress update [name] [--desc] [--title]".cyan);
		console.log("参数:");
		console.log("    "+"name".green+"   [可选]repository的名称.如果为空则根据db.json更新全部.只更新md文件\r\n");
		console.log("选项:");
		console.log("    "+"desc".green+"   [可选]db.json中的desc也会同步更新.");
		console.log("    "+"title".green+"  [可选]db.json中的title也会同步更新.\r\n");
		console.log("    "+"* 参数name可以是：");
		console.log("    "+"* 1.完整的README.md地址。");
		console.log("    "+"* 2.项目名称简写，如 cyclegtx/githubpress");
		console.log("    "+"* 3.项目目录内的README.md或者是非master分支的README.md,需要包含README.md,\r\n        如 uedtianji/bootSplit/master/doc/icon/README.md");
		console.log("注意：");
		console.log("    "+"* github文件更新后需等待几分钟，否则读取的仍为上次缓存。");
		
	}
	
}

