import {jsxDEV as original, Fragment} from 'react/jsx-dev-runtime';
import {localizeProps} from '../i18n.js';
export {Fragment};
export const jsxDEV=(type,props,...rest)=>original(type,localizeProps(type,props),...rest);
