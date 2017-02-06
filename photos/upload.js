const fs = require("fs");
const path = "../../photos";
var qiniu = require("qiniu");
var _ = require('lodash');

//需要填写你的 Access Key 和 Secret Key
qiniu.conf.ACCESS_KEY = '5AiqqOKwtMtW2bWkudFUwu0xlCQoywJIkc34c3bY';
qiniu.conf.SECRET_KEY = 'GBn7CmZU51Klo-rP7jTJ-tRQ4Cx66liTODITOgJJ';

//要上传的空间
bucket = 'hexo-blog';

// 导出对象
exportObj = new Object();
exportObj.galleries = [];

function Gallery(title) {
	this.title = title;
	this.date = '';
	this.photos = new Array();
}

function Photo(src){
	this.src = src;
	this.size = '';
	this.caption = '';
}

//构建上传策略函数
function uptoken(bucket, key) {
  var putPolicy = new qiniu.rs.PutPolicy(bucket+":"+key);
  return putPolicy.token();
}

//构造上传函数
function uploadFile(uptoken, key, localFile) {
	var extra = new qiniu.io.PutExtra();
	qiniu.io.putFile(uptoken, key, localFile, extra, function(err, ret) {
	  if(!err) {
		// 上传成功， 处理返回值
		console.log('upload success : ',ret.hash, ret.key);
	  } else {
		// 上传失败， 处理返回代码
		console.log(err);
	  }
  });
}

/**
 * 读取文件后缀名称，并转化成小写
 * @param file_name
 * @returns
 */
function getFilenameSuffix(file_name) {
  if(file_name=='.DS_Store'){
	return '.DS_Store';
  }
	if (file_name == null || file_name.length == 0)
		return null;
	var result = /\.[^\.]+/.exec(file_name);
	return result == null ? null : (result + "").toLowerCase();
}

function readDirSync(dirPath){
	fs.readdirSync(dirPath).forEach(function(file) {
		var stats = fs.statSync(dirPath + "/" + file);

		if (stats.isFile()) {
			var suffix = getFilenameSuffix(file);
			if(suffix=='.jpg'){
				//要上传文件的本地路径
				var filePath = dirPath+'/'+file;
				var fileDir = _.last(_.split(dirPath, '/'));

				//上传到七牛后保存的文件名
				key = file;
				//生成上传 Token
				token = uptoken(bucket, key);
				// 异步执行
				uploadFile(token, key, filePath);

				var gallery = _.find(exportObj.galleries, function(o) { return o.title === fileDir; });
				gallery.photos.push(new Photo(file));
			}
		} else if(stats.isDirectory()) {
			var gallery = new Gallery(file);
			exportObj.galleries.push(gallery);

			readDirSync(dirPath + "/" + file);
		}
	});
}

function writeToFile(){
	fs.writeFile("./galleries.json", JSON.stringify(exportObj, null, "\t"));
}

readDirSync(path);

writeToFile();