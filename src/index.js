import React from 'react';
import ReactDOM from 'react-dom';
import 'semantic-ui-css/semantic.min.css';
import { Provider } from 'react-redux';
import './index.css';
import 'react-redux-toastr/lib/css/react-redux-toastr.min.css';
import ReduxToastr from 'react-redux-toastr';
import App from './app/layout/App';
import { BrowserRouter } from 'react-router-dom';
import * as serviceWorker from './serviceWorker';
import { configureStore } from './app/store/configureStore'
import ScrollToTop from './app/common/util/ScrollToTop';


const rootEl = document.getElementById('root');
const store = configureStore();

let render = () => {
        ReactDOM.render( 
            <Provider store={store}>
                <BrowserRouter>
                <ScrollToTop>
                    <ReduxToastr 
                        position='bottom-right'
                        transitionIn='fadeIn'
                        transitionOut='fadeOut'/>
                    <App/> 
                </ScrollToTop>
                </BrowserRouter>
            </Provider>, rootEl)
        }

        if (module.hot) {
            module.hot.accept('./app/layout/App', () => {
                setTimeout(render)
            })
        }
        store.firebaseAuthIsReady.then(() => {
            render();
        })

        // If you want your app to work offline and load faster, you can change
        // unregister() to register() below. Note this comes with some pitfalls.
        // Learn more about service workers: http://bit.ly/CRA-PWA
        serviceWorker.unregister();