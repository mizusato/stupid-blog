#!/usr/bin/env node


let readline = require('readline-sync')
let security = require('./security')
let mask = { hideEchoBack: true, mask: '*' }


function main () {
    let url = readline.question('input new url for admin interface: ')
    let username = readline.question('input new username: ', mask)
    let password = readline.question('input new password: ', mask)
    if (url.length <= 1 || !url.startsWith('/')) {
        console.log('Error: URL not valid')
        process.exit(1)
    }
    security.reset(url, username, password)
    console.log('credentials updated successfully.')
    console.log('please restart the server to apply changes.')
}


main()
