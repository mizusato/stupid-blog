#!/usr/bin/env node


let DATA_FILE = 'data.json'


let express = require('express')
let ecstatic = require('ecstatic')
let argparse = require('argparse')
let fs = require('fs')
let data = JSON.parse(fs.readFileSync(DATA_FILE))


function save_data() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data))
}


let server = express()    


server.use((req, res, next) => {
    console.log(`FROM ${req.ip} ${req.method} ${req.originalUrl}`)
    next()
})


server.get('/data', async (req, res) => {
    // delay for debugging
    await new Promise(resolve => setTimeout(()=>resolve(), '1000'))
    res.json(data)
})


server.use(ecstatic({
    baseDir: '/files',
    root: `files`,
    showDir: true,
    autoIndex: false,
    hidePermissions: true,
    handleError: false
}))


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


server.use(ecstatic({
    baseDir: '/',
    root: `${__dirname}/client`,
    showDir: false,
    cache: 'max-age=0',
    handleError: false
}))


server.use((req, res, next) => {
    let code = res.statusCode
    if (code == 404) {
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
