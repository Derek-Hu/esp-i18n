import { Button } from 'antd';
import { formatMessage as fm } from '~/locale-tools';
import './polyfill';

console.log(fm({id: 'this-is-chinese'}));

console.log(``);

const json = {
 中文: 'hha',
 '中文2': 'ooo'
}