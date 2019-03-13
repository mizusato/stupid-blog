#!/usr/bin/env node


let express = require('express')
let argparse = require('argparse')

let tools = require('./tools')
let auth = require('./auth')
let api = require('./api')


let server = express()


server.disable('etag')


server.use(tools.logger)


server.use(`${auth.admin_url}/api/*`, auth.checker)


server.post(`${auth.admin_url}/login`, (req, res) => {
    res.json({ msg: 'Test OK', token: auth.gen_token() })
})


server.use(`${auth.admin_url}`, tools.serve_static('admin'))


server.get('/data', api.get_data)


server.use('/files', tools.serve_static('files', { index: true, dot: true }))


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


server.use('/', tools.serve_static('client'))


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
