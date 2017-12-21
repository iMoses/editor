import { AppContainer } from 'react-hot-loader';
import Window from './widgets/interface';
import system from './modules/system';
import { ReactDOM } from 'lib/react';
import { useStrict } from 'mobx';

useStrict(true);

const render = Component => {
    ReactDOM.render(
        <AppContainer>
            <Component system={system} />
        </AppContainer>,
        document.getElementById('root'),
    );
};

render(Window);

if (module.hot) {
    require('./styles/index.scss');  // listen to css changes
    (el => el.parentNode.removeChild(el))(document.getElementById('css-style'));
    module.hot.accept('./widgets/interface', () => render(Window));
    module.hot.accept('./modules/system', () => render(Window));
}
