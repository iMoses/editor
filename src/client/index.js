import { AppContainer } from 'react-hot-loader';
import Layout from './layout/default';
import { ReactDOM } from 'lib/react';
import { useStrict } from 'mobx';

useStrict(true);

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
