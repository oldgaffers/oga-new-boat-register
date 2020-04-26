import React, { useEffect } from 'react';
import Friendly from './Friendly.js';
import WeAre from './WeAre.js';
import ResponsiveContainer from "./ResponsiveContainer";

const Main = () => {
  useEffect(() => {
    document.title = "OGA Boat Register";
  });

    return (
    <ResponsiveContainer>
        <WeAre/>
        <Friendly/>
      </ResponsiveContainer>
  );
}

export default Main
