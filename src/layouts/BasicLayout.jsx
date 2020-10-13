import React from "react";
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import rootReducer from '@/redux/reducers';
import App from "@/App.js";


const supportsHistory = 'pushState' in window.history;

// 使用默认的确认函数
const getConfirmation = (message, callback) => {
  const allowTransition = window.confirm(message)
  callback(allowTransition)
}

const store = createStore(rootReducer)

class BasicLayout extends React.Component {
  render() {
    return (
      <BrowserRouter
        keyLength={12}
        forceRefresh={!supportsHistory}
        getUserConfirmation={getConfirmation}
      >
        <Provider store={store}>
          <App />
        </Provider>
      </BrowserRouter>)
  }
}

export default BasicLayout;