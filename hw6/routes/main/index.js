var express = require('express');
var router = express.Router();

router.use('/webtoonLists', require('./webtoonLists'));
router.use('/image', require('./image'));

module.exports = router;
