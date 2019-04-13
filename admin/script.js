'use strict';


let Blank = {
    pages: {
        id: 'new-page',
        title: MSG.blank.page,
        visible: false,
        content: MSG.blank.default_content
    },
    articles: {
        id: 'new-article',
        title: MSG.blank.article,
        tags: '',
        date: '1970-01-01 00:00',
        summary: MSG.blank.default_summary,
        visible: false,
        content: MSG.blank.default_content
    }
}


function now () {
    return (
        (new Date(Date.now() - (new Date()).getTimezoneOffset()*60*1000))
            .toISOString()
            .replace('T', ' ')
            .replace(/:\d\d\.\d+Z/, '')
    )
}


function gen_id () {
    let id_chars = '0123456789qwertyuiopasdfghjklzxcvbnm'
    let length = 10
    let result = ''
    for (let i=0; i<10; i++) {
        let t = Math.floor(id_chars.length*Math.random())
        result += id_chars[t]
    }
    return result
}


function for_vals_of (hash, f) {
    for (let key of Object.keys(hash)) {
        f(hash[key])
    }
}


function mapval (hash, f) {
    let new_hash = {}
    for (let key of Object.keys(hash)) {
        new_hash[key] = f(hash[key])
    }
    return new_hash
}


function get_token () {
    return sessionStorage.getItem('token')
}


function set_token (value) {
    sessionStorage.setItem('token', value)
}


function clear_token () {
    sessionStorage.removeItem('token')
}


async function send_to_api (operation, data) {
    let options = {
        method: 'POST',
        body: data,
        headers: {
            'X-Auth-Token': get_token()
        }
    }
    try {
        let raw = await fetch(`api/${operation}`, options)
        if (raw.status != 200) { throw new Error(`HTTP ${raw.status}`) }
        let res = await raw.json()
        if (!res.ok) { throw new Error(res.msg) }
        return res
    } catch (err) {
        console.log(err)
        alert(MSG.save_failed + ': ' + err.message)
        throw err
    }
}


let ContentForm = (props => JSX({
    tag: 'content-form', class: 'form-body',
    style: { display: props.tab == 'content'? 'block': 'none' },
    children: [
        { tag: TextInput, name: 'content', label: MSG.edit.content,
          disabled: !props.can_input, dirty: props.dirty,
          textarea: true, use_code_editor: true },
        { tag: 'a', href: `/preview/${props.preview.type}`, target: '_blank',
          className: 'preview', children: [MSG.preview],
          onClick: ev => props.preview.prepare()  }
    ]
}))


let ArticleInfoForm = (props => JSX({
    tag: 'article-info-form', class: 'form-body',
    style: { display: props.tab == 'info'? 'block': 'none' },
    children: [
        { tag: TextInput, name: 'title', label: MSG.edit.title,
          disabled: !props.can_input, dirty: props.dirty },
        { tag: TextInput, name: 'id', label: MSG.edit.id,
          disabled: !props.can_input, dirty: props.dirty },
        { tag: TextInput, name: 'tags', label: MSG.edit.tags,
          disabled: !props.can_input, dirty: props.dirty },
        { tag: TextInput, name: 'date', label: MSG.edit.date,
          disabled: !props.can_input, dirty: props.dirty },
        { tag: TextInput, name: 'summary', label: MSG.edit.summary,
          textarea: true, disabled: !props.can_input, dirty: props.dirty },
        { tag: OptionInput, name: 'visible', label: MSG.edit.visible,
          disabled: !props.can_input, dirty: props.dirty }
    ]
}))


let PageInfoForm = (props => JSX({
    tag: 'page-info-form', class: 'form-body',
    style: { display: props.tab == 'info'? 'block': 'none' },
    children: [
        { tag: TextInput, name: 'title', label: MSG.edit.title,
          disabled: !props.can_input, dirty: props.dirty },
        { tag: TextInput, name: 'id', label: MSG.edit.id,
          disabled: !props.can_input, dirty: props.dirty },
        { tag: OptionInput, name: 'visible', label: MSG.edit.visible,
          disabled: !props.can_input, dirty: props.dirty }
    ]
}))


let EditorTabBar = (props => JSX({
    tag: 'editor-tab-bar',
    children: props.tabs.map(tab => ({
        tag: 'a',
        className: (props.tab == tab)? 'disabled': 'enabled',
        href: (props.tab == tab)? null: 'javascript:void(0)',
        children: [MSG.edit.tabs[tab]],
        onClick: ev => props.switch_to(tab)
    }))
}))


class PageArticleEditor extends FormComponent {
    constructor (props, type) {
        super(props)
        this.state = { tab: 'info' }
        this.tabs = ['info', 'content']
        this.type = type
    }
    switch_to (tab) {
        this.setState({ tab })
    }
    prepare_preview () {
        localStorage.preview_title = this.props.item.data.title || ''
        localStorage.preview_content = this.props.item.data.content || ''
    }
    render () {
        let { dirty, save, can_input, can_save } = this.form_info()
        let switch_to = this.switch_to.bind(this)
        let preview = {
            type: this.type,
            prepare: this.prepare_preview.bind(this)
        }
        let type = this.type
        let InfoForm = ({
            page: PageInfoForm,
            article: ArticleInfoForm
        })[type]
        return JSX({
            tag: `${type}-editor`, class: 'editor',
            children: [ { tag: `${type}-form`, ref: 'form', children: [
                { tag: 'h1', children: [MSG.edit[type]] },
                { tag: EditorTabBar, switch_to, tabs: this.tabs,
                  tab: this.state.tab },
                { tag: InfoForm, can_input, dirty,
                  tab: this.state.tab },
                { tag: ContentForm, can_input, dirty, preview,
                  tab: this.state.tab, },
                { tag: 'button', children: [MSG.save],
                  disabled: !can_save, onClick: save }
            ] } ]
        })
    }
}


class PageEditor extends PageArticleEditor {
    constructor (props) {
        super(props, 'page')
    }
}


class ArticleEditor extends PageArticleEditor {
    constructor (props) {
        super(props, 'article')
    }
}


let SiteInfoFrom = (props) => (JSX({
    tag: 'site-info-form', class: 'form-body',
    style: { display: (props.tab == 'site_info')? 'block': 'none' },
    children: [
        { tag: TextInput, name: 'title', label: MSG.site_title,
          disabled: !props.can_input, dirty: props.dirty },
        { tag: TextInput, name: 'name', label: MSG.site_name,
          disabled: !props.can_input, dirty: props.dirty },
        { tag: TextInput, name: 'description', label: MSG.site_desc,
          textarea: true, disabled: !props.can_input, dirty: props.dirty },
    ]
}))


let OptionsForm = (props => JSX({
    tag: 'option-form', class: 'form-body',
    style: { display: (props.tab == 'options')? 'block': 'none' },
    children: [
        { tag: TextInput, name: 'ipp', label: MSG.items_per_page,
          disabled: !props.can_input, dirty: props.dirty },
        { tag: OptionInput, name: 'disqus_enabled', label: MSG.disqus.enabled,
          disabled: !props.can_input, dirty: props.dirty },
        { tag: TextInput, name: 'disqus_site_id', label: MSG.disqus.site_id,
          disabled: !props.can_input, dirty: props.dirty },
        { tag: TextInput, name: 'license', label: MSG.license,
          disabled: !props.can_input, dirty: props.dirty }
    ]
}))


let FooterForm = (props => JSX({
    tag: 'footer-form', class: 'form-body',
    style: { display: (props.tab == 'footer')? 'block': 'none' },
    children: [
        { tag: TextInput, name: 'footer', label: MSG.edit.footer,
          disabled: !props.can_input, dirty: props.dirty,
          textarea: true, use_code_editor: true },
    ]
}))


class MetaEditor extends FormComponent {
    constructor (props, type) {
        super(props)
        this.state = { tab: 'site_info' }
        this.tabs = ['site_info', 'options', 'footer']
    }
    switch_to (tab) {
        this.setState({ tab })
    }
    render () {
        let { dirty, save, can_input, can_save } = this.form_info()
        return JSX({
            tag: 'meta-editor', class: 'editor',
            children: [ { tag: 'meta-form', ref: 'form', children: [
                { tag: 'h1', children: [MSG.meta] },
                { tag: EditorTabBar, switch_to: this.switch_to.bind(this),
                  tabs: this.tabs, tab: this.state.tab },
                { tag: SiteInfoFrom, can_input, dirty, tab: this.state.tab },
                { tag: OptionsForm, can_input, dirty, tab: this.state.tab },
                { tag: FooterForm, can_input, dirty, tab: this.state.tab },
                { tag: 'button', children: [MSG.save],
                  disabled: !can_save, onClick: save }
            ] } ]
        })
    }
}


let Editors = {
    settings: MetaEditor,
    pages: PageEditor,
    articles: ArticleEditor
}


class EditArea extends React.Component {
    render () {
        return JSX({
            tag: 'edit-area',
            children: [{
                tag: this.props.editor,
                item: this.props.item,
                is_locked: this.props.is_locked,
                dirty: this.props.do.dirty,
                save: this.props.do.save
            }]
        })
    }
}


class MainView extends React.Component {
    constructor (props) {
        super(props)
        this.state = {
            is_locked: false,
            selected: { category: 'settings', id: 'meta' },
            edit: {}
        }
        for (let category of Object.keys(this.props.data)) {
            if (category == 'list') { continue }
            this.state.edit[category] = this.props.data.list[category].map(
                item_object => ({
                    id: item_object.id,
                    dirty: false,
                    is_new: false,
                    data: Object.assign({}, item_object)
                })
            )
        }
        this.sidebar_helpers = {
            switch_to: (category, id) => {
                return (() => {
                    console.log('switch to', category, id)
                    this.setState({ selected: { category, id } })
                })
            },
            remove: (category, id) => {
                let list = this.state.edit[category]
                let get_next = index => {
                    let try_ = [index, index-1]
                    for (let i of try_) {
                        if (0 <= i && i < list.length) {
                            return i
                        }
                    }
                    return -1
                }
                let remove_at_list = () => {
                    let index = -2
                    for (let i=0; i<list.length; i++) {
                        if (list[i].id == id) {
                            list.splice(i, 1)
                            index = i
                            break
                        }
                    }
                    if (this.is_selected(category, id)) {
                        let jump2index = get_next(index)
                        if (jump2index != -1) {
                            this.state.selected.id = list[jump2index].id
                        } else {
                            this.state.selected = {
                                category: 'settings', id: 'meta'
                            }
                        }
                    }
                    // forceUpdate in caller
                }
                return (async () => {
                    console.log('remove', category, id)
                    if (category == 'settings') { throw Error('invalid') }
                    if (this.state.is_locked) { return }
                    let item_object = this.get(category, id)
                    let item_info = `\n>> ${item_object.data.title} (${id})`
                    if (!confirm(MSG.confirm_remove[category] + item_info)) {
                        return
                    }
                    if (item_object.is_new) {
                        remove_at_list()
                        this.forceUpdate()
                        return
                    }
                    let data = { category, id }
                    this.setState({ is_locked: true })
                    try {
                        await send_to_api('remove', JSON.stringify(data))
                        remove_at_list()
                    } finally {
                        this.state.is_locked = false
                        this.forceUpdate()
                    }
                })
            },
            add: (category) => {
                return (() => {
                    console.log('add', category)
                    if (category == 'settings') { throw Error('invalid') }
                    let new_data = mapval(Blank[category], x => x)
                    new_data.id += ('-' + gen_id())
                    if ( new_data.date ) { new_data.date = now() }
                    let new_item = {
                        id: new_data.id,
                        dirty: true,
                        is_new: true,
                        data: new_data
                    }
                    let items = this.state.edit[category]
                    this.state.edit[category] = [new_item, ...items]
                    this.state.selected = { category, id: new_data.id }
                    this.forceUpdate()
                })
            }
        }
        this.editor_helpers = {
            dirty: (category, id) => {
                return (delta => {
                    console.log('dirty', category, id)
                    let item_object = this.get(category, id)
                    item_object.dirty = true
                    Object.assign(item_object.data, delta)
                    this.forceUpdate()
                })
            },
            save: (category, id) => {
                return (async () => {
                    console.log('save', category, id)
                    let item_object = this.get(category, id)
                    if (!item_object.dirty) { return }
                    let req_data = {
                        category,
                        item_object
                    }
                    this.setState({ is_locked: true })
                    try {
                        await send_to_api('update', JSON.stringify(req_data))
                        let new_id = item_object.data.id
                        if (this.is_selected(category, id)) {
                            this.state.selected.id = new_id
                        }
                        item_object.id = new_id
                        item_object.dirty = false
                        item_object.is_new = false
                    } finally {
                        this.state.is_locked = false
                        this.forceUpdate()
                    }
                })
            }
        }
    }
    componentDidMount () {
        window.onbeforeunload = (ev => {
            for (let category of Object.keys(this.state.edit)) {
                for (let item of this.state.edit[category]) {
                    if (item.dirty) {
                        return (
                            'Some content has not been saved. '
                            + 'Really exit?'
                        )
                    }
                }
            }
        })
        return null
    }
    get (category, id) {
        let all = this.state.edit[category]
        for (let I of all) {
            if (I.id == id) {
                return I
            }
        }
    }
    is_selected (category_, id_) {
        let { category, id } = this.state.selected
        return (category == category_ && id == id_)
    }
    render () {
        console.log('render', this.state)
        let { category, id } = this.state.selected
        let item = this.get(category, id)
        let Editor = Editors[category]
        let editor_helpers = mapval(this.editor_helpers, f => f(category, id))
        let is_selected = this.is_selected.bind(this)
        return JSX({
            tag: 'main-view',
            children: [
                { tag: SideBar, do: this.sidebar_helpers,
                  edit: this.state.edit, is_selected: is_selected },
                { tag: EditArea, do: editor_helpers,
                  item: item, editor: Editor,
                  is_locked: this.state.is_locked }
            ]
        })
    }
}


class Admin extends React.Component {
    constructor (props) {
        super(props)
        this.state = {
            signed_in: (get_token() != null),
            wait_at_dialog: false,
            loaded: false
        }
        if (this.state.signed_in) {
            this.load_data()
        }
    }
    load_data () {
        ;(async () => {
            var data;
            try {
                let raw_v = await fetch('validate', {
                    method: 'POST',
                    body: JSON.stringify({ token: get_token() })
                })
                let data_v = await raw_v.json()
                if (data_v.ok) {
                    let raw = await fetch('/data')
                    data = await raw.json()
                    normalize(data, true)
                    this.setState({
                        wait_at_dialog: false, loaded: true, data: data
                    })
                } else {
                    console.log('previous login is invalid')
                    clear_token()
                    if (this.state.wait_at_dialog) {
                        // rare case but handling needed
                        alert('invalid token')
                        window.location.reload()
                    } else {
                        this.setState({ signed_in: false })
                    }
                }
            } catch (err) {
                console.log(err)
                alert(MSG.failed)
                window.location.reload()
            }
        })()
    }
    login (token) {
        set_token(token)
        this.load_data()
        this.setState({ signed_in: true, wait_at_dialog: true })
    }
    render () {
        let { signed_in, loaded, wait_at_dialog, data } = this.state
        if (!signed_in || wait_at_dialog ) {
            return JSX({ tag: Login, success: token => this.login(token) })
        } else if (!loaded) {
            return JSX({ tag: Loading })
        }
        return JSX({ tag: MainView, data: data })
    }
}


document.title = MSG.admin_title
ReactDOM.render(React.createElement(Admin), react_root)
