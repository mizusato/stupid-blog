'use strict';

let { Route, Link, BrowserRouter: Router } = ReactRouterDOM


/**
 *  Encode Query for URL
 */
 function encode_query (hash) {
     let items = (
         Object.keys(hash)
            .map(k => `${k}=${encodeURIComponent(hash[k])}`)
            .join('&')
        )
    return items? `?${items}`: ''
}


/**
 *  Decode Query for URL
 */
 function decode_query (query_str) {
     let trimed = query_str.slice(1,query_str.length)
     let hash = {}
     trimed.split('&').forEach(item => {
         let [k,v] = item.split('=')
         hash[k] = decodeURIComponent(v)
     })
     return hash
 }


/**
 *  Get Color from String
 */
function get_color (string) {
    let base = 'cnjq3rivn9340vnwescm' + string.length.toString(16)
    let input = string + base
    let [a, b, c] = [6601, 4477, 5050]
    let M = 9487
    for (let char of input) {
        let x = char.codePointAt(0) * 2333
        a = ((57 + x*a + (b*c) % M)*x + x) % M
        b = ((99 + x*b + (c*a) % M)*x + x) % M
        c = ((41 + x*c + (a*b) % M)*x + x) % M
    }
    let H = a % 360
    let S = 60 + (b % 40)
    let L = 40 + (c % 5)
    return `hsl(${H}, ${S}%, ${L}%)`
}


/**
 *  Render Formulas using KaTeX
 */
function render_formulas (root) {
    var inlines = root.querySelectorAll('f')
    var equations = root.querySelectorAll('equation')
    ;[...inlines, ...equations].forEach(element => {
        let is_inline = (element.tagName == 'EQUATION')
        let LaTeX = element.textContent
        try {
            if (element.dataset.render_finished != 'true') {
                katex.render(LaTeX, element, { displayMode: is_inline })
                element.dataset.render_finished = 'true'
            }
        } catch (err) {
            alert(`Error Rendering Formulas: ${err.message}`)
        }
    })
}


/**
 *  Render Code Blocks using highlight.js
 */
function render_code_blocks (root) {
    root.querySelectorAll('pre.code').forEach(element => {
        if (element.dataset.render_finished != 'true') {
            hljs.highlightBlock(element)
            element.dataset.render_finished = 'true'
        }
    })
}


/**
 *  Fetch data from server using the HTML5 fetch API
 */
async function get_data() {
    try {
        let response = await fetch('/data')
        let data = await response.json()
        // TODO: validate data
        normalize(data)
        return data
    } catch (err) {
        console.log(err)
        return null
    }
}


/**
 *  Scroll View to the Content Element
 */
function scroll_to_content () {
    document.querySelector('content').scrollIntoView()
}


/**
 *  Paginating Plugin
 */
class PagerPlugin {
    constructor (total, initial, ipp, onchange) {
        this.total = total
        this.ipp = ipp
        this.onchange = onchange
        this.num_pages = Math.ceil(total / ipp)
        this.current = (0 <= initial && initial < this.num_pages)? initial: 0
    }
    goto (page) {
        if (typeof page == 'number') {
            this.current = (page == -1)? this.num_pages-1: page
        } else if (page == 'next') {
            this.current += 1
            this.current %= this.num_pages
        } else if (page == 'previous') {
            this.current -= 1
            this.current = (this.current + this.num_pages) % this.num_pages
        } else if (page == 'first') {
            this.current = 0
        } else if (page == 'last') {
            this.current = this.num_pages - 1
        } else {
            throw(new Error('invalid argument page'))
        }
        this.onchange()
    }
    is_first () {
        return (this.current == 0)
    }
    is_last () {
        return (this.current == this.num_pages-1)
    }
    is_valid_page (page) {
        return (0 <= page && page < this.num_pages)
    }
    range () {
        let { current, ipp, total } = this
        return (function* () {
            let begin = current*ipp
            let end = begin + ipp
            for (let i=begin; (i < end && i < total); i++) {
                yield i
            }
        })()
    }
}


/**
 *  Page Swither
 */
let PagerWidget = (props => {
    let pager = props.pager
    let get_page_from_index = (index_str => {
        let index = Number.parseInt(index_str)
        if (!Number.isNaN(index)) {
            let page = index - 1
            if (pager.is_valid_page(page)) {
                return page
            } else {
                return null
            }
        } else {
            return null
        }
    })
    return JSX({ tag: 'pager-widget', children: [
        { tag: 'button', children: ['⇤'],
          disabled: pager.is_first(),
          onClick: ev => pager.goto('first') },
        { tag: 'button', children: ['←'],
          disabled: pager.is_first(),
          onClick: ev => pager.goto('previous') },
        { tag: 'input',
          placeholder: `${pager.current+1}/${pager.num_pages}`,
          onKeyUp: ev => {
              if (ev.key != 'Enter') { return }
              let page = get_page_from_index(ev.target.value)
              if (page != null) {
                  ev.target.value = ''
                  ev.target.blur()
                  pager.goto(page)
              }
          }
        },
        { tag: 'button', children: ['→'],
          disabled: pager.is_last(),
          onClick: ev => pager.goto('next') },
        { tag: 'button', children: ['⇥'],
          disabled: pager.is_last(),
          onClick: ev => pager.goto('last') }
    ] })
})


/**
 *  Route Render Shortcut
 */
let RouteRender = element => (route_props => JSX(
    Object.assign({}, route_props, element)
))


/**
 *  Root Component
 */
class Blog extends React.Component {
    constructor (props) {
        super(props)
        this.state = {
            status: 'loading'
        }
    }
    async load () {
        this.setState({ status: 'loading' })
        let data = await get_data()
        if (data != null) {
            this.setState({ status: 'success', data: data })
        } else {
            this.setState({ status: 'failed' })
        }
    }
    componentDidMount () {
        this.load()
        let title = MSG.title[this.state.status]
        if (title) { document.title = title }
    }
    render () {
        let content = {
            loading: () => JSX({
                tag: 'blog',
                className: 'loading',
                children: [ { tag: 'wrapper', children: [MSG.loading] } ]
            }),
            failed: () => JSX({
                tag: 'blog',
                className: 'failed',
                children: [ { tag: 'wrapper', children: [
                    { tag: 'p', children: [MSG.failed] },
                    { tag: 'button', children: [MSG.retry], handlers: {
                        click: ev => this.load()
                    } }
                ] } ]
            }),
            success: () => JSX({
                tag: 'blog',
                className: 'ready',
                children: [ { tag: Router, children: [
                    { tag: 'wrapper', children: [
                        { tag: Header, data: this.state.data },
                        { tag: Content, data: this.state.data },
                        { tag: Comments, data: this.state.data },
                        { tag: Footer, data: this.state.data }
                    ] }
                ] } ]
            })
        }
        return content[this.state.status]()
    }
}


/**
 *  Comment Area
 */
let Comments = (props => JSX({
    tag: Route,
    path: '/article/:id',
    render: RouteRender({
        tag: CommentDisplay,
        data: props.data
    })
}))

class CommentDisplay extends React.Component {
    init (props) {
        let meta = props.data.settings.meta
        if (!meta.disqus_enabled) { return }
        let id = props.match.params.id
        if (!props.data.articles[id]) { return }
        let site_id = encodeURIComponent(meta.disqus_site_id)
        let port = location.port? ':' + location.port: ''
        let url = location.protocol + '//' + location.hostname + port
        let thread_id = id
        let thread_title = props.data.articles[id].title
        let disqus_config = function () {
            this.page.url = `${url}/article/${thread_id}`
            this.page.identifier = thread_id
            this.page.title = thread_title
        }
        if (window.DISQUS) {
            window.DISQUS.reset({ reload: true, config: disqus_config })
        } else {
            window.disqus_config = disqus_config
            let loaded = document.head.querySelector('#disqus_script')
            if (!loaded) {
                let script_tag = document.createElement('script')
                script_tag.id = 'disqus_script'
                script_tag.src = `https://${site_id}.disqus.com/embed.js`
                script_tag.dataset.timestamp = Number(new Date())
                document.head.appendChild(script_tag)
            }
        }
    }
    componentDidMount () {
        this.init(this.props)
    }
    componentWillReceiveProps (props) {
        this.init(props)
    }
    render () {
        return JSX({
            tag: 'comments', children: [{
                tag: 'div', id: 'disqus_thread'
            }]
        })
    }
}


/**
 *  Footer Area
 */
let Footer = (props => JSX({
    tag: Route, path: '/', exact: true,
    render: RouteRender({
        tag: 'footer',
        dangerouslySetInnerHTML: { __html: props.data.settings.meta.footer }
    })
}))


/**
 *  Header Area
 */
let Header = (props) => JSX({
    tag: 'header',
    children: [
        { tag: TitleBar, data: props.data },
        { tag: NavBar, data: props.data, page_list: props.data.list.pages }
    ]
})

let TitleBar = (props) => JSX({
    tag: 'title-bar',
    children: [
        { tag: React.Fragment, children: [
            { tag: 'h1', children: [props.data.settings.meta.name] },
            { tag: 'p', children: [props.data.settings.meta.description] }
        ] }
    ]
})

let NavBar = (props) => JSX({
    tag: 'nav-bar',
    children: concat([
        { tag: Link, to: '/', children: [MSG.homepage] }
    ], props.page_list.map(page => (
        { tag: Link, to: `/page/${page.id}`, children: [page.title] }
    )))
})


/**
 *  Content Area
 */
let Content = (props) => JSX({
    tag: 'content',
    children: [
        { tag: Route, path: '/', exact: true, render: RouteRender({
            tag: ArticleList, data: props.data
        }) },
        { tag: Route, path: '/tag/:tag', render: RouteRender({
            tag: ArticleList, data: props.data
        }) },
        { tag: Route, path: '/page/:id', render: RouteRender({
            tag: Page, data: props.data
        }) },
        { tag: Route, path: '/article/:id', render: RouteRender({
            tag: Article, data: props.data
        }) },
        { tag: Route, path: '/preview/page', render: RouteRender({
            tag: Page, data: props.data, is_preview: true
        }) },
        { tag: Route, path: '/preview/article', render: RouteRender({
              tag: Article, data: props.data, is_preview: true
        }) }
    ]
})

class ArticleList extends React.Component {
    constructor (props) {
        super(props)
        this.init(props)
        this.page_switch_lock = false
    }
    componentWillReceiveProps (props) {
        if (!this.page_switch_lock) {
            this.init(props)
        }
        this.page_switch_lock = false
    }
    init (props) {
        let get_ipp = () => {
            let ipp_str = props.data.settings.meta.ipp
            let ipp = Number.parseInt(ipp_str)
            return Number.isNaN(ipp)? 30: ipp
        }
        let article_list = props.data.list.articles
        let tag = props.match.params.tag
        if (tag) {
            let filter = (article => {
                return article.tags
                    .split(',')
                    .map(name => name.trim())
                    .indexOf(tag) != -1
            })
            article_list = article_list.filter(filter)
        }
        this.article_list = article_list
        let query = decode_query(props.location.search)
        let total = article_list.length
        let initial = (Number.parseInt(query.pn)-1) || 0
        let ipp = get_ipp()
        let onchange = () => {
            this.forceUpdate()
            setTimeout(scroll_to_content, 0)
            let path = props.location.pathname
            let query = encode_query({ pn: this.pager.current+1 })
            this.page_switch_lock = true
            props.history.push(path + query)
        }
        this.pager = new PagerPlugin(total, initial, ipp, onchange)
        this.map_articles = f => {
            let list = []
            for (let i of this.pager.range()) {
                list.push(f(this.article_list[i]))
            }
            return list
        }
        let site_title = props.data.settings.meta.title
        if (tag) {
            document.title = `${this.tag} - ${site_title}`
        } else {
            document.title = site_title
        }
    }
    render () {
        let tag = this.props.match.params.tag || null
        let items = this.map_articles(
            article => ({ tag: 'article-item', children: [
                { tag: Link,
                  to: `/article/${article.id}`,
                  children: [
                      { tag: 'h2', children: [article.title] },
                      { tag: 'summary', children: [article.summary] },
                  ] },
                { tag: 'item-detail', children: [
                    { tag: 'publish-date', children: [
                        { tag: 'img', src: '/common/icons/clock.svg' },
                        { tag: 'span', children: [article.date] }
                    ] },
                    { tag: 'tags', "data-n": article.tags.length,
                      children: [
                          { tag: 'img', src: '/common/icons/tags.svg' },
                          { tag: TagList, tags: article.tags, current: tag }
                      ] }
                ] }
            ] })
        )
        return JSX({ tag: 'article-list', children: [
            { tag: 'article-list-items', children: items },
            { tag: 'article-list-pager', children: [
                { tag: PagerWidget, pager: this.pager }
            ] }
        ] })
    }
}

let TagList = (props => JSX(
    { tag: 'span', children: (
        props.tags
            .split(',')
            .map(name => name.trim())
            .map(name => ({
                tag: 'tag', 'data-current': (name === props.current),
                children: [{
                    tag: Link, children: [name],
                    to: `/tag/${name}`,
                    style: { color: get_color(name) }
                }]
            }))
    ) }
))

class Page extends React.Component {
    constructor (props) {
        super(props)
        this.init(props)
    }
    componentWillReceiveProps (props) {
        this.init(props)
    }
    init (props) {
        if (!props.is_preview) {
            let id = props.match.params.id
            if (props.data.pages[id]) {
                this.page = props.data.pages[id]
            } else {
                this.page = {
                    title: MSG.page_404,
                    content: `<h1>${MSG.page_404}</h1>`
                }
            }
        } else {
            this.page = {
                title: localStorage.preview_title,
                content: localStorage.preview_content,
            }
        }
        let site_title = props.data.settings.meta.title
        document.title = `${this.page.title} - ${site_title}`
    }
    componentDidMount () {
        this.after_render()
    }
    componentDidUpdate () {
        this.after_render()
    }
    after_render () {
        render_formulas(this.refs.root)
        render_code_blocks(this.refs.root)
    }
    render () {
        return JSX({
            tag: 'page',
            ref: 'root',
            dangerouslySetInnerHTML: { __html: this.page.content }
        })
    }
}

class Article extends React.Component {
    constructor (props) {
        super(props)
        this.init(props)
    }
    componentWillReceiveProps (props) {
        this.init(props)
    }
    init (props) {
        this.license = this.props.data.settings.meta.license
        if (!props.is_preview) {
            let id = props.match.params.id
            if (props.data.articles[id]) {
                this.article = props.data.articles[id]
            } else {
                this.article = {
                    title: MSG.article_404,
                    date: '---',
                    content: ''
                }
            }
        } else {
            this.article = {
                title: localStorage.preview_title,
                content: localStorage.preview_content
            }
        }
        let site_title = props.data.settings.meta.title
        document.title = `${this.article.title} - ${site_title}`
    }
    componentDidMount () {
        this.after_render()
    }
    componentDidUpdate () {
        this.after_render()
    }
    after_render () {
        render_formulas(this.refs.root)
        render_code_blocks(this.refs.root)
    }
    render () {
        return JSX({
            tag: 'article',
            ref: 'root',
            children: [
                { tag: 'h1', className: 'title',
                  children: [this.article.title] },
                { tag: 'div',
                  dangerouslySetInnerHTML: { __html: this.article.content } },
                { tag: 'div', className: 'indicator date',
                  children: [`${MSG.publish_date}: ${this.article.date}`] },
                { tag: 'div', className: 'indicator license',
                  children: (
                      this.license? [`${MSG.license}: ${this.license}`]: []
                  ) }
            ]
        })
    }
}


/* Render the Root Component */
ReactDOM.render(React.createElement(Blog), react_root)
