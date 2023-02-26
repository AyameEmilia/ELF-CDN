const fs = require("fs")
const saveDB = (path, data) => {
    try {
        fs.writeFileSync("./database/" + path + ".json", JSON.stringify(data, null, 4))
    } catch (error) {
        return {
            error: error,
            status: false
        }
    }
    return {
        status: true
    }
}

const getDB = (path) => {
    let database;
    try {
        database = JSON.parse(fs.readFileSync("./database/" + path + ".json", "utf-8"))
    } catch (error) {
        return {
            status: false,
            error: error
        }
    }
    return {
        status: true,
        data: database
    }
}

module.exports = {
    save: saveDB,
    get: getDB
}