(function () {
  'use strict';
  var body = document.body;
  var stored = null;
  try { stored = localStorage.getItem('ai_dev_book_theme'); } catch (e) {}
  if (stored === 'light' || stored === 'dark') body.dataset.theme = stored;
  else body.dataset.theme = 'dark';
  var theme = document.getElementById('themeToggle');
  if (theme) theme.addEventListener('click', function(){
    body.dataset.theme = body.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('ai_dev_book_theme', body.dataset.theme); } catch(e) {}
  });
  var sidebar=document.getElementById('sideBar');
  var menu=document.getElementById('menuToggle');
  if(menu && sidebar){
    menu.addEventListener('click',function(){sidebar.classList.toggle('open');});
    sidebar.addEventListener('click',function(e){if(e.target.closest('a')) sidebar.classList.remove('open');});
    document.addEventListener('click',function(e){if(!sidebar.contains(e.target)&&!menu.contains(e.target))sidebar.classList.remove('open');});
  }
  var progress=document.getElementById('readingProgress');
  var scrollTick=false;
  function updateProgress(){
    var max=document.documentElement.scrollHeight-window.innerHeight;
    if(progress)progress.style.width=(max>0?Math.min(100,Math.max(0,window.scrollY/max*100)):100)+'%';
    scrollTick=false;
  }
  window.addEventListener('scroll',function(){if(!scrollTick){scrollTick=true;requestAnimationFrame(updateProgress);}}, {passive:true});
  updateProgress();

  var toast=document.getElementById('toast'),toastTimer=null;
  function showToast(message){
    if(!toast)return;
    toast.textContent=message;toast.classList.add('visible');
    clearTimeout(toastTimer);toastTimer=setTimeout(function(){toast.classList.remove('visible');},1800);
  }
  document.querySelectorAll('.prose pre').forEach(function(pre){
    var button=document.createElement('button');button.className='code-copy';button.type='button';button.textContent='Копировать';button.setAttribute('aria-label','Копировать код');
    button.addEventListener('click',function(){
      var txt=pre.querySelector('code')?pre.querySelector('code').innerText:pre.innerText;
      if(navigator.clipboard && navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(function(){showToast('Скопировано');},function(){showToast('Не удалось скопировать');});}
      else showToast('Выделите и скопируйте код');
    });
    pre.appendChild(button);
  });

  var tocLinks=[].slice.call(document.querySelectorAll('.side-toc a[href^="#"]'));
  if(tocLinks.length && 'IntersectionObserver' in window){
    var headings=tocLinks.map(function(a){return document.getElementById(a.getAttribute('href').slice(1));}).filter(Boolean);
    var visible={};
    var obs=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){visible[entry.target.id]=entry.isIntersecting;});
      var present=headings.filter(function(h){return visible[h.id];});
      if(present.length){tocLinks.forEach(function(a){a.classList.toggle('active',a.getAttribute('href')==='#'+present[0].id);});}
    },{rootMargin:'-88px 0px -65% 0px',threshold:0});
    headings.forEach(function(h){obs.observe(h);});
  }

  var complete=document.querySelector('.chapter-complete');
  function completeKey(file){return 'ai_dev_2026_complete_'+file;}
  function checkDone(file){try{return localStorage.getItem(completeKey(file))==='true';}catch(e){return false;}}
  if(complete){
    var f=complete.dataset.complete;
    complete.checked=checkDone(f);
    complete.addEventListener('change',function(){
      try{localStorage.setItem(completeKey(f), String(complete.checked));}catch(e){}
      showToast(complete.checked?'Глава отмечена как изученная':'Отметка снята');
    });
  }
  document.querySelectorAll('.book-card').forEach(function(card){
    var file=(card.getAttribute('href')||'').split('#')[0];
    if(checkDone(file))card.classList.add('completed');
  });

  var chapterSearch=document.getElementById('chapterSearch');
  if(chapterSearch){
    var cards=[].slice.call(document.querySelectorAll('.book-card'));
    chapterSearch.addEventListener('input',function(){
      var q=chapterSearch.value.trim().toLocaleLowerCase('ru');var n=0;
      cards.forEach(function(card){var show=card.dataset.search.includes(q);card.hidden=!show;if(show)n++;});
      var empty=document.getElementById('searchEmpty');if(empty)empty.hidden=n!==0;
    });
  }
  var glos=document.getElementById('glossarySearch');
  if(glos){
    var terms=[].slice.call(document.querySelectorAll('.term-card'));
    glos.addEventListener('input',function(){
      var q=glos.value.trim().toLocaleLowerCase('ru');
      terms.forEach(function(term){term.hidden=!term.dataset.term.includes(q);});
    });
  }
  document.addEventListener('keydown',function(e){
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){
      var input=chapterSearch||glos;
      if(!input)return;
      e.preventDefault();input.focus();input.select();
    }
    if(e.key==='Escape'&&sidebar)sidebar.classList.remove('open');
  });
})();

/* Diagram animation controller: keep SVG static without scripts, animate in viewport. */
(function(){var reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;var b=document.body;var off=false;try{off=localStorage.getItem('ai_dev_motion')==='off';}catch(e){}if(reduced||off)b.classList.add('motion-off');var btn=document.getElementById('motionToggle');function sync(){if(btn){btn.textContent=b.classList.contains('motion-off')?'▷':'◉';btn.title=b.classList.contains('motion-off')?'Включить анимацию схем':'Остановить анимацию схем';btn.setAttribute('aria-pressed',String(!b.classList.contains('motion-off')))}}sync();if(btn)btn.addEventListener('click',function(){b.classList.toggle('motion-off');sync();try{localStorage.setItem('ai_dev_motion',b.classList.contains('motion-off')?'off':'on')}catch(e){}});var all=document.querySelectorAll('.concept-viz');if('IntersectionObserver' in window){var o=new IntersectionObserver(function(rows){rows.forEach(function(r){r.target.classList.toggle('in-view',r.isIntersecting)})},{rootMargin:'30px 0px 30px 0px',threshold:.06});all.forEach(function(x){o.observe(x)})}else{all.forEach(function(x){x.classList.add('in-view')})}})();
