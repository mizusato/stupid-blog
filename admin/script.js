'use strict';


function for_vals_of (hash, f) {
    for (let key of Object.keys(hash)) {
        f(hash[key])
    }
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
        return JSX({
            tag: 'dialog-wrapper',
            children: [{
                tag: 'dialog-box',
                children: [
                    {
                        tag: 'dialog-title',
                        children: [MSG.login_title]
                    },
                    { tag: 'hr' },
                    {
                        tag: 'dialog-content',
                        children: [
                            {
                                tag: 'input',
                                ref: 'username',
                                placeholder: MSG.username
                            },
                            {
                                tag: 'input',
                                type: 'password',
                                ref: 'password',
                                placeholder: MSG.password,
                                handlers: { keyUp: ev => {
                                    if (ev.key == 'Enter') {
                                        this.submit()
                                    }
                                }}
                            },
                            {
                                tag: 'form-message',
                                ref: 'msg',
                                children: ['']
                            },
                            {
                                tag: 'button',
                                ref: 'button',
                                children: [MSG.login],
                                handlers: { click: ev => this.submit() }
                            }
                        ]
                    }
                ]
            }]
        })
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
                callback: props.do.switch_to(category, item.name),
                selected: props.is_selected(category, item.name),
                action: {
                    icon: 'remove',
                    callback: props.do.remove(category, item.name)
                }
            }))
        }))
    )
}))


class MetaEditor extends FormComponent {
    render () {
        let dirty = this.dirty.bind(this)
        let save = this.save.bind(this)
        let can_input = !this.props.is_locked
        let can_save = this.props.item.dirty && !this.props.is_locked
        return JSX({
            tag: 'meta-editor',
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


class EditArea extends React.Component {
    render () {
        let item = this.props.edit.settings[0]
        return JSX({
            tag: 'edit-area',
            children: [
                { tag: MetaEditor, item, is_locked: this.props.is_locked,
                  dirty: this.props.do.dirty('settings', 'meta'),
                  save: this.props.do.save('settings', 'meta') }
            ]
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
        this.is_selected = ((category, id) => {
            return (
                category == this.state.selected.category
                && id == this.state.selected.id
            )
        })
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
                    console.log('switch to', category, id)
                })
            },
            remove: (category, id) => {
                return (() => {
                    if (category == 'settings') {
                        throw Error('invalid operation')
                    }
                    console.log('remove', category, id)
                })
            },
            add: (category) => {
                return (() => {
                    if (category == 'meta') {
                        throw Error('invalid operation')
                    }
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
                        item_object.id = item_object.data.id
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
    render () {
        return JSX({
            tag: 'main-view',
            children: [
                { tag: SideBar, do: this.sidebar_helpers,
                  edit: this.state.edit, is_selected: this.is_selected },
                { tag: EditArea, do: this.editor_helpers,
                  edit: this.state.edit, is_locked: this.state.is_locked }
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
