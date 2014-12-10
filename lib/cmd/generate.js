/**
 * 生成静态文件
 **/

var fs = require('fs-extra'),
	colors = require('colors'),
	marked = require('marked'),
	hljs = require('highlight.js'),
	cheerio = require('cheerio'),
	dateFormat = require('dateformat'),
	jschardet = require('jschardet');
module.exports = function(option){
	var cwd = option.cwd,
		argv = option.argv,
		dirname = option.dirname;
	var	config = require(cwd+'/config.json');
	var Model = require(dirname+'/lib/model/model.js');
	
	

	//清空dist文件夹
	fs.removeSync(cwd+"/dist");
	//将静态文件考入
	fs.copySync(cwd+'/template/'+config.template+'/assets', './dist/assets');
	fs.copySync(cwd+'/CNAME', './dist/CNAME');
	fs.copySync(cwd+'/config.json', './dist/data/config.json');
	fs.copySync(cwd+'/db.json', './dist/data/db.json');
	fs.copySync(cwd+'/repos.json', './dist/data/repos.json');
	fs.copySync(cwd+'/source/_posts', './dist/data/source/_posts');
	fs.copySync(cwd+'/lib/model', './dist/data/lib/model');
	fs.copySync(cwd+'/template', './dist/data/template');

	//记录文件名称
	var list = [];

	listfiles('./dist/CNAME',list);
	listfiles('./dist/data/config.json',list);
	listfiles('./dist/data/db.json',list);
	listfiles('./dist/data/repos.json',list);
	listfiles('./dist/data/source/_posts',list);
	listfiles('./dist/data/lib/model',list);
	listfiles('./dist/data/template',list);

	for(var i in list){
		list[i] = list[i].replace('./dist','');
	}
	fs.outputJsonSync('./dist/data/files.json',list);

	//_模板文件载入
	var _post = fs.readFileSync(cwd+'/template/'+config.template+'/_post.html',"utf-8");
	var _index = fs.readFileSync(cwd+'/template/'+config.template+'/_index.html',"utf-8");
	var _indexpost = fs.readFileSync(cwd+'/template/'+config.template+'/_indexpost.html',"utf-8");


	//数据库db.json载入
	var model = new Model(cwd+"/db.json");
	var posts =	model.listPost();

	//markdown文件解释器
	//post内容
	var mdRenderer = new marked.Renderer();
	mdRenderer.code = function(code, lang, escaped) {
	  if (this.options.highlight) {
	    var out = this.options.highlight(code, lang);
	    if (out != null && out !== code) {
	      escaped = true;
	      code = out;
	    }
	  }

	  if (!lang) {
	    return '<pre class="hljs"><code>'
	      + (escaped ? code : escape(code, true))
	      + '\n</code></pre>';
	  }

	  return '<pre class="hljs"><code class="'
	    + this.options.langPrefix
	    + escape(lang, true)
	    + '">'
	    + (escaped ? code : escape(code, true))
	    + '\n</code></pre>\n';
	};
	//post描述
	var descRD = new marked.Renderer();
	descRD.link = function (href,title,text) {
	  var out = '<p>'+ text + '</p>';
	  return out;
	};
	/*descRD.image = function (href,title,text) {
	  return "";
	};*/

	marked.setOptions({
	  highlight:function(code){
	  	return hljs.highlightAuto(code).value;
	  },
	  renderer:mdRenderer,
	  gfm:true,
	});
	var indexlist = [];


	//生成post
	gen_post();
	//生成首页
	gen_index();

	//生成post
	function gen_post(){
		console.log("生成静态文件:");
		for(var i in posts){
			console.log("----------------");
			console.log("标题:  "+String(posts[i].title).cyan);
			console.log("作者: "+String(posts[i].author).cyan);
			console.log("文件位置: "+String(posts[i].source).cyan);
			console.log("添加时间:   "+String(dateFormat(posts[i].date,"yyyy-mm-dd h:MM:ss")).cyan);
			//md文件
			try {
		　　	var txt = fs.readFileSync(cwd+posts[i].source);
				var fmt =jschardet.detect(txt);
				fmt = fmt.encoding === null?'utf-8':fmt.encoding;
				var txt = fs.readFileSync(cwd+posts[i].source,fmt);
				if(txt == ""){
					console.log("错误:文章md文件为空".red);
					continue;
				}
		　　} catch(error) {
				console.log("错误:文章md文件读取错误".red);
		　　	console.log(error);
				continue;
		　　}
			try {
				var content = marked(txt);
				//为描述生成html
				var desc = marked(posts[i].desc,{renderer:descRD});
				posts[i].content_html = content;
				posts[i].desc_html = desc;
			}catch(error) {
				console.log("错误:文章md文件解析错误".red);
		　　	console.log(error);
				continue;
		　　}
			if(posts[i].github_fullname != ""){
				posts[i].chatid = posts[i].github_fullname;
				posts[i].reposURL = "https://github.com/"+posts[i].github_fullname;
			}else{
				posts[i].chatid = String(posts[i].source).replace("/source/_posts/","");
				posts[i].reposURL = "#";
			}
			var html = post_tmp(posts[i]);
			//保存post html
			try {
				var filename = /.*\/(.+)\.md$/.exec(posts[i].source)[1]+".html";
				fs.outputFileSync(cwd+'/dist/'+filename,html);
			}catch(error) {
				console.log("错误：HTML 文件生成错误".red);
		　　	console.log(error);
				continue;
		　　}
			
			console.log("成功".green);
			console.log(String(cwd+'/dist/'+filename).green);
			console.log("");
			indexlist.push({
				title:posts[i].title,
				author:posts[i].author,
				date:dateFormat(posts[i].date,"mm-dd"),
				desc:posts[i].desc_html,
				reposURL:posts[i].reposURL,
				link:filename
			});
		}
	}

	//根据数据生成post html文件
	function post_tmp(post){
		var $post = cheerio.load(_post,{decodeEntities:false});
		$post("head").find("title").text(post.title);
		//添加TKD
		$post("head").find("meta[name='keywords']").attr("content",post.title);
		$post("head").find("meta[name='description']").attr("content",post.title);
		//添加share
		if(config.website_weibo !== ""){
			$post("[githubpress-website-weibo] a").attr("href",config.website_weibo);
		}else{
			$post("[githubpress-website-weibo]").remove();
		}
		if(config.website_github !== ""){
			$post("[githubpress-website-github] a").attr("href",config.website_github);
		}else{
			$post("[githubpress-website-github]").remove();
		}
		if(config.website_weixin !== ""){
			$post("[githubpress-website-weixin] a").attr("href",config.website_weixin);
		}else{
			$post("[githubpress-website-weixin]").remove();
		}

		if(config.website_tieba !== ""){
			$post("[githubpress-website-tieba] a").attr("href",config.website_tieba);
		}else{
			$post("[githubpress-website-tieba]").remove();
		}
		$post("[githubpress-title]").html(post.title);
		$post("[githubpress-author]").html(post.author);
		$post("[githubpress-reposURL]").attr("href",post.reposURL);
		$post("[githubpress-date]").html(dateFormat(post.date,"mm-dd"));
		$post("[githubpress-content]").html(post.content_html);

		var filename = /.*\/(.+)\.md$/.exec(post.source)[1]+".html";
		var url = "http://"+config.domain+"/"+filename;
		$post(".ds-thread").attr("data-thread-key",post.chatid);
		$post(".ds-thread").attr("data-title",post.title);
		$post(".ds-thread").attr("data-short-name",config.duoshuo_id);
		$post(".ds-thread").attr("data-url",url);
		return $post.html();
	}

	//生成首页
	function gen_index(){
		var $index = cheerio.load(_index,{decodeEntities:false});
		//添加TKD
		$index("head").find("title").text(config.website_title);
		$index("head").find("meta[name='keywords']").attr("content",config.website_keywords);
		$index("head").find("meta[name='description']").attr("content",config.website_description);
		//添加share
		if(config.website_weibo !== ""){
			$index("[githubpress-website-weibo] a").attr("href",config.website_weibo);
		}else{
			$index("[githubpress-website-weibo]").remove();
		}
		if(config.website_github !== ""){
			$index("[githubpress-website-github] a").attr("href",config.website_github);
		}else{
			$index("[githubpress-website-github]").remove();
		}
		if(config.website_weixin !== ""){
			$index("[githubpress-website-weixin] a").attr("href",config.website_weixin);
		}else{
			$index("[githubpress-website-weixin]").remove();
		}
		if(config.website_tieba !== ""){
			$index("[githubpress-website-tieba] a").attr("href",config.website_tieba);
		}else{
			$index("[githubpress-website-tieba]").remove();
		}
		for(var n = indexlist.length-1;n>=0;n--){
			var $indexpost = cheerio.load(_indexpost,{decodeEntities:false});
			$indexpost("[githubpress-date]").text(dateFormat(indexlist[n].date,"mm-dd"));
			$indexpost("[githubpress-author]").text(indexlist[n].author);
			$indexpost("[githubpress-reposURL]").attr("href",indexlist[n].reposURL);
			$indexpost("[githubpress-title]").text(indexlist[n].title);
			$indexpost("[githubpress-title]").attr("href",indexlist[n].link);
			$indexpost("[githubpress-link]").attr("href",indexlist[n].link);
			$indexpost("[githubpress-content]").html(indexlist[n].desc);
			$index("[githubpress-posts]").append($indexpost.html());
		}
		fs.outputFileSync(cwd+'/dist/index.html',$index.html());
		console.log("首页生成完毕：");
		console.log(String(cwd+'/dist/index.html').green);
	}

	//返回文件夹中的文件名字
	function listfiles(path,arr) {
		if(fs.statSync(path).isDirectory()){
			var files = fs.readdirSync(path);
			for(var i in files){
				listfiles(path+'/'+files[i],arr)
			}
		}else{
			arr.push(path);
			return;
		}
	}
}