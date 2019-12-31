import React from 'react';
import {A} from 'hookrouter';
import PropTypes from 'prop-types';
import {
    Button,
    Container,
    Header,
    Icon
  } from 'semantic-ui-react';

/* Heads up! HomepageHeading uses inline styling, however it's not the best practice. Use CSS or styled components for
 * such things.
 */
const Hero = ({ mobile }) => {
    return (
    <Container>
      <Header
        as='h1'
        content='Celebrate your heritage'
        inverted 
        style={{
          fontSize: mobile ? '2em' : '4em',
          fontWeight: 'normal',
          marginBottom: 0,
          marginTop: mobile ? '1.5em' : '3em',
        }}
      />
      <Header
        as='h2'
        content='A home for traditionally rigged yachts and working craft.'
        inverted
        style={{
          fontSize: mobile ? '1.5em' : '1.7em',
          fontWeight: 'normal',
          marginTop: mobile ? '0.5em' : '1.5em',
        }}
      />
      <Button primary size='huge'>
        <A href="/browse"><span style={{color: 'white'}}>Let's Look at some boats ...</span>
          <Icon name='right arrow' style={{color: 'white'}}/>
        </A>
      </Button>
    </Container>
  )}
  
  Hero.propTypes = {
    mobile: PropTypes.bool,
  }

  export default Hero;
