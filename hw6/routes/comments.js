var express = require('express');
var router = express.Router();

const resMsg = require('../modules/responseMessage')
const statusCode = require('../modules/statusCode');
const authUtil = require('../modules/authUtil');
const pool = require('../modules/pool');

const upload = require('../config/multer');
const moment = require('moment');
const timeFormat = moment().format('YYYY-MM-DD HH:mm:ss');

//댓글 쓰기
router.post('/', upload.single('img'), async (req, res) => {
    const contentImg = req.file.location;
    const insertQuery = 'INSERT INTO comment (userIdx, writetime, content, contentImg, episodeIdx) VALUES (?, ?, ?, ?, ?)';
    let result = await pool.queryParam_Arr(insertQuery, [req.body.userIdx, timeFormat, req.body.content, contentImg, req.body.episodeIdx]);
    if (!result) {
        res.status(200).send(authUtil.successFalse(statusCode.BAD_REQUEST, resMsg.ADD_COMMENT_FAIL));
    }
    else {
        res.status(200).send(authUtil.successTrue(statusCode.OK, resMsg.ADD_COMMENT_SUCCESS));
    }
});

//댓글 수정
router.put('/', upload.single('img'), async (req, res) => {
    const contentImg = req.file.location;

    const selectQuery = 'SELECT * FROM comment WHERE commentIDX = ? AND userIdx = ?'
    let commentresult = await pool.queryParam_Arr(selectQuery, [req.body.commentIdx, req.body.userIdx]);
    if (!commentresult) {
        res.status(200).send(authUtil.successFalse(statusCode.BAD_REQUEST, resMsg.UPDATE_COMMENT_FAIL));
    }
    else if (commentresult.length == 0) {
        res.status(200).send(authUtil.successFalse(statusCode.BAD_REQUEST, resMsg.NO_UPDATE_AUTHORITY));
    }
    else {
        const updateQuery = 'UPDATE comment SET writetime=?, content=?, contentImg=? WHERE commentIdx = ? AND userIdx= ?';
        let result = await pool.queryParam_Arr(updateQuery, [timeFormat, req.body.content, contentImg, req.body.commentIdx, req.body.userIdx]);
        if (!result) {
            res.status(200).send(authUtil.successFalse(statusCode.BAD_REQUEST, resMsg.UPDATE_COMMENT_FAIL));
        }
        else {
            res.status(200).send(authUtil.successTrue(statusCode.OK, resMsg.UPDATE_COMMENT_SUCCESS));
        }
    }
});

//댓글 삭제
router.delete('/', async (req, res) => {
    let deleteQuery = 'DELETE FROM comment WHERE commentIdx = ?';
    const selectQuery = 'SELECT * FROM comment WHERE commentIdx = ? AND userIdx = ?'

    let commentresult = await pool.queryParam_Arr(selectQuery, [req.body.commentIdx, req.body.userIdx]);
    if (!commentresult) {
        res.status(200).send(authUtil.successFalse(statusCode.BAD_REQUEST, resMsg.UPDATE_COMMENT_FAIL));
    }
    else if (commentresult.length == 0) {
        res.status(200).send(authUtil.successFalse(statusCode.BAD_REQUEST, resMsg.NO_UPDATE_AUTHORITY));
    }
    else {
        let result = await pool.queryParam_Arr(deleteQuery, [req.body.commentIdx]);
        if (!result) {
            res.status(200).send(authUtil.successFalse(statusCode.BAD_REQUEST, resMsg.DELETE_COMMENT_FAIL));
        }
        else {
            res.status(200).send(authUtil.successTrue(statusCode.OK, resMsg.DELETE_COMMENT_SUCCESS));
        }
    }
});

module.exports = router;