var fs = require('fs-extra');
module.exports = function (dbfile) {
	this.dbfile = dbfile;
	this.db = {
		"posts": []
	};
	if(dbfile !== undefined){
		 try {
	        this.db = require(this.dbfile);
	    } catch (err) {
	    	var msg = "Can not find database file："+this.dbfile;
	    	throw new Error(msg);
	    }
	}
	
}
module.exports.prototype.addPost = function(post){
	this.db.posts.push(post);
}
module.exports.prototype.listPost = function(){
	return this.db.posts;
}
module.exports.prototype.save = function(){
	fs.outputJsonSync(this.dbfile, this.db, function(err) {
	  if(err) console.log(err);
	});
}