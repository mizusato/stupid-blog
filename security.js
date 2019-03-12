let CONFIG_SCHEMA = { url: 'string', username: 'string', password: 'string' }
let PASSWORD_FILE = 'password.json'
let ROUNDS = 13
let fs = require('fs')
let bcrypt = require('bcrypt')
let config = null


function error (msg) {
    console.log(msg)
    process.exit(1)
}


function load_config () {
    try {
        config = JSON.parse(fs.readFileSync(PASSWORD_FILE))
        for (let key of Object.keys(CONFIG_SCHEMA)) {
            if (typeof config[key] != CONFIG_SCHEMA[key]) {
                error('invalid password configuration file')
            }
        }
    } catch (err) {
        console.log(err)
        error('unable to read password configuration file')
    }
}


function hash (input) {
    return bcrypt.hashSync(input, ROUNDS)
}


function compare (input, password) {
    return bcrypt.compareSync(input, password)
}


function reset (url, username, password) {
    config = {
        url: url,
        username: hash(username),
        password: hash(password)
    }
    fs.writeFileSync(PASSWORD_FILE, JSON.stringify(config))
}


function check (username, password, callback) {
    let u_ok = compare(username, config.username)
    let p_ok = compare(password, config.password)
    callback(null, u_ok && p_ok)
}


load_config()


module.exports = { admin_url: config.url, reset, check }
