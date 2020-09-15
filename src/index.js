import React from "react";
import ReactDom from "react-dom";
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import rootReducer from '@/redux/reducers'
import App from "./App.js";
import "antd/dist/antd.css";

const supportsHistory = 'pushState' in window.history
// 使用默认的确认函数
const getConfirmation = (message, callback) => {
  const allowTransition = window.confirm(message)
  callback(allowTransition)
}

const store = createStore(rootReducer)

ReactDom.render(
  <BrowserRouter
    keyLength={12}
    forceRefresh={!supportsHistory}
    getUserConfirmation={getConfirmation}
  >
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>,
  document.getElementById("root")
);
