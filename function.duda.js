const Duda = (target, fn) => {
    const form = document.querySelector(target);

    const createKey = (obj, value) => {
        if (!obj.current[obj.key]) {
            obj.current[obj.key] = value;
        }
    }

    const createArray = obj => {
        const pathNext = obj.path.replace(new RegExp(`^${obj.key}.|.$`, 'g'), '');
        createKey(obj, []);
        obj.current[obj.key].push(!pathNext ? obj.value : { [pathNext]: obj.value });
    }

    const createObject = obj => {
        const pathNext = obj.path.replace(new RegExp(`${obj.key}?.`), '');
        createKey(obj, !pathNext ? obj.value : {});
        formatObject(obj.current[obj.key], pathNext, obj.value);
    }

    const createObjectOrArray = obj => obj.isArray ? createArray(obj) : createObject(obj);

    const formatObject = (objCurrent, path, value) => {
        const current = objCurrent;
        const limiter = /\[|\./.exec(path) || (path && /\s$/.exec(`${path} `));
        if (limiter) {
            const key = path.substring(0, limiter.index);
            const isArray = limiter[0] === '[';
            createObjectOrArray({ isArray, current, path, key, value});
        }
    }


    const formatBoolean = v => v === 'true';

    const formatJSON = v => {
        try {
            return JSON.parse(v);
        } catch (e) {
            console.error(`[ERROR DUDA] ${e}`);
        }
    }

    const formatNumber = v => Number(v);

    const formatString = v => (v).toString();

    const formatAutoValue = value => {
        if (value === 'true' || value === 'false') {
            return formatBoolean(value);
        }
        const valueToNumber = Number(value);
        return window.Number.isNaN(valueToNumber)
            ? formatString(value)
            : formatNumber(value);
    }

    const formatTyped = (value, type) => {
        let valueFinal = null;
        switch (type) {
            case 'boolean': valueFinal = formatBoolean(value);
                break;
            case 'json': valueFinal = formatJSON(value);
                break;
            case 'number': valueFinal = formatNumber(value);
                break;
            default: valueFinal = formatString(value);
                break;
        }
        return valueFinal;
    }

    const submitEvent = () => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = {};
            const inputs = [...form.querySelectorAll('input, select, textarea')];
            inputs.forEach((input) => {
                const { type, value: val, key } = input.dataset;
                const value = val || input.value;
                const name = key || input.name;
                const valueFinal = !type ? formatAutoValue(value) : formatTyped(value, type);
                formatObject(data, name, valueFinal);
            });
            fn(data);
        });
    }
    
    if (form) {
        submitEvent();
    }
}
