(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = (id, cls='') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const config = Object.assign({recipientName:'',authorName:'',finalMessage:'Mi piace questo universo. Soprattutto quando ci sei tu.',finalSignature:'Il prossimo giro lo facciamo insieme.',storageKey:'nasty-little-universe-v1'}, window.NLU_CONFIG || {});
  const questions = window.NLU_QUESTIONS || [];
  const chapters = [
    {id:0,short:'Il giardino Nasty',title:'Il giardino Nasty',location:'01 · GIARDINO',subtitle:'Ponti che sbocciano',track:'bam-bam',color:'#edb0d1',intro:'Sir Rattingham ti accompagna a ritrovare quattro gigli. Il primo cresce in un giardino piuttosto vivace.',note:'Cammina sui boccioli: faranno crescere ponti di foglie.',mission:'Fai sbocciare i ponti di foglie.',win:'Sir Rattingham lo mette da parte per te.',lily:'Giglio notturno',sceneTitle:'Il primo è al sicuro.'},
    {id:1,short:'Kyoto, lato B',title:'Kyoto, lato B',location:'02 · KYOTO',subtitle:'Vinili a molla e tetti rosa',track:'glass-jaw',color:'#b89af4',intro:'Dietro il Nasty Records, le lanterne restano accese. Il secondo giglio ti aspetta sopra i tetti.',note:'I vinili sul percorso ti fanno rimbalzare più in alto.',mission:'Sali sui vinili per raggiungere i tetti.',win:'Un ultimo giro sul piatto. Poi si riparte.',lily:'Giglio al neon',sceneTitle:'Questo lato B finisce bene.'},
    {id:2,short:'Sabbia & limone',title:'Sabbia & limone',location:'03 · EGITTO',subtitle:'Un passaggio tra le rovine',track:'escape-matrix',color:'#edc19e',intro:'Il terzo giglio è oltre le rovine. Culo Triglicerido tiene in fresco il tè per il ritorno.',note:'Sali sui blocchi mobili e fatti accompagnare dall’altra parte.',mission:'Attraversa sui blocchi in movimento.',win:'Anche le mummie ogni tanto si fermano per un tè.',lily:'Giglio del deserto',sceneTitle:'Una piccola pausa al limone.'},
    {id:3,short:'Orbita viola',title:'Orbita viola',location:'04 · SPAZIO',subtitle:'Un salto fra le stelle',track:'no-peace',color:'#c8b4fa',intro:'L’ultimo giglio è andato un po’ lontano. Seguendo le stelle, però, ci si arriva.',note:'Gravità leggera. Il doppio salto dà una spinta lungo le scie stellari.',mission:'Doppio salto: una spinta fra le stelle.',win:'Quattro gigli. Si torna da te.',lily:'Giglio orbitale',sceneTitle:'Adesso ci sono tutti.'}
  ];
  const photos = [
    {id:'pink-rat',file:'pink-rat.jpg',title:'Il responsabile',caption:'Ratto Rosa. Il responsabile di questo viaggio.',unlock:'Già nella squadra'},
    {id:'cucumber-duo',file:'cucumber-duo.jpg',title:'Botanica sentimentale',caption:'Piante contro zombie? Qui le piante avevano altri programmi.',unlock:'Primo varco del giardino'},
    {id:'sonic-break',file:'sonic-break.jpg',title:'Pausa tecnica',caption:'Get Up, ma dopo cinque minuti. Anche i più veloci hanno un limite.',unlock:'Secondo varco del giardino'},
    {id:'double-portrait',file:'double-portrait.jpg',title:'Dress code: sì',caption:'Due interpretazioni molto precise dello stesso stato d’animo.',unlock:'Primo varco di Kyoto'},
    {id:'gold-icon',file:'gold-icon.jpg',title:'Patrono dei checkpoint',caption:'La faccia di chi ha già trovato il prossimo checkpoint.',unlock:'Primo varco del deserto'},
    {id:'strange-visitor',file:'strange-visitor.jpg',title:'Ospite non in lista',caption:'Johnatan Galindo, nella lista degli ospiti. Per qualche motivo.',unlock:'Secondo varco del deserto'},
    {id:'purple-globe',file:'purple-globe.jpg',title:'Il nostro Globo',caption:'Ci sono tanti modi di chiamarlo. Il nostro lo sai già.',unlock:'Secondo varco nello spazio'}
  ];
  const defaultState = () => ({version:2,completed:[false,false,false,false],chapter:0,checkpoints:{},answers:{},gallery:['pink-rat'],secrets:[],bestPetals:[0,0,0,0],endingDone:false,options:{gentle:false,reducedMotion:window.matchMedia('(prefers-reduced-motion: reduce)').matches,muted:false,volume:.5}});
  let storageWorks=true, state=defaultState();
  try {
    const raw=JSON.parse(localStorage.getItem(config.storageKey)||'null');
    if(raw&&(raw.version===1||raw.version===2)){
      state={...state,...raw,options:{...state.options,...raw.options}};
      state.completed=Array.from({length:4},(_,i)=>!!raw.completed?.[i]);
      state.gallery=Array.from(new Set(['pink-rat',...(Array.isArray(raw.gallery)?raw.gallery:[])])).filter(id=>photos.some(p=>p.id===id));
      state.secrets=(Array.isArray(raw.secrets)?raw.secrets:[]).filter(id=>/^level-[0-3]$/.test(id));
      state.answers=raw.version===2&&raw.answers&&typeof raw.answers==='object'?raw.answers:{};
      state.checkpoints=raw.version===2&&raw.checkpoints&&typeof raw.checkpoints==='object'?raw.checkpoints:{};
      state.version=2;
      state.bestPetals=Array.from({length:4},(_,i)=>Math.max(0,Math.min(10,Number(raw.bestPetals?.[i])||0)));
      state.chapter=Math.max(0,Math.min(3,Number(raw.chapter)||0));
      state.options.volume=Math.max(0,Math.min(1,Number.isFinite(Number(state.options.volume))?Number(state.options.volume):.5));
    }
  } catch (_) {storageWorks=false;}
  const save=()=>{try{localStorage.setItem(config.storageKey,JSON.stringify(state));storageWorks=true;}catch(_){storageWorks=false;}};
  let engine=null,screen='home',currentChapter=0,modalType='',modalBack=null,lastSaved=0,runAnswers={},isReplay=false,quizContext=null;
  let toastTimeout=0,gameToastTimeout=0,photoReturn=null,wasHidden=false,wasPlayingBeforeHide=false,placedFlowers=new Set(),scenePlayer=null;
  const modal=$('#modal'), modalContent=$('#modal-content');
  const music=new window.NastyAudio({muted:state.options.muted,volume:state.options.volume,onChange:updateAudio});

  function updateAudio(a) {
    const audible=a.playing&&!a.muted&&a.volume>0;
    $('#sound-button').classList.toggle('is-playing',audible);
    $('#sound-button').setAttribute('aria-pressed',String(audible));
    $('#sound-button').setAttribute('aria-label',audible?'Disattiva musica':a.error?'Riavvia musica':'Attiva musica');
    $('#sound-label').textContent=audible?'AUDIO ON':'AUDIO OFF';
    $('#track-credit').textContent=a.title?`♫ ${a.title}`:'Musica';
    $('#sound-button').title=a.error||a.title||'Tocca per avviare la musica';
    const status=$('#audio-status');if(status)status.textContent=a.error||(a.title?`${a.title}${audible?' · in riproduzione':' · in pausa / silenziata'}`:'La musica parte quando entri.');
  }
  function playTrack(id,restart=false){music.select(id,{restart});music.unlock();}
  function toggleSound(){const a=music.getState();if(a.playing&&!a.muted&&a.volume>0){music.setMuted(true);state.options.muted=true;}else{if(!a.trackId)music.select('young-money');if(a.volume===0){music.setVolume(.5);state.options.volume=.5;}music.setMuted(false);music.unlock();state.options.muted=false;}save();}
  function toast(message){clearTimeout(toastTimeout);$('#global-toast').textContent=message;$('#global-toast').classList.add('is-visible');toastTimeout=setTimeout(()=>$('#global-toast').classList.remove('is-visible'),3300);}
  function gameToast(message){clearTimeout(gameToastTimeout);$('#game-toast').textContent=message;$('#stage-mission').textContent=message;gameToastTimeout=setTimeout(()=>{if(screen==='game')$('#stage-mission').textContent=chapters[currentChapter].mission;},4500);}
  function applyOptions(){document.body.classList.toggle('reduced-motion',!!state.options.reducedMotion);music.setMuted(!!state.options.muted);music.setVolume(state.options.volume);}
  function countComplete(){return state.completed.filter(Boolean).length;}
  function unlocked(i){return i===0||state.completed[i-1];}
  function nextChapter(){const i=state.completed.findIndex(v=>!v);return i<0?0:i;}
  function remember(){if(engine){const s=engine.getState();if(s.active&&!s.finished&&!isReplay){state.checkpoints[currentChapter]=s.checkpoint;state.chapter=currentChapter;}}save();}
  function stopEngine(){if(engine){engine.destroy();engine=null;}releaseControls();}
  function showScreen(name){screen=name;for(const n of ['home','game','ending'])$(`#${n}-screen`).hidden=n!==name;document.body.classList.toggle('is-playing',name==='game');$('#app-footer').hidden=true;window.scrollTo({top:0,behavior:'instant'});}
  function closeModal(resume=false){stopScene();if(modal.open)modal.close();modalType='';modalBack=null;if(resume&&engine&&screen==='game'){engine.pause(false);music.resume();}}
  function showModal(html,type='info',back=null,wide=false){stopScene();releaseControls();if(engine)engine.pause(true);modalContent.innerHTML=html;modalType=type;modalBack=back;modal.classList.toggle('is-wide',wide);if(!modal.open)modal.showModal();modal.scrollTop=0;}
  function closeButton(){return `<button class="modal-close" data-action="close-modal" aria-label="Chiudi">${icon('close')}</button>`;}
  function modalExit(){if(modalType==='settings')applyOptions();if(modalType==='intro'&&engine?.getState().finished){goHome();return;}if(modalBack){const b=modalBack;modalBack=null;b();return;}if(['quiz','win'].includes(modalType))return;closeModal(screen==='game');}

  function chapterArt(i){
    const id='thumb'+i;
    const background=[['#1d1936','#655276'],['#17142e','#5c3f68'],['#38213f','#bd8290'],['#101128','#442664']][i];
    let art=`<defs><linearGradient id="${id}" x2="0" y2="1"><stop stop-color="${background[0]}"/><stop offset="1" stop-color="${background[1]}"/></linearGradient></defs><rect width="300" height="160" fill="url(#${id})"/><g fill="#eee0fc" opacity=".65"><circle cx="35" cy="25" r="1"/><circle cx="80" cy="46" r="1"/><circle cx="135" cy="21" r="1.2"/><circle cx="189" cy="45" r="1"/><circle cx="257" cy="22" r="1.3"/></g>`;
    if(i===0)art+=`<circle cx="231" cy="45" r="23" fill="#e2c4ec"/><circle cx="241" cy="40" r="22" fill="#433653"/><path d="M0 137Q70 91 155 131T300 117v43H0Z" fill="#292a38"/><path d="M0 149Q90 110 182 139T300 134v26H0Z" fill="#404537"/><g stroke="#afb88b" stroke-width="2"><path d="M72 151V88m0 42-16-9m16 18 16-10M137 147V112m75 36V97"/></g><g fill="#eeb4d3"><ellipse cx="65" cy="90" rx="6" ry="14" transform="rotate(-32 65 90)"/><ellipse cx="79" cy="90" rx="6" ry="14" transform="rotate(32 79 90)"/><ellipse cx="72" cy="97" rx="19" ry="5"/><ellipse cx="207" cy="100" rx="5" ry="12" transform="rotate(-32 207 100)"/><ellipse cx="218" cy="100" rx="5" ry="12" transform="rotate(32 218 100)"/><ellipse cx="137" cy="113" rx="13" ry="7"/></g><g fill="#f3e4b3"><circle cx="72" cy="97" r="2"/><circle cx="212" cy="105" r="2"/><circle cx="137" cy="113" r="2"/></g>`;
    if(i===1)art+=`<circle cx="208" cy="62" r="35" fill="#e4a5bd"/><path d="M0 147V77h40v70h9V97h35v50h38V56h38v91h12V88h49v59h13V96h31v51h35v13H0Z" fill="#241c38"/><g fill="#d792b6" opacity=".55"><path d="M8 89h22v3H8zm48 19h16v3H56zm74-38h19v3h-19zm51 31h20v3h-20zm0 12h20v3h-20z"/></g><path d="M77 151V66m74 85V66M66 64q51 13 98 0M71 80h88" fill="none" stroke="#ad708f" stroke-width="9"/><path d="M65 62q50 13 99 0" fill="none" stroke="#e3a7c0" stroke-width="3"/><path d="M181 35v34" stroke="#d8abc5"/><rect x="173" y="44" width="16" height="22" rx="7" fill="#f8bea7"/><path d="M0 151h300v9H0Z" fill="#41324f"/>`;
    if(i===2)art+=`<circle cx="222" cy="47" r="29" fill="#f7ccb7"/><circle cx="214" cy="40" r="26" fill="#81506b"/><path d="M0 131 80 52l81 91Z" fill="#a56a88"/><path d="m80 52 17 83 64 8Z" fill="#704561"/><path d="m110 143 82-78 69 78Z" fill="#bb7d95"/><path d="m192 65 17 78h52Z" fill="#7e4c69"/><path d="M0 143q76-19 143-3t157-4v24H0Z" fill="#59334f"/><path d="M48 151v-32h26v32M43 116l18-9 18 9Z" fill="#ad8098"/><path d="M46 124h28" stroke="#eac6b1" stroke-width="2"/>`;
    if(i===3)art+=`<ellipse cx="154" cy="82" rx="138" ry="29" fill="#8b53bb" opacity=".2" transform="rotate(-30 154 82)"/><ellipse cx="155" cy="81" rx="110" ry="16" fill="#cd84c5" opacity=".15" transform="rotate(-30 155 81)"/><circle cx="206" cy="75" r="35" fill="#b49ad7"/><ellipse cx="206" cy="75" rx="59" ry="12" fill="none" stroke="#dec8ee" stroke-width="5" transform="rotate(-25 206 75)"/><circle cx="80" cy="109" r="17" fill="#bd7daa"/><path d="m0 156 35-12 37 7 26-8 18 17Z" fill="#817393"/><path d="m153 160 37-16 21 3 33-9 30 22Z" fill="#756585"/><g fill="#f4d6ec"><path d="m94 37 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z"/><path d="m259 32 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z"/></g>`;
    return `<svg viewBox="0 0 300 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${art}</svg>`;
  }
  function renderHome(){
    $('#made-for').textContent=config.recipientName?`PER ${config.recipientName.toUpperCase()}`:'PER TE';
    $('#start-button span').textContent=countComplete()===4?'Un altro giro?':state.checkpoints[nextChapter()]?'Riprendiamo?':countComplete()?'Continuiamo?':'Entriamo?';
    $('#lily-progress').innerHTML=chapters.map((c,i)=>`<svg class="${state.completed[i]?'is-collected':''}" aria-hidden="true"><use href="#i-flower"/></svg>`).join('')+`<small>${countComplete()}/4</small>`;
    $('#lily-progress').setAttribute('aria-label',`${countComplete()} gigli raccolti su quattro`);
    $('#chapter-grid').innerHTML=chapters.map((c,i)=>`<button class="chapter-card ${i===nextChapter()?'is-current':''}" data-chapter="${i}" aria-label="${esc(c.short)}. ${state.completed[i]?'Completato, rigioca':unlocked(i)?'Disponibile':'Da sbloccare'}"><div class="chapter-art">${chapterArt(i)}<span class="chapter-number">0${i+1}</span><span class="chapter-state">${state.completed[i]?'Completato':unlocked(i)?'Entra':icon('lock')}</span></div><div class="chapter-info"><h3>${esc(c.short)}</h3><p>${esc(c.subtitle)}</p>${icon('arrow','chapter-arrow')}</div></button>`).join('');
    $('#album-count').textContent=`${state.gallery.length}/7`;
    $('#ending-home').hidden=countComplete()!==4;
  }
  function goHome(){remember();closeModal();stopEngine();showScreen('home');renderHome();if(music.getState().unlocked)music.select('young-money');}
  function showIntro(i){
    if(!unlocked(i)){showModal(`<div class="modal-inner">${closeButton()}<h2>${esc(chapters[i].short)}</h2><p>Recupera il giglio del capitolo precedente per aprire questo mondo.</p><button class="primary-button" data-action="close-modal">Ricevuto ${icon('arrow')}</button></div>`);return;}
    const c=chapters[i],hasCheckpoint=!state.completed[i]&&!!state.checkpoints[i];
    showModal(`<div class="modal-inner">${closeButton()}${i===0?'<img class="story-portrait" src="assets/photos/pink-rat.jpg" alt="Ratto Rosa">':''}<span class="eyebrow">${c.location}</span><h2>${esc(c.title)}</h2><p>${esc(c.intro)}</p><div class="story-tag">${icon('flower')}<span>${esc(c.note)}</span></div><button class="primary-button" data-enter="${i}">${hasCheckpoint?'Riparti dal checkpoint':state.completed[i]?'Rientra nel mondo':'Andiamo'} ${icon('arrow')}</button></div>`,'intro');
  }
  function startChapter(i){
    remember();stopEngine();closeModal();currentChapter=i;state.chapter=i;isReplay=!!state.completed[i];runAnswers={};quizContext=null;
    const c=chapters[i];showScreen('game');$('#stage-label').textContent=`CAPITOLO ${i+1}`;$('#stage-title').textContent=c.title;$('#stage-mission').textContent=c.mission;$('#game-toast').textContent='';clearTimeout(gameToastTimeout);
    $('#petal-count').textContent='0';$('#gates-count').textContent='0/2 varchi';$('#journey-fill').style.width='0%';
    playTrack(c.track,!state.checkpoints[i]||isReplay);
    engine=new window.NastyEngine($('#game-canvas'),{
      onGate:index=>openGate(index),onCollect:()=>{},onNotice:gameToast,
      onSecret:id=>{if(!state.secrets.includes(id)){state.secrets.push(id);save();}gameToast('Ricordo segreto aggiunto a Memoria.');},
      onProgress:data=>{ $('#petal-count').textContent=data.petals;$('#journey-fill').style.width=`${data.percent}%`;$('#gates-count').textContent=`${data.checkpoint.gates.length}/2 varchi`;if(!isReplay)state.checkpoints[i]=data.checkpoint;state.bestPetals[i]=Math.max(state.bestPetals[i],data.petals);if(Date.now()-lastSaved>2400){lastSaved=Date.now();save();}},
      onFinish:result=>finishChapter(result)
    });
    engine.start(i,{gentle:state.options.gentle,reducedMotion:state.options.reducedMotion,checkpoint:isReplay?null:state.checkpoints[i]});engine.resize();

    save();
  }

  function unlockPhoto(id){if(!id||state.gallery.includes(id))return;state.gallery.push(id);$('#album-count').textContent=`${state.gallery.length}/7`;save();toast('Una nuova figurina in Memoria.');}
  function gatePhoto(level,gate){return { '0-0':'cucumber-duo','0-1':'sonic-break','1-0':'double-portrait','2-0':'gold-icon','2-1':'strange-visitor','3-1':'purple-globe'}[`${level}-${gate}`];}
  function answerStore(){return isReplay?runAnswers:state.answers;}
  function openGate(index){
    releaseControls();quizContext={gate:index,position:0,order:[]};
    const store=answerStore();
    while(quizContext.position<2&&store[questions[currentChapter*4+index*2+quizContext.position].id]?.solved)quizContext.position++;
    if(quizContext.position>=2){completeGate();return;}renderQuestion();
  }
  function shuffledOrder(q){const order=[0,1,2,3];for(let i=3;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}return order;}
  function renderQuestion(){
    const q=questions[currentChapter*4+quizContext.gate*2+quizContext.position];
    quizContext.question=q;quizContext.order=shuffledOrder(q);const old=answerStore()[q.id]||{attempts:0,wrong:[]};
    showModal(`<div class="modal-inner"><div class="quiz-topline"><span class="quiz-category">${esc(q.category)}</span><span class="quiz-position">VARCO ${quizContext.gate+1} · ${quizContext.position+1}/2</span></div><div class="quiz-dots"><i class="${quizContext.position===0?'active':''}"></i><i class="${quizContext.position===1?'active':''}"></i></div><h2 class="quiz-question">${esc(q.question)}</h2><div class="quiz-options">${quizContext.order.map((v,j)=>`<button class="quiz-option ${(old.wrong||[]).includes(v)?'is-wrong':''}" data-answer="${v}" ${(old.wrong||[]).includes(v)?'disabled':''}><span class="option-letter">${'ABCD'[j]}</span><span>${esc(q.choices[v])}</span></button>`).join('')}</div><div id="quiz-feedback" class="quiz-feedback" ${old.attempts?'':'hidden'}><b>Un piccolo indizio.</b><p>${esc(q.hint)}</p></div><div class="quiz-footer"><button class="primary-button" id="quiz-next" data-action="quiz-next" hidden>${quizContext.position===0?'La prossima':'Apri il varco'} ${icon('arrow')}</button></div><button class="quiz-exit" data-action="quiz-home">Salva ed esci</button></div>`,'quiz');
  }
  function chooseAnswer(index){
    if(!quizContext||modalType!=='quiz')return;const q=quizContext.question,store=answerStore();let a=store[q.id]||{attempts:0,wrong:[],solved:false};
    if(a.solved||a.wrong.includes(index))return;a.attempts++;
    const button=$(`[data-answer="${index}"]`),feedback=$('#quiz-feedback');feedback.hidden=false;
    if(index===q.correct){a.solved=true;a.firstCorrect=a.attempts===1;button.classList.add('is-correct');$$('[data-answer]').forEach(b=>b.disabled=true);feedback.classList.add('good');feedback.innerHTML=`<b>${a.firstCorrect?'Esatto!':'Trovata!'}</b><p>${esc(q.explanation)}</p><a class="source-link" href="${esc(q.source.url)}" target="_blank" rel="noopener noreferrer">Fonte: ${esc(q.source.title)} ↗</a>`;$('#quiz-next').hidden=false;}
    else{a.wrong.push(index);button.classList.add('is-wrong');button.disabled=true;feedback.classList.remove('good');feedback.innerHTML=`<b>Non questa. Riprova pure.</b><p>${esc(q.hint)}</p>`;}
    store[q.id]=a;save();
  }
  function quizNext(){if(!quizContext||!answerStore()[quizContext.question.id]?.solved)return;quizContext.position++;if(quizContext.position<2)renderQuestion();else completeGate();}
  function completeGate(){const gate=quizContext.gate;unlockPhoto(gatePhoto(currentChapter,gate));closeModal();engine.unlockGate(gate);engine.pause(false);quizContext=null;remember();gameToast(gate===0?'Primo varco aperto.':'Il giglio ti aspetta più avanti.');}
  function stopScene(){if(scenePlayer){scenePlayer.destroy();scenePlayer=null;}}
  function finishChapter(result){
    releaseControls();state.completed[currentChapter]=true;state.checkpoints[currentChapter]=null;state.bestPetals[currentChapter]=Math.max(state.bestPetals[currentChapter],result.petals);state.chapter=Math.min(3,currentChapter+1);save();const c=chapters[currentChapter];
    showModal(`<div class="cutscene-art"><canvas id="cutscene-canvas" width="960" height="600" role="img" aria-label="${esc(['Sir Rattingham riceve il primo giglio in giardino.','Il ratto balla su un vinile fuori dal Nasty Records.','Il ratto offre un tè al limone a una mummia.','I quattro gigli fluttuano fra le stelle.'][currentChapter])}"></canvas><button class="scene-replay" data-action="replay-scene" aria-label="Riguarda la scena">↻</button></div><div class="modal-inner win-content"><span class="eyebrow">GIGLIO ${currentChapter+1} DI 4</span><h2>${esc(c.sceneTitle)}</h2><p>${esc(c.win)}</p><button class="primary-button" data-action="${currentChapter===3?'to-ending':'next-chapter'}">${currentChapter===3?'Componi il bouquet':'Continua il viaggio'} ${icon('arrow')}</button><button class="text-button win-map" data-action="go-home">Torna alla mappa</button></div>`,'win');
    scenePlayer=window.NLUScenes.play($('#cutscene-canvas'),currentChapter,{reducedMotion:state.options.reducedMotion});
  }

  function showHow(){showModal(`<div class="modal-inner">${closeButton()}<h2>Un piccolo viaggio.<br>Nessuna fretta.</h2><ol class="how-list"><li><span class="how-number">01</span><div><b>Muoviti, salta, salta ancora.</b><p>Su telefono usa i pulsanti sotto il gioco. Puoi tenere una direzione e saltare insieme. Due tocchi su SALTA danno due salti.</p></div></li><li><span class="how-number">02</span><div><b>Due varchi per ogni mondo.</b><p>Avvicinati per attivare i quiz: due domande per varco. Se sbagli ricevi un indizio e riprovi. Non perdi vite e non c’è un conto alla rovescia.</p></div></li><li><span class="how-number">03</span><div><b>Un giglio alla fine.</b><p>Ogni mondo ha una sorpresa: ponti di foglie, vinili a molla, blocchi mobili e scie stellari. I petali lungo la strada sono extra.</p></div></li><li><span class="how-number">04</span><div><b>Il mondo aspetta.</b><p>I varchi e i checkpoint si salvano su questo browser. Nelle impostazioni trovi la modalità Passeggiata, con meno ostacoli.</p></div></li></ol><p class="story-footnote">Da computer: frecce o A/D per muoverti · Spazio, W o ↑ per saltare · Esc per la pausa.</p><button class="primary-button" data-action="close-modal">Si parte ${icon('arrow')}</button></div>`,'how');}
  function showPause(){if(!engine||screen!=='game')return;remember();music.pause();showModal(`<div class="modal-inner">${closeButton()}<h2>Facciamo una pausa.</h2><p>Il tuo checkpoint è al sicuro.</p><button class="primary-button" data-action="resume">Riprendiamo ${icon('arrow')}</button><button class="secondary-button" data-action="retry">Torna all’ultimo checkpoint</button><button class="secondary-button" data-action="settings-from-pause">Scegli il ritmo</button><button class="secondary-button" data-action="go-home">Salva e torna alla mappa</button></div>`,'pause');}
  function showSettings(back=null){remember();showModal(`<div class="modal-inner">${closeButton()}<h2>Il tuo ritmo.</h2><label class="settings-row"><span><b>Modalità Passeggiata</b><p>Meno ostacoli e salti più permissivi. I quiz restano gli stessi.</p></span><input class="toggle" id="gentle-option" type="checkbox" ${state.options.gentle?'checked':''}></label><label class="settings-row"><span><b>Animazioni ridotte</b><p>Meno movimento decorativo, stelle più tranquille.</p></span><input class="toggle" id="motion-option" type="checkbox" ${state.options.reducedMotion?'checked':''}></label><label class="settings-row"><span><b>Musica</b><p id="audio-status">${esc(music.getState().title||'Parte quando entri in un mondo.')}</p></span><input class="toggle" id="music-option" type="checkbox" ${!state.options.muted?'checked':''}></label><label class="settings-row"><span><b>Volume</b><p>Su alcuni telefoni lo regoli con i tasti del dispositivo.</p></span><input class="volume-slider" id="volume-option" aria-label="Volume musica" type="range" min="0" max="1" step=".05" value="${state.options.volume}"></label><p class="settings-note">${storageWorks?'I progressi restano su questo browser e dispositivo.':'Il browser non consente il salvataggio: i progressi dureranno solo finché questa pagina rimane aperta.'}${screen==='game'?' Le modifiche al percorso si applicano dal checkpoint.':''}</p><button class="primary-button" data-action="apply-settings">Va bene così ${icon('arrow')}</button><br><button class="danger-button" data-action="ask-reset">Ricomincia tutto da zero</button></div>`,'settings',back);}
  function applySettings(){
    const changed=state.options.gentle!==$('#gentle-option').checked||state.options.reducedMotion!==$('#motion-option').checked;
    state.options.gentle=$('#gentle-option').checked;state.options.reducedMotion=$('#motion-option').checked;state.options.muted=!$('#music-option').checked;state.options.volume=Number($('#volume-option').value);applyOptions();save();
    if(changed&&engine&&screen==='game'&&!engine.getState().finished){const checkpoint=engine.getState().checkpoint;engine.start(currentChapter,{checkpoint,gentle:state.options.gentle,reducedMotion:state.options.reducedMotion});engine.pause(true);engine.resize();}
    if(modalBack){const back=modalBack;modalBack=null;back();}else closeModal(screen==='game');
  }
  function askReset(){showModal(`<div class="modal-inner">${closeButton()}<h2>Ripartiamo davvero<br>da zero?</h2><p>Gigli, risposte, figurine e checkpoint verranno azzerati su questo browser.</p><button class="primary-button" data-action="confirm-reset">Sì, ricomincia</button><button class="secondary-button" data-action="settings">No, tieni i progressi</button></div>`,'reset',()=>showSettings());}

  function showAlbum(back=null){
    const cards=photos.map(p=>{const open=state.gallery.includes(p.id);return `<button class="photo-card ${open?'':'is-locked'}" ${open?`data-photo="${p.id}"`:'disabled'}>${open?`<img src="assets/photos/${p.file}" alt="${esc(p.title)}" loading="lazy">`:`<div class="photo-locked">${icon('lock')}</div>`}<span>${esc(open?p.title:'Ancora in viaggio')}</span>${open?'':`<small>${esc(p.unlock)}</small>`}</button>`;}).join('');
    const stamps=['Giardino','Kyoto','Deserto','Orbita'];
    showModal(`<div class="modal-inner">${closeButton()}<h2>Memoria.</h2><p class="album-intro">${state.gallery.length} di 7 ricordi raccolti.</p><div class="album-grid">${cards}</div><div class="postcard"><svg class="postcard-art" viewBox="0 0 100 65" aria-label="Cartolina illustrata di Tel Aviv"><rect width="100" height="65" rx="3" fill="#d7c4e3"/><path d="M0 49q20-5 42 0t58 0v16H0Z" fill="#8f90bf"/><path d="M8 46V25h20v21m7 0V16h25v30m8 0V30h23v16" fill="#ece3e6"/><g stroke="#947b9d" stroke-width="2"><path d="M11 30h14m-14 7h14m15-15h15m-15 7h15m-15 7h15m18 1h15"/></g><path d="M0 55q19-4 38 0t38 0 24 0" stroke="#d0c2dc" fill="none"/><text x="85" y="15" fill="#706089" font-size="11" font-family="serif">חי</text></svg><div><b>Tel Aviv, lato viola.</b><p>Una cartolina da Israele. חי, «vita»: da tenere fra i ricordi.</p></div></div>${state.secrets.length?`<div class="secret-stamps">${state.secrets.map(id=>`<span>${stamps[Number(id.slice(-1))]}</span>`).join('')}</div>`:'<p class="story-footnote">Esplora i percorsi alti per trovare altri quattro ricordi.</p>'}</div>`,'album',back,true);
  }
  function showPhoto(id){const p=photos.find(x=>x.id===id);if(!p||!state.gallery.includes(id))return;if(modalType==='album')photoReturn=modalBack;const ids=photos.filter(x=>state.gallery.includes(x.id)).map(x=>x.id),index=ids.indexOf(id);showModal(`<div class="modal-inner photo-view">${closeButton()}<span class="eyebrow">MEMORIA · ${index+1}/${ids.length}</span><h2>${esc(p.title)}</h2><img src="assets/photos/${p.file}" alt="${esc(p.title)}"><p style="margin-top:15px">${esc(p.caption)}</p><div class="photo-controls"><button class="text-button" data-action="photo-back">← Tutte le figurine</button>${ids.length>1?`<button class="text-button" data-photo="${ids[(index+1)%ids.length]}">La prossima →</button>`:''}</div></div>`,'photo',()=>showAlbum(photoReturn),true);}

  function startEnding(){if(countComplete()<4)return;remember();stopEngine();closeModal();showScreen('ending');playTrack('young-money',true);placedFlowers=new Set();$('#bouquet-flowers').innerHTML='';$('#final-letter').hidden=true;$('#bouquet-instruction').textContent='Tocca i quattro gigli per comporre il bouquet.';$('#flower-picker').innerHTML=chapters.map(c=>`<button class="flower-choice" data-flower="${c.id}" style="color:${c.color}" aria-label="Aggiungi ${esc(c.lily)}"><canvas class="flower-art" width="160" height="200" data-lily="${c.id}" aria-hidden="true"></canvas></button>`).join('');$$('[data-lily]').forEach(canvas=>drawLily(canvas,Number(canvas.dataset.lily)));}
  function drawLily(canvas,i){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);window.NLUArt.lily(c,canvas.width/2,canvas.height-8,{scale:(canvas.height-16)/108,color:i%2?'purple':'pink',time:0});}
  function placeFlower(i){if(placedFlowers.has(i))return;placedFlowers.add(i);const f=document.createElement('div');f.className='bouquet-flower';f.innerHTML='<canvas width="200" height="270" aria-hidden="true"></canvas>';drawLily(f.firstChild,i);f.style.color=chapters[i].color;$('#bouquet-flowers').appendChild(f);$(`[data-flower="${i}"]`).disabled=true;if(placedFlowers.size===4){state.endingDone=true;save();$('#bouquet-instruction').textContent='Sono tutti per te.';$('#final-message').innerHTML=`<span class="ti-globo">Ti Globo.</span><span class="final-message-copy">${esc(config.finalMessage)}</span>`;$('#letter-signature').textContent=[config.finalSignature,config.authorName?`— ${config.authorName}`:''].filter(Boolean).join(' ');$('#final-letter').hidden=false;setTimeout(()=>$('#final-letter').scrollIntoView({behavior:state.options.reducedMotion?'instant':'smooth',block:'center'}),250);}}

  const heldPointers=new Map(),heldKeys=new Set();
  function releaseControls(){heldPointers.clear();heldKeys.clear();$$('[data-control]').forEach(b=>b.classList.remove('is-held'));if(engine)for(const a of ['left','right','jump','interact'])engine.input(a,false);}
  function syncInput(action){if(engine)engine.input(action,[...heldPointers.values()].includes(action)||[...heldKeys].some(code=>keyMap[code]===action));}
  $$('[data-control]').forEach(b=>{
    b.addEventListener('pointerdown',e=>{if(!engine||screen!=='game'||modal.open)return;e.preventDefault();b.setPointerCapture(e.pointerId);heldPointers.set(e.pointerId,b.dataset.control);b.classList.add('is-held');syncInput(b.dataset.control);});
    for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,e=>{heldPointers.delete(e.pointerId);if(![...heldPointers.values()].includes(b.dataset.control))b.classList.remove('is-held');syncInput(b.dataset.control);});
    b.addEventListener('contextmenu',e=>e.preventDefault());
  });
  const keyMap={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'jump',ArrowUp:'jump',KeyW:'jump',KeyE:'interact'};
  document.addEventListener('keydown',e=>{if(screen!=='game'||!engine||modal.open)return;if(e.code==='Escape'){e.preventDefault();showPause();return;}const action=keyMap[e.code];if(action){e.preventDefault();if(e.repeat)return;heldKeys.add(e.code);syncInput(action);}});
  document.addEventListener('keyup',e=>{const action=keyMap[e.code];if(action){heldKeys.delete(e.code);syncInput(action);}});
  modal.addEventListener('cancel',e=>{e.preventDefault();modalExit();});
  modal.addEventListener('click',e=>{if(e.target===modal&&!['quiz','win'].includes(modalType))modalExit();});
  document.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b||b.disabled)return;
    if(b.dataset.chapter!==undefined){showIntro(Number(b.dataset.chapter));return;}
    if(b.dataset.enter!==undefined){startChapter(Number(b.dataset.enter));return;}
    if(b.dataset.answer!==undefined){chooseAnswer(Number(b.dataset.answer));return;}
    if(b.dataset.photo){showPhoto(b.dataset.photo);return;}
    if(b.dataset.flower!==undefined){placeFlower(Number(b.dataset.flower));return;}
    const action=b.dataset.action;
    if(action==='close-modal')modalExit();
    else if(action==='quiz-next')quizNext();
    else if(action==='quiz-home'||action==='go-home')goHome();
    else if(action==='resume')closeModal(true);
    else if(action==='retry'){engine.retryCheckpoint();closeModal(true);}
    else if(action==='settings-from-pause')showSettings(()=>showPause());
    else if(action==='settings')showSettings();
    else if(action==='apply-settings')applySettings();
    else if(action==='ask-reset')askReset();
    else if(action==='confirm-reset'){stopEngine();const options=state.options;state=defaultState();state.options=options;save();goHome();toast('Un universo nuovo. Stesso ratto.');}
    else if(action==='photo-back')showAlbum(photoReturn);
    else if(action==='replay-scene'){stopScene();scenePlayer=window.NLUScenes.play($('#cutscene-canvas'),currentChapter,{reducedMotion:state.options.reducedMotion});}
    else if(action==='next-chapter'){closeModal();showIntro(currentChapter+1);}
    else if(action==='to-ending')startEnding();
  });
  $('#start-button').addEventListener('click',()=>showIntro(nextChapter()));
  $('#home-button').addEventListener('click',()=>{if(screen==='game')showPause();else goHome();});
  $('#how-button').addEventListener('click',showHow);
  $('#settings-button').addEventListener('click',()=>showSettings());
  $('#sound-button').addEventListener('click',toggleSound);
  $('#album-button').addEventListener('click',()=>showAlbum());
  $('#pause-button').addEventListener('click',showPause);
  $('#ending-home').addEventListener('click',startEnding);
  $('#ending-album').addEventListener('click',()=>showAlbum());
  $('#ending-replay').addEventListener('click',goHome);
  modalContent.addEventListener('input',e=>{if(e.target.id==='volume-option'){music.setVolume(Number(e.target.value));}if(e.target.id==='music-option'){music.setMuted(!e.target.checked);if(e.target.checked){if(!music.getState().trackId)music.select('young-money');music.unlock();}}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){wasHidden=true;wasPlayingBeforeHide=music.getState().playing;releaseControls();remember();if(engine)engine.pause(true);music.pause();}else if(wasHidden){wasHidden=false;if(screen==='game'&&!modal.open)showPause();else if(wasPlayingBeforeHide&&(modalType==='quiz'||modalType==='win'||screen==='ending'||screen==='home'))music.resume();}});
  window.addEventListener('blur',()=>{releaseControls();if(screen==='game'&&!modal.open&&engine)showPause();});
  window.addEventListener('pagehide',remember);
  applyOptions();renderHome();
  if(questions.length!==16||!window.NastyEngine)toast('Alcuni file del gioco non sono disponibili. Ricarica la pagina.');
})();
