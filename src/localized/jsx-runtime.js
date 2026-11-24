import {jsx as originalJsx, jsxs as originalJsxs, Fragment} from 'react/jsx-runtime';
import {localizeProps} from '../i18n.js';
export {Fragment};
export const jsx=(type,props,key)=>originalJsx(type,localizeProps(type,props),key);
export const jsxs=(type,props,key)=>originalJsxs(type,localizeProps(type,props),key);
