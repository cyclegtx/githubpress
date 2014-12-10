/**
 * 管理Repositories的列表
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
	var Model = require(dirname+'/lib/model/model.js');
	
	var action = argv._[1],
		name = argv._[2];
	switch(action){
		case "list":
			list();
			break;
		case "ignore":
			ignore();
			break;
		case "get":
			get();
			break;
		case "help":
			help();
			break;
		default:
			help();
			break;
	}
	function help(){
		console.log("使用方法: githubpress repos <命令> [msg]".cyan);
		console.log("命令:");
		console.log("    "+"list".green+"   <列出>repos.json的内容");
		console.log("    "+"ignore".green+" <记录>需要忽略的repos,其中[msg]为repos的fullname,\r\n                 若[msg]为空则根据ignore删除repos列表");
		console.log("    "+"get".green+"    <记录>[msg]帐号的所有Repos到repos.json,若[msg]为空则获取所有用户\r\n                 [msg]为config.github_users中的github帐号\r\n");
		return false;
	}
	function list(){
		console.log("====================\r\nrepos列表：");
		for(var i in repos_file.repos){
			console.log(String(repos_file.repos[i]).green);
		}
		console.log("====================\r\nignore忽略列表：");
		for(var n in repos_file.ignore){
			console.log(String(repos_file.ignore[n]).green);
		}
		
	}
	function ignore(){
		if(name === undefined){
			var tmparr = [];
			for(var i in repos_file.repos){
				if(repos_file.ignore.indexOf(repos_file.repos[i]) === -1){
					tmparr.push(repos_file.repos[i]);
				}else{
					console.log(repos_file.repos[i]+"已从repos列表中删除");
				}
			}
			repos_file.repos = tmparr;
			fs.outputJsonSync(cwd+'/repos.json',repos_file);
			console.log("repos列表清除完毕".green);
		}else{
			if(repos_file.repos.indexOf(name) !== -1){
				var tmparr = [];
				for(var i in repos_file.repos){
					if(repos_file.repos[i] != name){
						tmparr.push(repos_file.repos[i]);
					}
				}
				repos_file.repos = tmparr;
				fs.outputJsonSync(cwd+'/repos.json',repos_file);
				console.log(name+"已从repos列表中删除");
			}
			if(repos_file.ignore.indexOf(name) === -1){
				repos_file.ignore.push(name);
				fs.outputJsonSync(cwd+'/repos.json',repos_file);
				console.log("成功添加"+name+"到忽略列表中");
			}else{
				console.log(name+"已经在忽略列表中了");
			}
		}
	}
	function get(){
		if(name === undefined){
			for(var i in config.github_users){
				getRepos(config.github_users[i]);
			}
		}else{
			var exist = false;
			for(var i in config.github_users){
				if(config.github_users[i] == name){
					exist = true;
				}
			}
			if(exist === false){
				console.log(String("用户:"+name+"未添加").red);
				return;
			}
			getRepos(name);
		}
	}
	function getRepos(name){
		var api_userRepo = {
		    url: "https://api.github.com/users/"+name+"/repos",
		    headers: {
		        'User-Agent': 'nodejs-githubpress'
		    }
		};
		request(api_userRepo, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
		  	var res = JSON.parse(body);
		  	for(var n in res){
		  		if(repos_file.ignore.indexOf(res[n].full_name) == -1){
		  			if(repos_file.repos.indexOf(res[n].full_name) == -1){
			  			repos_file.repos.push(res[n].full_name);
			  			console.log(String("已加入:"+res[n].full_name).green);
			  		}else{
			  			console.log(String("已存在:"+res[n].full_name).red);
			  		}
		  		}else{
		  			console.log(String("忽略:"+res[n].full_name).yellow);
		  		}
		  		
		  	}
		    fs.outputJsonSync(cwd+'/repos.json',repos_file);
		  }else if(response.statusCode == 404){
		  	console.log("错误: github用户未找到!".red);
		  }
		});
	}
}