/* Общие скрипты сайта */
(function(){
  'use strict';

  // Фоновый эффект "матрица" — общий для всех страниц
  function initMatrix(){
    if(!document.getElementById('matrix')) return;
    var canvas=document.getElementById('matrix');
    if(!canvas || !canvas.getContext) return;
    var ctx=canvas.getContext('2d');
    var chars='アイウエオカキクケコサシスセソ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*+=<>;:/?{}[]';
    var cols,drops;
    function size(){
      canvas.width=window.innerWidth;
      canvas.height=window.innerHeight;
      cols=Math.floor(canvas.width/16);
      drops=[]; for(var i=0;i<cols;i++) drops[i]=Math.floor(Math.random()*-canvas.height/16);
    }
    size();
    window.addEventListener('resize',size);
    setInterval(function(){
      ctx.fillStyle='rgba(10,15,26,0.12)';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.font='14px "JetBrains Mono",monospace';
      for(var i=0;i<drops.length;i++){
        var ch=chars[Math.floor(Math.random()*chars.length)];
        ctx.fillStyle='rgba(0,255,156,'+(Math.random()*0.4+0.4)+')';
        ctx.fillText(ch,i*16,drops[i]*16);
        if(drops[i]*16>canvas.height && Math.random()>0.975) drops[i]=0;
        drops[i]++;
      }
    },70);
  }

  // Подсветка текущего пункта меню
  function highlightNav(){
    var path=location.pathname.split('/').pop()||'index.html';
    document.querySelectorAll('nav .links a').forEach(function(a){
      var href=(a.getAttribute('href')||'').split('/').pop();
      if(href===path) a.style.color='var(--green)';
    });
  }

  // Поиск с живыми подсказками (на главной)
  function initSearch(){
    var input=document.getElementById('searchInput');
    var results=document.getElementById('searchResults');
    if(!input||!results) return;

    var articles=window.__ARTICLES__||[];
    var hints=[
      {label:'hack-terminal', desc:'Открыть интерактивный хакер-терминал', link:'hack-terminal.html', special:true},
      {label:'статьи', desc:'Все материалы по кибербезопасности', link:'index.html#articles'}
    ];

    function render(){
      var q=input.value.trim().toLowerCase();
      if(!q){ results.style.display='none'; return; }
      var list=[];
      // спец-команда
      if(q.indexOf('hack')!==-1 || q.indexOf('термин')!==-1){
        list.push(hints[0]);
      }
      if(q==='статьи'||q==='article'||q==='статья') list.push(hints[1]);
      // статьи
      articles.forEach(function(a){
        if(a.title.toLowerCase().indexOf(q)!==-1 || a.cat.toLowerCase().indexOf(q)!==-1 || a.keywords.join(' ').toLowerCase().indexOf(q)!==-1){
          list.push({label:a.title, desc:'Статья · '+a.cat, link:a.file+'.html'});
        }
      });
      var byLabel={};
      list=list.filter(function(r){ return byLabel[r.label]?false:(byLabel[r.label]=true); });
      if(!list.length){
        results.innerHTML='<div class="sr-item muted">ничего не найдено по «'+input.value.trim()+'»</div>';
      } else {
        results.innerHTML=list.map(function(r){
          return '<a class="sr-item" href="'+r.link+'"><span>'+r.label+'</span><small>'+r.desc+'</small></a>';
        }).join('');
      }
      results.style.display='block';
    }
    input.addEventListener('input',render);
    input.addEventListener('keydown',function(e){
      if(e.key==='Enter'){
        e.preventDefault();
        var first=results.querySelector('.sr-item');
        if(first&&first.href) location.href=first.getAttribute('href');
      }
    });
    document.addEventListener('click',function(e){
      if(!e.target.closest('#searchBox')) results.style.display='none';
    });
  }

  initMatrix();
  highlightNav();
  initSearch();
})();