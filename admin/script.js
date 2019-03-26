'use strict';


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


let Loading = (props) => JSX({
    tag: 'loading-tip',
    children: [
        { tag: 'span', children: [MSG.loading] }
    ]
})


class Login extends React.Component {
    get_form_data () {
        let username = this.refs.username.value
        let password = this.refs.password.value
        return { username, password }
    }
    disable_form() {
        for_vals_of(this.refs, x => x.disabled = true)
    }
    enable_form() {
        for_vals_of(this.refs, x => x.disabled = false)
    }
    retype_password () {
        this.refs.password.value = ''
        this.refs.password.focus()
    }
    info (status) {
        this.refs.msg.dataset.status = status
        this.refs.msg.textContent = MSG.login_status[status]
        if (status == 'pending') {
            this.refs.button.textContent = MSG.login_status.pending
            this.disable_form()
        } else if (status == 'failed') {
            this.refs.button.textContent = MSG.login
            this.enable_form()
            this.retype_password()
        } else if (status == 'success') {
            this.refs.button.style.display = 'none'
        }
    }
    pending () {
        this.info('pending')
    }
    failed () {
        this.info('failed')
    }
    success (token) {
        this.info('success')
        this.props.success(token)
    }
    submit () {
        ;(async () => {
            this.pending()
            let data = this.get_form_data()
            let body = JSON.stringify(data)
            var res;
            try {
                let raw = await fetch('login', { method: 'POST', body: body })
                res = await raw.json()
            } catch (err) {
                console.log(err)
                this.failed()
            }
            if (res.success) {
                this.success(res.token)
            } else {
                this.failed()
            }
        })()
    }
    render () {
        return JSX({ tag: 'dialog-wrapper', children: [{
            tag: 'dialog-box', children: [
                { tag: 'dialog-title', children: [MSG.login_title] },
                { tag: 'hr' },
                { tag: 'dialog-content', children: [
                    { tag: 'input', ref: 'username',
                      placeholder: MSG.username },
                    { tag: 'input', type: 'password', ref: 'password',
                      placeholder: MSG.password,
                      handlers: {
                          keyUp: ev => (ev.key == 'Enter') && this.submit()
                      } },
                    { tag: 'form-message', ref: 'msg', children: [''] },
                    { tag: 'button', ref: 'button', children: [MSG.login],
                      handlers: { click: ev => this.submit() } }
                  ]
              } ]
        } ] })
    }
}


let Icon = {
    settings: '/common/icons/settings.png',
    meta: '/common/icons/meta.png',
    category: '/common/icons/folder.svg',
    dirty: '/common/icons/edit.png',
    doc: '/common/icons/doc.png',
    add: '/common/icons/add.png',
    remove: '/common/icons/remove.png'
}


/**
 *  SFC: BarItem
 *
 *  props: {
 *      selected: boolean,
 *      ident: boolean,
 *      icon: string,
 *      text: string,
 *      callback: function
 *      action: {
 *          icon: string,
 *          callback: function
 *      },
 *  }
 */
let BarItem = (props => JSX({
    tag: 'bar-item',
    classList: [props.indent? 'indent': 'no-indent'],
    dataset: { selected: props.selected },
    handlers: { click: ev => props.callback && props.callback() },
    children: concat(
        [
            { tag: 'bar-item-body', children: [
                { tag: 'img', src: Icon[props.icon] },
                { tag: 'span', children: [props.text] }
            ] }
        ],
        props.action? [
            { tag: 'img', src: Icon[props.action.icon], handlers: {
                click: ev => {
                    ev.stopPropagation()
                    props.action.callback && props.action.callback()
                }
            }}
        ]: [{ tag: 'span', classList: ['placeholder'] }]
    )
}))


/**
 *  SFC: BarList
 *
 *  props: {
 *      icon: string,
 *      text: string,
 *      action: BarItem::action,
 *      list: [{
 *          selected: boolean,
 *          icon: string,
 *          text: string,
 *          action: BarItem::action,
 *          callback: function
 *      }]
 *  }
 */
let BarList = (props => JSX({
    tag: 'bar-list',
    children: concat(
        [{
            tag: BarItem, indent: false,
            icon: props.icon, text: props.text,
            action: props.action
        }],
        props.list.map(item => ({
            tag: BarItem, indent: true, selected: item.selected,
            icon: item.icon, text: item.text,
            action: item.action, callback: item.callback
        }))
    )
}))


let SideBar = (props => JSX({
    tag: 'side-bar',
    children: concat(
        [{  tag: BarList, icon: 'settings', text: MSG.settings, list: [{
            icon: props.edit.settings[0].dirty? 'dirty': 'meta',
            text: MSG.meta,
            callback: props.do.switch_to('settings', 'meta'),
            selected: props.is_selected('settings', 'meta')
        }] }],
        ['pages', 'articles'].map(category => ({
            tag: BarList, icon: 'category', text: MSG[category],
            action: { icon: 'add', callback: props.do.add(category) },
            list: props.edit[category].map(item => ({
                icon: item.dirty? 'dirty': 'doc',
                text: item.data.title,
                callback: props.do.switch_to(category, item.id),
                selected: props.is_selected(category, item.id),
                action: {
                    icon: 'remove',
                    callback: props.do.remove(category, item.id)
                }
            }))
        }))
    )
}))


let ContentForm = (props => JSX({
    tag: 'content-form', class: 'form-body',
    style: { display: props.tab == 'content'? 'block': 'none' },
    children: [
        { tag: TextInput, name: 'content', label: MSG.edit.content,
          disabled: !props.can_input, dirty: props.dirty,
          textarea: true },
        { tag: 'a', href: 'javascript:void(0)', children: [MSG.preview],
          onClick: ev => this.props.preview(), className: 'preview' }
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
    preview () {
        // TODO
    }
    render () {
        let { dirty, save, can_input, can_save } = this.form_info()
        let switch_to = this.switch_to.bind(this)
        let preview = this.preview.bind(this)
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
                { tag: 'button', children: [MSG.update],
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


class MetaEditor extends FormComponent {
    render () {
        let { dirty, save, can_input, can_save } = this.form_info()
        return JSX({
            tag: 'meta-editor', class: 'editor',
            children: [ { tag: 'meta-form', ref: 'form', children: [
                { tag: 'h1', children: [MSG.meta] },
                { tag: TextInput, name: 'title', label: MSG.site_title,
                  disabled: !can_input, dirty },
                { tag: TextInput, name: 'name', label: MSG.site_name,
                  disabled: !can_input, dirty },
                { tag: TextInput, name: 'description', label: MSG.site_desc,
                  textarea: true, disabled: !can_input, dirty },
                { tag: 'button', children: [MSG.update],
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
                    data: Object.assign({}, item_object)
                })
            )
        }
        this.sidebar_helpers = {
            switch_to: (category, id) => {
                return (() => {
                    this.setState({ selected: { category, id } })
                })
            },
            remove: (category, id) => {
                return (() => {
                    if (category == 'settings') { throw Error('invalid') }
                    console.log('remove', category, id)
                })
            },
            add: (category) => {
                let blank = {
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
                return (() => {
                    if (category == 'settings') { throw Error('invalid') }
                    let new_data = mapval(blank[category], x => x)
                    new_data.id += ('-' + gen_id())
                    if ( new_data.date ) { new_data.date = now() }
                    let new_item = {
                        id: new_data.id,
                        dirty: true,
                        data: new_data
                    }
                    let items = this.state.edit[category]
                    this.state.edit[category] = [new_item, ...items]
                    this.forceUpdate()
                    console.log('add', category)
                })
            }
        }
        this.editor_helpers = {
            dirty: (category, id) => {
                return (delta => {
                    let item_object = this.get(category, id)
                    item_object.dirty = true
                    Object.assign(item_object.data, delta)
                    this.forceUpdate()
                })
            },
            save: (category, id) => {
                return (async () => {
                    let item_object = this.get(category, id)
                    if (!item_object.dirty) { return }
                    let options = {
                        method: 'POST',
                        body: JSON.stringify({
                            category,
                            item_object
                        }),
                        headers: {
                            'X-Auth-Token': get_token()
                        }
                    }
                    try {
                        this.setState({ is_locked: true })
                        let raw = await fetch('api/update', options)
                        let res = await raw.json()
                        if (!res.ok) { throw new Error(res.msg) }
                        let new_id = item_object.data.id
                        if (this.is_selected(category, id)) {
                            this.state.selected.id = new_id
                        }
                        item_object.id = new_id
                        item_object.dirty = false
                    } catch (err) {
                        console.log(err)
                        alert(MSG.update_failed + ': ' + err.message)
                    }
                    this.state.is_locked = false
                    this.forceUpdate()
                })
            }
        }
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
                let raw = await fetch('/data')
                data = await raw.json()
                normalize(data, true)
            } catch (err) {
                console.log(err)
                alert(MSG.failed)
                window.location.reload()
            }
            this.setState({ wait_at_dialog: false, loaded: true, data: data })
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
