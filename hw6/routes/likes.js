var express = require('express');
var router = express.Router();
const pool = require('../modules/pool');
const resMsg = require('../modules/responseMessage')
const statusCode = require('../modules/statusCode');
const authUtil = require('../modules/authUtil');
const upload = require('../config/multer');
const moment = require('moment');
const timeFormat = moment().format('YYYY-MM-DD HH:mm:ss');

router.post('/', async (req, res)=>{
    let likeQuery = 'INSERT INTO `like` (`webtoonIdx`, `userIdx`) VALUES (?,?)'
    let result = await pool.queryParam_Arr(likeQuery, [req.body.webtoonIdx, req.body.userIdx]);
    console.log(result);
    if(!result) {
        res.status(200).send(authUtil.successFalse(statusCode.BAD_REQUEST, resMsg.LIKE_FAIL));
    }
    else {
        res.status(200).send(authUtil.successTrue(statusCode.OK, resMsg.LIKE_SUCCESS));
    }
})

router.get('/:webtoonIdx', async (req, res)=>{
    let webtoonId = req.params.webtoonIdx;
    let getLikeQuery = 'SELECT userIdx FROM `like` WHERE `webtoonIdx` = ?';
    let result = await pool.queryParam_Arr(getLikeQuery, [webtoonId]);
    if(!result) {
        res.status(200).send(authUtil.successFalse(statusCode.BAD_REQUEST, resMsg.GET_LIKE_FAIL));
    }
    else {
        res.status(200).send(authUtil.successTrue(statusCode.OK, resMsg.GET_LIKE_SUCCESS, {
            webtoonId : webtoonId,
            likes : result.length
        }))
    }
})

module.exports = router;
