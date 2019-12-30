// App.js
import "semantic-ui-css/semantic.min.css";
import './App.css';
import React from 'react';
import Main from "./components/Main";
import AddBoat from "./components/AddBoat";
import BrowseBoats from "./components/BrowseBoats";
import {useRoutes} from 'hookrouter';

const routes = {
  "/": () => <Main />,
  "/browse": () => <BrowseBoats />,
  "/add": () => <AddBoat />
};

const App = () => {
  const routeResult = useRoutes(routes)
  return routeResult
};

export default App;