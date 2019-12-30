import React from 'react';
import Friendly from './Friendly.js';
import WeAre from './WeAre.js';
import ResponsiveContainer from "./ResponsiveContainer";

const Main = () => {
    return (
    <ResponsiveContainer>
        <WeAre/>
        <Friendly/>
      </ResponsiveContainer>
  );
}

export default Main
