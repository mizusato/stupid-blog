class Hello extends React.Component {
    render () {
        return React.createElement('p', null, 'Hello World')
    }
}


ReactDOM.render(React.createElement(Hello), react_root)
