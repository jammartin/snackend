'use strict';

function deepCopy(object){
    const deepCopyWorker = (obj, acc) => {
        Object.keys(obj)
            .forEach(key => {
                if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                    acc[key] = deepCopyWorker(obj[key], {});
                } else {
                    acc[key] = obj[key];
                }
            });
        return acc;
    };
    return deepCopyWorker(object, {});
}


function readable(object){
    // helper method taken from:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value#Examples
    const getCircularReplacer = () => {
        const seen = new WeakSet();
        return (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                    return;
                }
                seen.add(value);
            } else if (typeof value === 'function'){
                value = value.name;
            }
            return value;
        };
    };
    return JSON.stringify(object, getCircularReplacer());
}

module.exports = {
    deepCopy: deepCopy,
    readable: readable
};