/* A native dialog occupies the browser's top layer. Keep the supplied hand
   cursor in that layer too, including when a new popup opens. */
(() => {
  const cursor=document.querySelector('#touchCursor');
  const popup=document.querySelector('#modal');
  if(!cursor||!popup)return;
  if(typeof cursor.showPopover!=='function'){
    document.body.classList.add('native-pointer');
    return;
  }
  cursor.setAttribute('popover','manual');
  function synchronize(){
    const show=document.body.classList.contains('phone-open')&&matchMedia('(pointer:fine)').matches;
    if(cursor.matches(':popover-open'))cursor.hidePopover();
    cursor.classList.toggle('compact-pointer',popup.open);
    if(show)cursor.showPopover();
  }
  // Opening the cursor after the modal puts it above the popup in top-layer order.
  new MutationObserver(synchronize).observe(popup,{attributes:true,attributeFilter:['open']});
  new MutationObserver(synchronize).observe(document.body,{attributes:true,attributeFilter:['class']});
  matchMedia('(pointer:fine)').addEventListener('change',synchronize);
  document.addEventListener('pointercancel',()=>cursor.classList.remove('pressing'));
  document.addEventListener('pointermove',event=>{
    // Keep the finger's hotspot under the real pointer at either cursor size.
    const width=Math.min(130,innerWidth*.18);
    cursor.style.setProperty('--hand-width',width+'px');
    cursor.style.setProperty('--hot-x',(181/1029*width)+'px');
    cursor.style.setProperty('--hot-y',(27/1029*width)+'px');
    cursor.style.left=event.clientX+'px';cursor.style.top=event.clientY+'px';
  });
  synchronize();
})();
