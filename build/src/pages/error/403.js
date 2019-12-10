import { formatMessage, FormattedMessage } from '~/locale-tools';
import React from 'react';
import ErrorPage from '~/components/error-page';
import Controller from 'meta.macro';

Controller('/403', {
  title: '访问拒绝',
})
export default class ErrorPage403 extends React.Component {
  render() {
    return <ErrorPage title={formatMessage({id: 'pages-error-403.be-sorry-menu-limits-of-authority-contact'})}>
      <div>
        <p><FormattedMessage id="pages-error-403.waste-number-coffee" /></p>
        <input value={formatMessage({id: 'pages-error-403.ha-ha-ha'})}></input><FormattedMessage id="pages-error-403.to-punch-cards" /></div>
    </ErrorPage>;
  }
}
