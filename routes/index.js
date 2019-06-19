var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var con = mysql.createConnection({
    host: 'localhost',//数据库ip地址账号
    user: 'root',//数据库 登录用户名
    // port: 3307,
    password: '123456',//数据库 登录密码
    database: 'sys_nobound'//数据库名称
});
con.connect();//连接mysql

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.get('/getList', function (req, res) {
    con.query('select * from nblog_articlelist', function (e, r) {
        res.send(data);
    })
});

module.exports = router;
