let express = require('express')
let serve_index = require('serve-index')
let body_parser = require('body-parser')


function logger (req, res, next) {
    let time = (new Date()).toLocaleString()
    console.log(`[${time}] <${req.ip}> ${req.method} ${req.originalUrl}`)
    next()
}


function serve_static (dir, options) {
    options = options || {}
    let path = `${__dirname}/${dir}`
    let base = express.static(path, {
        fallthrough: !!options.index,
        dotfiles: (options.dot? 'allow': 'ignore')
    })
    if (options.index) {
        return [base, serve_index(path, {
            icons: true,
            hidden: !options.dot
        })]
    } else {
        return base
    }
}


let parse_json = [body_parser.text({type:'*/*'}), (req, res, next) => {
    try {
        req.data = JSON.parse(req.body)
        next()
    } catch (err) {
        res.status(400).json({ ok: false, msg: '400 Bad Request' })
    }
}]


module.exports = { logger, serve_static, parse_json }
