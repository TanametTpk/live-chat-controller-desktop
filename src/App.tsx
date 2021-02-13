import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.global.css';
import HomePage from './pages/Home';
import MacroPage from './pages/Macro';
import SettingPage from './pages/Settings';

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/macros" component={MacroPage} />
        <Route path="/settings" component={SettingPage} />
        <Route path="/" component={HomePage} />
      </Switch>
    </Router>
  );
}
