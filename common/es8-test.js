(function (window) {
    let { a } = { a: `1` }
    let b = [1,2,3]
    let c = [...b.map(x => x+1), 2]
    class A {}
    let d = new A()
    ;(async () => { await new Promise((res, rej) => { res(1) }) })()
    if (typeof window.fetch == 'function') {
        window.es8_ok = true
    }
})(window)
