var express = require('express');
var router = express.Router();

const resMessage = require('../../modules/responseMessage')
const statusCode = require('../../modules/statusCode')
const authUtil = require('../../modules/authUtil')
const pool = require('../../modules/pool')

// 웹툰 리스트 가져오기
router.get('/:categoryId', async (req, res) => {
    let categoryId = req.params.categoryId
    let getWebtoonListQuery = 'SELECT name, writer, thumnail FROM webtoon WHERE category = ?'
    let result = await pool.queryParam_Arr(getWebtoonListQuery, [categoryId])

    if(result.length === undefined) {
        res.status(200).send(authUtil.successFalse(statusCode.BAD_REQUEST, resMessage.READ_DATA_FAIL))
    } else if(result.length == 0) {
        res.status(200).send(authUtil.successTrue(statusCode.OK, resMessage.NO_WEBTOON, []))
    } else if(result.length > 1) {
        res.status(200).send(authUtil.successTrue(statusCode.OK, resMessage.READ_WEBTOON_LIST_SUCCESS, result))
    }

})


module.exports = router;
