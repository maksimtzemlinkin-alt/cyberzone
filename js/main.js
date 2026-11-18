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

  // ---- система входа / регистрации ----
  var ADMIN_USER = 'admin';
  var ADMIN_PASS = 'CyberZone2026!';
  var LS_USERS = 'cz_users';
  var LS_SESSION = 'cz_session';
  var LS_LOG = 'cz_visits';

  function getJSON(key, fallback){ try { var v=localStorage.getItem(key); return v?JSON.parse(v):fallback; }catch(e){ return fallback; } }
  function setJSON(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){} }

  function loadUsers(){
    var u=getJSON(LS_USERS,{});
    // гарантируем запись админа
    var seeded=false;
    if(!u[ADMIN_USER]){ u[ADMIN_USER]={pass:ADMIN_PASS, role:'admin', created:Date.now()}; seeded=true; }
    if(seeded) setJSON(LS_USERS,u);
    return u;
  }

  function logVisit(nick){
    var log=getJSON(LS_LOG,[]);
    log.unshift({nick:nick, time:Date.now(), page:location.href});
    if(log.length>500) log.length=500;
    setJSON(LS_LOG,log);
  }

  function isAdmin(nick){ return nick===ADMIN_USER; }

  function getSession(){
    var s=getJSON(LS_SESSION,null);
    if(s && s.nick){ return s; }
    return null;
  }

  function setSession(nick){
    setJSON(LS_SESSION,{nick:nick, time:Date.now()});
    logVisit(nick);
    document.documentElement.classList.add('has-admin');
  }

  // рендер модального окна входа
  function showAuth(){
    var ov=document.getElementById('authOverlay');
    if(ov){
      ov.classList.add('show');
      ov.innerHTML =
        '<div class="auth-modal">'+
          '<div class="lob">Cyber<b>Zone</b></div>'+
          '<div class="sub">Вход для чтения материалов</div>'+
          '<div class="auth-tabs">'+
            '<button id="tabLogin" class="on" onclick="CZ.switchTab(\'login\')">Вход</button>'+
            '<button id="tabReg" onclick="CZ.switchTab(\'reg\')">Регистрация</button>'+
          '</div>'+
          '<div id="authForm">'+
            '<div class="errline" id="authErr"></div>'+
            '<label>Ник</label><input id="authNick" class="field" autocomplete="off" placeholder="твой ник">'+
            '<label>Пароль</label><input id="authPass" class="field" type="password" autocomplete="off" placeholder="••••••">'+
            '<div id="regWrap" style="display:none">'+
              '<label>Повтори пароль</label><input id="authPass2" class="field" type="password" placeholder="••••••">'+
            '</div>'+
            '<button class="btn block" id="authBtn" onclick="CZ.submitAuth()">Войти</button>'+
          '</div>'+
        '</div>';
      document.getElementById('authNick').focus();
    } else {
      // если оверлея нет — просто считаем входом (не прерываем)
      var existing=loadUsers();
      setSession(ADMIN_USER);
    }
  }

  function initAuth(){
    // скрытая админ-ссылка появляется для залогиненного админа
    var sess=getSession();
    if(sess && isAdmin(sess.nick)){
      document.documentElement.classList.add('has-admin');
    }
    // на каждой странице при заходе просим войти, если нет сессии в этом браузере
    if(!getSession()){
      // ждём DOM, показываем окно
      if(document.readyState==='loading'){
        document.addEventListener('DOMContentLoaded',function(){ showAuth(); });
      } else {
        showAuth();
      }
    }
  }

  window.CZ = {
    switchTab: function(mode){
      var isLogin = mode==='login';
      document.getElementById('tabLogin').className = isLogin?'on':'';
      document.getElementById('tabReg').className = isLogin?'':'on';
      document.getElementById('regWrap').style.display = isLogin?'none':'block';
      document.getElementById('authBtn').textContent = isLogin?'Войти':'Зарегистрироваться';
      document.getElementById('authErr').textContent='';
    },
    submitAuth: function(){
      var nick=document.getElementById('authNick').value.trim();
      var pass=document.getElementById('authPass').value;
      var pass2=document.getElementById('authPass2')?document.getElementById('authPass2').value:'';
      var err=document.getElementById('authErr');
      var isReg = document.getElementById('regWrap').style.display!=='none';
      if(!nick || !pass){ err.textContent='Заполни ник и пароль.'; return; }
      var users=loadUsers();
      if(isReg){
        if(nick.toLowerCase()==='admin'){ err.textContent='Этот ник недоступен.'; return; }
        if(users[nick]){ err.textContent='Ник уже занят. Войди.'; return; }
        if(pass.length<4){ err.textContent='Пароль короткий (минимум 4 символа).'; return; }
        if(pass!==pass2){ err.textContent='Пароли не совпадают.'; return; }
        users[nick]={pass:pass, role:'user', created:Date.now()};
        setJSON(LS_USERS,users);
      } else {
        var u=users[nick];
        if(!u || u.pass!==pass){ err.textContent='Неверный ник или пароль.'; return; }
      }
      setSession(nick);
      document.getElementById('authOverlay').classList.remove('show');
    }
  };

  initMatrix();
  highlightNav();
  initSearch();
  initAuth();
})();