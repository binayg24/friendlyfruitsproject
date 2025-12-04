// Home Page mobile menu toggle
document.addEventListener('DOMContentLoaded', function(){
  const mobileBtn = document.getElementById('mobile-menu');
  const menu = document.querySelector('.navbar__menu');
 
  if(!mobileBtn || !menu) return;
 
  mobileBtn.addEventListener('click', function(){
    mobileBtn.classList.toggle('is-active');
    menu.classList.toggle('active'); 
  });
 
  // Close mobile menu when clicking a link
  menu.querySelectorAll('a').forEach(link=>{
    link.addEventListener('click', ()=>{
      if(window.innerWidth <= 960){
        mobileBtn.classList.remove('is-active');
        menu.classList.remove('active'); 
      }
    });
  });
 
});