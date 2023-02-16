/*import Utterances from 'utterances-react';

export default function PostUtter () {
    return (
        <Utterances
            repo="signal-k/starsailors"
            issueTerm="title"
            label="ansible"
            theme="github-light"
            crossorigin="anonymous"
            async={false}
            style={`
            & .utterances {
              max-width: 950px;
            }
          `}
        />
    );
}*/

import React, { useEffect, useRef, Component } from 'react';

export const createComment = () => {
  const ref = useRef();
  const script = document.createElement('script');

  const config = {
    src: 'https://utteranc.es/client.js',
    repo: 'signal-k/starsailors',
    'issue-term': 'pathname',
    theme: 'github-light',
    label: 'ansible',
    crossOrigin: 'anonymous',
    defer: true
  };

  Object.entries(config).forEach(([key, value]) => {
    script.setAttribute(key, value);
  });

  setTimeout(() => {
    ref.current.append(script);
  }, 300);

  return <div ref={ref} />;
}

export class UtterancesCommentsDefunct extends Component {
  componentDidMount () {
      let script = document.createElement("script");
      let anchor = document.getElementById("inject-comments-for-uterances");
      script.setAttribute("src", "https://utteranc.es/client.js");
      script.setAttribute("crossorigin","anonymous");
      script.setAttribute("async", true);
      script.setAttribute("repo", "signal-k/starsailors");
      script.setAttribute("issue-term", "title");
      script.setAttribute("theme", "github-light");
      script.setAttribute("label", "ansible");
      anchor.appendChild(script);
  }

  render() {
    return (
        <div id="inject-comments-for-uterances"></div>
    );
  }
}

export default class UtterancesComments extends Component {

  constructor(props) {
      super(props);
      this.commentBox = React.createRef(); // use ref to create our element
  }

  componentDidMount() { // Should we just put this in a post that is inside a profile sandbox?
      let scriptEl = document.createElement("script");
      scriptEl.setAttribute("theme", 'github-light');
      scriptEl.setAttribute("src", "https://utteranc.es/client.js");
      scriptEl.setAttribute("crossorigin", "anonymous");
      scriptEl.setAttribute("async", true);
      scriptEl.setAttribute("repo", "signal-k/starsailors"); 
      scriptEl.setAttribute("issue-term", "url");
      scriptEl.setAttribute("label", "ansible");
      this.commentBox.current.appendChild(scriptEl);
  }

  render() {
      return (
          <div style={{ width: '100%' }} id="comments">
              <div ref={this.commentBox} />
          </div>
      );
  }
}

export function UtterancesCommentsArchived () {
  const ref = useRef();

  useEffect(() => {
    const script = document.createElement('script');

    const config = {
      src: 'https://utteranc.es/client.js',
      repo: 'signal-k/starsailors',
      'issue-term': 'pathname',
      theme: 'github-light',
      label: 'ansible',
      crossOrigin: 'anonymous',
      defer: true
    };

    Object.entries(config).forEach(([key, value]) => {
      script.setAttribute(key, value);
    });

    setTimeout(() => {
      ref.current.append(script);
    }, 300);
  }, []);

  return <div ref={ref} />;
};