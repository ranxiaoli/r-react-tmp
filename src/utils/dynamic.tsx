/**
 * @flow
 */

import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IProps {}
interface IState {
  Module: any;
}

export default function dynamic(loadComponent: any) {
  class Load extends React.Component<IProps, IState> {
    constructor(props: IProps) {
      super(props);
      this.state = {
        Module: null,
      };
    }

    componentDidMount() {
      loadComponent()
        .then((res: any) => {
          let Module;
          if (typeof res === 'function') Module = res;
          else Module = res.default;
          this.setState({ Module });
        })
        // eslint-disable-next-line no-console
        .catch(console.log);
    }

    render() {
      const { Module } = this.state;
      return Module ? <Module {...(this.props as IProps)} /> : null;
    }
  }
  return Load;
}
