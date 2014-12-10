/**
 * 命令处理
 **/
module.exports = function(option){
	var cmd = option.argv._[0];
	switch(cmd){
		case "init":
			require('./init.js')(option);
			break;
		case "new":
			require('./new.js')(option);
			break;
		case "get":
			require('./get.js')(option);
			break;
		case "getall":
			require('./getall.js')(option);
			break;
		case "update":
			require('./update.js')(option);
			break;
		case "list":
			require('./list.js')(option);
			break;
		case "generate":
			require('./generate.js')(option);
			break;
		case "clean":
			require('./clean.js')(option);
			break;
		case "author":
			require('./author.js')(option);
			break;
		case "repos":
			require('./repos.js')(option);
			break;
		/*case "push":
			gitPush();
			break;*/
		case "help":
			require('./help.js')(option);
			break;
		default:
			require('./help.js')(option);
			break;
	}
}
