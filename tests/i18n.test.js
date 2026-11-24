import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base=new URL('../src/',import.meta.url);
const dictionary=fs.readFileSync(new URL('translations.txt',base),'utf8');
const source=fs.readFileSync(new URL('i18n.js',base),'utf8').replace("import dictionary from './translations.txt?raw';",`const dictionary=${JSON.stringify(dictionary)};`);
const storage=new Map();
globalThis.localStorage={getItem:key=>storage.get(key),setItem:(key,v)=>storage.set(key,v)};
globalThis.document={documentElement:{lang:'zh-CN'},title:''};
const {t,setLanguage,localizeProps,translations}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
test('all existing Chinese UI phrases have translations',()=>{
 for(const file of fs.readdirSync(base).filter(f=>/\.(jsx|js)$/.test(f)&&f!=='i18n.js')) {
  for(const phrase of fs.readFileSync(new URL(file,base),'utf8').match(/[\u3400-\u9fff]+/g)||[]) if(phrase!=='中文')assert.ok(translations[phrase],`${file}: ${phrase}`);
 }
});
test('language changes text and accessibility without altering callbacks or identifiers',()=>{
 const handler=()=>{};const props={children:['结构',120],title:'普通窗与围护',className:'structure',onClick:handler};
 setLanguage('en'); const result=localizeProps('button',props);
 assert.equal(result.children[0],'Structure');assert.equal(result.children[1],120);assert.equal(result.onClick,handler);assert.equal(result.className,'structure');
 assert.equal(document.documentElement.lang,'en');assert.equal(storage.get('blueprint-language'),'en');
 assert.equal(localizeProps(()=>{},props),props);
 setLanguage('zh');assert.equal(t('结构'),'结构');assert.equal(document.documentElement.lang,'zh-CN');
});
test('dynamic feedback preserves amounts and translates phrases',()=>{
 setLanguage('en');assert.match(t('金币不足，进修需要 5 金币。'),/5 coins/);assert.doesNotMatch(t('金币不足，进修需要 5 金币。'),/[\u3400-\u9fff]/);setLanguage('zh');
});
