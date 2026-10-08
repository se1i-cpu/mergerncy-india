/* Destination selection extends the supplied SAATH story; the original missions remain in app.js. */
(() => {
  const cities = [
    {id:'jaipur',name:'자이푸르',en:'JAIPUR',region:'라자스탄',theme:'건축과 로컬 시장',tag:'PINK CITY',photo:'assets/jaipur.jpg',coords:[26.9239,75.8267],description:'분홍빛 건물 사이를 걷고, 골목의 시장을 만나는 여행.',places:['하와 마할','시티 팰리스','로컬 시장'],hotel:'자이푸르 게스트하우스'},
    {id:'delhi',name:'델리',en:'DELHI',region:'델리',theme:'역사와 도시 산책',tag:'CITY & CULTURE',photo:'assets/destinations/delhi.jpg',coords:[28.6139,77.2090],description:'오래된 거리와 새로운 도시가 함께 있는 인도의 첫 관문.',places:['후마윤 묘','올드 델리','도시 산책'],hotel:'델리 게스트하우스'},
    {id:'agra',name:'아그라',en:'AGRA',region:'우타르프라데시',theme:'건축과 세계유산',tag:'HERITAGE JOURNEY',photo:'assets/destinations/agra.jpg',coords:[27.1751,78.0421],description:'타지마할을 마주하고, 오래된 건축의 이야기를 따라가는 여행.',places:['타지마할','아그라 요새','건축 여행'],hotel:'아그라 게스트하우스'},
    {id:'varanasi',name:'바라나시',en:'VARANASI',region:'우타르프라데시',theme:'강변과 오래된 골목',tag:'RIVERSIDE JOURNEY',photo:'assets/destinations/varanasi.jpg',coords:[25.3061,83.0106],description:'갠지스강의 풍경과 오래된 골목에서 도시의 일상을 만나요.',places:['갠지스강','강변 산책','로컬 문화'],hotel:'바라나시 게스트하우스'},
    {id:'goa',name:'고아',en:'GOA',region:'고아',theme:'해변과 여유',tag:'SLOW & COASTAL',photo:'assets/destinations/goa.jpg',coords:[15.4989,73.8278],description:'바다 가까이 머물며, 해변과 작은 마을을 천천히 둘러보세요.',places:['해변 산책','올드 고아','느린 여행'],hotel:'고아 게스트하우스'}
  ];
  const byId = Object.fromEntries(cities.map(city=>[city.id,city]));
  const key = 'saath-india-journey-v1';
  let saved = [], passed = [], selected = null, choosing = true, filter = 'all', drag = 0, leaving = false, pointer = null;
  let swipeTimer, cityIndex=0;
  try {
    const stored = JSON.parse(localStorage.getItem(key)||'null');
    if(stored) {
      saved = Array.isArray(stored.saved)?[...new Set(stored.saved.filter(id=>byId[id]))]:[];
      passed = Array.isArray(stored.passed)?[...new Set(stored.passed.filter(id=>byId[id]&&!saved.includes(id)))]:[];
      selected = byId[stored.selected]||null;
      choosing = !selected;
      if(selected && Number.isInteger(stored.chapter) && stored.chapter>=0 && stored.chapter<=4) state.chapter=stored.chapter;
      if(selected && Number.isInteger(stored.xp) && stored.xp>=0 && stored.xp<=10000) state.xp=stored.xp;
      if(Array.isArray(stored.done)) state.done=new Set(stored.done.filter(id=>typeof id==='string'));
      if(Array.isArray(stored.checks)) state.checks=new Set(stored.checks.filter(id=>Number.isInteger(id)&&id>=0&&id<5));
      if(Array.isArray(stored.booking)) state.booking=new Set(stored.booking.filter(id=>Number.isInteger(id)&&id>=0&&id<3));
    }
  } catch { /* A fresh journey remains usable when storage is unavailable. */ }
  function persist() {
    try {localStorage.setItem(key,JSON.stringify({saved,passed,selected:selected?.id,chapter:state.chapter,xp:state.xp,done:[...state.done],checks:[...state.checks],booking:[...state.booking]}));}
    catch {toast('이 브라우저에서는 여행 선택을 저장할 수 없어요.');}
  }
  const storySub=scenes.map(scene=>scene.sub);
  const baseScene=renderScene;
  renderScene=function(){
    const city=selected;
    scenes[0].sub=city?`인도, ${city.name}. 당신의 여행이 시작됩니다.`:storySub[0];
    scenes[3].sub=city?`해가 지는 ${city.name}. 이제 숙소로 돌아갈 시간.`:storySub[3];
    baseScene();
    const location=$('.location');
    if(location.childNodes[1]) location.childNodes[1].textContent=city?` ${city.name} · ${city.region} `:' 자이푸르 · 핑크 시티 ';
    $('#speakerRole').textContent=city?`${city.name}에서 만난 현지 가이드`:'자이푸르에서 만난 현지 가이드';
    if(!city) $('#takePhone').textContent='휴대폰 꺼내 여행지 고르기';
    $('#outerLevel').textContent='Lv. '+(1+Math.floor(state.xp/80));
  };
  window.storyPoint=(lat,lng)=>selected?[lat-26.9239+selected.coords[0],lng-75.8267+selected.coords[1]]:[lat,lng];
  const routeOffsets=[[-.0091,-.0083],[-.0071,-.0069],[-.0045,-.0066],[-.0019,-.0063],[-.0001,-.0038],[.0022,-.0024]];
  function applyCity(){
    if(!selected)return;
    demoRoute.splice(0,demoRoute.length,...routeOffsets.map(([lat,lng])=>[selected.coords[0]+lat,selected.coords[1]+lng]));
    lastViewport=null;lastMode=null;
    infos.hotel=['숙소 · 퀘스트 목적지',`${selected.hotel}는 시연용 숙소입니다. 실제 예약과 주소를 확인한 뒤 이동하세요.`];
    infos.me=['나의 여행 캐릭터',`걷기 시뮬레이션은 ${selected.name}의 예시 경로를 따라 움직입니다. 현재 위치 연결 시에는 실제 GPS 좌표를 표시해요.`];
  }
  const originalApp=renderApp;
  const originalMapView=mapView;
  mapView=function(){return originalMapView().replace('나의 안전 지도',`${selected?.name||'인도'} 안전 지도`);};
  const originalReviews=showReviews;
  showReviews=function(){originalReviews();const heading=$('#modalBody>small');if(selected&&heading)heading.textContent=heading.textContent.replace('자이푸르 · 예시 제보',`${selected.name} · 예시 제보`);};
  const baseRoutes=showRoutes;
  showRoutes=function(){baseRoutes();if(selected)$('#destination').value=selected.hotel;};
  const baseAward=award;
  award=function(id,xp){baseAward(id,xp);persist();};
  const baseChapter=completeChapter;
  completeChapter=function(id){baseChapter(id);persist();};

  function deck(){return cities.filter(city=>filter==='all'||(filter==='coast'?city.id==='goa':city.id!=='goa'));}
  function icon(name,size=22){const paths={heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.01"/>',pin:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5Z"/>',previous:'<path d="m15 6-6 6 6 6"/>',next:'<path d="m9 6 6 6-6 6"/>',undo:'<path d="M3 10a9 9 0 1 1 2.5 8M3 4v6h6"/>'};return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;}
  function context(){
    $('.phone-context .eyebrow').textContent=choosing?'YOUR INDIA JOURNEY':'YOUR LOCAL COMPANION';
    $('.phone-context h2').innerHTML=choosing?'이번 여행,<br>어디로 갈까요?':`${selected.name}에서,<br>나의 속도로.`;
    $('.phone-context p').textContent=choosing?'도시를 넘겨보고, 이번 여행지를 골라보세요.':'길 위의 정보가 다음 선택의 힌트가 됩니다.';
    $('.bottom-nav').hidden=choosing;
    $('#sos').hidden=choosing;
    $('#changeCity').hidden=choosing;
    if(!choosing)document.querySelector('.picker-actions')?.remove();
  }
  const cityButton=document.createElement('button');cityButton.id='changeCity';cityButton.className='change-city';cityButton.textContent='여행지 변경';cityButton.onclick=()=>{choosing=true;renderApp();};$('.app-header').insertBefore(cityButton,$('#sos'));
  const liveRegion=document.createElement('div');liveRegion.className='sr-only';liveRegion.setAttribute('aria-live','polite');liveRegion.id='destinationStatus';$('.phone-screen').append(liveRegion);

  function renderChooser(){
    clearTimeout(swipeTimer);
    context();
    document.querySelector('.picker-actions')?.remove();
    const current=deck()[cityIndex];
    const body=$('#phoneContent');
    body.innerHTML=`<section class="destination-picker" aria-label="인도 여행지 선택"><div class="journey-steps"><span class="active">01 여행지 고르기</span><span>02 안전 여행</span></div><div class="page-heading"><div><span class="eyebrow">FIND YOUR INDIA</span><h2>어디로 떠날까요?</h2></div><button class="icon-button" id="restartDeck" aria-label="첫 여행지로 돌아가기">${icon('undo',18)}</button></div><div class="category-tabs" aria-label="여행지 분류">${[['all','전체'],['city','도시 · 문화'],['coast','해변']].map(([id,label])=>`<button data-category="${id}" aria-pressed="${filter===id}">${label}</button>`).join('')}</div>${current?`<div class="discovery"><div class="card-stack"><div class="card-back"></div><div class="guide-card destination-card" id="destinationCard" tabindex="0" aria-label="${current.name} 여행지 카드, 오른쪽 방향키로 다음 도시, 왼쪽 방향키로 이전 도시"><div class="guide-photo"><img src="${current.photo}" alt="${current.name} 여행 풍경" draggable="false"><div class="photo-shade"></div><span class="photo-category">${current.tag}</span><span class="photo-location">${icon('pin',14)}${current.region}, 인도</span><button class="photo-info" id="cityInfo" aria-label="${current.name} 여행지 상세보기">${icon('info',19)}</button><span class="swipe-stamp" id="swipeStamp" hidden></span><div class="photo-caption"><span>${current.theme}</span><span class="photo-counter">${cityIndex+1} / ${deck().length}</span></div></div><div class="guide-info"><div class="guide-name-row"><div><h3>${current.name}</h3><p>${current.en}</p></div><span class="destination-compass">${icon('compass',25)}</span></div><p class="destination-description">${current.description}</p><div class="card-divider"></div><div class="destination-tags">${current.places.map(place=>`<span>${place}</span>`).join('')}</div></div></div></div><div class="swipe-actions"><button class="round-action pass-action" id="passCity" aria-label="이전 여행지">${icon('previous',25)}</button><button class="journey-button choose-current" id="chooseCurrentCity">이 도시로 여행하기</button><button class="round-action save-action" id="saveCity" aria-label="다음 여행지">${icon('next',25)}</button></div><div class="swipe-help"><span>왼쪽으로 이전 도시</span><span>오른쪽으로 다음 도시</span></div></div>`:`<div class="destination-empty">${icon('compass',38)}<h3>여행지를 모두 살펴봤어요</h3><p>${saved.length?'마음에 담은 도시에서 이번 여행지를 골라보세요.':'패스한 여행지를 다시 만나볼까요?'}</p><button class="journey-button secondary" id="reviewDeck">다시 보기</button></div>`}${selected?`<button class="journey-button secondary full" id="returnService">${selected.name} 여행으로 돌아가기</button>`:''}<a class="photo-credits" href="credits.html" target="_blank" rel="noopener">사진 출처</a></section>`;
    const actions=body.querySelector('.swipe-actions');
    if(actions){
      const dock=document.createElement('div');dock.className='picker-actions';
      dock.append(actions,body.querySelector('.swipe-help'));
      $('.phone-screen').insertBefore(dock,$('.bottom-nav'));
    }
    body.scrollTop=0;drag=0;pointer=null;leaving=false;
    $('#restartDeck').onclick=restart;
    if($('#reviewDeck'))$('#reviewDeck').onclick=restart;
    $$('[data-category]').forEach(button=>button.onclick=()=>{filter=button.dataset.category;cityIndex=0;renderChooser();});
    $$('[data-select-city]').forEach(button=>button.onclick=()=>details(byId[button.dataset.selectCity]));
    if($('#returnService'))$('#returnService').onclick=()=>{choosing=false;renderApp();};
    if(!current)return;
    $('#passCity').onclick=()=>swipe('left');$('#saveCity').onclick=()=>swipe('right');$('#passCity').disabled=cityIndex===0;$('#saveCity').disabled=cityIndex===deck().length-1;$('#chooseCurrentCity').onclick=()=>selectCity(current);$('#cityInfo').onclick=()=>details(current);
    const card=$('#destinationCard');
    card.addEventListener('pointerdown',event=>{if(event.target.closest('button')||leaving)return;pointer={x:event.clientX,y:event.clientY,id:event.pointerId};card.setPointerCapture(event.pointerId);});
    card.addEventListener('pointermove',event=>{if(!pointer||leaving)return;const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;if(Math.abs(dx)>Math.abs(dy)){drag=dx;paintDrag(card);}});
    card.addEventListener('pointerup',event=>{if(!pointer)return;const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;pointer=null;if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.2)swipe(dx>0?'right':'left');else{drag=0;paintDrag(card);}});
    card.addEventListener('pointercancel',()=>{pointer=null;drag=0;paintDrag(card);});
    card.addEventListener('keydown',event=>{if(event.target!==card)return;if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();swipe(event.key==='ArrowRight'?'right':'left');}});
  }
  function paintDrag(card){card.style.transform=`translateX(${drag}px) rotate(${drag/24}deg)`;const stamp=$('#swipeStamp');stamp.hidden=Math.abs(drag)<30;stamp.className=`swipe-stamp ${drag>0?'saved':'passed'}`;stamp.textContent=drag>0?'NEXT':'PREV';}
  function swipe(direction){
    if(leaving)return;
    const next=cityIndex+(direction==='right'?1:-1);
    if(next<0||next>=deck().length){drag=0;paintDrag($('#destinationCard'));return;}
    leaving=true;drag=direction==='right'?360:-360;const card=$('#destinationCard');card.classList.add('leaving');paintDrag(card);$('#passCity').disabled=true;$('#saveCity').disabled=true;$('#chooseCurrentCity').disabled=true;
    swipeTimer=setTimeout(()=>{cityIndex=next;$('#destinationStatus').textContent=deck()[cityIndex].name+' 여행지';renderChooser();},220);
  }
  function restart(){clearTimeout(swipeTimer);cityIndex=0;renderChooser();}
  function details(city){
    modal(`<small>이번 여행의 목적지</small><h2>${city.name}</h2><img class="destination-detail-photo" src="${city.photo}" alt="${city.name} 여행 풍경"><p>${city.description}</p><div class="destination-tags">${city.places.map(place=>`<span>${place}</span>`).join('')}</div><button class="journey-button full" id="confirmCity">${city.name}로 여행하기</button>`);
    $('#confirmCity').onclick=()=>selectCity(city);
  }
  function selectCity(city){
    clearTimeout(swipeTimer);
    if(state.walking){clearInterval(walkTimer);state.walking=false;}
    if(state.watch!==null){navigator.geolocation.clearWatch(state.watch);state.watch=null;}state.location=null;
    if(selected?.id!==city.id){state.chapter=0;state.xp=0;state.done.clear();state.booking.clear();state.step=0;}
    selected=city;choosing=false;state.tab='map';state.scope='local';state.geoAlert=false;
    if(!saved.includes(city.id))saved.push(city.id);passed=passed.filter(id=>id!==city.id);
    applyCity();persist();$('#modal').close();renderScene();renderApp();$('#phoneContent').scrollTop=0;
    toast(`${city.name} 여행을 시작해요.`);
  }
  renderApp=function(){
    if(choosing||!selected){if(liveMap){liveMap.remove();liveMap=null;}mapObserver?.disconnect();renderChooser();return;}
    context();originalApp();
    const body=$('#phoneContent');
    if(state.tab==='bookings'){
      const rows=$$('.list-item>span');const bookingLabels=['인도 도착 · 항공편 확인',`${selected.hotel} · 2박`,`${selected.name} 도착 · 이동편 확인`];
      rows.forEach((row,index)=>{if(index<3)row.firstChild.textContent=bookingLabels[index];});
    }
    const strip=document.createElement('div');strip.className='destination-strip';strip.innerHTML=`<span>${icon('pin',15)}<strong>${selected.name}</strong><small>${selected.region}</small></span><button id="switchDestination">여행지 변경</button>`;body.prepend(strip);
    $('#switchDestination').onclick=()=>{choosing=true;renderApp();};persist();
  };
  $('#skip').textContent='인트로 건너뛰고 여행지 고르기';
  // Keep the phone and game controls supplied by the teammate.
  applyCity();renderScene();
})();
