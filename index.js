const fastify = require('fastify')({ logger: false, bodyLimit: 524288000 });
const path = require("path")
const middleware = require("./functions/middleware")
//register
fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, 'public'),
    prefix: '/public/'
})
fastify.register(require('@fastify/cookie'), {
    secret: "ck_"+require("./config.json").key, // for cookies signature
    hook: 'onRequest', // set to false to disable cookie autoparsing or set autoparsing on any of the following hooks: 'onRequest', 'preParsing', 'preHandler', 'preValidation'. default: 'onRequest'
    parseOptions: {}  // options for parsing cookies
})
fastify.register(require('@fastify/multipart'), {
    attachFieldsToBody: true,
    limits: {
        fieldNameSize: 100, // Max field name size in bytes
        fieldSize: 100,     // Max field value size in bytes
        fields: 2,         // Max number of non-file fields
        fileSize: 524288000,  // For multipart forms, the max file size in bytes
        files: 1,           // Max number of file fields
        headerPairs: 2000,   // Max number of header key=>value pairs
        parts: 1000         // For multipart forms, the max number of parts (fields + files)
    }
});
fastify.register(require("./api"), { prefix: '/api/v1/' });
fastify.register(require("./file"), { prefix: '/file/' });

//homepage
fastify.get('/', { preHandler: [middleware.data] }, async (request, reply) => {
    if (request.user) reply.redirect("/upload")
    return reply.sendFile("index.html")
})
fastify.get('/error', async (request, reply) => reply.sendFile("error.html"))
fastify.get('/signin', { preHandler: [middleware.data] }, async (request, reply) => {
    if (request.user) reply.redirect("/upload")
    return reply.sendFile("signin.html")
})
fastify.get('/signup', { preHandler: [middleware.data] }, async (request, reply) => {
    if (request.user) reply.redirect("/upload")
    return reply.sendFile("signup.html")
})
fastify.get('/upload', { preHandler: [middleware.data] }, async (request, reply) => {
    if (!request.user) reply.redirect("/signin")
    return reply.sendFile("upload.html")
})
fastify.get("/logout", (req,res) => {
    res.clearCookie("token")
    return res.redirect("/")
})


//start
const start = async () => {
    try {
        await fastify.listen({ port: require("./config.json").port, host: "0.0.0.0" }).then(() => {
            console.log("Server running on http://localhost:" + require("./config.json").port)
        })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start()