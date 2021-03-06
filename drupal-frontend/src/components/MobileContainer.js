import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    Container,
    Icon,
    Menu,
    Responsive,
    Segment,
    Sidebar
  } from 'semantic-ui-react'
  import Hero from "./Hero"

function getWidth() {
  return 100;
}

const MobileContainer = ({children}) => {
    const [sidebarOpened, setSidebarOpened] = useState(false);
    return (
      <Responsive
        as={Sidebar.Pushable}
        getWidth={getWidth}
        maxWidth={Responsive.onlyMobile.maxWidth}
      >
        <Sidebar
          as={Menu}
          animation='push'
          inverted
          onHide={() => setSidebarOpened(false)}
          vertical
          visible={sidebarOpened}
        >
          <Menu.Item as='a' active>Home</Menu.Item>
          <Menu.Item as='a'>Search</Menu.Item>
          <Menu.Item as='a'>For Sale</Menu.Item>
          <Menu.Item as='a'>Join In</Menu.Item>
          <Menu.Item as='a'>Log in</Menu.Item>
          <Menu.Item as='a'>Sign Up</Menu.Item>
        </Sidebar>

        <Sidebar.Pusher dimmed={sidebarOpened}>
          <Segment
            inverted
            textAlign='center'
            style={{ minHeight: 350, padding: '1em 0em' }}
            vertical
          >
            <Container>
              <Menu inverted pointing secondary size='large'>
                <Menu.Item onClick={() => setSidebarOpened(!sidebarOpened)}>
                  <Icon name='sidebar' />
                </Menu.Item>
                <Menu.Item position='right'>
                  <Button as='a' inverted>
                    Log in
                  </Button>
                  <Button as='a' inverted style={{ marginLeft: '0.5em' }}>
                    Sign Up
                  </Button>
                </Menu.Item>
              </Menu>
            </Container>
            <Hero mobile />
          </Segment>

          {children}
        </Sidebar.Pusher>
      </Responsive>
    )
}

MobileContainer.propTypes = {
  children: PropTypes.node,
}

export default MobileContainer