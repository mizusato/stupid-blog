let express = require('express')
let ecstatic = require('ecstatic')
let argparse = require('argparse')


let parser = new argparse.ArgumentParser({
    addHelp: true,
    description: 'Blog Server'
})

parser.addArgument(['-p','--port'], { defaultValue: '9487' })

let args = parser.parseArgs()


let server = express()


server.use(ecstatic({
    baseDir: '/files',
    root: `files`,
    showDir: true,
    autoIndex: false,
    hidePermissions: true,
    handleError: false
}))


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


server.listen(args.port, () => console.log(`listening on port ${args.port}`))
