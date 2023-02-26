const sha256 = require("sha256")
const db = require("./functions/Database")
const jwt = require('jsonwebtoken');
const middleware = require("./functions/middleware")

module.exports = (fastify, opts, done) => {

    //auth
    fastify.post("signup", (req, reply) => {

        const { username, password, privateKey} = req.body
        if (!username || !password || privateKey !== require("./config.json").privateKey) return { code: 0, msg: "กรุณาระบุข้อมูลให้ครบ!" }
        const users = db.get("users")
        if (!users.status) return { code: 0, msg: "พบปัญหากับฐานข้อมูล" }
        if (users.data.find(u => u.username.toLowerCase() === username.toLowerCase())) return { code: 0, msg: "มีชื่อผู้ใช้นี้อยู่ในระบบอยู่แล้ว!" }
        users.data.push({
            username,
            password: sha256(password, { asBytes: true })
        })

        const saveData = db.save("users", users.data)
        return { code: saveData ? 1 : 0, msg: saveData ? "สำเร็จแล้ว" : saveData }

    })
    fastify.post("signin", (req, reply) => {

        let { username, password } = req.body
        if (!username || !password) return { code: 0, msg: "กรุณาระบุข้อมูลให้ครบ!" }
        const users = db.get("users")
        if (!users.status) return { code: 0, msg: "พบปัญหากับฐานข้อมูล" }

        const user = users.data.find(u => u.username.toLowerCase() === username.toLowerCase())
        if(!user) return { code: 0, msg: "ไมพบผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }
        
        password = sha256(password, { asBytes: true }).toString()
        if(user.password.toString() !== password) return { code: 0, msg: "ไมพบผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }
        
        const token = jwt.sign({ username }, require("./config.json").key);
        return { code: 1, msg: "สำเร็จแล้ว", token }

    })

    fastify.get("@me", { preHandler: [middleware.getUser] }, (req, reply) => {
        return reply.send({ code: 1 })
    })
    
    done()
}