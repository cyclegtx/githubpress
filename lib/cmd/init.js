/**
 * 项目目录初始化
 **/
var fs = require('fs-extra'),
	colors = require('colors'),
	request = require("request");
module.exports = function(option){
	var cwd = option.cwd,
		argv = option.argv,
		dirname = option.dirname;
	//var dir = argv._[1] === undefined?cwd:cwd+"/"+argv._[1];
	var name = argv._[1];
	var dir = cwd;
	var base_url = "https://raw.githubusercontent.com/";

	if(name == "help"){
		help();
		return;
	}
	if(name != undefined){
		var filelist_url = base_url+name+"/data/files.json";
		read_url(filelist_url,function (files) {
			files = JSON.parse(files)
			for(var i in files){
				var url = base_url+name+files[i];
				var path =dir+files[i].replace('/data','');
				dl_source(url,path);
			}
		});
		var cname_url = base_url+name+"/CNAME";
		get_url(cname_url,"/CNAME");
	}else{
		file_copy();
	}

	function file_copy () {
		fs.copySync(dirname+'/config.json', dir+'/config.json');
		fs.copySync(dirname+'/repos.json', dir+'/repos.json');
		fs.copySync(dirname+'/CNAME', dir+'/CNAME');
		fs.copySync(dirname+'/db.json', dir+'/db.json');
		fs.copySync(dirname+'/template', dir+'/template');
		fs.copySync(dirname+'/lib/model', dir+'/lib/model');
		
		console.log(String("博客目录已经创建:\r\n"+dir).green);
	}
	function dl_source(url,path){
		fs.createFileSync(path);
		request(url).on('response', function(response) {
		 if (response.statusCode == 200) {console.log(String("已生成： "+path).green);}
		 else if(response.statusCode == 404){console.log(String("错误: github文件未找到!"+url).red);}
		}).pipe(fs.createWriteStream(path));
	}
	function read_url(url,callback){
		request(url, function (error, response, body) {
		  if (!error && response.statusCode == 200) {

		  	if(callback != undefined){
				callback(body);
			}
		     
		  }else if(response.statusCode == 404){
		  	console.log(String("错误: github文件未找到!"+url).red);
		  }
		});
	}
	function get_url(url,filepath,callback){
		request(url, function (error, response, body) {
		  if (!error && response.statusCode == 200) {

			fs.outputFileSync(dir+filepath,body);
			console.log(String("已生成： "+dir+filepath).green);
			if(callback != undefined){
				callback();
			}
		     
		  }else if(response.statusCode == 404){
		  	console.log(String("错误: github文件未找到!"+url).red);
		  }
		});
	}
	//命令使用帮助
	function help(){
		/*console.log("Usage: githubpress init [repos] ".cyan);
		console.log("Arguments:");
		*/
		console.log("使用方法: githubpress init [repos] ".cyan);
		console.log("参数:");
		console.log("    "+"repos".green+"   [可选]github中存放站点的repository名称.\r\n");
		console.log("    * 参数repos可以是：");
		console.log("    * 1.repository的fullname,要包括分支，一般是gh-pages.\r\n        例如 cyclegtx/test/gh-pages");
	}
};
