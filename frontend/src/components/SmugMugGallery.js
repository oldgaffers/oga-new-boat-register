import React from 'react';
import Iframe from 'react-iframe'

const url = 'https://juliancable.smugmug.com/frame/slideshow'
const queryString = 'autoStart=1&captions=1&navigation=1&playButton=1&randomize=1&speed=3&transition=fade&transitionSpeed=2'

const map = {
    2148: 'smhdQr'
};
const SmugMugGallery = ({ id }) => {

    return (
        <Iframe
        url={`${url}?key=${map[id]}&${queryString}`}
        width="800" 
        height="600" 
        frameborder="no" 
        scrolling="no"
        />
    );
}

export default SmugMugGallery