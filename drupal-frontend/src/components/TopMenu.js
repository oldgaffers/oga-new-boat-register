import React from 'react';
import {A} from 'hookrouter';
import {
  Button,
  Container,
  Image,
  Menu,
  Segment,
} from 'semantic-ui-react'
import { useAuth0 } from "../react-auth0-spa";

const TopMenu = ({fixed}) => {
    const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();
    return (
        <Segment style={{ backgroundColor: '#002E50' }}>
            <Menu
            fixed={fixed ? 'top' : null}
            inverted={!fixed}
            pointing={!fixed}
            secondary={!fixed}
            size='large'
            >
            <Image src='https://www.oga.org.uk/sites/all/themes/boat_register/logo.png' />
            <Container>
                <Menu.Item><A href="/">Home</A></Menu.Item>
                <Menu.Item><A href="/browse">Search</A></Menu.Item>
                <Menu.Item as='a'>For Sale</Menu.Item>
                <Menu.Item as='a'>Join In</Menu.Item>
                <Menu.Item position='right'>
                {!isAuthenticated && (
                <Button
                    as='button'
                    onClick={() => loginWithRedirect({})}
                    inverted={!fixed}
                >
                    Log in
                </Button>
                )}
                {isAuthenticated && 
                    <Button as='button' inverted={!fixed} onClick={() => logout()}>
                        Log out {user.given_name}
                    </Button>}
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