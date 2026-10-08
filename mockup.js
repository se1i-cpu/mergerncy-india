/* Scale the entire photographed device and UI together from one coordinate system. */
(() => {
  const rig=document.querySelector('.phone-rig');
  function resize(){
    const height=window.visualViewport?.height||innerHeight;
    const scale=Math.min(1.15,(height-96)/696);
    rig.style.setProperty('--phone-scale',String(Math.max(.55,scale)));
  }
  addEventListener('resize',resize);
  window.visualViewport?.addEventListener('resize',resize);
  resize();
})();
