import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import HomePage from './pages/HomePage';
import CounterPage from './pages/CounterPage';

export default function Routes() {
  return (
    <Switch>
      <Route path={routes.COUNTER} component={CounterPage} />
      <Route path={routes.HOME} component={HomePage} />
    </Switch>
  );
}
