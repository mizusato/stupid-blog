let express = require('express')
let serve_index = require('serve-index')


function logger (req, res, next) {
    console.log(`FROM ${req.ip} ${req.method} ${req.originalUrl}`)
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


module.exports = { logger, serve_static }

