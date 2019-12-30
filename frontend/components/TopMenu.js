import React from 'react';
import {A} from 'hookrouter';
import {
  Button,
  Container,
  Image,
  Menu,
  Segment,
} from 'semantic-ui-react'

const TopMenu = ({fixed}) => {
    return (
        <Segment inverted>
            <Menu
            fixed={fixed ? 'top' : null}
            inverted={!fixed}
            pointing={!fixed}
            secondary={!fixed}
            size='large'
            >
            <Image src='https://www.oga.org.uk/sites/all/themes/boat_register/logo.png' />
            <Container>
                <Menu.Item active>
                    <A href="/">Home</A>
                </Menu.Item>
                <Menu.Item as='a'>Search</Menu.Item>
                <Menu.Item as='a'>For Sale</Menu.Item>
                <Menu.Item as='a'>Join In</Menu.Item>
                <Menu.Item position='right'>
                <Button as='a' inverted={!fixed}>
                    Log in
                </Button>
                <Button as='a' inverted={!fixed} primary={fixed} style={{ marginLeft: '0.5em' }}>
                    Sign Up
                </Button>
                </Menu.Item>
            </Container>
            </Menu>
        </Segment>
    );
}
export default TopMenu