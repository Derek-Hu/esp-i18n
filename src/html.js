const parse = (line) => {
    const chinease = line.match(/[\u4e00-\u9fa5]+[a-z0-9A-Z]*[\u4e00-\u9fa5]+/g);
    chinease && chinease.map(word => {
        
    });
    return chinease;
}

const parsers = [
    '确认签署如上协议，将发送短信到安心签注册手机',
    'placeholder="请输入短信验证码"',
    '<div slot="title">剩余发行额度不足</div>',
    '<div slot="title">剩余<span>发bbb行</span>额度不足100</div>',
    '剩余<span>发bbb行</span>额度不足100',
    '剩余<span>发bbb行</span>额度不足',
    '<div slot="title">剩余'
].map(parse);

console.log(parsers);