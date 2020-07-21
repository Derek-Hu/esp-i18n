import { Button } from 'antd';
import LocalTools from '~/locale-tools';
import { formatMessage } from '~/locale-tools';
import d3 from 'd3';

const isTrue = true;

console.log(`${formatMessage({id: 'ha-ha'})}${isTrue ? formatMessage({id: 'happy'}) : formatMessage({id: 'unhappy'})}${formatMessage({id: '24-hours-a-day'})}`);

const render = () => {
    return <>
        <div title={formatMessage({id: 'title'})}>
            {formatMessage({id: 'well-1'})}
        </div>
        <p>{formatMessage({id: 'subtitle'})}</p>
        <p>{isTrue ? formatMessage({id: 'happy'}) : formatMessage({id: 'unhappy'})}</p>
        <input placeholder={formatMessage({id: 'subtitle'})} />
        <div slot="title">{formatMessage({id: 'surplus'})}<span>{formatMessage({id: 'bbb-line'})}</span>{formatMessage({id: 'quota-less-than-100'})}</div>
    </>
}