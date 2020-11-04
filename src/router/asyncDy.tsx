import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IProps {}

interface IState {
  AsyncComponent: any | null;
}

const asyncComponent = <P extends IProps>(loadComponent: any) =>
  class AsyncComponent extends React.Component<IProps, IState> {
    constructor(props: IProps) {
      super(props);

      this.state = {
        AsyncComponent: null,
      };

      this.hasLoadedComponent = this.hasLoadedComponent.bind(this);
    }

    // eslint-disable-next-line react/no-deprecated
    componentWillMount() {
      if (this.hasLoadedComponent()) {
        return;
      }

      loadComponent()
        .then((module: any) => (module.default ? module.default : module))
        .then((AsyncComponent: any) => {
          this.setState({
            AsyncComponent,
          });
        })
        .catch((error: Error) => {
          console.error('cannot load Component in <AsyncComponent>');
          throw error;
        });
    }
    hasLoadedComponent() {
      return this.state.AsyncComponent !== null;
    }
    render() {
      const { AsyncComponent } = this.state;

      return AsyncComponent ? <AsyncComponent {...(this.props as P)} /> : null;
    }
  };

export default asyncComponent;
