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
		post = require(cwd+'/lib/model/post.js');
	var name = argv._[1],
		title = argv._[2],
		author = argv._[3],
		now = new Date().getTime();
	//匹配文章描述的正则表达式
	var descRE = new RegExp("^(?:(?:\r\n|\n)?.*){0,"+config.desc_line+"}");

	if(name === undefined){
		help();
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
			fullname = url;
			url = "https://raw.githubusercontent.com/"+url;
		}else{
			//不包含".md"
			fullname = url;
			url = "https://raw.githubusercontent.com/"+url+"/master/README.md";
		}
	}else{
		fullname = url.replace("https://raw.githubusercontent.com/","");
	}
	request(url, function (error, response, body) {
	  if (!error && response.statusCode == 200) {

	  	if(body == ""){
	  		//Failed: Markdown file is empty!
	  		console.log("错误：文件内容为空！".red);
	  	}else{
	  		//为描述生成html
			var desc = descRE.exec(body)[0];
	  		//取md文件第一行作为文章标题
	  		var mdtitle = body.split(/\r?\n/ig)[0];
	  		//删除第一行中的"#"
	  		mdtitle = mdtitle.replace(/^#+/,"");
	  		//取github中的用户名作为用户名
	  		var mdAuthor = /.*raw\.githubusercontent\.com\/([^\/]+)\/.*/.exec(url)[1];
	  		/*
	  		* 判断命令中是否输入了title 和 author， 如果输入了则使用用户输入，否则使用github的信息
	  		*/
	  		title = title === undefined?mdtitle:title;
	  		author = author === undefined?mdAuthor:author;
	  		var mdfile = now+'.md';
			for(var i =1;fs.existsSync(cwd+'/source/_posts/'+mdfile);i++){
				mdfile = now+"_"+i+'.md';
			}
			//新建md文件
			fs.outputFileSync(cwd+'/source/_posts/'+mdfile,body);
			console.log(String("文章已生成： "+cwd+'/source/_posts/'+mdfile).green);
			//将信息保存到db.json中
			post.title = title;
			post.source = '/source/_posts/'+mdfile;
			post.author	= author === undefined?"":author;
			post.date	= now;
			post.desc = desc;
			post.github = url;
			post.github_fullname = fullname;
			var model = new Model(cwd+"/db.json");
			model.addPost(post);
			model.save();
	  	}
	     
	  }else if(response.statusCode == 404){
	  	console.log("错误: github文件未找到!".red);
	  }
	});
	//命令使用帮助
	function help(){
		/*console.log("Usage: githubpress get <name> [title] [author] ".cyan);
		console.log("Arguments:");
		console.log("    "+"name".green+"   name of the repository.");
		console.log("    "+"title".green+"   Post title. Wrap it with quotations to escape.");
		console.log("    "+"author".green+"    Post author. Wrap it with quotations to escape.\r\n");
		*/
		console.log("使用方法: githubpress get <name> [title] [author]".cyan);
		console.log("参数:");
		console.log("    "+"name".green+"   <必填>repository的名称.");
		console.log("    "+"title".green+"   [可选]文章标题.如果含有空格请用引号括起来.");
		console.log("    "+"author".green+"   [可选]文章作者.如果含有空格请用引号括起来.\r\n");
		console.log("* 参数name可以是：");
		console.log("* 1.完整的README.md地址。");
		console.log("* 2.项目名称简写，如 cyclegtx/githubpress");
		console.log("* 3.项目目录内的README.md或者是非master分支的README.md,需要包含README.md,\r\n    如 uedtianji/bootSplit/master/doc/icon/README.md");
		
	}
	
}

