import React, { useState, useEffect }from 'react';
import Iframe from 'react-iframe'

const url = 'https://oga.smugmug.com/frame/slideshow'
const queryString = 'autoStart=1&captions=1&navigation=1&playButton=1&randomize=1&speed=3&transition=fade&transitionSpeed=2'

const map = {
    2148: 'smhdQr'
};

const SmugMugGallery = ({ id }) => {

    const [key, setKey] = useState();

    useEffect(() => {
        const url = 'https://api.smugmug.com/api/v2!weburilookup?'
                +'WebUri=https://oga.smugmug.com/Boats/OGA-'+id
        fetch(
            url,
            {
              method: "GET",
              headers: new Headers({ Accept: "application/json" })
            }
          )
          .then(res => res.json())
            .then(response => {
                console.log(response);
                setKey(response.Response.Album.AlbumKey);
                })
            .catch(error => console.log(error));
    }, [id])

    return (
        <Iframe
        url={`${url}?key=${key}&${queryString}`}
        width="800" 
        height="600" 
        frameborder="no" 
        scrolling="no"
        />
    );
}

export default SmugMugGallery