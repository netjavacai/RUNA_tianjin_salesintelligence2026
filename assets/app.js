
(function(){
  const btn=document.querySelector('.to-top');
  if(btn){
    window.addEventListener('scroll',()=>btn.classList.toggle('show',window.scrollY>500));
    btn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  }
})();
