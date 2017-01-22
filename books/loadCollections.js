const request = require('request');
const _ = require('lodash/core');
const Q = require('q');
const jsonfile = require('jsonfile');

var file = './books.json';

var page = 0;
var count = 30;
var total;

var books = new Object();

books.reading = [];
books.read = [];
books.wish = [];

request('https://api.douban.com/v2/book/user/39503955/collections', function (error, response, body) {
	if (!error && response.statusCode == 200) {
		var result = JSON.parse(body);
		total = result.total;

		var readArray = [];
		while(page*count < total){
			var start = page*count;

			readArray.push(readBooks(start, count));

			page++;
		}

		Q.all(readArray)
			.then(function(callback){
				// console.log(books.count);
				writeToFile(file, books);
			}, function(err){
				console.log(err);
			}
		);
	}
});

function readBooks(start, count){
	var deferred = Q.defer();

	request('https://api.douban.com/v2/book/user/39503955/collections?start='+start+'&count='+count, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var result = JSON.parse(body);

			var collections = result.collections;

			_.forEach(collections, function(item) {
				var book = new Object();
				book.id = item.book.id;
				book.title = item.book.title;
				book.image = item.book.image;

				if(item.status === "reading"){
					books.reading.push(book);
				} else if(item.status === "read"){
					books.read.push(book);
				} else if(item.status === "wish"){
					books.wish.push(book);
				}
			});

			deferred.resolve();
		} else {
			deferred.reject(err);
		}
	});

	return deferred.promise.nodeify();
}

function writeToFile(file, data){
	jsonfile.writeFile(file, data, function (err) {
		if(err !== null){
			console.error(err);
		}
	})
}
