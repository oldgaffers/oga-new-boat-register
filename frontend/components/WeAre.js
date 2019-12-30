import React from 'react';
import {
  Button,
  Grid,
  Header,
  Image,
  Segment,
} from 'semantic-ui-react'
import {A} from 'hookrouter';

const WeAre = () => (
  <Segment style={{ padding: '8em 0em' }} vertical>
    <Grid container stackable verticalAlign='middle'>
      <Grid.Row>
        <Grid.Column width={8}>
          <Header as='h3' style={{ fontSize: '2em' }}>
            People like you
          </Header>
          <p style={{ fontSize: '1.33em' }}>
            We are a group of ordinary people with a love of sailing.
          </p>
          <Header as='h3' style={{ fontSize: '2em' }}>
            Life's too short for a boring boat
          </Header>
          <p style={{ fontSize: '1.33em' }}>
            Some of our boats are over 100 years old. Others are being built in our garages.
          </p>
        </Grid.Column>
        <Grid.Column floated='right' width={6}>
          <Image bordered rounded size='large' src='https://www.oga.org.uk/sites/default/files/picnic-shade-aldeburgh-sfoxall.jpeg' />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column textAlign='center'>
          <Button size='huge'>
            <A href="/browse">Check out our boats ...</A>
          </Button>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </Segment>
  )
  
  export default WeAre