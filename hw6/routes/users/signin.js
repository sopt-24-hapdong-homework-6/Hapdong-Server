var express = require('express');
var router = express.Router();

const resMessage = require('../../modules/responseMessage')
const statusCode = require('../../modules/statusCode');
const authUtil = require('../../modules/authUtil');
const pool = require('../../modules/pool');

const crypto = require('crypto-promise');

//로그인
router.post('/', async (req, res) => {
    const getuserQuery = 'SELECT * FROM user WHERE id = ?';
    const result = await pool.queryParam_Parse(getuserQuery, [req.body.id]);

    if (!result || result.length == 0) {
        res.status(200).send(authUtil.successFalse(statusCode.DB_ERROR, resMessage.ID_OR_PASSWORD_INCORRECT));
    } else {
        const salt = result[0].salt;
        const loadPwd = result[0].password;
        const hashedPw = await crypto.pbkdf2(req.body.password.toString('base64'), salt, 1000, 32, 'SHA512');
        if (loadPwd === hashedPw.toString('base64')) {
            res.status(200).send(authUtil.successTrue(statusCode.OK, resMessage.SIGNIN_SUCCESS));
            /*MEMBERSHIP_INSERT_SUCCESS 가 없어서 수정.*/
        }
        else {
            res.status(200).send(authUtil.successFalse(statusCode.DB_ERROR, resMessage.ID_OR_PASSWORD_INCORRECT));
        }

    }
});
module.exports = router;