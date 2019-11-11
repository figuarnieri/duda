class Duda {
    constructor(target, fn) {
        const form = document.querySelector(target);
        this.fn = fn;
        this.init(form);
    }

    init(form) {
        if (form) {
            this.submitEvent(form);
        }
    }

    createKey(obj, value) {
        if (!obj.current[obj.key]) {
            obj.current[obj.key] = value;
        }
    }

    createArray(obj) {
        const pathNext = obj.path.replace(new RegExp(`^${obj.key}.|.$`, 'g'), '');
        this.createKey(obj, []);
        obj.current[obj.key].push(!pathNext ? obj.value : { [pathNext]: obj.value });
    }

    createObject(obj) {
        const pathNext = obj.path.replace(new RegExp(`${obj.key}?.`), '');
        this.createKey(obj, !pathNext ? obj.value : {});
        this.formatObject(obj.current[obj.key], pathNext, obj.value);
    }

    createObjectOrArray(obj) {
        this[obj.isArray ? 'createArray' : 'createObject'](obj);
    }

    formatObject(objCurrent, path, value) {
        const current = objCurrent;
        const limiter = /\[|\./.exec(path) || (path && /\s$/.exec(`${path} `));
        if (limiter) {
            const key = path.substring(0, limiter.index);
            const isArray = limiter[0] === '[';
            this.createObjectOrArray({ isArray, current, path, key, value});
        }
    }

    formatAutoValue(value) {
        if (value === 'true' || value === 'false') {
            return this.formatBoolean(value);
        }
        const valueToNumber = Number(value);
        return window.Number.isNaN(valueToNumber)
            ? this.formatString(value)
            : this.formatNumber(value);
    }

    formatBoolean(v) {
        return v === 'true';
    }

    formatJSON(v) {
        try {
            return JSON.parse(v);
        } catch (e) {
            console.error(`[ERROR DUDA] ${e}`);
        }
    }

    formatNumber(v) {
        return Number(v);
    }

    formatString(v) {
        return (v).toString();
    }

    formatTyped(value, type) {
        let valueFinal = null;
        switch (type) {
            case 'boolean': valueFinal = this.formatBoolean(value);
                break;
            case 'json': valueFinal = this.formatJSON(value);
                break;
            case 'number': valueFinal = this.formatNumber(value);
                break;
            default: valueFinal = this.formatString(value);
                break;
        }
        return valueFinal;
    }

    submitEvent(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = {};
            const inputs = [...form.querySelectorAll('input, select, textarea')];
            inputs.forEach((input) => {
                const { type, value: val, key } = input.dataset;
                const value = val || input.value;
                const name = key || input.name;
                const valueFinal = !type ? this.formatAutoValue(value) : this.formatTyped(value, type);
                this.formatObject(data, name, valueFinal);
            });
            this.fn(data);
        });
    }
}
