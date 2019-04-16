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
    dataset: { selected: props.selected, public: props.public },
    handlers: { click: ev => props.callback && props.callback() },
    children: concat(
        [{ tag: 'bar-item-body', children: [
            { tag: 'img', src: Icon[props.icon] },
            { tag: 'span', children: [props.text] }
        ] }],
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
            tag: BarItem, indent: true,
            selected: item.selected, public: item.public,
            icon: item.icon, text: item.text,
            action: item.action, callback: item.callback
        }))
    )
}))


/**
 *  SFC: SideBar (Left Area)
 *
 *  props: {
 *      icon: string,
 *      do: Hash<Function<category [,id]>>,
 *      is_selected: Function<category, id>,
 *      edit: (Editor State Object)
 *  }
 */
let SideBar = (props => JSX({
    tag: 'side-bar',
    children: concat(
        [{  tag: BarList, icon: 'settings', text: MSG.settings, list: [{
            icon: props.edit.settings[0].dirty? 'dirty': 'meta',
            text: MSG.meta, public: true,
            callback: props.do.switch_to('settings', 'meta'),
            selected: props.is_selected('settings', 'meta')
        }] }],
        ['pages', 'articles'].map(category => ({
            tag: BarList, icon: 'category', text: MSG[category],
            action: { icon: 'add', callback: props.do.add(category) },
            list: props.edit[category].map(item => ({
                icon: item.dirty? 'dirty': 'doc',
                text: item.data.title, public: item.data.visible,
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
