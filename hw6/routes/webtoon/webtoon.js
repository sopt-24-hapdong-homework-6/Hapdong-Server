var express = require('express');
var router = express.Router();

const resMessage = require('../../modules/responseMessage')
const statusCode = require('../../modules/statusCode')
const authUtil = require('../../modules/authUtil')
const pool = require('../../modules/pool')

// 웹툰 추가
router.post('/', upload.fields([{ name: 'thumbnail', maxCount: 1 }]), async (req, res) => {
    let insertQuery = 'INSERT INTO webtoon (name, writer, thumbnail, category) VALUES (?,?,?,?)';
    let result = await pool.queryParam_Arr(insertQuery, [req.body.name, req.body.writer, req.files.thumbnail[0].location, req.body.category]);
    console.log(result);
    if (!result) {
        res.status(200).send(authUtil.successFalse(statusCode.BAD_REQUEST, resMessage.ADD_WEBTOON_FAIL));
    }
    else {
        res.status(200).send(authUtil.successTrue(statusCode.OK, resMessage.ADD_WEBTOON_SUCCESS));
    }
})

// 웹툰 수정
router.put('/', upload.fields([{ name: 'thumbnail', maxCount: 1 }]), async (req, res) => {
    let updateQuery = 'UPDATE webtoon SET (name, writer, thumbnail, category) = (?,?,?,?) WHERE webtoonIdx = ?';
    let result = await pool.queryParam_Arr(updateQuery, [req.body.name, req.body.writer, req.files.thumbnail[0].location, req.body.category, req.body.webtoonIdx]);
    console.log(result);
    if(!result) {
        res.status(200).send(authUtil.successFalse(statusCode.BAD_REQUEST, resMessage.UPDATE_WEBTOON_FAIL));
    }
    else {
        res.status(200).send(authUtil.successTrue(statusCode.OK, resMessage.UPDATE_WEBTOON_SUCCESS));
    }
})

// 웹툰 삭제
router.delete('/:webtoonId', async (req,res)=>{
    let webtoonId = req.params.webtoonId;
    let deleteQuery = 'DELETE FROM webtoon WHERE webtoonIdx = ?';
    let result = await pool.queryParam_Arr(deleteQuery, [webtoonId]);
    console.log(result);
    if(!result) {
        res.status(200).send(authUtil.successFalse(statusCode.BAD_REQUEST, resMessage.NO_WEBTOON));
    }
    else {
        res.status(200).send(authUtil.successTrue(statusCode.OK, resMessage.DELETE_WEBTOON_SUCCESS));
    }
})

module.exports = router;