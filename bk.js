//网盘后台
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const server = express();
server.listen(1200);
server.use(bodyParser.urlencoded({}))
server.use(multer({dest:'./files'}).any())

//登陆注册
const resRouter = express.Router();
server.use('/loginRegister', resRouter);

//注册接口
resRouter.use('/register', function(req, res){
	res.setHeader('Access-Control-Allow-Origin', '*');
	var pool = mysql.createPool({host: 'localhost', user: 'root', password: '123456', database: 'mysql'});
	pool.getConnection((err, con) => {
		if(err) {
			res.send({'ok': 0, msg: '数据库连接失败'});
		}
		else {
			con.query('SELECT name FROM `userTab` WHERE name="' + req.body.name+'";', (err, data) => {
				if(err) {
					console.log(err);
					res.send({'ok': 0, msg: '获取数据失败'});
					con.release();
				}
				else {
					var users = JSON.stringify(data);
					if(eval(users)[0]) {
						res.send({'ok': 2, msg: '用户名已存在！'});
					}
					else {
						con.query('INSERT INTO `userTab` (`name`,`pass`) VALUES ("' + req.body.name + '","' + req.body.pass + '");', (err,data) => {
							if(err) {
								console.log(err);
								res.send({'ok': 0, msg: '数据导入错误' + err});	
							}
							else {
								con.query(`CREATE TABLE ${req.body.name} (
									id int(255) NOT NULL AUTO_INCREMENT,
									lastName varchar(255) NOT NULL,
									hashName varchar(255) NOT NULL,
									lastTime varchar(255) NOT NULL,
									type varchar(255) NOT NULL,
									size varchar(255) NOT NULL,
									download varchar(255) NOT NULL,
									PRIMARY KEY (id)
								)`, (err, data) => {
									if(err) {
										console.log(err);
										res.send({'ok': 0, msg: '创建表格错误' + err});
									}
									else{
										res.send({'ok': 1, msg: '恭喜您注册成功！'});
									}
								})
							}
							con.release();
						});
					}
				}
			})
		}
	})
})

//登陆接口
resRouter.use('/login', (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	var pool = mysql.createPool({host: 'localhost', user: 'root', password: '123456', database: 'mysql'});
	pool.getConnection((err, con) => {
		if(err) {
			res.send({'ok': 0, msg: '数据库连接失败'});
		}
		else {
			con.query('SELECT * FROM `userTab` WHERE name="' + req.body.name + '" AND pass="' + req.body.pass + '"', (err,data) => {
				if(eval(JSON.stringify(data))[0]) {
					con.query('SELECT * FROM `' + req.body.name + '`;', (err, data) => {
						if(err) {
							console.log(err);
							res.send({'ok': 0, msg: '登陆失败'});
						}
						else {
							con.query('SELECT * FROM `allFiles`;', (err, files) => {
								if(err) {
									console.log(err);
									res.send({'ok': 0, msg: '登陆失败'});
								}
								else {
									res.send({'ok': 1, msg: '登陆成功', data: data, files: files});
								}
							})
						}
					})
				}
				else {
					console.log(err);
					res.send({'ok': 0, msg: '登陆失败'});
				}
			})
			con.release();
		}
	})
})

//上传文件接口
resRouter.use('/upload', (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	var hashname = req.files[0].filename+path.parse(req.files[0].originalname).ext;
	var lastTime = new Date().toLocaleString();
	var ext = path.parse(req.files[0].originalname).ext;
	fs.rename(req.files[0].path, req.files[0].path + ext, function(err){
		if(err) {
			console.log(err);
			res.send({'ok': 0, msg: err});
		}
		else {
			var pool = mysql.createPool({host: 'localhost', user: 'root', password: '123456', database: 'mysql'});
			pool.getConnection((err, con) => {
				if(err) {
					console.log(err);
					res.send({'ok': 0, msg: '数据库连接失败'});
				}
				else {
					con.query('INSERT INTO `' + req.body.loginUser + '` (`lastName`,`hashName`,`lastTime`,`type`,`size`,`download`) VALUES ("' + req.files[0].originalname + '","'+hashname + '","' + lastTime+'","' + ext+'","' + req.files[0].size + '","0");', (err,data) => {
						if(err) {
							console.log(err);
							res.send({'ok': 0, msg: '文件上传失败'});
						}
						else {
							con.query('INSERT INTO `allFiles` (`lastName`,`hashName`,`lastTime`,`type`,`size`,`download`,`uploader`) VALUES ("'+req.files[0].originalname+'","' + hashname+'","' + lastTime + '","' + ext + '","' + req.files[0].size + '","0","' + req.body.loginUser+'");', (err,data) => {
								if(err) {
									console.log(err);
									res.send({'ok': 0, msg: '文件上传失败'});
								}
								else {
									res.send({'ok': 1, msg: '文件上传成功', hashName: hashname, timer: lastTime});
								}
							})	
						}
					})
				}
				con.release();
			})
		}
	})
})

//删除文件接口
resRouter.use('/del', (req,res) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	var pool = mysql.createPool({host: 'localhost', user: 'root', password: '123456', database: 'mysql'});
	pool.getConnection((err, con) => {
		if(err) {
			console.log(err);
			res.send({'ok': 0, msg: '数据库连接失败'})
		}
		else {
			con.query('DELETE FROM `' + req.query.userName + '` WHERE hashName="' + req.query.hashName + '"',(err,data) => {
				if(err) {
					console.log(err);
					res.send({'ok': 0, msg: '删除失败'});
				}
				else{
					con.query('DELETE FROM `allFiles` WHERE hashName="' + req.query.hashName + '"', (err,data) => {
						if(err) {
							console.log(err);
							res.send({'ok': 0, msg: '删除失败'});
						}
						else {
							res.send({'ok': 1, msg: '删除成功'});
						}
					})
					
				}
			})
		}
	})
})

//下载文件接口
resRouter.use('/download', (req, res) => {
	var download;
	res.setHeader('Access-Control-Allow-Origin', '*');
	var pool = mysql.createPool({host:'localhost', user:'root', password:'123456', database:'mysql'});
	pool.getConnection((err, con) => {
		if(err) {
			res.send({'ok': 0, msg: '数据库连接失败'});
		}
		else{
			con.query('SELECT download FROM `allFiles` WHERE hashName="' + req.query.hashName + '"', (err,data) => {
				if(err) {
					console.log(err);
					res.send({'ok': 0, msg: '下载失败'});
				}
				else {
					download=Number(eval(JSON.stringify(data))[0].download) + 1;
					con.query('UPDATE `' + req.query.uploader + '` SET download="' + download + '" WHERE hashName="' + req.query.hashName + '"', (err,data) => {
						if(err) {
							console.log(err);
							res.send({'ok': 0, msg: '下载失败'});
						}
						else {
							con.query('UPDATE `allFiles` SET download="' + download + '" WHERE hashName="' + req.query.hashName + '"',(err,data) => {
								if(err) {
									console.log(err);
									res.send({'ok': 0, msg: '下载失败'});
								}
								else {
									res.send({'ok': 1, msg: '下载成功', download: download});								
								}
							})
						}
					})
				}
			})
		}
		con.release();
	})
})