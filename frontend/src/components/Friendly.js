import React from 'react';
import {
  Container,
  Grid,
  Header,
  List,
  Segment,
} from 'semantic-ui-react'

const Friendly = () => (
  <Segment inverted vertical style={{ padding: '5em 0em' }}>
    <Container>
      <Grid divided inverted stackable>
        <Grid.Row>
          <Grid.Column width={3}>
            <Header inverted as='h4' content='Links' />
            <List link inverted>
              <List.Item>
                <List.Content>
                  <a href="https://www.oga.org.uk/about/contact-oga">Contact Us</a>
                </List.Content>
              </List.Item>
              <List.Item>
                <List.Content>
                  <a href="https://www.oga.org.uk">Main Site</a>
                </List.Content>
              </List.Item>
              <List.Item>
                <List.Content>
                  <a href="https://www.oga.org.uk/boats-for-sale">Sell your boat</a>
                </List.Content>
                </List.Item>
              <List.Item>
                <List.Content>
                <a href="http://www.sailing-by.org.uk/Sailing By">Sailing By</a>
                </List.Content>
              </List.Item>
            </List>
          </Grid.Column>
          <Grid.Column width={10}>
            <Header as='h4' inverted>
              The Friendly Association
            </Header>
            <p>
              Everyone is welcome in the OGA. If you love our boats and think you might want to own one
              come to one of our events.
                We offer crewing opportunities on small and larger boats.
                We are happy to share our thoughts on the pitfalls to avoid when buying a boat.
              Membership has been a life-changing experience for more than one of our members.
              and
            </p>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  </Segment>
  )
  
  export default Friendly