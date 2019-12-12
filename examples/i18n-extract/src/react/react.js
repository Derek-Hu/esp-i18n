import React from 'react';
import ErrorPage from '~/components/error-page';
import Controller from '~/Controller';

@Controller('/403', {
  title: '访问拒绝2',
})
export default class ErrorPage403 extends React.Component {
  id = 'uuid';

  state = {
    name: 'benlv'
  }

  render() {
    return <ErrorPage title="抱歉你没有菜单权限">
      <p>请联系管理员</p>
    </ErrorPage>;
  }
}
