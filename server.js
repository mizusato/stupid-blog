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
server.post(`${auth.admin_url}/api/remove`, tools.parse_json, api.remove)
server.post(`${auth.admin_url}/api/update`, tools.parse_json, api.update)
server.post(`${auth.admin_url}/login`, tools.parse_json, auth.login)
server.post(`${auth.admin_url}/validate`, tools.parse_json, auth.validate)
server.use(`${auth.admin_url}`, tools.serve_static('admin'))


server.get('/data', api.get_data)
server.use('/common', tools.serve_static('common'))
server.use('/files', tools.serve_static('files', { index: true, dot: true }))


server.use('/page/:id', (req, res, next) => {
    req.url = '/'
    server.handle(req, res, next)
})

server.use('/article/:id', (req, res, next) => {
    req.url = '/'
    server.handle(req, res, next)
})

server.use('/tag/:name', (req, res, next) => {
    req.url = '/'
    server.handle(req, res, next)
})

server.use('/preview/:category', (req, res, next) => {
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
        let code = err.statusCode || 500
        res.status(code).send(
            `<!DOCTYPE html><h1>HTTP ${code}</h1><pre>${err.message}</pre>`
        )
    }
})


function main() {
    let parser = new argparse.ArgumentParser({
        addHelp: true,
        description: 'Blog Server'
    })
    parser.addArgument(['-p','--port'], { defaultValue: '9487' })
    let args = parser.parseArgs()
    let delay = api.SAVE_DELAY
    console.log(`*** SAVE_DELAY is set to ${delay}ms`)
    console.log(`*** Data change will be saved to disk with this delay value`)
    server.listen(args.port, () => {
        console.log(`listening on port ${args.port}`)
    })
}


main()
