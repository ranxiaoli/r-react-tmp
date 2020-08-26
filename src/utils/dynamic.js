/**
 * @flow
 */

import React from 'react'

export default function dynamic(loadComponent) {
  class Load extends React.Component {
    constructor(props) {
      this.state = {
        Module: null,
      }
    }
    

    componentDidMount() {
      loadComponent().then(res => {
        let Module
        if (typeof res === 'function') Module = res
        else Module = res.default
        this.setState({ Module })
      }).catch(console.log)
    }

    render() {
      const { Module } = this.state
      return Module ? <Module {...this.props} /> : null
    }
  }
  return Load
}
