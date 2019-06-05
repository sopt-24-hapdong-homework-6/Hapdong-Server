var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/webtoon', require('./webtoon'));
router.use('/users', require('./users/index'));
router.use('/main', require('./main/index'));
router.use('/likes', require('./likes'));
router.use('/episodes', require('./episodes'));
router.use('/comments', require('./comments'));

module.exports = router;
