let CONFIG_SCHEMA = { url: 'string', username: 'string', password: 'string' }
let PASSWORD_FILE = 'password.json'
let ROUNDS = 12
let TOKEN_CHARS = '0123456789qwertyuiopasdfghjklzxcvbnm'
let TOKEN_LENGTH = 50


let fs = require('fs')
let bcrypt = require('bcrypt')
let config = null
let token_hash = ''


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


function choose(choices) {
    return choices[Math.floor(Math.random() * choices.length)]
}


function gen_token () {
    let token = ''
    for (let i=0; i<TOKEN_LENGTH; i++) {
        token += choose(TOKEN_CHARS)
    }
    token_hash = hash(token)
    return token
}


function check_token (token) {
    return compare(token, token_hash)
}


function checker (req, res, next) {
    let token = req.get('X-Auth-Token') || ''
    if (token.length > 0 && check_token(token)) {
        next()
    } else {
        res.status(401).json({ msg: '401 Unauthorized' })
    }
}


load_config()


module.exports = { admin_url: config.url, reset, check, gen_token, checker }
