/* Geographic base map; all story overlays are explicitly demonstrations. */
let liveMap=null, mapObserver=null, lastViewport=null, lastMode=null, gpsCentered=false;
const demoRoute=[[26.9148,75.8184],[26.9168,75.8198],[26.9194,75.8201],[26.9220,75.8204],[26.9238,75.8229],[26.9261,75.8243]];
function realMapMarkup(){return '<div class="map-wrap"><div id="realMap" class="real-map" role="region" aria-label="확대하고 이동할 수 있는 실제 지도"></div><div class="map-loading" id="mapLoading">실제 지도를 불러오고 있어요…</div><button class="map-recenter" id="mapRecenter" aria-label="내 위치 또는 인도 중심으로 이동">⌖</button><span class="map-mode-label">실제 지도 · 스토리 경고는 시연</span></div>'}
indiaMap=realMapMarkup;localMap=realMapMarkup;
const originalRenderApp=renderApp;
renderApp=function(){if(liveMap){lastViewport={center:liveMap.getCenter(),zoom:liveMap.getZoom()};liveMap.remove();liveMap=null}mapObserver?.disconnect();originalRenderApp();if(state.tab==='map')initRealMap();};
function gameMarker(id,coords,emoji,color,label){const icon=L.divIcon({className:'game-marker-container',html:`<div class="game-marker ${color}"><span>${emoji}</span></div>`,iconSize:[42,50],iconAnchor:[21,49]});const marker=L.marker(coords,{icon,title:label,alt:label,keyboard:true}).addTo(liveMap);marker.on('click',()=>showPin(id));if(label)marker.bindTooltip(label,{direction:'top',offset:[0,-43],className:'game-tooltip'});return marker}
function initRealMap(){const host=$('#realMap');if(!host)return;if(!window.L){$('#mapLoading').textContent='지도를 불러오지 못했어요. 새로고침 후 다시 시도해주세요.';return}const mode=state.scope+(state.location&&!state.walking?'-gps':'-demo');liveMap=L.map(host,{zoomControl:false,scrollWheelZoom:true,minZoom:2,maxZoom:19,attributionControl:true});L.control.zoom({position:'bottomright'}).addTo(liveMap);liveMap.attributionControl.setPrefix(false);const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',keepBuffer:1}).addTo(liveMap);let loaded=false;tiles.on('tileload',()=>{loaded=true;const el=$('#mapLoading');if(el)el.hidden=true});tiles.on('tileerror',()=>{if(!loaded){const el=$('#mapLoading');if(el){el.hidden=false;el.textContent='지도 연결이 불안정해요. 네트워크를 확인해주세요.'}}});
 if(state.scope==='india'){
  liveMap.fitBounds([[6.7,67.5],[36.4,97.8]],{padding:[12,20]});
  // Approximate warning halos identify locations, not legal or administrative boundaries.
  L.circle([34.05,74.8],{radius:160000,color:'#ff3445',weight:2,fillColor:'#ff4855',fillOpacity:.24,className:'warning-region'}).addTo(liveMap).on('click',()=>showPin('kashmir'));
  L.polyline([[32.5,74.6],[30.8,73.8],[28.2,72.5],[26.6,70.2],[24.0,68.5]],{color:'#ff354a',weight:12,opacity:.35,dashArray:'5 9'}).addTo(liveMap).on('click',()=>showPin('kashmir'));
  L.circle([24.66,93.91],{radius:100000,color:'#ff8b11',weight:2,fillColor:'#ffaa19',fillOpacity:.28,className:'caution-region'}).addTo(liveMap).on('click',()=>showPin('manipur'));
  gameMarker('kashmir',[34.05,74.8],'!','red','잠무·카슈미르 · 최신 경보 확인');gameMarker('manipur',[24.66,93.91],'!','orange','마니푸르 · 현지 상황 확인');
  gameMarker('crowd',[28.61,77.2],'👥','pink','혼잡한 장소 · 소지품 주의');gameMarker('rain',[19.08,72.88],'🌧','blue','우기 · 폭우와 침수');gameMarker('water',[16.7,78.1],'🍴','teal','식수·음식 위생 확인');gameMarker('night',[12.97,77.59],'☾','navy','야간 이동 주의');
 }else{
  const actual=state.location&&!state.walking,coords=actual?[state.location.latitude,state.location.longitude]:demoRoute[Math.min(state.step,5)];
  liveMap.setView(coords,actual?15:14);
  if(!actual){
   liveMap.fitBounds(demoRoute,{padding:[32,42]});
   L.polyline(demoRoute,{color:'#fff',weight:9,opacity:.95}).addTo(liveMap);L.polyline(demoRoute,{color:state.route==='safe'?'#30b768':'#ff8628',weight:5,dashArray:'8 10'}).addTo(liveMap);
   L.circle(storyPoint(26.9205,75.8232),{radius:180,color:'#ff9525',fillColor:'#ffc229',weight:2,fillOpacity:.25}).addTo(liveMap);
   if(state.filter==='전체'||state.filter==='혼잡')gameMarker('crowd',storyPoint(26.9205,75.8232),'!','orange','혼잡 ★★ · 시연');
   if(state.filter==='전체'||state.filter==='식수')gameMarker('water',storyPoint(26.9175,75.8178),'💧','teal','식수 확인 · 행동 수칙');
   if(state.filter==='전체'||state.filter==='교통')gameMarker('traffic',storyPoint(26.918,75.8215),'🚧','pink','공사 구간 · 시연');
   if(state.filter==='전체'||state.filter==='야간')gameMarker('night',storyPoint(26.9215,75.8258),'☾','navy','야간 골목 · 시연');
   gameMarker('hotel',demoRoute[5],'🏡','green','퀘스트 목적지 · 시연');
  }else{L.circle(coords,{radius:Math.min(state.location.accuracy,5000),color:'#319be8',fillOpacity:.1,weight:1}).addTo(liveMap);$('.map-mode-label').textContent='GPS 실시간 위치 · 주변 위험 정보 미연결';}
  gameMarker('me',coords,'🐯','player',actual?'나의 실제 위치':'여행 캐릭터 · 시연');
 }
 if(lastViewport&&lastMode===mode&&!state.walking)liveMap.setView(lastViewport.center,lastViewport.zoom);lastMode=mode;
 $('#mapRecenter').onclick=()=>{lastViewport=null;if(state.scope==='india')liveMap.fitBounds([[6.7,67.5],[36.4,97.8]],{padding:[12,20]});else if(state.location&&!state.walking)liveMap.setView([state.location.latitude,state.location.longitude],16);else liveMap.fitBounds(demoRoute,{padding:[32,42]})};
 mapObserver=new ResizeObserver(()=>liveMap?.invalidateSize({pan:false}));mapObserver.observe(host);requestAnimationFrame(()=>liveMap?.invalidateSize({pan:false}));
}
const originalOpenPhone=openPhone,originalClosePhone=closePhone;
openPhone=function(){originalOpenPhone();document.body.classList.add('phone-open')};closePhone=function(){originalClosePhone();document.body.classList.remove('phone-open')};
$('#takePhone').onclick=openPhone;$('#lowerPhone').onclick=closePhone;$('.phone-backdrop').onclick=closePhone;$('.app-header>b').onclick=()=>{if(innerWidth<761)closePhone()};
// Pixel hotspot of attached 1029 × 1529 image: index fingertip at (181, 27).
const hand=$('#touchCursor');function moveHand(e){const width=Math.min(185,innerWidth*.23);hand.style.setProperty('--hand-width',width+'px');hand.style.setProperty('--hot-x',(181/1029*width)+'px');hand.style.setProperty('--hot-y',(27/1029*width)+'px');hand.style.left=e.clientX+'px';hand.style.top=e.clientY+'px'}
document.addEventListener('pointermove',moveHand);document.addEventListener('pointerdown',()=>{hand.style.scale='1';hand.classList.add('pressing')});document.addEventListener('pointerup',()=>{hand.style.scale='1';hand.classList.remove('pressing')});document.addEventListener('pointerleave',()=>hand.style.opacity='0');document.addEventListener('pointerenter',()=>hand.style.opacity='1');
infos.me=['나의 여행 캐릭터','현재 위치를 연결하면 GPS 좌표에 캐릭터가 표시됩니다. 걷기 시뮬레이션을 시작하면 자이푸르의 예시 경로를 따라 움직입니다.'];
if(state.phone)renderApp();
