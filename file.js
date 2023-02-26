const db = require("./functions/Database")
const sha256 = require("sha256")
const path = require("path")
const fs = require("fs")
const middleware = require("./functions/middleware")

module.exports = (fastify, opts, done) => {

    fastify.get('/:file', (req, reply) => {
        const fileurl = req.params.file
        const file = db.get("upload")
        if (!file || !file.status) return reply.sendFile("error.html")
        let search = file.data;
        search = search.find(e => e.url === fileurl)
        if (!search) return reply.sendFile("error.html")
        let key = req?.query?.key

        if (search.key !== false) {
            if (!key) return reply.sendFile("error.html")
            else {
                try {
                    key = sha256(key)
                } catch (err) {
                    return reply.sendFile("error.html")
                }
                if (search.key && search.key !== key) return reply.sendFile("error.html")
                const buffer = fs.readFileSync(path.join("private", search.file.path))
                reply.type(search.file.mime)
                return reply.send(buffer)
            }
        } else {
            const buffer = fs.readFileSync(path.join("private", search.file.path))
            reply.type(search.file.mime)
            return reply.send(buffer)
        }
    })

    fastify.post("upload", { preHandler: [middleware.getUser] }, async (req, res) => {
        const body = req.body
        let key = body?.key?.value
        const file = await body?.file?.toBuffer()

        if (!file) return { msg: "กรุณาอัพโหลดไฟล์ให้ถูกต้อง", code: 0 }

        let fileSplit = body.file.filename.split('.');
        let fileExt = '';
        if (fileSplit.length > 1) {
            fileExt = fileSplit[fileSplit.length - 1];
        }

        const data = {
            url: (new Date().getTime()).toString(16),
            file: {
                "mime": body.file.mimetype,
                "path": (new Date().getTime()).toString(16) + "." + fileExt
            },
            key: false,
            owner: req.user.username
        }
        key = key === "false" ? false : key
        if (key) data.key = sha256(key)
        fs.writeFileSync(path.join("private", data.file.path), file)
        const uploadDB = db.get("upload")
        if (!uploadDB.status) return { msg: "พบปัญหาในการอ่านฐานข้อมูล", code: 0 }
        uploadDB.data.push(data)
        db.save("upload", uploadDB.data)

        return { msg: "สำเร็จแล้ว", code: 1, url: `${require("./config.json").domain + "/file/"}${data.url}${data.key ? "?key=" + key : ''}` }
    })

    // เดะกลับมาทำถ้าขยัน
    // fastify.post("delete", async (req,res) => {
    //     let url = req.body.url.value
    //     const privateKey = req.body.key.value
    //     if(privateKey !== require("./config.json").privateKey) return { msg: "ไม่มีสิทธิ์สำหรับการกระทำนี้!", code: 0 }
    // })

    done()
}