import classNames from 'classnames/bind';
import React from 'react';

export default styles => Component => isStateless(Component)
    ? props => transformElement(Component(props), classNames.bind(styles))
    : class extends Component { render() { return transformElement(super.render(), classNames.bind(styles)); } };

function transformElement(el, cx) {
    let className = el && el.props.className;
    if (className) {
        className = cx(splitStrings(className));
    }
    return el && React.cloneElement(el, {...el.props, className}, recursiveTransform(el.props.children, cx));
}

function splitStrings(className) {
    if (Array.isArray(className)) {
        return className.map(splitStrings);
    }
    if (typeof className === 'string') {
        return className.split(/\s+/g);
    }
    return className;
}

function recursiveTransform(el, cx) {
    if (React.isValidElement(el)) {
        return transformElement(el, cx);
    }
    if (Array.isArray(el)) {
        return React.Children.map(el, child => recursiveTransform(child, cx));
    }
    return el;
}

function isStateless(Component) {
    return !('prototype' in Component && typeof Component.prototype.render === 'function');
}
