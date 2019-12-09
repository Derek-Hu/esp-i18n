import React from 'react';
import ErrorPage from '~/components/error-page';
import Controller from 'meta.macro';
import { formatMessage, formatMessage as fm, FormattedMessage } from '~/locale-tools';


Controller('/403', {
  title: '访问拒绝',
})
export default class ErrorPage403 extends React.Component {
  render() {
    return <ErrorPage title={formatMessage({id: '抱歉你没有菜单权限,请联系管理员。'})}>
      <div>
        <p><FormattedMessage id="浪费多少咖啡里的撒" /></p>
        <input value={formatMessage({id: '哈哈哈'})}></input><FormattedMessage id="
        来打卡
      " /></div>
    </ErrorPage>;
  }
}
