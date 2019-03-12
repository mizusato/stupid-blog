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
        let data = JSON.parse(fs.readFileSync(PASSWORD_FILE))
        let u_valid = typeof data.username == 'string'
        let p_valid = typeof data.password == 'string'
        if (u_valid && p_valid) {
            config = data
        }
    } catch (err) {
        console.log(err)
        error('unable to read password file')
    }
}


function hash (input) {
    return bcrypt.hashSync(input, ROUNDS)
}


function compare (input, password) {
    return bcrypt.compareSync(input, password)
}


function reset (username, password) {
    config = {
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


module.exports = { config, reset, check }
