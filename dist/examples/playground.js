"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Ajv = require("ajv");
const schemas = require("../schema");
const data = require("../schema/data");
const get_data_1 = require("./get-data");
const __1 = require("..");
const templates_1 = require("../templates");
const valid = '✔️';
const invalid = '❌';
const unknown = '❓';
const ajv = new Ajv({
    schemaId: 'id',
    allErrors: true,
    jsonPointers: true
});
ajv.addMetaSchema(schemas.meta);
ajv.addFormat('multiline', () => true);
ajv.addFormat('password', () => true);
ajv.addFormat('tel', () => true);
ajv.addFormat('range', () => true);
ajv.addFormat('hidden', () => true);
ajv.addFormat('color', /^\#[a-f0-9]{6}$/);
ajv.addFormat('month', /^\d{4}-\d{1,2}$/);
ajv.addFormat('week', /^\d{4}-W\d{1,2}$/);
document.addEventListener('DOMContentLoaded', () => {
    const schemaToDom = __1.SchemaToFormElements(templates_1.ClientFormTemplates(document, Event));
    const { form, submit, select, schema, schemaSubmit, resultJson, resultFormData, resultSubmit, schemaSection, formSection, resultSection, schemaValid, formValid, resultValid, formErrors, schemaErrors, resultErrors, showJson, showFormData } = init();
    submit.onclick = e => {
        e.preventDefault();
        onFormSubmit();
    };
    schemaSubmit.onclick = e => {
        e.preventDefault();
        onSchemaSubmit();
    };
    resultSubmit.onclick = e => {
        e.preventDefault();
        onResultSubmit();
    };
    const onFormSubmit = () => {
        if (!isSchemaValid())
            return;
        if (!isFormValid())
            return;
        resultSection.classList.remove('invalid');
        const value = get_data_1.getData(form);
        resultJson.value = JSON.stringify(value, null, 2);
        const formData = new FormData(form);
        resultFormData.innerHTML = '';
        Array.from(formData.entries()).forEach(([key, value]) => {
            const tr = document.createElement('tr');
            const th = document.createElement('th');
            const td = document.createElement('td');
            th.innerText = key;
            td.innerHTML = String(value).split('\n').join('<br>');
            tr.appendChild(th);
            tr.appendChild(td);
            resultFormData.appendChild(tr);
        });
        const isValid = isResultValid();
        resultValid.innerText = isValid ? valid : invalid;
        if (!isValid) {
            resultSection.classList.add('invalid');
            let errors = ajv.errorsText(ajv.errors);
            if (errors === 'No errors') {
                errors = 'Invalid JSON';
            }
            else {
                errors = errors.split(', ').join('\n');
            }
            resultErrors.innerText = errors;
        }
    };
    const onSelect = () => {
        const key = select.selectedOptions[0].value;
        let currentSchema = schemas[key];
        if (key in data) {
            currentSchema = JSON.parse(JSON.stringify(currentSchema));
            currentSchema.default = data[key];
        }
        schema.value = JSON.stringify(currentSchema, null, 2);
        form.innerHTML = '';
        resultJson.value = '';
        resultFormData.innerHTML = '';
        onSchemaChange();
    };
    const onSchemaChange = () => {
        const isValid = isSchemaValid();
        schemaValid.innerText = isValid ? valid : invalid;
        formSection.classList.remove('invalid');
        resultSection.classList.remove('invalid');
        if (!isValid) {
            schemaSection.classList.add('invalid');
            let errors = ajv.errorsText(ajv.errors);
            if (errors === 'No errors') {
                errors = 'Invalid JSON';
            }
            else {
                errors = errors.split(', ').join('\n');
            }
            schemaErrors.innerText = errors;
            form.innerHTML = '';
            resultJson.value = '';
            resultFormData.innerHTML = '';
            formValid.innerText = unknown;
            resultValid.innerText = unknown;
            return;
        }
        schemaSection.classList.remove('invalid');
        onSchemaSubmit();
    };
    const onSchemaSubmit = () => {
        const currentSchema = JSON.parse(schema.value);
        const schemaDom = schemaToDom(currentSchema);
        form.innerHTML = '';
        resultJson.value = '';
        resultFormData.innerHTML = '';
        form.appendChild(schemaDom);
        onFormChange();
    };
    const onFormChange = () => {
        console.log('form change');
        const isValid = isFormValid();
        formValid.innerText = isValid ? valid : invalid;
        if (!isValid) {
            formSection.classList.add('invalid');
            let errors = '';
            const invalidItems = Array.from(form.querySelectorAll(':invalid'));
            invalidItems.forEach(item => {
                if (item.localName === 'fieldset')
                    return;
                errors += `${item.title || item.name || item.localName}: ${item.validationMessage}\n`;
            });
            formErrors.innerText = errors;
            const currentFocus = document.activeElement;
            form.reportValidity();
            if (currentFocus !== null)
                currentFocus.focus();
            resultValid.innerText = unknown;
            resultJson.value = '';
            resultFormData.innerHTML = '';
            return;
        }
        formSection.classList.remove('invalid');
        onFormSubmit();
    };
    const onResultChange = () => {
        const isValid = isResultValid();
        resultValid.innerText = isValid ? valid : invalid;
        if (!isValid) {
            resultSection.classList.add('invalid');
            let errors = ajv.errorsText(ajv.errors);
            if (errors === 'No errors') {
                errors = 'Invalid JSON';
            }
            else {
                errors = errors.split(', ').join('\n');
            }
            resultErrors.innerText = errors;
        }
    };
    const onResultSubmit = () => {
        if (!isSchemaValid())
            return;
        if (!isFormValid())
            return;
        if (!isResultValid())
            return;
        const resultValue = JSON.parse(resultJson.value);
        let currentSchema = JSON.parse(schema.value);
        currentSchema.default = resultValue;
        schema.value = JSON.stringify(currentSchema, null, 2);
        onSchemaSubmit();
    };
    schema.oninput = onSchemaChange;
    form.oninput = onFormChange;
    resultJson.oninput = onResultChange;
    select.onchange = onSelect;
    showJson.onclick = e => {
        e.preventDefault();
        showJson.classList.add('selected');
        showFormData.classList.remove('selected');
        resultSection.classList.remove('form-data');
        resultSection.classList.add('json');
    };
    showFormData.onclick = e => {
        e.preventDefault();
        showJson.classList.remove('selected');
        showFormData.classList.add('selected');
        resultSection.classList.add('form-data');
        resultSection.classList.remove('json');
    };
    onSelect();
});
const isSchemaValid = () => {
    const schema = getCurrentSchema();
    if (!schema)
        return false;
    return ajv.validate('http://json-schema.org/draft-04/schema#', schema);
};
const isFormValid = () => {
    const form = getForm();
    if (!form)
        return false;
    return form.checkValidity();
};
const isResultValid = () => {
    const result = getResult();
    if (result === undefined)
        return false;
    if (!isSchemaValid())
        return false;
    const currentSchema = getCurrentSchema();
    if (!currentSchema)
        return false;
    return ajv.validate(currentSchema, result);
};
const getCurrentSchema = () => {
    try {
        const schema = document.querySelector('.schema textarea');
        return JSON.parse(schema.value);
    }
    catch (_a) {
        return;
    }
};
const getForm = () => {
    const form = document.querySelector('.form form');
    if (form)
        return form;
};
const getResult = () => {
    try {
        const result = document.querySelector('.result textarea');
        return JSON.parse(result.value);
    }
    catch (_a) {
        return;
    }
};
const init = () => {
    const form = createForm();
    const submit = createFormButton();
    const select = createSelect();
    const schema = document.querySelector('.schema textarea');
    const schemaSubmit = createSchemaButton();
    const resultJson = document.querySelector('.result textarea.json');
    const resultFormData = document.querySelector('.result table.form-data');
    const resultSubmit = createResultButton();
    const formSection = document.querySelector('.form');
    const schemaSection = document.querySelector('.schema');
    const resultSection = document.querySelector('.result');
    const schemaValid = document.querySelector('.schema-valid');
    const formValid = document.querySelector('.form-valid');
    const resultValid = document.querySelector('.result-valid');
    const formErrors = document.querySelector('.form pre');
    const schemaErrors = document.querySelector('.schema pre');
    const resultErrors = document.querySelector('.result pre');
    const showJson = document.querySelector('.result a[href="#json"]');
    const showFormData = document.querySelector('.result a[href="#form-data"]');
    return {
        form, submit, select, schema, schemaSubmit, resultJson, resultFormData,
        resultSubmit, formSection, schemaSection, resultSection, schemaValid,
        formValid, resultValid, formErrors, schemaErrors, resultErrors, showJson,
        showFormData
    };
};
const createForm = () => {
    const form = document.querySelector('.form form');
    return form;
};
const createFormButton = () => {
    const formButtonContainer = document.querySelector('.form-button');
    const submit = document.createElement('input');
    submit.type = 'submit';
    submit.value = 'Update Results';
    formButtonContainer.appendChild(submit);
    return submit;
};
const createSchemaButton = () => {
    const schemaButtonContainer = document.querySelector('.schema-button');
    const schemaSubmit = document.createElement('input');
    schemaSubmit.type = 'submit';
    schemaSubmit.value = 'Update Form';
    schemaButtonContainer.appendChild(schemaSubmit);
    return schemaSubmit;
};
const createResultButton = () => {
    const resultButtonContainer = document.querySelector('.result-button');
    const resultSubmit = document.createElement('input');
    resultSubmit.type = 'submit';
    resultSubmit.value = 'Update Schema Defaults';
    resultButtonContainer.appendChild(resultSubmit);
    return resultSubmit;
};
const createSelect = () => {
    const select = document.querySelector('header select');
    const keys = Object.keys(schemas);
    keys.forEach((key, i) => {
        const schema = schemas[key];
        const option = document.createElement('option');
        option.value = key;
        option.innerText = schema.title;
        option.selected = i === 0;
        select.appendChild(option);
    });
    return select;
};
//# sourceMappingURL=playground.js.map