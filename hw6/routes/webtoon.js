var express = require('express');
var router = express.Router();
const pool = require('../modules/pool');
const statusCode = require('../modules/statusCode');
const authUtil = require('../modules/authUtil');
const upload = require('../config/multer');
const resMsg = require('../modules/responseMessage');

/*webtoon 폴더안에 webtoon.js 밖에 없어서 라우팅 할게 없으면 routes 안의 index에서 정의해도 돼서 옮겼음!*/

// 웹툰 추가
router.post('/', upload.fields([{ name: 'thumbnail', maxCount: 1 }]), async (req, res) => {
    let insertQuery = 'INSERT INTO webtoon (name, writer, thumbnail, category) VALUES (?,?,?,?)';
    let result = await pool.queryParam_Arr(insertQuery, [req.body.name, req.body.writer, req.files.thumbnail[0].location, req.body.category]);
    if (!result) {
        res.status(200).send(authUtil.successFalse(statusCode.BAD_REQUEST, resMsg.ADD_WEBTOON_FAIL));
    }
    else {
        res.status(200).send(authUtil.successTrue(statusCode.OK, resMsg.ADD_WEBTOON_SUCCESS));
    }
})

// 웹툰 수정
router.put('/', upload.fields([{ name: 'thumbnail', maxCount: 1 }]), async (req, res) => {
    let updateQuery = 'UPDATE webtoon SET name = ?, writer = ?, thumbnail = ?, category = ? WHERE webtoonIdx = ?';
    let result = await pool.queryParam_Arr(updateQuery, [req.body.name, req.body.writer, req.files.thumbnail[0].location, req.body.category, req.body.webtoonIdx]);
    if(result.changedRows == 0) {
        res.status(200).send(authUtil.successFalse(statusCode.BAD_REQUEST, resMsg.UPDATE_WEBTOON_FAIL));
    }
    else {
        res.status(200).send(authUtil.successTrue(statusCode.OK, resMsg.UPDATE_WEBTOON_SUCCESS));
    }
    /*result 를 콘솔에 찍어보면 update는 조건 안맞아도 undefined 가 안나와서 result.changedRows==0 이면 변화된 열이 없는 것으로 일단 처리했는데... 물어봐야할듯... */
})

// 웹툰 삭제
router.delete('/:webtoonId', async (req,res)=>{
    let webtoonId = req.params.webtoonId;
    let deleteQuery = 'DELETE FROM webtoon WHERE webtoonIdx = ?';
    let result = await pool.queryParam_Arr(deleteQuery, [webtoonId]);
    console.log(result);
    if(result.affectedRows == 0) {
        res.status(200).send(authUtil.successFalse(statusCode.BAD_REQUEST, resMsg.NO_WEBTOON));
    }
    else {
        res.status(200).send(authUtil.successTrue(statusCode.OK, resMsg.DELETE_WEBTOON_SUCCESS));
    }
})
/* 얘도 똑같음... 어카ㅈ ㅣ ? */
module.exports = router;