#!/usr/bin/env node

/* External Modules */
let express = require('express')
let argparse = require('argparse')

/* Internal Modules */
let tools = require('./server/tools')
let auth = require('./server/auth')
let api = require('./server/api')
let seo = require('./server/seo')


/* Initialize Server */
let server = express()
server.disable('etag')
server.use(tools.logger)

/* Common Static Files */
server.use('/common', tools.serve_static('common'))

/* User Static Files */
server.use('/files', tools.serve_static('files', { index: true, dot: true }))

/* Administration Interface */
server.use(`${auth.admin_url}/api/*`, auth.checker)
server.post(`${auth.admin_url}/api/remove`, tools.parse_json, api.remove)
server.post(`${auth.admin_url}/api/update`, tools.parse_json, api.update)
server.post(`${auth.admin_url}/login`, tools.parse_json, auth.login)
server.post(`${auth.admin_url}/validate`, tools.parse_json, auth.validate)
server.use(`${auth.admin_url}`, tools.serve_static('admin'))

/* Data API */
server.get('/data', api.get_data)

/* SPA & SEO */
let jump2spa = (req, res, next) => {
    req.url = '/'
    server.handle(req, res, next)
}
server.use('/page/:id', seo.page, jump2spa)
server.use('/article/:id', seo.article, jump2spa)
server.use('/tag/:name', jump2spa)
server.use('/preview/:category', jump2spa)
server.use('/', seo.index, tools.serve_static('client'))

/* Error Handling */
server.use((err, req, res, next) => {
    if (err.statusCode == 404) {
        res.status(404).sendFile('404.html', { root: `${__dirname}/server` })
    } else {
        let code = err.statusCode || 500
        res.status(code).send(
            `<!DOCTYPE html>
            <h1>HTTP ${code}</h1>
            <pre>${err.message}</pre>
            <pre>${err.stack}</pre>`
        )
    }
})


/* Entry Point */
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
