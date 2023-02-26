const jwt = require('jsonwebtoken');
const db = require("./Database")
const getUser = (req, res, done) => {
    const token = req.headers.token
    let decoded;
    try {
        decoded = jwt.verify(token, require("../config.json").key);
    } catch (error) {
        return res.send({ msg: "ผิดพลาดกรุณาเข้าสู่ใหม่เพื่อลองอีกครั้ง!", code: 0 })
    }
    if (!decoded) return res.send({ msg: "ผิดพลาดกรุณาเข้าสู่ใหม่เพื่อลองอีกครั้ง!", code: 0 })
    const user = db.get("users")
    if (!user.status) res.send({ msg: "ฐานข้อมูลชำรุดกรุณาติดต่อผู้ดูแล!", code: 0 })
    if (user.data.find(e => e.username === decoded.username)) {
        req.user = user.data.find(e => e.username === decoded.username)
        done()
    }
    else return res.send({ msg: "ผิดพลาดกรุณาเข้าสู่ใหม่เพื่อลองอีกครั้ง!", code: 0 })
}

const getUserData = (req, res, done) => {
    const token = req.cookies.token
    let decoded;
    try {
        decoded = jwt.verify(token, require("../config.json").key);
    } catch (error) {
        return done();
    }
    if (!decoded) return;
    const user = db.get("users")
    if (!user.status) return;
    if (user.data.find(e => e.username === decoded.username)) {
        req.user = user.data.find(e => e.username === decoded.username)
        return done();
    }
    else return done();
}

module.exports = {
    getUser: getUser,
    data: getUserData
}