/**
 * 新建文章
 **/
var fs = require('fs-extra'),
	colors = require('colors');
module.exports = function(option){
	var cwd = option.cwd,
		argv = option.argv,
		dirname = option.dirname;
	var Model = require(dirname+'/lib/model/model.js'),
		post = require(cwd+'/lib/model/post.js');
	var title = argv._[1],
		author = argv._[2],
		now = new Date().getTime();
	//本地新建文章，标题不能为空；说明命令输入有误，显示命令使用帮助
	if(title === undefined){
		new_help();
		return false;
	}
	var mdfile = now+'.md';
	for(var i =1;fs.existsSync(cwd+'/source/_posts/'+mdfile);i++){
		mdfile = now+"_"+i+'.md';
	}
	//新建md文件
	fs.createFileSync(cwd+'/source/_posts/'+mdfile);
	console.log("文件已创建:"+cwd+'/source/_posts/'+mdfile);
	//将信息保存到db.json中
	post.title = title;
	post.source = '/source/_posts/'+mdfile;
	post.author	= author === undefined?"":author;
	post.date	= now;
	var model = new Model(cwd+"/db.json");
	model.addPost(post);
	model.save();
	//命令使用帮助
	function new_help(){
		/*console.log("Usage: githubpress new <title> [author] ".cyan);
		console.log("Arguments:");
		console.log("    "+"title".green+"   Post title. Wrap it with quotations to escape.");
		console.log("    "+"author".green+"    Post author. Wrap it with quotations to escape.\r\n");
		*/
		console.log("使用方法: githubpress new <title> [author] ".cyan);
		console.log("参数:");
		console.log("    "+"title".green+"   <必填>文章标题.如果含有空格请用引号括起来.");
		console.log("    "+"author".green+"   [可选]文章作者.如果含有空格请用引号括起来.\r\n");
	}
	
}

