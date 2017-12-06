import { AppContainer } from 'react-hot-loader';
import ReactDOM from 'react-dom';
import Layout from './layout/default';

const render = Component => {
    ReactDOM.render(
        <AppContainer>
            <Component />
        </AppContainer>,
        document.getElementById('root'),
    );
};

render(Layout);

if (module.hot) {
    require('./styles/index.scss');  // listen to css changes
    (el => el.parentNode.removeChild(el))(document.getElementById('css-style'));
    module.hot.accept('./layout/default', () => render(Layout));
}
