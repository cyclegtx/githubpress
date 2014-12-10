/**
 * 添加或者删除github帐号
 **/
var fs = require('fs-extra'),
	colors = require('colors'),
	request = require("request");
module.exports = function(option){
	var cwd = option.cwd,
		argv = option.argv,
		dirname = option.dirname;
	var config = require(cwd+'/config.json'),
		repos_file = require(cwd+'/repos.json');
	
	var action = argv._[1],
		name = argv._[2];
	switch(action){
		case "add":
			add();
			break;
		case "del":
			del();
			break;
		case "list":
			list();
			break;
		case "repos":
			repos();
			break;
		case "help":
			help();
			break;
		default:
			help();
			break;
	}
	function help(){
		console.log("使用方法: githubpress author <命令> [msg]".cyan);
		console.log("命令:");
		console.log("    "+"add".green+"    <添加>github帐号,[msg]为帐号名称");
		console.log("    "+"del".green+"    <删除>github帐号,[msg]为帐号名称");
		console.log("    "+"list".green+"   <列出>所有github帐号");
		console.log("    "+"repos".green+"  <列出>[msg]帐号的所有Repositories");
		return false;
	}
	function del(){
		if(name === undefined){
			help();
		}else{
			var olength = config.github_users.length;
			var tmp = [];
			for(var i in config.github_users){
				if(config.github_users[i] == name){
					console.log(String("用户:"+name+"已经删除！").green);
				}else{
					tmp.push(config.github_users[i]);
				}
			}
			if(tmp.length === olength){
				console.log(String("用户:"+name+"未找到").red);
				return;
			}
			config.github_users = tmp;
			fs.outputJsonSync(cwd+'/config.json',config);
		}
	}
	function list(){
		for(var i in config.github_users){
			console.log("====================");
			console.log(String(config.github_users[i]).green);
		}
		
	}
	function add(){
		if(name === undefined){
			help();
		}else{
			for(var i in config.github_users){
				if(config.github_users[i] == name){
					console.log(String("用户："+name+"已经存在！").yellow);
					return;
				}
			}
			var api_userInfo = {
			    url: "https://api.github.com/users/"+name,
			    headers: {
			        'User-Agent': 'nodejs-githubpress'
			    }
			};
			request(api_userInfo, function (error, response, body) {
			  if (!error && response.statusCode == 200) {
			  	var res = JSON.parse(body);
			  	var name = res.login;
			  	config.github_users.push(name);
			  	fs.outputJsonSync(cwd+'/config.json',config);
			  	console.log(String("成功: github用户"+res.login+"已添加.").green);
			  }else if(response.statusCode == 404){
			  	console.log("错误: github用户未找到!".red);
			  }
			});
		}
	}
	function repos(){
		if(name === undefined){
			help();
		}else{
			var exist = false;
			var repos_url = "";
			for(var i in config.github_users){
				if(config.github_users[i] == name){
					exist = true;
					repos_url = "https://api.github.com/users/"+config.github_users[i]+"/repos";
				}
			}
			if(exist === false){
				console.log(String("用户:"+name+"未添加").red);
				return;
			}
			var api_userRepo = {
			    url: repos_url,
			    headers: {
			        'User-Agent': 'nodejs-githubpress'
			    }
			};
			request(api_userRepo, function (error, response, body) {
			  if (!error && response.statusCode == 200) {
			  	var res = JSON.parse(body);
			  	for(var n in res){
			  		console.log("============");
			  		console.log(res[n].name);
			  		console.log(res[n].full_name);
			  	}
			     
			  }else if(response.statusCode == 404){
			  	console.log("错误: github用户未找到!".red);
			  }
			});
		}
	}
}