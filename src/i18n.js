import dictionary from './translations.txt?raw';
export const translations = Object.fromEntries(dictionary.replace(/^\uFEFF/,'').trim().split(/\r?\n/).map(line => { const i=line.indexOf('='); return [line.slice(0,i),line.slice(i+1)]; }));
let language = 'zh';
try { language = localStorage.getItem('blueprint-language') === 'en' ? 'en' : 'zh'; } catch {}
export const getLanguage = () => language;
export function setLanguage(value) {
 language = value === 'en' ? 'en' : 'zh';
 try { localStorage.setItem('blueprint-language', language); } catch {}
 document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
 document.title = language === 'en' ? 'Blueprint Studio — Design Review Demo' : '构想事务所 · 蓝图评审 Demo';
}
export function t(value) {
 if (language !== 'en' || typeof value !== 'string') return value;
 if (translations[value]) return translations[value];
 return value.replace(/[\u3400-\u9fff]+/g, phrase => translations[phrase] ? ` ${translations[phrase]} ` : phrase)
 .replace(/。/g,'. ').replace(/，|、/g,', ').replace(/；/g,'; ').replace(/：/g,': ').replace(/！/g,'!').replace(/？/g,'?').replace(/（/g,'(').replace(/）/g,')').replace(/ +/g,' ').replace(/ +([,.;:!?])/g,'$1').replace(/\b1 (coins|stars|meeting rooms|lounges)\b/g,(_,word)=>'1 '+word.slice(0,-1));
}
export function localizeProps(type, props) {
 if (typeof type !== 'string' || !props) return props;
 const children = value => Array.isArray(value) ? value.map(children) : typeof value === 'string' ? t(value) : value;
 const result = {...props, children: children(props.children)};
 for (const key of ['title','aria-label','alt','placeholder']) if (typeof result[key] === 'string') result[key]=t(result[key]);
 return result;
}
