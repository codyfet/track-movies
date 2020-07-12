import React from "react";
import ReactDOM from "react-dom";
import {Provider} from "react-redux";
import {applyMiddleware, createStore} from "redux";
import thunk from "redux-thunk";
import reducer from "./Reducers";

import "./Styles/Styles";
import "./Styles/Login";
import "./Styles/Main";
import "./Styles/Profile";
import "./Styles/Diary";
import "./Styles/Autosuggest";
import "semantic-ui-css/semantic.min.css";

import {App} from "./Components/App";

const store = createStore(reducer, applyMiddleware(thunk));

ReactDOM.render(
    <Provider store={store} >
        <App />
    </Provider>,
    document.getElementById("root")
);