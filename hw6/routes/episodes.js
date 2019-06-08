var express = require('express');
var router = express.Router();
const pool = require('../modules/pool');
const resMsg = require('../modules/responseMessage')
const statusCode = require('../modules/statusCode');
const authUtil = require('../modules/authUtil');
const upload = require('../config/multer');
const moment = require('moment');
const timeFormat = moment().format('YYYY-MM-DD HH:mm:ss');

router.get('/list/:webtoonId', async (req, res) => {
    let webtoonId = req.params.webtoonId;
    let getEpisodeQuery = 'SELECT episodeIdx, thumbnail, title, views, writetime FROM episode WHERE webtoonIdx = ?';
    let result = await pool.queryParam_Arr(getEpisodeQuery, [webtoonId]);
    console.log(result);
    if (result[0] == undefined) {
        res.status(200).send(authUtil.successFalse(statusCode.BAD_REQUEST, resMsg.NO_WEBTOON));
    }
    else {
        res.status(200).send(authUtil.successTrue(statusCode.OK, resMsg.READ_EPISODE_LIST_SUCCESS, result));
    }
})

router.get('/:episodeId', async (req, res) => {
    let episodeId = req.params.episodeId;
    let getContentQuery = 'SELECT contentImg FROM episode WHERE episodeIdx = ?';
    let addViewQuery = 'UPDATE episode SET views= views+1 WHERE episodeIdx = ?';
    const getContentResult = (await pool.queryParam_Arr(getContentQuery, [episodeId]))[0].contentImg;
    console.log(getContentResult);
    const addViewResult = await pool.queryParam_Arr(addViewQuery, [episodeId]);
    if(!getContentResult || !addViewResult) {
        res.status(200).send(authUtil.successFalse(statusCode.BAD_REQUEST, resMsg.READ_EPISODE_FAIL));
    }
    else {
        res.status(200).send(authUtil.successTrue(statusCode.OK, resMsg.READ_EPISODE_SUCCESS, getContentResult));
    }
})
/* views 증가하기 구현*/

router.post('/', upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'contentImg', maxCount: 1 }]), async (req, res) => {
    let insertQuery = 'INSERT INTO episode (thumbnail, title, views, writetime, webtoonIdx, contentImg) VALUES (?,?,?,?,?,?)';
    // let getWebToonIdxQuery = 'SELECT webtoonIdx FROM webtoon WHERE webtoon.name = ?';
    // let getWebToonIdxResult = (await pool.queryParam_Arr(getWebToonIdxQuery, [req.body.webtoonName]))[0].webtoonIdx;
    let result = await pool.queryParam_Arr(insertQuery, [req.files.thumbnail[0].location, req.body.title, 0, timeFormat, req.body.webtoonIdx, req.files.contentImg[0].location]);
    console.log(result);
    if (!result) {
        res.status(200).send(authUtil.successFalse(statusCode.BAD_REQUEST, resMsg.ADD_EPISODE_FAIL));
    }
    else {
        res.status(200).send(authUtil.successTrue(statusCode.OK, resMsg.ADD_EPISODE_SUCCESS));
    }
})
/*webtoon이 되어야 작동할 듯*/

router.put('/', upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'contentImg', maxCount: 1 }]), async (req, res) => {
    let updateQuery = 'UPDATE episode SET thumbnail=?, contentImg=?, writetime=?, title=? WHERE episodeIdx = ?';
    let result = await pool.queryParam_Arr(updateQuery, [req.files.thumbnail[0].location,req.files.contentImg[0].location, timeFormat, req.body.title, req.body.episodeIdx]);
    console.log(result);
    if (result.affectedRows ==0 ) {
        res.status(200).send(authUtil.successFalse(statusCode.BAD_REQUEST, resMsg.UPDATE_EPISODE_FAIL));
    }
    else {
        res.status(200).send(authUtil.successTrue(statusCode.OK, resMsg.UPDATE_EPISODE_SUCCESS));
    }
})

router.delete('/:episodeId', async (req, res) => {
    let episodeId = req.params.episodeId;
    let deleteQuery = 'DELETE FROM episode WHERE episodeIdx = ?';
    let result = await pool.queryParam_Arr(deleteQuery, [episodeId]);
    console.log(result);
    if (result.affectedRows == 0) {
        res.status(200).send(authUtil.successFalse(statusCode.BAD_REQUEST, resMsg.NO_EPISODE));
    }
    else {
        res.status(200).send(authUtil.successTrue(statusCode.OK, resMsg.DELETE_EPISODE_SUCCESS));
    }
})

//댓글 리스트
router.get('/:episodeId/comments', async (req, res) => {
    let episodeIdx = req.params.episodeId;
    let getContentQuery = 'SELECT * FROM comment WHERE episodeIdx = ?';
    let result = (await pool.queryParam_Arr(getContentQuery, [episodeIdx]));
    console.log(result);
    if (!result) {
        res.status(200).send(authUtil.successFalse(statusCode.BAD_REQUEST, resMsg.NO_COMMENTS));
    }
    else {
        res.status(200).send(authUtil.successTrue(statusCode.OK, resMsg.READ_COMMENTS_SUCCESS, result));
    }
})

module.exports = router;
