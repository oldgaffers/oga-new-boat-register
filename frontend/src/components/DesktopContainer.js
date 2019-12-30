import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Responsive,
  Segment,
  Visibility,
} from 'semantic-ui-react'
import Hero from "./Hero"
import TopMenu from "./TopMenu"

function imageBackground() {
    const url = 'https://www.oga.org.uk/sites/default/files/boat_images/Rocket-DD CNV00018.JPG';
    const Background = {
      backgroundImage: "url('" + url + "')",
      backgroundSize: '800px'
    };
    return Background;
  }

const DesktopContainer = ({children}) => {
    const [fixed, setFixed] = useState(false);
    return (
    <Responsive minWidth={Responsive.onlyTablet.minWidth}>
        <Visibility
        style={imageBackground()}
        once={false}
        onBottomPassed={() => setFixed(true)}
        onBottomPassedReverse={() => setFixed(false)}
        >
        <Segment
            textAlign='center'
            style={{ minHeight: 700, padding: '1em 0em' }}
            vertical
        >
            <TopMenu fixed={fixed} />
            <Hero />
        </Segment>
        </Visibility>
        {children}
    </Responsive>
)}
  
DesktopContainer.propTypes = {
    children: PropTypes.node,
}

export default DesktopContainer;