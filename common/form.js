let INPUT_SELECTOR = 'text-field > input, text-field > textarea'


let TextInput = (props) => JSX({
    tag: 'text-field',
    children: [
        { tag: 'label', for: props.name, children: [props.label] },
        { tag: props.textarea? 'textarea': 'input', disabled: props.disabled,
          name: props.name, placeholder: props.label,
          onInput: ev => props.dirty && props.dirty() }
    ]
})


function prepare_data (form, data) {
    let fields = form.querySelectorAll(INPUT_SELECTOR)
    for (let field of fields) {
        field.value = data[field.name]
    }
}


function pull_data (form) {
    let data = {}
    let fields = form.querySelectorAll(INPUT_SELECTOR)
    for (let field of fields) {
        data[field.name] = field.value
    }
    return data
}


class FormComponent extends React.Component {
    constructor (props) {
        super(props)
    }
    componentDidMount () {
        this.init()
    }
    init () {
        prepare_data(this.refs.form, this.props.item.data)
    }
    dirty () {
        let new_data = pull_data(this.refs.form)
        this.props.dirty(new_data)
    }
    save () {
        this.props.save()
    }
}
