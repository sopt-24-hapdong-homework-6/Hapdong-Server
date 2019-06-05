var express = require('express');
var router = express.Router();

const resMessage = require('../../modules/responseMessage')
const statusCode = require('../../modules/statusCode');
const authUtil = require('../../modules/authUtil');
const pool = require('../../modules/pool');

const crypto = require('crypto-promise');

//회원 가입
router.post('/', async (req, res) => {

    const insertQuery = 'INSERT INTO user (name, id, password, salt) VALUES (?, ?, ?, ?)';
    //이미 존재하는 id 인지 확인
    const idQuery = 'SELECT * FROM user WHERE id= ?';
    const idresult = await pool.queryParam_Parse(idQuery, [req.body.id]);
    if (idresult.length > 0) {
        res.status(200).send(authUtil.successFalse(statusCode.DB_ERROR, resMessage.ALREADY_USER));
    }
    else {
        const salt = await crypto.randomBytes(32);
        const hashedpw = await crypto.pbkdf2(req.body.password.toString(), salt.toString('base64'), 1000, 32, 'SHA512');
        const result = await pool.queryParam_Parse(insertQuery, [req.body.name, req.body.id, hashedpw.toString('base64'), salt.toString('base64')]);
        if (!result) {
            res.status(200).send(authUtil.successFalse(statusCode.DB_ERROR, resMessage.NULL_VALUE));
            /*MEMBERSHIP_INSERT_SUCCESS 가 없어서 수정. 회원가입에서는 아디 비번 같은거 틀릴일 없어서 그냥 value가 없을때만 가정했음. */
        } else {
            res.status(200).send(authUtil.successTrue(statusCode.OK, resMessage.SIGNUP_SUCCESS));
        }
    }
});
module.exports = router;