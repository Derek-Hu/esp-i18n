// 改函数运行在浏览器内，不能访问函数体外的变量

module.exports = function (translatedId) {

    function formatWord(word) {
        return word.toLowerCase().replace(/[,.:/|<*>()【】\[\]"']/g, '').replace(/[\u4e00-\u9fa5]/g, '').trim().replace(/\s/g, '-');
    }
    const maxWords = 4;
    const keywordsSelector = 'ul.keywords-container li.keywords-content .keywords-means';

    const translationEle = document.querySelector('p.ordinary-output.target-output');
    const translation = translationEle.textContent.trim();

    debugger;
    if (translatedId) {
        return {
            id: translatedId,
            translation: translation
        }
    }

    const keyMeansElems = document.querySelectorAll(keywordsSelector) || [];
    const keyMeans = Array.prototype.slice.call(keyMeansElems).map(ele => ele.textContent);

    const translationParts = translation.split(' ').map(formatWord).filter(v => v);

    const allFirstMeans = (keyMeans && keyMeans.length) ? keyMeans.map(means => {
        const firstMeans = means.split(';');
        if (firstMeans && firstMeans[0]) {
            return firstMeans[0].trim();
        }
        return '';
    }).map(formatWord).filter(v => v) : [];

    if (translationParts.length && (translationParts.length <= maxWords)) {
        return {
            id: translationParts.join('-'),
            translation: translation
        };
    }

    return {
        id: allFirstMeans.concat(translationParts).reduce((means, word, index) => {
            if (index >= maxWords) {
                return means;
            }
            means.push(word);
            return means;
        }, []).join('-'),
        translation: translation
    };
}