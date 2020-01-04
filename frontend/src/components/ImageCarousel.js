import React from 'react';
import { CarouselProvider, Image, Slider, Slide, Dot, ButtonFirst, ButtonLast } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';
import { Container, Image as ReactImage, Icon, Grid } from 'semantic-ui-react';

const Thumb = ({ image }) => {
    return (<ReactImage src={image.uri} size="tiny" />)
}

const ImageCarousel = ({ images }) => {
    if(!images) {
        return "We don't have any pictures of this boat. We'd love to have some!"
    }

    return (
        <CarouselProvider className="Br-tall"
            naturalSlideWidth={100}
            naturalSlideHeight={100}
            totalSlides={images ? images.length : 0}
        >
            <Slider>
                {
                    (images) ?
                        images.map((image, i) => (
                            <Slide index={i} key={i}>
                                <Image tag="div" src={image.uri} children={
                                    (<Container className="Br-copyright-outer">
                                        <Container className="Br-copyright-inner">
                                            <Icon name="copyright outline" />{image.copyright}
                                        </Container>
                                    </Container>)
                                }>
                                </Image>
                            </Slide>
                        ))
                        : ''
                }
            </Slider>
            <br />
            <Grid >
                <Grid.Row centered verticalAlign="middle">

                    <ButtonFirst><Icon size="big" name="angle double left" /></ButtonFirst>
                    {
                        images.map((image, index) => {
                            return (<Dot key={index} slide={index}><Thumb image={image} /></Dot>)
                        })
                    }
                    <ButtonLast><Icon size="big" name="angle double right" /></ButtonLast>
                </Grid.Row>
            </Grid>
        </CarouselProvider>
    );
}

export default ImageCarousel