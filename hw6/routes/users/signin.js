var express = require('express');
var router = express.Router();

const resMessage = require('../../modules/responseMessage')
const statusCode = require('../../modules/statusCode');
const authUtil = require('../../modules/authUtil');
const pool = require('../../modules/pool');
const jwtUtils = require('../../modules/jwt');
const crypto = require('crypto-promise');
const loginVerify = require('../../modules/loginVerify')

//로그인
router.post('/', async (req, res) => {
    const getuserQuery = 'SELECT * FROM user WHERE id = ?';
    const makeRefreshTokenQuery = 'UPDATE user SET refreshToken=? WHERE id=?'
    const result = await pool.queryParam_Parse(getuserQuery, [req.body.id]);

    if (!result || result.length == 0) {
        res.status(200).send(authUtil.successFalse(statusCode.DB_ERROR, resMessage.ID_OR_PASSWORD_INCORRECT));
    } else {
        const tokens = await jwtUtils.sign(req.body);
        const salt = result[0].salt;
        console.log(tokens);
        const loadPwd = result[0].password;
        const hashedPw = await crypto.pbkdf2(req.body.password.toString('base64'), salt, 1000, 32, 'SHA512');
        if (loadPwd === hashedPw.toString('base64')) {
            if(result[0].refreshToken == null) {
                await pool.queryParam_Arr(makeRefreshTokenQuery, [tokens.refreshToken, req.body.id]);
                res.status(200).send(authUtil.successTrue(statusCode.OK, resMessage.SIGNIN_SUCCESS, tokens.token));
            }
            else {
                res.status(200).send(authUtil.successTrue(statusCode.OK, resMessage.SIGNIN_SUCCESS, tokens.token ));
            }
        }
        else {
            res.status(200).send(authUtil.successFalse(statusCode.DB_ERROR, resMessage.ID_OR_PASSWORD_INCORRECT));
        }

    }
});

router.get('/', loginVerify.isLoggedin, (req, res)=>{
    console.log(req.decoded);
} )

module.exports = router;