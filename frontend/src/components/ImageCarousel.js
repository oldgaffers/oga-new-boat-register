import React from 'react';
import { CarouselProvider, Image, Slider, Slide, ButtonBack, ButtonNext } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';

const ImageCarousel = ({images}) => {
      return (
        <CarouselProvider
          naturalSlideWidth={16}
          naturalSlideHeight={9}
          totalSlides={images.length}
        >
        <Slider>
            {
                images.map((image, i) =>(
                    <Slide index={i}>
                    <Image src={image.uri} />   
                    </Slide>
                ))
            }
        </Slider>
        <ButtonBack>Back</ButtonBack>
        <ButtonNext>Next</ButtonNext>
        </CarouselProvider>
      );
  }

  export default ImageCarousel