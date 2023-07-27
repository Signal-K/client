import React from "react";

import BigProject from "../../Core/atoms/ListComponent";
import Section from "../../Core/atoms/Section";

const BigProjectsSection: React.VFC = () => {
  return (
    <Section title="Your missions" label="Tools">
      <BigProject
        inProgress={false}
        name="Star Sailors"
        link="https://play.skinetics.tech"
        textGradient="pink"
        description="Classify planets & sail the stars in an open-source citizen science adventure."
      />
      <BigProject
        inProgress={false}
        name="Silfur"
        textGradient="pink"
        link="https://github.com/signal-k/silfur"
        description="Lightweight blockchain for gamifying scientific media"
      />
      <BigProject
        inProgress={false}
        name="Fjall"
        textGradient="pink"
        link='https://github.com/Signal-K/Fjall'
        description="Plugin interface for Nodes on the DeSci framework"
      />
      <BigProject
        inProgress
        name="Matr"
        textGradient="purple"
        link="https://punchcard.so/"
        description="Developing and decentralising aligned AI innovation transparently"
      />
      <BigProject
        inProgress
        name="Talon Interface"
        textGradient="purple"
        link="https://punchcard.so/"
        description="UI schema for citizen science projects"
      />
    </Section>
  );
};

export default BigProjectsSection;