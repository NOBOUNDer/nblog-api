/*提供给前端跨域的接口*/
var express = require('express');
var router = express.Router();
var navcm = require("navcm");
var multer = require('multer');// 图片上传模块
var nav = navcm.navCM();// navcm模块自动帮助我们进行分类层级,要在数据库中添加pid栏
let host = 'http://127.0.0.1:3017';

//CORS跨域
router.all("*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://127.0.0.1:8080");//*表示允许所有的源
    res.header("Access-Control-Allow-Headers", "X-Requested-With");//检测是不是ajax访问
    res.header("Access-Control-Allow-Methods", "POST,GET");//允许请求的方法是post和get
    res.header("Content-Type", "application/json;charset=utf-8");//设置响应头部
    res.header('Access-Control-Allow-Credentials', 'true');//node后台启动时设置允许携带cookie
    next();//相当于继续匹配/HT路由 只执行传入需要匹配的路由

});

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

// 图片上传配置
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var dir = "public/images"; // 设置目录名称
        multer({dest: dir});// 如果目录不存在就创建目录
        cb(null, dir);// 把上传的文件存在这个目录
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "." + file.originalname.split(".")[1]);//设置上传的文件名称
    }
});
var upload = multer({storage: storage})//使用配置文件

// 数据库配置
var mysql = require('mysql');
var con = mysql.createConnection({
    host: 'localhost',//数据库ip地址账号
    user: 'root',//数据库 登录用户名
    // port: 3307,
    password: '1234567890',//数据库 登录密码
    database: 'sys_nobound'//数据库名称
});

con.connect();//连接mysql

// 登录路由
router.post('/signIn', function (req, res) {
    console.log(req)
    con.query('select * from nblog_user where userName=? && passWord=?', [req.body.userName, req.body.passWord], function (e, r) {
        if (r.length > 0) {
            // 把用户的名称存起来 用来记录登录的状态
            res.cookie("userName", req.body.userName, {maxAge: (1000 * 60 * 60)});
            res.send("登陆成功")
        } else {
            //说明此用户名在数据库中不存在
            res.send("用户名或密码错误！")
        }
    })
});
// 退出登录
router.get('/logOut', function (req, res) {
    res.cookie("userName", {expires: new Date(0)});
});


// 获取导航分层数据
router.get('/getNavSelect', function (req, res) {
    //1.先从数据库中的nav表获取所有数据
    con.query('select * from nblog_nav', function (e, r) {
        //2.把得到的数据通过navcm进行分类
        let data = nav.get_hierarchy_json(r);//获得分类层级
        res.send(data);
    })
});
// 添加导航
router.post('/createNav', function (req, res) {
    let sql = 'insert into nblog_nav set pid=?,navName=?,route=?,keyword=?,description=?';
    let data = [
        req.body.pid,
        req.body.navName,
        req.body.route,
        req.body.keyword,
        req.body.description,
    ];
    con.query(sql, data, function (e, r) {
        // console.log(r)
        res.send("添加成功！");
    });
});
// 更新导航
router.post('/updateNav', function (req, res) {
    let sql = 'update nblog_nav set navName=?,route=?,keyword=?,description=? where id=?';
    let data = [
        req.body.navName,
        req.body.route,
        req.body.keyword,
        req.body.description,
        req.body.id,
    ];
    // console.log(data)
    con.query(sql, data, function (e, r) {
        res.send("更新成功！");
    });
});
// 获取单行导航
router.get('/getNav', function (req, res) {
    con.query('select * from nblog_nav where id=?', [req.query.id], function (e, r) {
        res.send(r);
    })
});
// 删除导航
router.get('/delNav', function (req, res) {
    //选取id号和pid号和前端传过来的id号相等的项，对其进行删除，即删除选中栏以及选中栏的子栏
    con.query('delete from nblog_nav where id=? || pid=?', [req.query.id, req.query.id], function (e, r) {
        // console.log(r);
        res.send("删除成功！");
    })
});


// 获取文章列表
router.get('/listArticle', function (req, res) {
    let sql = 'select * from nblog_article';
    con.query(sql, function (e, r) {
        res.send(r);
    })
})
// 获取文章
router.get('/getArticle', function (req, res) {
    let sql = 'select * from nblog_article where id=?';
    data = [req.query.id]
    con.query(sql, data, function (e, r) {
        res.send(r);
    })
})
// 更新文章
router.post('/updateArticle', function (req, res) {
    let sql = 'update nblog_article set title=?,author=?,pid=?,description=?,content=? where id=?';
    let data = [
        req.body.title,
        req.body.author,
        req.body.pid,
        req.body.description,
        req.body.content,
        req.body.id
    ]
    con.query(sql, data, function (e, r) {
        res.send('更新成功！');
    })
})
// 添加文章
router.post('/createArticle', function (req, res) {
    let sql = 'insert into nblog_article set title=?,author=?,pid=?,description=?,content=?';
    let data = [
        req.body.title,
        req.body.author,
        req.body.pid,
        req.body.description,
        req.body.content,
    ];
    con.query(sql, data, function (e, r) {
        if (e) {
            // console.log(e)
        } else {
            res.send("添加成功！");
        }
    });
});
// 删除文章
router.get('/delArticle', function (req, res) {
    let sql = 'delete from nblog_article where id=?';
    let data = [req.query.id];
    con.query(sql, data, function (e, r) {
        if (e) {
            // console.log(e)
        } else {
            res.send("删除成功！");
        }
    });
});
// 获取文章分类列表
router.get('/listArticleClassify', function (req, res) {
    let sql = 'select * from nblog_articleClassify'
    con.query(sql, function (e, r) {
        res.send(r)
    })
})
// 获取单行文章分类
router.get('/getArticleClassify', function (req, res) {
    let sql = 'select * from nblog_articleClassify where id=?'
    let data = [req.query.id]
    con.query(sql, data, function (e, r) {
        res.send(r)
    })
})
// 添加文章分类
router.post('/createArticleClassify', function (req, res) {
    let sql = 'insert into nblog_articleClassify set title=?,pid=?,route=?,description=?';
    let data = [
        req.body.title,
        req.body.pid,
        req.body.route,
        req.body.description,
    ];
    con.query(sql, data, function (e, r) {
        if (e) {
            // console.log(e)
        } else {
            res.send("添加成功！");
        }
    });
});
// 更新文章分类
router.post('/updateArticleClassify', function (req, res) {
    let sql = 'update nblog_articleClassify set title=?,route=?,description=? where id=?';
    let data = [
        req.body.title,
        req.body.route,
        req.body.description,
        req.body.id,
    ];
    con.query(sql, data, function (e, r) {
        if (e) {
            // console.log(e)
        } else {
            res.send("更新成功！");
        }
    });
});
// 删除文章分类
router.get('/delArticleClassify', function (req, res) {
    let sql = 'delete from nblog_articleClassify where id=?';
    let data = [req.query.id];
    con.query(sql, data, function (e, r) {
        if (e) {
            // console.log(e)
        } else {
            res.send("删除成功！");
        }
    });
});


// 获取网站设置信息
router.get('/getSetting', function (req, res) {
    con.query('select * from nblog_setting where id=1', function (e, r) {
        res.send(r);
    })
});
// 网站logo上传
router.post('/logo', upload.single('avatar'), function (req, res) {
    // console.log(req.file)
    let sql = 'update nblog_setting set logo=? where id=1 ';
    let data = [
        host + "/images/" + req.file.filename,
    ];
    con.query(sql, data, function (e, r) {
        res.send("上传成功！");
    });
});
// 网站设置
router.post('/setting', function (req, res) {
    let sql = 'update nblog_setting set title=?,keyword=?,description=?,icp=? where id=1';
    let data = [
        req.body.title,
        req.body.keyword,
        req.body.desc,
        req.body.icp,
    ];
    // console.log(data)
    con.query(sql, data, function (e, r) {
        res.send("设置成功");
    });
});

module.exports = router;
