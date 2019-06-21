var express = require('express');
var router = express.Router();
const pool = require('../modules/pool');
const resMsg = require('../modules/responseMessage')
const statusCode = require('../modules/statusCode');
const authUtil = require('../modules/authUtil');
const upload = require('../config/multer');
const moment = require('moment');
const loginVerify = require('../modules/loginVerify');
const timeFormat = moment().format('YYYY-MM-DD HH:mm:ss');

router.post('/', loginVerify.isLoggedin, async (req, res)=>{
    const userIdx = req.decoded.idx[0].userIdx;
    let checkLikeQuery = 'SELECT userIdx FROM `like` WHERE `webtoonIdx` = ? AND `userIdx` = ?';
    let addLikeQuery = 'INSERT INTO `like` (`webtoonIdx`, `userIdx`) VALUES (?,?)'
    let cancelLikeQuery = 'DELETE FROM `like` WHERE `webtoonIdx` = ? AND `userIdx` = ?';
    let checkResult = await pool.queryParam_Arr(checkLikeQuery, [req.body.webtoonIdx, userIdx]);
    console.log(checkResult);
    
    if(checkResult.length==0) {
        let result = await pool.queryParam_Arr(addLikeQuery, [req.body.webtoonIdx, userIdx]);
        if(!result){
            res.status(200).send(authUtil.successFalse(statusCode.BAD_REQUEST, resMsg.ADD_LIKE_FAIL));
        } else {
            res.status(200).send(authUtil.successTrue(statusCode.OK, resMsg.ADD_LIKE_SUCCESS));
        }
    } else if (checkResult.length>0) {
        let result = await pool.queryParam_Arr(cancelLikeQuery, [req.body.webtoonIdx, userIdx]);
        if(!result){
            res.status(200).send(authUtil.successFalse(statusCode.BAD_REQUEST, resMsg.CANCEL_LIKE_FAIL));
        } else {
            res.status(200).send(authUtil.successTrue(statusCode.OK, resMsg.CANCEL_LIKE_SUCCESS));
        }
    }
    
})

router.get('/:webtoonIdx', async (req, res)=>{
    let webtoonIdx = req.params.webtoonIdx;
    let getLikeQuery = 'SELECT `userIdx` FROM `like` WHERE `webtoonIdx` = ?';
    let result = await pool.queryParam_Arr(getLikeQuery, [webtoonIdx]);
    console.log(result);
    if(!result) {
        res.status(200).send(authUtil.successFalse(statusCode.BAD_REQUEST, resMsg.GET_LIKE_FAIL));
    }
    else {
        res.status(200).send(authUtil.successTrue(statusCode.OK, resMsg.GET_LIKE_SUCCESS, {
            webtoonIdx : webtoonIdx,
            likes : result.length
        }))
    }
})

module.exports = router;
