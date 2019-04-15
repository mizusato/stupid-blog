function es8_not_ok_action () {
    alert('We detected that your browser does not support ECMAScript 2017. Please update your browser.')
    window.location.href = 'https://www.mozilla.org/en-US/firefox/all/'
}


if (!window.es8_ok) {
     es8_not_ok_action()
} else {
    console.log('ES2017 Check Passed')
}
