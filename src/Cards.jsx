import React, {useId} from 'react';

// Procedural placeholders; all blueprints share the same drafting language.
export function CardArt({id,mini=false}) {
 const pattern=useId().replace(/:/g,'');
 const structural=['concrete','timber','steel'].includes(id),envelope=['basic','lowe','shade'].includes(id),path=id.startsWith('path');
 const ink=structural?'#b8b5e4':envelope?'#8dcdea':path?'#76dbc2':'#98d9de';
 return <div className={mini?'mini-art':'card-art'} aria-hidden="true"><svg viewBox="0 0 240 142" stroke={ink} strokeWidth="1.5" fill="none" strokeLinejoin="round">
 <defs><pattern id={pattern} width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" stroke={ink} strokeOpacity=".08" strokeWidth="1"/></pattern></defs><rect width="240" height="142" fill={`url(#${pattern})`} stroke="none"/>
 <path d="M28 100 110 135 215 82 132 47Z" fill={ink} fillOpacity=".035" strokeOpacity=".45"/>
 {structural?<g><path d="M40 94V38L124 9 201 44V96M40 38 116 72 201 44M116 72V126M124 9V65" strokeWidth={id==='concrete'?7:id==='timber'?5:2.5} strokeOpacity=".7"/><path d="M40 94 116 126 201 96M40 38 116 72 201 44 124 9Z"/>{id==='steel'?<path d="m36 36 8 4m-8 52 8 4m68-26 8 4m-8 50 8 4m77-84 8 4m-8 50 8 4M40 38 116 126M116 72 201 96"/>:<path d="M44 43v49m76-17v46m77-72v44" stroke={id==='timber'?'#d5b57c':ink} strokeOpacity=".7"/>}</g>
 :envelope?<g><path d="M45 104V38L190 12V79ZM45 38 53 42 198 16 190 12M190 79 198 83V16M45 104 53 108 198 83M53 42V108"/><path d="M60 49 182 27V72L60 94Z" fill={ink} fillOpacity={id==='lowe'?'.18':'.07'}/><path d="m102 42 0 44m42-52v44"/>{id==='lowe'&&<path d="M65 53 177 33V68L65 88ZM60 49l5 4m117-26-5 6"/>}{id==='shade'&&[0,1,2,3].map(n=><path key={n} d={`M54 ${48+n*12} 189 ${24+n*12} 203 ${30+n*12} 68 ${54+n*12}Z`} fill="#173746"/>)}</g>
 :path?<g><path d={id==='path_half'?'m94 121 74-37-18-8-74 37Z':id==='path_wide'?'m37 98 82 35 94-48-82-35Z':'m62 108 48 20 93-48-48-20Z'} fill={ink} fillOpacity=".13"/><path d="m100 112 77-39m-10 0 10 0-5 8" strokeDasharray="6 4" strokeWidth="2"/></g>
 :id==='garden'?<g><path d="M58 98 113 122 184 85 130 62Z" fill="#2b695a" fillOpacity=".35"/>{[[85,78],[135,56],[153,86]].map(([x,y])=><g key={x}><path d={`M${x} ${y+21}v-28`}/><ellipse cx={x} cy={y} rx="20" ry="14" fill="#123d36"/><path d={`m${x-12} ${y-1} 12 6 12-6m-12 6v-16`}/></g>)}</g>
 :id==='lounge'?<g><path d="m45 87 43 19 32-16-43-19Z M45 87v-15l43 19v15m0-15 32-16v15M45 72l32-16 43 19" fill={ink} fillOpacity=".08"/><path d="m135 69 29 13 25-13-29-13Z M135 69v-16l29 13v16m0-16 25-13v16M135 53l25-13 29 13"/><ellipse cx="131" cy="105" rx="28" ry="11"/><path d="M131 116v9"/></g>
 :<g>{(id==='meeting'?[[69,67]]:[[42,65],[120,43]]).map(([x,y])=><g key={x} transform={`translate(${x} ${y})`}><path d={id==='meeting'?'M0 20 61 46 111 21 50-5Z':'M0 20 42 38 78 19 36 2Z'} fill={ink} fillOpacity=".12"/><path d={id==='meeting'?'M0 20v16m61 10v16m50-41v16':'M0 20v17m42 1v17m36-36v17'}/>{id==='office'?<path d="M24 16V0l23 10v16ZM23 27l14 6 14-7"/>:<path d="M22 4V-8l14 6v13m41 10V8l14 6v13M23 42v-11l14 6v11m35-2v-11l14 6v11"/>}</g>)}</g>}
 </svg></div>;
}
export function BlueprintCard({card,level=1,equipped=false,children}) {
 const spatial=['function','circulation'].includes(card.category);
 return <article className={`blueprint-card ${card.category} ${equipped?'equipped':''}`} data-card={card.id}><div className="card-top"><span>{card.label}蓝图</span><span className="stars" aria-label={`${level} 星`}>{'★'.repeat(level)}{'☆'.repeat(3-level)}</span></div><CardArt id={card.id}/><h3>{card.name}</h3><div className="card-meta"><span>{spatial?`${(card.w||2)/2} × ${(card.h||2)/2} 格`:'整栋应用'}</span><span>基础 {card.base}</span></div><p className="card-description">{card.description}</p><div className="card-actions">{children}</div></article>;
}
