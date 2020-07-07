const isTrue = true;

console.log(`happy哈哈，${isTrue ? '开心' : '不开心'}的一天24小时`);

const render = () => {
    return <>
        <div title="标题">
            好的
        </div>
        <p>{'子标题'}</p>
        <p>{isTrue ? '开心' : '不开心'}</p>
        <input placeholder={'子标题'} />
    </>
}