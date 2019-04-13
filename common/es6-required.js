function es6_not_ok_action () {
    alert('We detected that your browser does not support ECMAScript 2015. Please update your browser.')
    window.location.href = 'https://www.mozilla.org/en-US/firefox/all/'
}


if (!window.es6_ok) {
     es6_not_ok_action()
}
