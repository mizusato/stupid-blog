function concat (...arrays) {
    let result = []
    for (let array of arrays) {
        for (let element of array) {
            result.push(element)
        }        
    }
    return result
}


function capitalize (string) {
    return string[0].toUpperCase() + string.slice(1, string.length)
}


function is_hash (object) {
    return (
        typeof object == 'object'
            && Object.getPrototypeOf(object) == Object.prototype
    )
}


function extract_props (structure) {
    let s = structure
    let props = {}
    for (let key of Object.keys(s)) {
        if (key == 'children' || key == 'tag') {
            continue
        } else if (key == 'handlers') {
            for (let event of Object.keys(s.handlers)) {
                props[`on${capitalize(event)}`] = s.handlers[event]
            }
        } else {
            props[key] = s[key]
        }
    }
    return props
}


function JSX (structure) {
    let s = structure
    if (is_hash(s)) {
        return React.createElement.apply(
            React,
            concat(
                [s.tag, extract_props(s)],
                (s.children)? s.children.map(JSX): []
            )
        )
    } else {
        return s
    }
}
