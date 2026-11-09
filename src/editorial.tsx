import React from 'react';
import {forceOverview} from './narrative-data';
import './editorial.css';
export function ForceOverview(){
 return <section className="force-overview" aria-labelledby="forces-title">
  <header><h3 className="type-detail" id="forces-title">一条主线，几路红军</h3><p>本展以中央红军1934—1935年的行军为主线。其他红军队伍出发时间、途经地区不同，1936年的主力会师是接续展开的共同历程。</p></header>
  <ol>{forceOverview.map(force=><li key={force.name}><time>{force.time}</time><h4 className="type-detail">{force.name}</h4><p>{force.text}</p></li>)}</ol>
 </section>;
}
