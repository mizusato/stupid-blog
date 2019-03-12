#!/usr/bin/env node


let readline = require('readline-sync')
let security = require('./security')
let input_options = { hideEchoBack: true, mask: '*' }


function main () {
    let username = readline.question('input new username: ', input_options)
    let password = readline.question('input new password: ', input_options)
    security.reset(username, password)
    console.log('password updated successfully.')
}


main()
