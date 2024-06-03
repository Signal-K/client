import React, { Component } from 'react';
import RocketCore from './RocketCore';

interface ClassRocketState {
  initialLaunchTime: number;
}

class ClassRocket extends Component<{}, ClassRocketState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      initialLaunchTime: Date.now()
    };
  }

  render() {
    const { initialLaunchTime } = this.state;

    return <RocketCore initialLaunchTime={initialLaunchTime} />;
  }
}

export default ClassRocket;
