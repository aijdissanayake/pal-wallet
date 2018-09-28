/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Switch, Route } from 'react-router';
import routes from './constants/routes.json';
import App from './containers/App';
import { Account } from './containers';// eslint-disable-line
import DashboardContainer from './containers/DashboardContainer';
import SuperNodeContainer from './containers/SuperNodeContainer';

export default () => (
  <App>
    <Switch>
      <Route path={`${routes.ACCOUNT_DETAIL}/:page`} component={Account.Details} />
      <Route path={routes.ACCOUNT_DETAIL} component={Account.Details} />
      <Route path={routes.SUPERNODE} component={SuperNodeContainer} />
      <Route path={routes.HOME} component={DashboardContainer} />
    </Switch>
  </App>
);
