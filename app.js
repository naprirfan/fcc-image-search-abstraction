//setup variables & modules
var express = require("express");
var app = express();
var fs = require("fs");

//define view engine
app.set("views", __dirname + "/views");
app.set("view engine", "pug");

/*
-------------
ROUTES
-------------
*/
app.get("/", function(req,res){
	res.render("index");
});

app.get("/api/imagesearch/:query", function(req,res){
	//setup vars
	var dataset = JSON.parse(fs.readFileSync('./database/images.json', 'utf8'));
	var offset = req.query.offset || 0;
	var itemPerPage = 10;
	var query = req.params.query.toLowerCase();
	var queryArr = query.split(" ");//split per words

	//building result
	var queryResult = dataset.filter(function(entry){
		var snippet = entry.snippet.toLowerCase();
		var exist = false;
		for (var i = 0; i < queryArr.length; i++) {
			if (snippet.includes(queryArr[i])) {
				exist = true;
				break;
			}
		}
		return exist;
	});
	var beginItem = offset * itemPerPage;
	var result = queryResult.slice(beginItem, beginItem + itemPerPage);

	//insert into search log history
	var searchlog = JSON.parse(fs.readFileSync('./database/search_log.json', 'utf8'));
	var date = new Date();
	var log = {
		term : req.params.query,
		when : date.toISOString()
	};
	searchlog.unshift(log);
	fs.writeFile("./database/search_log.json", JSON.stringify(searchlog), function(err) {
	    if (err) throw err;
	}); 

	//output result
	res.writeHead(200, {"Content-Type": "application/json"});
	res.end(JSON.stringify(result));
});

app.get("/api/searchlog", function(req,res){
	var dataset = fs.readFileSync('./database/search_log.json', 'utf8');
	res.writeHead(200, {"Content-Type": "application/json"});
	res.end(dataset);
});

app.get("*", function(req,res){
	res.end("404!");
});

//start server
app.listen(process.env.PORT || 5000);
console.log("I'm listening...");