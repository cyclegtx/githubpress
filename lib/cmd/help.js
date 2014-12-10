/**
 * 显示使用帮助
 **/
module.exports = function(){
	//console.log("Usage: githubpress <command>".yellow);
	//console.log("Commands:");
	//console.log("	"+"config".green+"     List the current configuration");
	//console.log("	"+"clean".green+"   Remove the posts widthout any content");
	//console.log("	"+"generate".green+"   Generate static files");
	//console.log("	"+"help".green+"       Get help on a command");
	//console.log("	"+"init".green+"       Create a new folder");
	//console.log("	"+"list".green+"       List of all the posts");
	//console.log("	"+"get".green+"        Create a new post from github");
	//console.log("	"+"getall".green+"     Create all posts from repos.json");
	//console.log("	"+"new".green+"        Create a new post");
	//console.log("	"+"push".green+"   Push your website to github");
	console.log("使用方法: githubpress <命令>".yellow);
	console.log("命令:");
	console.log("	"+"init".green+"       初始化博客");
	console.log("	"+"repos".green+"      管理Repositories的列表");
	console.log("	"+"getall".green+"     根据repos.json获取README新建文章");
	console.log("	"+"generate".green+"   生成静态文件");
	console.log("	"+"clean".green+"	   清除没有内容的文章");
	console.log("	"+"help".green+"       获取帮助");
	console.log("	"+"list".green+"       列出所有文章");
	console.log("	"+"get".green+"        从github获取README新建文章");
	console.log("	"+"update".green+"     从github获取最新README更新文章");
	console.log("	"+"new".green+"        新建文章");
	console.log("	"+"author".green+"	   添加或者删除github帐号");
	console.log("	"+"push".green+"       发布文章到github");
}