import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';

export default function HomePage() {
  return (
    <div>
      <h2>Home</h2>
      <Link to={routes.COUNTER}>to Counter</Link>
    </div>
  );
}
