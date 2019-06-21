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
    const firstTokenQuery = 'UPDATE user SET refreshToken=? WHERE id=?'
    const getUserResult = (await pool.queryParam_Parse(getuserQuery, [req.body.id]))[0];
    if (!getUserResult || getUserResult.length == 0) {
        res.status(200).send(authUtil.successFalse(statusCode.DB_ERROR, resMessage.ID_OR_PASSWORD_INCORRECT));
    } else {
        
        const refreshToken = req.headers.refreshtoken;
        const accessVerify = jwtUtils.verify(req.headers.token);
        const salt = getUserResult.salt;
        const loadPwd = getUserResult.password;
        const hashedPw = await crypto.pbkdf2(req.body.password.toString('base64'), salt, 1000, 32, 'SHA512');
        const refreshVerify = jwtUtils.verify(refreshToken);
        if (loadPwd === hashedPw.toString('base64')) {
            if(getUserResult.refreshToken == '' || refreshVerify == -3) { //첫 로그인이라 아예 리프레쉬토큰이 없을 때 or refreshToken 이 만료됐을 때
                console.log('First login. Token complete.');
                const tokens = await jwtUtils.sign(req.body);
                await pool.queryParam_Arr(firstTokenQuery, [tokens.refreshToken, req.body.id]);
                res.status(200).send(authUtil.successTrue(statusCode.OK, resMessage.SIGNIN_SUCCESS, tokens));
            }
            else if (accessVerify == -3 || accessVerify == -2){ //verify 결과 유효하지 않거나 만료된 accessToken 일때
                if(refreshToken == getUserResult.refreshToken) {
                    const newAccessToken = await jwtUtils.refresh(getUserResult);
                    res.status(200).send(authUtil.successTrue(statusCode.OK, resMessage.SIGNIN_SUCCESS, newAccessToken));
                }
            }
            else {
                console.log('이미 로그인 중입니다.');
                res.status(200).send(authUtil.successFalse(statusCode.BAD_REQUEST, resMessage.ALREADY_LOGIN));
            }
        }
        else {
            res.status(200).send(authUtil.successFalse(statusCode.DB_ERROR, resMessage.ID_OR_PASSWORD_INCORRECT));
        }

    }
});

//토큰 재발급
router.get('/refresh', async (req, res) => {
    const refreshToken = req.headers.refreshtoken;
    const verify = jwtUtils.verify(req.headers.token);
    console.log(verify);
    if(verify == -3 || verify == -2) {

    }
    else {
        //DB에서 해당 refreshToken을 가진 User를 찾음
        const getRefreshTokenUserQuery = 'SELECT * FROM user WHERE refreshToken =?'
        //찾은 유저
        const selectUser = await pool.queryParam_Parse(getRefreshTokenUserQuery, [refreshToken]);
    
        if(!selectUser || selectUser.length == 0){
            res.status(200).send(authUtil.successFalse(statusCode.DB_ERROR, resMessage.INVALID_REFRESH_TOKEN));
        }
        else{
            const newAccessToken = jwt.refresh(selectUser[0]);
            res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, resMessage.REFRESH_TOKEN, newAccessToken));
        }
    }
});

module.exports = router;