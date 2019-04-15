let detector = require('spider-detector')
let api = require('./api')


let EscapeTable = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
}


function Escape(text) {
    return text.replace(/[&<>"']/g, match => {
        return EscapeTable[match]
    })
 }


function HtmlBoilerplate (title, body) {
    return `<!DOCTYPE html>
        <html>
            <head>
                <title>${Escape(title)}</title>
            </head>
            <body>
                <p style="color:red; font-weight: bold; font-size: 120%;">
                    This page intends for crawlers/spiders/bots of search engines. If you didn't modify your HTTP UserAgent, please report the bug to <a href="https://github.com/binarykitchen/spider-detector/" target="_blank">spider-detector</a>.
                </p>
                ${body}
            </body>
        </html>
    `
}


function HtmlTag (tag, props, content) {
    function encode_props () {
        let encoded = []
        for (let name of Object.keys(props)) {
            encoded.push(' ')
            encoded.push(`${Escape(name)}="${Escape(props[name])}"`)
        }
        return encoded.join('')
    }
    if (content instanceof Array) {
        content = content.join('')
    }
    return `<${Escape(tag)}${encode_props()}>${content}</${Escape(tag)}>`
}


function is_spider (req) {
    let UA = req.get('user-agent')
    return detector.isSpider(UA)
}


function page (req, res, next) {
    if (!is_spider(req)) { next(); return }
    let data = api.get_raw_data()
    let id = req.params.id
    let page = data.pages[id]
    if (!page) { res.status(404).end(); return }
    let title = `${page.title} - ${data.settings.meta.title}`
    let html = HtmlBoilerplate(title, HtmlTag('article', {}, [
        HtmlTag('h1', {}, Escape(page.title)),
        HtmlTag('p', {}, Escape(page.content))
    ]))
    res.send(html)
}


function article (req, res, next) {
    if (!is_spider(req)) { next(); return }
    let data = api.get_raw_data()
    let id = req.params.id
    let article = data.articles[id]
    if (!article) { res.status(404).end(); return }
    let title = `${article.title} - ${data.settings.meta.title}`
    let date = article.date.replace(/ .*/, '')
    let html = HtmlBoilerplate(title, HtmlTag('article', {}, [
        HtmlTag('header', {}, [
            HtmlTag('h1', {}, Escape(article.title)),
            HtmlTag('time', { pubdate: 'true', datetime: date }, Escape(date))
        ]),
        HtmlTag('p', {}, Escape(article.content))
    ]))
    res.send(html)
}


function index (req, res, next) {
    if (!is_spider(req)) { next(); return }
    let data = api.get_raw_data()
    let title = data.settings.meta.title
    let desc = data.settings.meta.description
    let pages = []
    for (let id of Object.keys(data.pages)) {
        let page_title = data.pages[id].title
        pages.push(HtmlTag('li', {}, HtmlTag(
            'a', { href: `/page/${id}` },
            Escape(page_title)
        )))
    }
    let articles = []
    for (let id of Object.keys(data.articles)) {
        let article = data.articles[id]
        articles.push(HtmlTag('li', {}, HtmlTag('article', {}, [
            HtmlTag('h4', {}, HtmlTag(
                'a', { href: `/article/${id}` },
                Escape(article.title)
            )),
            HtmlTag('summary', {}, Escape(article.summary))
        ])))
    }
    let html = HtmlBoilerplate(title, HtmlTag('div', {}, [
        HtmlTag('header', {}, [
            HtmlTag('h1', {}, Escape(title)),
            HtmlTag('h2', {}, Escape(desc))
        ]),
        HtmlTag('section', {}, [
            HtmlTag('h3', {}, 'Pages'),
            HtmlTag('ul', {}, pages)
        ]),
        HtmlTag('section', {}, [
            HtmlTag('h3', {}, 'Articles'),
            HtmlTag('ul', {}, articles)
        ]),
    ]))
    res.send(html)
}


module.exports = { page, article, index }
