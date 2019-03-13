#!/usr/bin/env node


let DATA_FILE = 'data.json'


let express = require('express')
let serve_index = require('serve-index')
let argparse = require('argparse')
let fs = require('fs')
let auth = require('./auth')


let data = JSON.parse(fs.readFileSync(DATA_FILE))


function save_data() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data))
}


let server = express()


function serve_static(dir, options) {
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


server.use((req, res, next) => {
    console.log(`FROM ${req.ip} ${req.method} ${req.originalUrl}`)
    next()
})


server.use(`${auth.admin_url}/api/*`, auth.checker)


server.post(`${auth.admin_url}/login`, (req, res) => {
    res.json({ msg: 'Test OK', token: auth.gen_token() })
})


server.use(`${auth.admin_url}`, serve_static('admin'))


server.get('/data', (req, res) => {
    res.json(data)
})


server.use('/files', serve_static('files', { index: true, dot: true }))


server.use('/page/:id', (req, res, next) => {
    req.url = '/'
    server.handle(req, res, next)
})


server.use('/article/:id', (req, res, next) => {
    req.url = '/'
    server.handle(req, res, next)
})


server.use('/', (req, res, next) => {
    next()
})


server.use('/', serve_static('client'))


server.use((err, req, res, next) => {
    if (err.statusCode == 404) {
        res.status(404).sendFile('404.html', { root: __dirname })
    } else {
        res.status(code).send(`<!DOCTYPE html><h1>HTTP ${code}</h1>`)
    }
})


function main() {
    let parser = new argparse.ArgumentParser({
        addHelp: true,
        description: 'Blog Server'
    })
    parser.addArgument(['-p','--port'], { defaultValue: '9487' })
    let args = parser.parseArgs()
    server.listen(
        args.port, () => console.log(`listening on port ${args.port}`)
    )
}


main()
