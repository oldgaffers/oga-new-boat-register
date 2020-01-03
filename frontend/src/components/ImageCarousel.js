import React from 'react';
import { CarouselProvider, Image, Slider, Slide, DotGroup, ButtonFirst, ButtonLast, ButtonBack, ButtonNext } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';

const ImageCarousel = ({images}) => {
      return (
        <CarouselProvider
          naturalSlideWidth={16}
          naturalSlideHeight={9}
          totalSlides={images?images.length:0}
        >
        <ButtonFirst>First</ButtonFirst>
        <ButtonBack>Back</ButtonBack>
        <ButtonNext>Next</ButtonNext>
        <ButtonLast>Last</ButtonLast>
        <DotGroup />
        <Slider>
            {
                (images)?
                    images.map((image, i) =>(
                        <Slide index={i} key={i}>
                        <Image  src={image.uri} />   
                        </Slide>
                    ))
                :''
            }
        </Slider>
    </CarouselProvider>
      );
  }

  export default ImageCarousel