/* Nasty Little Universe — dependency-free, responsive platformer. */
(function () {
  'use strict';
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const lerp = (a, b, t) => a + (b - a) * t;
  const TAU = Math.PI * 2;
  const THEMES = [
    {name:'Giardino Nasty',sky:['#171135','#38235d','#70518c'],ink:'#2f2246',light:'#eab8ef',accent:'#d7faad',soil:'#503465',top:'#bd91d0'},
    {name:'Kyoto, lato B',sky:['#100e2a','#392144','#714567'],ink:'#241c42',light:'#ffb8df',accent:'#b6f0eb',soil:'#2a2246',top:'#ac7cbb'},
    {name:'Sabbia & limone',sky:['#25163d','#774365','#d6918a'],ink:'#4c2a52',light:'#ffd0bd',accent:'#f1e0a1',soil:'#8f5779',top:'#deb0bb'},
    {name:'Orbita viola',sky:['#090b22','#1b1747','#352152'],ink:'#24203c',light:'#d4c4ff',accent:'#baf7ee',soil:'#494060',top:'#a498d6'}
  ];
  function round(c,x,y,w,h,r) {
    r=Math.max(0,Math.min(r,w/2,h/2));
    c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();
  }
  function ellipse(c,x,y,rx,ry,color,angle=0) {c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),angle,0,TAU);if(color)c.fillStyle=color;c.fill();}
  function line(c,x,y,a,b,color,width=1) {c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(a,b);c.stroke();}
  function text(c,str,x,y,size=13,color='#fff',align='center',weight='600') {c.fillStyle=color;c.font=`${weight} ${size}px system-ui, -apple-system, sans-serif`;c.textAlign=align;c.textBaseline='middle';c.fillText(str,x,y);}
  function seed(n) {const s=Math.sin(n*127.1+311.7)*43758.5453123;return s-Math.floor(s);}
  function star(c,x,y,r,color,rot=0) {c.save();c.translate(x,y);c.rotate(rot);c.fillStyle=color;c.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,rr=i%2?r*.28:r;i?c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):c.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);}c.closePath();c.fill();c.restore();}
  function flower(c,x,y,s,phase=0,color='#f4b4de') {c.save();c.translate(x,y);c.rotate(Math.sin(phase)*.06);line(c,0,0,0,-s*.9,'#81987b',Math.max(1.5,s*.07));ellipse(c,-s*.18,-s*.34,s*.25,s*.09,'#9ba78b',-.5);ellipse(c,s*.17,-s*.57,s*.23,s*.085,'#81977c',.4);c.translate(0,-s);for(let i=0;i<6;i++){c.save();c.rotate(i*TAU/6);ellipse(c,0,-s*.18,s*.12,s*.33,color,.1);c.restore();}ellipse(c,0,0,s*.085,s*.085,'#f5e9b4');c.restore();}
  function lily(c,x,y,s,phase=0) {if(window.NLUArt){window.NLUArt.lily(c,x,y,{scale:s/92,time:phase});return;}c.save();c.translate(x,y);c.rotate(Math.sin(phase)*.045);line(c,0,0,s*.04,-s*.84,'#9fb58a',s*.035);ellipse(c,-s*.13,-s*.34,s*.22,s*.055,'#869e8b',.65);ellipse(c,s*.16,-s*.59,s*.24,s*.07,'#a8b890',-.55);c.translate(0,-s*.82);for(let i=0;i<6;i++){c.save();c.rotate((i-2.5)*.72);c.beginPath();c.moveTo(0,0);c.bezierCurveTo(-s*.19,-s*.08,-s*.21,-s*.43,0,-s*.59);c.bezierCurveTo(s*.18,-s*.37,s*.18,-s*.09,0,0);c.fillStyle=i%2?'#e9a8d1':'#ffcee8';c.fill();line(c,0,-s*.06,0,-s*.40,'#bd75af',s*.012);c.restore();}for(let i=-1;i<=1;i++){line(c,0,0,i*s*.12,-s*.29,'#fbdf99',s*.018);ellipse(c,i*s*.12,-s*.29,s*.025,s*.045,'#e8d191',i*.35);}c.restore();}

  class NastyEngine {
    constructor(canvas, callbacks={}) {
      if(!canvas || !canvas.getContext)throw new Error('NastyEngine requires a canvas.');
      this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.cb=callbacks;
      this.keys={left:false,right:false,jump:false,interact:false};this.level=0;this.active=false;this.paused=true;
      this.phase=0;this.acc=0;this.lastTime=0;this.camera=0;this.cameraY=0;this.viewW=800;this.viewH=600;this.scale=1;
      this.particles=[];this.progressTick=0;this.destroyed=false;
      this.stars=Array.from({length:116},(_,i)=>({x:seed(i+7)*4400,y:28+seed(i+27)*350,r:.6+seed(i+89)*1.6,p:seed(i+19)*TAU}));
      this.resizeObserver=typeof ResizeObserver!=='undefined'?new ResizeObserver(()=>this.resize()):null;
      if(this.resizeObserver)this.resizeObserver.observe(canvas);
      this.boundResize=()=>this.resize();window.addEventListener('resize',this.boundResize);
      this.boundFrame=t=>this.frame(t);this.resize();this.raf=requestAnimationFrame(this.boundFrame);
    }
    emit(name,...args) {if(typeof this.cb[name]==='function')this.cb[name](...args);}
    start(levelIndex, options={}) {
      this.level=clamp(Math.floor(Number(levelIndex)||0),0,3);this.theme=THEMES[this.level];
      this.gentle=!!options.gentle;this.reducedMotion=!!options.reducedMotion;this.active=true;this.paused=false;this.finished=false;
      this.elapsed=0;this.falls=0;this.petals=0;this.collected=new Set();this.secret=false;this.pendingGate=null;this.particles=[];
      this.keys={left:false,right:false,jump:false,interact:false};this.jumpBuffer=0;this.acc=0;this.lastTime=0;this.progressTick=0;
      this.mechanismNotices=new Set();this.bloomed=new Set();this.boostTimer=0;
      this.buildLevel();this.safe={x:75,y:this.platforms[0].y-54};
      this.player={x:75,y:this.safe.y,w:35,h:54,vx:0,vy:0,dir:1,grounded:true,jumps:0,coyote:.1,invincible:1,support:'base-0'};
      const supplied=options.checkpoint&&options.checkpoint.checkpoint?options.checkpoint.checkpoint:options.checkpoint;
      if(supplied && supplied.version===2 && Number(supplied.level)===this.level){
        const gs=Array.isArray(supplied.gates)?supplied.gates:[];
        this.gates.forEach(g=>{g.open=gs.includes(g.index);});
        const permitted=new Set(this.items.map(it=>it.id));
        (Array.isArray(supplied.collected)?supplied.collected:[]).forEach(id=>{if(permitted.has(id))this.collected.add(id);});
        this.secret=!!supplied.secret;this.petals=this.items.filter(it=>it.kind!=='secret'&&this.collected.has(it.id)).length;
        (Array.isArray(supplied.bloomed)?supplied.bloomed:[]).forEach(id=>{const bud=this.buds.find(b=>b.id===id);if(bud){this.bloomed.add(id);bud.growth=1;this.platforms.find(p=>p.id===bud.bridge).active=true;}});
        this.falls=clamp(Number(supplied.falls)||0,0,99999);this.elapsed=clamp(Number(supplied.seconds)||0,0,999999);
        let sx=Number(supplied.x),sy=Number(supplied.y);
        if(Number.isFinite(sx)&&Number.isFinite(sy)){
          sx=clamp(sx,40,this.worldW-160);
          const ground=this.platforms.find(p=>p.base&&sx>=p.x&&sx+35<=p.x+p.w&&p.y>=sy+48&&p.y<=sy+70);
          const firstClosed=this.gates.find(g=>!g.open);
          if(ground&&(!firstClosed||sx<firstClosed.x-35))this.safe={x:sx,y:ground.y-54};
        }
        this.player.x=this.safe.x;this.player.y=this.safe.y;
      }
      this.camera=clamp(this.player.x-this.viewW*.3,0,Math.max(0,this.worldW-this.viewW));
      this.cameraY=clamp(this.player.y-this.viewH*.55,0,this.cameraMaxY);
      this.makeSky();this.report();
    }
    buildLevel() {
      this.worldW=[2820,2860,2820,3000][this.level];
      const floors=[
        [[0,600,520],[830,570,520],[1600,620,490],[2420,400,520]],
        [[0,500,520],[665,605,470],[1435,585,520],[2195,665,470]],
        [[0,490,520],[800,560,500],[1690,480,520],[2470,350,500]],
        [[0,420,520],[685,500,470],[1485,490,520],[2305,695,475]]
      ][this.level];
      this.platforms=floors.map((p,i)=>({x:p[0],w:p[1],y:p[2],h:180,base:true,active:true,id:'base-'+i}));
      const raised=[
        [[280,410,120],[935,395,120],[1730,380,115],[1810,305,110],[2480,410,110]],
        [[535,350,130],[810,340,135],[1300,325,125],[2080,330,110],[2530,340,140]],
        [[900,390,115],[1780,395,105],[2490,385,110]],
        [[220,405,105],[820,350,110],[1580,405,100],[2485,350,130]]
      ][this.level];
      raised.forEach((p,i)=>this.platforms.push({x:p[0],y:p[1],w:p[2],h:25,base:false,active:true,id:'ledge-'+i}));
      const floorY=x=>floors.find(p=>x>=p[0]&&x<=p[0]+p[1])[2];
      const gates=[[1110,2015],[1100,2380],[1120,1960],[1010,1770]][this.level];
      this.gates=gates.map((x,index)=>({index,x,y:floorY(x),open:false}));
      const exitX=[2680,2730,2680,2840][this.level];this.exit={x:exitX,y:floorY(exitX)};
      const pickups=[
        [[275,480],[340,370],[490,480],[710,465],[995,355],[1290,480],[1680,450],[1790,340],[2260,450],[2535,370]],
        [[260,480],[440,410],[590,305],[870,300],[1210,360],[1370,280],[1550,480],[1980,385],[2130,280],[2590,300]],
        [[205,480],[470,480],[635,420],[955,350],[1305,460],[1515,395],[1840,355],[2090,480],[2315,415],[2540,345]],
        [[275,365],[410,400],[560,310],[875,310],[1160,380],[1330,300],[1600,365],[1940,400],[2150,300],[2550,310]]
      ][this.level];
      this.items=pickups.map((p,i)=>({x:p[0],y:p[1],id:`${this.level}-petal-${i}`,kind:i===1||i===7?'tea':'petal'}));
      const secret=[[1860,265],[2585,240],[1840,290],[2540,245]][this.level];this.items.push({x:secret[0],y:secret[1],id:`${this.level}-secret`,kind:'secret'});
      const enemies=[[[355,50],[1770,38]],[[855,45],[2525,48]],[[1000,40],[1810,43]],[[1575,45],[2510,48]]][this.level];
      this.hazards=enemies.map((p,i)=>({base:p[0],range:p[1],y:floorY(p[0]),speed:.9+i*.16,p:i*1.9}));
      if(this.gentle)this.hazards=this.hazards.slice(0,1);
      this.buds=[];this.bouncePads=[];this.movers=[];
      if(this.level===0){
        [[475,520,600,230,520],[1280,520,1400,200,505],[2110,490,2220,200,505]].forEach((p,i)=>{
          const id='leaf-bridge-'+i;this.platforms.push({id,x:p[2],y:p[4],w:p[3],h:20,base:false,active:false,leaf:true});
          this.buds.push({id:'bud-'+i,x:p[0],y:p[1],bridge:id,growth:0});
        });
      }
      if(this.level===1)this.bouncePads=[425,1180,1930].map(x=>({x,y:floorY(x),cooldown:0,pulse:0}));
      if(this.level===2)[[570,480,150,90],[1430,450,160,90],[2245,470,155,90]].forEach((p,i)=>this.addMover(p[0],p[1],p[2],p[3],0,i));
      if(this.level===3)[[510,380,150,0,38],[1260,375,150,0,38],[2070,380,165,0,42]].forEach((p,i)=>this.addMover(...p,i));
    }
    addMover(x,y,w,rx,ry,i){const p={id:'ferry-'+i,x,y,w,h:28,base:false,active:true,moving:true,ox:x,oy:y,rx,ry,phase:i*1.7,dx:0,dy:0};this.platforms.push(p);this.movers.push(p);}
    resize() {
      const rect=this.canvas.getBoundingClientRect();
      const w=Math.max(1,rect.width||this.canvas.clientWidth||800),h=Math.max(1,rect.height||this.canvas.clientHeight||450);
      this.dpr=Math.min(window.devicePixelRatio||1,2);this.canvas.width=Math.round(w*this.dpr);this.canvas.height=Math.round(h*this.dpr);
      this.viewH=w/h>1.55&&h<370?420:600;this.viewW=this.viewH*w/h;this.scale=this.canvas.height/this.viewH;
      this.cameraMaxY=Math.max(0,600-this.viewH-30);this.cameraY=clamp(this.cameraY||0,0,this.cameraMaxY);
      if(this.active){this.camera=clamp(this.camera,0,Math.max(0,this.worldW-this.viewW));this.makeSky();this.render();}
    }
    pause(value=true) {this.paused=!!value;this.keys.left=false;this.keys.right=false;this.keys.jump=false;this.jumpBuffer=0;this.acc=0;this.lastTime=0;}
    input(action, pressed) {
      if(!Object.prototype.hasOwnProperty.call(this.keys,action))return;
      if(action==='jump'&&pressed&&!this.keys.jump&&!this.paused)this.jumpBuffer=.15;
      if(action==='interact'&&pressed&&!this.keys.interact&&!this.paused)this.interact();
      this.keys[action]=!!pressed;
    }
    interact() {
      if(!this.active||this.finished)return;
      const p=this.player,g=this.gates.find(it=>!it.open&&Math.abs(p.x-it.x)<145);
      if(g)this.requestGate(g);
      else if(Math.abs(p.x-this.exit.x)<100)this.tryFinish();
      else this.emit('onNotice','Avvicinati a un varco per aprirlo.');
    }
    unlockGate(index) {
      const g=this.gates.find(it=>it.index===Number(index));if(!g||g.open)return;
      g.open=true;this.pendingGate=null;this.safe={x:g.x+80,y:g.y-54};
      this.burst(g.x+10,g.y-76,this.theme.accent,25);this.report();
    }
    retryCheckpoint() {
      if(!this.active)return;
      this.player.x=this.safe.x;this.player.y=this.safe.y;this.player.vx=0;this.player.vy=0;this.player.jumps=0;
      this.player.grounded=true;this.player.coyote=.1;this.player.invincible=1.8;this.player.support=null;this.jumpBuffer=0;this.boostTimer=0;
      this.keys.left=this.keys.right=this.keys.jump=false;this.camera=clamp(this.player.x-this.viewW*.32,0,Math.max(0,this.worldW-this.viewW));
    }
    getState() {
      if(!this.active)return {active:false,level:this.level};
      const checkpoint={version:2,level:this.level,x:this.safe.x,y:this.safe.y,gates:this.gates.filter(g=>g.open).map(g=>g.index),collected:[...this.collected],bloomed:[...this.bloomed],secret:this.secret,petals:this.petals,falls:this.falls,seconds:Math.floor(this.elapsed)};
      return {active:this.active,paused:this.paused,finished:this.finished,level:this.level,petals:this.petals,falls:this.falls,seconds:Math.floor(this.elapsed),percent:clamp(Math.round((this.player.x/this.exit.x)*100),0,100),player:{...this.player},checkpoint,gates:this.gates.map(g=>({...g})),platforms:this.platforms.map(p=>({...p})),buds:this.buds.map(b=>({...b})),bouncePads:this.bouncePads.map(b=>({...b})),boostTimer:this.boostTimer,exit:{...this.exit},camera:this.camera,cameraY:this.cameraY,viewW:this.viewW,viewH:this.viewH};
    }
    report() {const s=this.getState();if(s.active)this.emit('onProgress',{percent:s.percent,petals:s.petals,checkpoint:s.checkpoint});}
    requestGate(g) {
      if(g.open||this.pendingGate!==null)return;
      this.pendingGate=g.index;this.safe={x:g.x-125,y:g.y-54};
      this.player.vx=0;this.pause(true);this.report();this.emit('onGate',g.index);
    }
    tryFinish() {
      if(this.finished)return;
      if(this.gates.some(g=>!g.open)){this.emit('onNotice','Apri entrambi i varchi per raccogliere il giglio.');return;}
      this.finished=true;this.pause(true);this.burst(this.exit.x,this.exit.y-70,'#ffd5ef',46);this.report();
      this.emit('onFinish',{petals:this.petals,falls:this.falls,seconds:Math.round(this.elapsed)});
    }
    fall(hit=false) {
      this.falls++;this.burst(this.player.x+18,this.player.y+24,'#edb4d8',12);this.retryCheckpoint();
      if(this.falls===1)this.emit('onNotice',hit?'Salta sopra i nemici. Riparti dal checkpoint.':'Riparti dal checkpoint. Puoi saltare anche in aria.');
      else if(this.falls===3)this.emit('onNotice','Puoi saltare due volte. Nessuna vita da perdere.');
      else if(this.falls%7===0)this.emit('onNotice','Modalità relax disponibile in pausa, se ti va.');
      this.report();
    }
    step(dt) {
      const p=this.player;this.elapsed+=dt;
      this.boostTimer=Math.max(0,this.boostTimer-dt);
      for(const m of this.movers){
        const nx=m.ox+Math.sin(this.elapsed*.85+m.phase)*m.rx,ny=m.oy+Math.sin(this.elapsed*.9+m.phase)*m.ry;
        m.dx=nx-m.x;m.dy=ny-m.y;
        if(p.grounded&&p.support===m.id){p.x+=m.dx;p.y+=m.dy;}
        m.x=nx;m.y=ny;
      }
      for(const bud of this.buds){
        if(!this.bloomed.has(bud.id)&&Math.abs(p.x+p.w/2-bud.x)<42&&Math.abs(p.y+p.h-bud.y)<22){
          this.bloomed.add(bud.id);this.burst(bud.x,bud.y-20,'#daefab',14);this.report();
        }
        if(this.bloomed.has(bud.id)){bud.growth=Math.min(1,bud.growth+dt*2.4);this.platforms.find(q=>q.id===bud.bridge).active=bud.growth>.35;}
      }
      this.bouncePads.forEach(b=>{b.cooldown=Math.max(0,b.cooldown-dt);b.pulse=Math.max(0,b.pulse-dt*2);});
      p.invincible=Math.max(0,p.invincible-dt);this.jumpBuffer=Math.max(0,this.jumpBuffer-dt);
      const dir=(this.keys.right?1:0)-(this.keys.left?1:0),maxSpeed=this.boostTimer>0?430:this.gentle?235:252;
      if(dir){p.vx=lerp(p.vx,dir*maxSpeed,Math.min(1,dt*13));p.dir=dir;}else p.vx=lerp(p.vx,0,Math.min(1,dt*(this.boostTimer>0?3:18)));
      if(p.grounded)p.coyote=.11;else p.coyote=Math.max(0,p.coyote-dt);
      if(this.jumpBuffer>0&&(p.grounded||p.coyote>0||p.jumps<2)){
        const first=p.grounded||p.coyote>0;p.jumps=first?1:Math.max(2,p.jumps+1);
        p.vy=-(this.level===3?(first?445:380):(first?(this.gentle?645:594):(this.gentle?580:545)));
        if(this.level===3&&!first){this.boostTimer=.52;p.vx=p.dir*430;this.burst(p.x,p.y+30,'#b9ecff',16);}
        p.grounded=false;p.coyote=0;this.jumpBuffer=0;this.burst(p.x+17,p.y+p.h,'#eac2f5',first?4:8);
      }
      const gravity=this.level===3?750:1510;
      p.vy=Math.min(p.vy+gravity*dt,780);const prevBottom=p.y+p.h;
      p.x=clamp(p.x+p.vx*dt,8,this.worldW-p.w-10);p.y+=p.vy*dt;p.grounded=false;p.support=null;
      for(const platform of this.platforms){
        if(platform.active!==false && p.vy>=0 && p.x+p.w>platform.x+1 && p.x<platform.x+platform.w-1 && prevBottom<=platform.y+Math.max(2,Math.abs(platform.dy||0)+2) && p.y+p.h>=platform.y){
          p.y=platform.y-p.h;p.vy=0;p.grounded=true;p.jumps=0;p.support=platform.id;
        }
      }
      for(const pad of this.bouncePads){
        if(p.grounded&&pad.cooldown===0&&Math.abs(p.x+p.w/2-pad.x)<36&&Math.abs(p.y+p.h-pad.y)<10){
          p.vy=-760;p.grounded=false;p.jumps=1;p.coyote=0;p.support=null;pad.cooldown=.6;pad.pulse=1;this.burst(pad.x,pad.y-12,'#c8eeed',14);
        }
      }
      if(p.grounded){const ground=this.platforms.find(q=>q.id===p.support&&q.base);if(ground&&p.x>ground.x+65&&p.x<ground.x+ground.w-110&&ground.x>this.safe.x){this.safe={x:ground.x+70,y:ground.y-p.h};this.report();}}
      for(const g of this.gates){
        if(!g.open&&p.x+p.w>g.x-18&&p.x<g.x+40){p.x=g.x-18-p.w;p.vx=Math.min(0,p.vx);}
        if(!g.open&&this.pendingGate===null&&p.x+p.w>g.x-105&&p.x<g.x+15&&p.y+p.h>g.y-190){this.requestGate(g);return;}
      }
      if(p.y>700){this.fall();return;}
      if(p.invincible===0){
        for(const h of this.hazards){
          const hx=h.base+Math.sin(this.elapsed*h.speed+h.p)*h.range,hy=h.y;
          if(p.x+p.w>hx-18&&p.x<hx+18&&p.y+p.h>hy-48&&p.y<hy-5){this.fall(true);return;}
        }
      }
      for(const item of this.items){
        if(this.collected.has(item.id))continue;
        const d=Math.hypot((p.x+p.w/2)-item.x,(p.y+p.h/2)-item.y);
        if(d<37){
          this.collected.add(item.id);this.burst(item.x,item.y,item.kind==='tea'?'#e8eead':'#fbc2ee',14);
          if(item.kind==='secret'){this.secret=true;this.emit('onSecret',`level-${this.level}`);}
          else {this.petals++;this.emit('onCollect',{kind:item.kind,id:item.id});}
          this.report();
        }
      }
      if(p.x+p.w/2>this.exit.x-43&&p.y+p.h>this.exit.y-140&&p.y<this.exit.y+20)this.tryFinish();
      const target=clamp(p.x-this.viewW*.32+clamp(p.vx*.13,-35,35),0,Math.max(0,this.worldW-this.viewW));
      this.camera=lerp(this.camera,target,Math.min(1,dt*6));
      this.cameraY=lerp(this.cameraY,clamp(p.y-this.viewH*.53,0,this.cameraMaxY),Math.min(1,dt*5));
      this.progressTick+=dt;if(this.progressTick>.4){this.progressTick=0;this.report();}
    }
    frame(now) {
      if(this.destroyed)return;
      const dt=this.lastTime?Math.min((now-this.lastTime)/1000,.075):0;this.lastTime=now;
      if(!this.reducedMotion)this.phase+=dt;
      if(this.active&&!this.paused&&!this.finished){this.acc=Math.min(this.acc+dt,.08);let n=0;while(this.acc>=1/60&&n++<5){this.step(1/60);this.acc-=1/60;if(this.paused)break;}}
      for(let i=this.particles.length-1;i>=0;i--){const q=this.particles[i];q.life-=dt;if(q.life<=0){this.particles.splice(i,1);continue;}q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=180*dt;}
      if(this.active)this.render();this.raf=requestAnimationFrame(this.boundFrame);
    }
    burst(x,y,color,n) {if(this.reducedMotion)n=Math.min(n,5);for(let i=0;i<n&&this.particles.length<100;i++){const a=seed(i+this.phase*40)*TAU,v=40+seed(i+this.phase*29)*90;this.particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-30,r:2+seed(i+2)*3,life:.35+seed(i+4)*.45,color});}}
    makeSky() {
      if(!this.active)return;
      this.sky=document.createElement('canvas');this.sky.width=Math.max(1,Math.ceil(this.viewW));this.sky.height=600;
      const c=this.sky.getContext('2d'),w=this.viewW,t=this.theme;
      const g=c.createLinearGradient(0,0,0,600);t.sky.forEach((v,i)=>g.addColorStop(i/2,v));c.fillStyle=g;c.fillRect(0,0,w,600);
      const glow=(x,y,r,color)=>{const a=c.createRadialGradient(x,y,1,x,y,r);a.addColorStop(0,color);a.addColorStop(1,'transparent');c.fillStyle=a;c.fillRect(x-r,y-r,r*2,r*2);};
      if(this.level===3){
        c.save();c.translate(w*.56,245);c.rotate(-.45);c.scale(1.6,.58);glow(0,0,Math.max(w*.4,360),'#7f42aa95');glow(-110,85,280,'#bb57c55a');glow(100,-90,260,'#4153bb6a');c.restore();
        glow(w*.23,210,200,'#416ac632');glow(w*.79,130,150,'#cc6fa837');
      } else {glow(w*.74,145,190,this.level===2?'#ffbfac55':'#d4b1f035');glow(w*.18,350,240,'#a56bc52a');}
      for(let i=0;i<Math.ceil(w/9);i++){
        const x=seed(i+5)*w,y=seed(i+71)*360;
        ellipse(c,x,y,.5+seed(i+56)*1.2,.5+seed(i+56)*1.2,`rgba(255,234,255,${.18+seed(i+101)*.5})`);
      }
      if(this.level!==3){
        const mx=w*.75,my=this.level===2?154:113,mr=this.level===2?69:46;
        const mg=c.createLinearGradient(mx,my-mr,mx,my+mr);mg.addColorStop(0,'#fff0df');mg.addColorStop(1,this.level===2?'#e6a4b0':'#cba8e0');ellipse(c,mx,my,mr,mr,mg);
        if(this.level===0)ellipse(c,mx+19,my-14,mr*.93,mr*.93,'#3a2759');
        if(this.level===1){line(c,mx-mr,my+12,mx+mr,my+12,'#523154',5);line(c,mx-mr,my+25,mx+mr,my+25,'#523154',7);line(c,mx-mr,my+37,mx+mr,my+37,'#523154',9);}
        if(this.level===2)ellipse(c,mx-9,my-8,mr*.81,mr*.81,'#4f2b52');
      }
    }
    render() {
      if(!this.ctx||!this.active)return;
      const c=this.ctx;c.setTransform(this.scale,0,0,this.scale,0,0);c.globalAlpha=1;c.lineCap='round';c.lineJoin='round';
      c.drawImage(this.sky,0,0,this.viewW,this.viewH);c.save();c.translate(0,-this.cameraY*.28);this.drawBack(c);c.restore();
      c.save();c.translate(-this.camera,-this.cameraY);
      this.drawScenery(c);
      for(const p of this.platforms)if(this.visible(p.x,p.w))this.drawPlatform(c,p);
      this.drawMechanisms(c);this.drawWayfinding(c);
      for(const it of this.items)if(!this.collected.has(it.id)&&this.visible(it.x,30))this.drawItem(c,it);
      for(const h of this.hazards){const x=h.base+Math.sin(this.elapsed*h.speed+h.p)*h.range;if(this.visible(x,60))this.drawHazard(c,x,h.y,h);}
      for(const g of this.gates)if(this.visible(g.x-60,130))this.drawGate(c,g);
      if(this.visible(this.exit.x-85,170))this.drawExit(c);
      this.drawPlayer(c,this.player.x+this.player.w/2,this.player.y+this.player.h,1,this.player.dir,this.player.grounded?Math.abs(this.player.vx)/250:0,false);
      for(const q of this.particles){c.globalAlpha=clamp(q.life*2,0,1);star(c,q.x,q.y,q.r,q.color,q.life*3);}c.globalAlpha=1;
      c.restore();
      const vign=c.createLinearGradient(0,this.viewH-50,0,this.viewH);vign.addColorStop(0,'transparent');vign.addColorStop(1,'#110e2548');c.fillStyle=vign;c.fillRect(0,this.viewH-50,this.viewW,50);
    }
    visible(x,w=0) {return x+w>this.camera-100&&x<this.camera+this.viewW+100;}
    drawBack(c) {
      const w=this.viewW,cam=this.camera,phase=this.phase;
      for(let i=0;i<22;i++){const s=this.stars[i],x=(s.x-cam*.12)%(w+100);c.globalAlpha=.3+.35*(Math.sin(phase*.9+s.p)+1)/2;star(c,x,s.y,s.r+1,'#fce9ff',0);}c.globalAlpha=1;
      if(this.level===0){
        for(let layer=0;layer<2;layer++){
          c.fillStyle=layer?'#3b2d51':'#332743';c.beginPath();c.moveTo(0,600);
          for(let x=-100;x<w+150;x+=50){const wx=x+cam*(layer?.24:.12);const y=350+layer*60+Math.sin(wx*.006)*35+Math.sin(wx*.013)*14;c.lineTo(x,y);}c.lineTo(w+100,600);c.closePath();c.fill();
        }
        for(let i=0;i<30;i++){const x=i*165-cam*.35;if(x<-100||x>w+100)continue;const h=85+seed(i+67)*95;line(c,x,445,x+8,445-h,'#493254',6);ellipse(c,x-20,445-h*.55,37,13,'#463051',.5);ellipse(c,x+27,445-h*.75,38,14,'#463051',-.5);}
        for(let i=0;i<24;i++){const x=(i*161+seed(i)*90-cam*.5)%(w+120);ellipse(c,x,260+seed(i+23)*210,2,2,`rgba(230,226,173,${.25+(Math.sin(phase+i)+1)*.22})`);}
      }else if(this.level===1){
        for(let layer=0;layer<2;layer++)for(let i=0;i<36;i++){
          const x=i*125-cam*(layer?.38:.17)-70,bw=70+seed(i+9)*63,h=95+seed(i+28+layer*7)*180,base=440+layer*45;
          if(x+bw<0||x>w)continue;c.fillStyle=layer?'#34243f':'#2b223b';c.fillRect(x,base-h,bw,h+170);
          if(i%4===0){line(c,x+bw/2,base-h,x+bw/2,base-h-25,'#6b4363',2);ellipse(c,x+bw/2,base-h-27,2,2,'#f0a8cf');}
          for(let row=0;row<Math.floor(h/30)-1;row++)for(let col=0;col<3;col++)if(seed(row+col*17+i*6)>.35){c.fillStyle=col%2?'#c586a333':'#a695c32d';c.fillRect(x+13+col*22,base-h+20+row*30,8,12);}
        }
        c.strokeStyle='#b777a25a';c.lineWidth=1;c.beginPath();c.moveTo(0,250);c.bezierCurveTo(w*.3,320,w*.7,230,w,275);c.stroke();
        for(let i=0;i<7;i++){const x=i*w/6;ellipse(c,x,270+Math.sin(i)*15,3,5,i%2?'#eec9e6':'#e6d4a7');}
      }else if(this.level===2){
        for(let layer=0;layer<3;layer++){
          c.fillStyle=['#87506c','#a46b83','#b98091'][layer];c.beginPath();c.moveTo(0,600);
          for(let x=-60;x<w+90;x+=25)c.lineTo(x,380+layer*43+Math.sin((x+cam*(.1+layer*.09))*.006+layer)*37);
          c.lineTo(w+70,600);c.closePath();c.fill();
        }
        for(let i=0;i<5;i++){const x=i*630+210-cam*.3,y=423,s=150+seed(i+6)*90;if(x+s<-100||x-s>w+100)continue;c.fillStyle='#67405e';c.beginPath();c.moveTo(x-s,y);c.lineTo(x,y-s*1.1);c.lineTo(x+s,y);c.closePath();c.fill();c.fillStyle='#8c5773';c.beginPath();c.moveTo(x,y-s*1.1);c.lineTo(x+s,y);c.lineTo(x+s*.17,y);c.closePath();c.fill();}
      }else{
        for(let i=22;i<this.stars.length;i++){const s=this.stars[i],x=s.x-cam*.24;if(x<-30||x>w+30)continue;c.globalAlpha=.25+(Math.sin(phase*.6+s.p)+1)*.28;ellipse(c,x,s.y,s.r,s.r,'#e8dffc');}c.globalAlpha=1;
        this.drawPlanet(c,225-cam*.12,135,59,'#c1a4de','#6f559b',-.4,true);
        this.drawPlanet(c,780-cam*.18,240,101,'#586caa','#353c77',.4,false);
        this.drawPlanet(c,1390-cam*.3,130,81,'#d89acb','#88528c',-.2,true);
        for(let i=0;i<4;i++){const x=i*360+30-cam*.22,y=360+seed(i+18)*70;ellipse(c,x,y,37,13,'#61547255',-.3);}
        if(!this.reducedMotion){const cycle=(phase*.1)%1;if(cycle<.12){const x=w*.9-cycle*1800,y=65+cycle*550;const g=c.createLinearGradient(x,y,x+100,y-30);g.addColorStop(0,'#f9e9fd');g.addColorStop(1,'transparent');line(c,x,y,x+100,y-30,g,2);}}
      }
    }
    drawPlanet(c,x,y,r,a,b,angle,ring) {
      c.save();c.translate(x,y);c.rotate(angle);if(ring){c.strokeStyle='#bdadd857';c.lineWidth=10;c.beginPath();c.ellipse(0,0,r*1.6,r*.38,0,Math.PI,TAU);c.stroke();}
      const g=c.createRadialGradient(-r*.4,-r*.45,3,0,0,r);g.addColorStop(0,a);g.addColorStop(1,b);ellipse(c,0,0,r,r,g);
      c.save();c.beginPath();c.arc(0,0,r,0,TAU);c.clip();c.globalAlpha=.15;for(let k=-2;k<=3;k++){c.strokeStyle='#f1d8f3';c.lineWidth=8;c.beginPath();c.ellipse(0,k*r*.28,r*1.1,r*.35,-.2,0,Math.PI);c.stroke();}c.restore();
      if(ring){c.strokeStyle='#d5c3e4b0';c.lineWidth=10;c.beginPath();c.ellipse(0,0,r*1.6,r*.38,0,0,Math.PI);c.stroke();}c.restore();
    }
    drawScenery(c) {
      if(this.level===0){
        for(const x of [27,860,1630,2446]){const y=this.groundAt(x);if(y&&this.visible(x,60)){lily(c,x,y+3,71,this.phase+x);lily(c,x+21,y+7,46,this.phase+x+.8);}}
        if(this.visible(86,177)){
          c.fillStyle='#49364f';round(c,86,424,177,53,9);c.fill();
          c.strokeStyle='#8b7995';c.lineWidth=3;c.beginPath();c.moveTo(92,422);c.quadraticCurveTo(175,412,257,422);c.stroke();
          this.drawPlant(c,126,423);this.drawPlayer(c,218,423,1,1,0,true);
          line(c,94,407,255,407,'#9883a4',3);
          for(let xx=95;xx<=255;xx+=20)line(c,xx,406,xx,463,'#6e587e',2);
        }
      }else if(this.level===1){
        if(this.visible(110,180))this.drawTorii(c,205,520,174);
        if(this.visible(1430,590))this.drawRecordWall(c);
        if(this.visible(1894,76)){
          c.fillStyle='#2f263d';round(c,1894,25,76,109,30);c.fill();c.strokeStyle='#715979';c.lineWidth=3;c.stroke();
          this.drawDoorman(c,1932,134);line(c,1894,119,1970,119,'#a589ac',3);
          for(let xx=1900;xx<1970;xx+=14)line(c,xx,119,xx,134,'#80658d',2);
        }
        for(const x of [718,2245,2615]){const y=this.groundAt(x);if(!y||!this.visible(x,90))continue;
          line(c,x,y,x,y-192,'#665073',6);line(c,x,y-190,x+42,y-190,'#8d6b92',5);
          c.save();c.translate(x+39,y-162);c.rotate(Math.sin(this.phase+x)*.025);
          const gl=c.createRadialGradient(0,0,2,0,0,44);gl.addColorStop(0,'#f3c5d746');gl.addColorStop(1,'transparent');ellipse(c,0,0,44,44,gl);
          const lantern=c.createLinearGradient(-17,0,17,0);lantern.addColorStop(0,'#b774a5');lantern.addColorStop(.5,'#f6cee1');lantern.addColorStop(1,'#c882ac');ellipse(c,0,0,17,25,lantern);
          for(const xx of [-9,0,9]){c.strokeStyle='#99638555';c.lineWidth=1;c.beginPath();c.ellipse(xx*.4,0,Math.abs(xx)+4,23,0,0,TAU);c.stroke();}
          line(c,-10,-22,10,-22,'#72506c',4);line(c,-10,22,10,22,'#72506c',4);line(c,0,24,0,37,'#d8a1c1',2);c.restore();
        }
      }else if(this.level===2){
        for(const x of [20,840]){const y=this.groundAt(x);if(!this.visible(x-25,50)||!y)continue;
          const g=c.createLinearGradient(x-18,0,x+18,0);g.addColorStop(0,'#b983a0');g.addColorStop(.5,'#e3bac2');g.addColorStop(1,'#94647f');c.fillStyle=g;
          c.beginPath();c.moveTo(x-18,y);c.lineTo(x-13,y-151);c.lineTo(x,y-178);c.lineTo(x+13,y-151);c.lineTo(x+18,y);c.closePath();c.fill();
          for(let k=0;k<4;k++){const yy=y-126+k*26;ellipse(c,x,yy,6,4,'#97647e');line(c,x,yy+5,x,yy+12,'#97647e',2);}
        }
        if(this.visible(255,210)){
          const x=265,y=520;c.fillStyle='#80556e';round(c,x,y-92,182,92,6);c.fill();
          c.fillStyle='#d8a9b6';c.beginPath();c.moveTo(x-10,y-95);c.lineTo(x+10,y-138);c.lineTo(x+172,y-138);c.lineTo(x+192,y-95);c.closePath();c.fill();
          for(let i=0;i<5;i++){c.fillStyle=i%2?'#bb87a6':'#e6bfc6';c.fillRect(x-8+i*40,y-96,40,13);}
          text(c,'TÈ AL LIMONE',x+91,y-111,18,'#fff2bf');
          if(window.NLUArt){window.NLUArt.tea(c,x+55,y-11,{scale:.8,time:this.phase});window.NLUArt.tea(c,x+132,y-11,{scale:.8,time:this.phase+.4});}
        }
        if(this.visible(2044,122)){
          c.fillStyle='#744d68';round(c,2044,304,122,160,51);c.fill();c.strokeStyle='#bd95a9';c.lineWidth=6;c.stroke();
          c.fillStyle='#b58a9e';round(c,2053,432,104,33,4);c.fill();this.drawMummy(c,2105,432);
        }
      }else{
        const points=[[470,230],[540,193],[597,229],[570,270],[470,230]];
        for(let j=0;j<3;j++)for(let i=0;i<points.length-1;i++){
          const a=points[i],b=points[i+1],offset=j*800;if(!this.visible(a[0]+offset,160))continue;
          line(c,a[0]+offset,a[1],b[0]+offset,b[1],'#b0a7db32',1.2);star(c,a[0]+offset,a[1],3.6,'#dbd1f3');
        }
      }
    }
    drawRecordWall(c){
      const x=1460,y=134,w=535,h=302;
      c.fillStyle='#251c39';round(c,x,y,w,h,15);c.fill();c.strokeStyle='#80638e';c.lineWidth=3;c.stroke();
      const neon=c.createLinearGradient(x,0,x+w,0);neon.addColorStop(0,'#bce4ee');neon.addColorStop(.5,'#ffc7e4');neon.addColorStop(1,'#d3b1fa');
      text(c,'NASTY RECORDS',x+w/2,y+29,23,neon,'center','800');
      const titles=['Globo','Memoria','A quanto pare','Junkie walk 2','Maturo','Get Up','Nasty Bounce','Vice city'];
      const colors=['#9f88ca','#bb86ac','#7c9dab','#ce9b95','#c0af89','#859ba9','#a980bd','#d58cb6'];
      for(let i=0;i<8;i++){
        const col=i%4,row=Math.floor(i/4),xx=x+20+col*128,yy=y+51+row*122;
        c.fillStyle='#171429';round(c,xx-9,yy-3,116,114,4);c.fill();
        const sleeve=c.createLinearGradient(xx,yy,xx+98,yy+83);sleeve.addColorStop(0,colors[i]);sleeve.addColorStop(1,'#45334f');c.fillStyle=sleeve;c.fillRect(xx,yy,98,84);
        if(window.NLUArt)window.NLUArt.vinyl(c,xx+49,yy+41,{scale:1.25,time:0,color:colors[i]});else{ellipse(c,xx+49,yy+41,31,31,'#282236');ellipse(c,xx+49,yy+41,9,9,colors[i]);}
        if(i===0){c.strokeStyle='#f5d8ff';c.lineWidth=1;c.beginPath();c.ellipse(xx+49,yy+41,11,23,0,0,TAU);c.stroke();}
        text(c,titles[i],xx+49,yy+99,16,'#f7e9f4','center','600');
      }
    }
    drawMechanisms(c){
      for(const bud of this.buds){if(!this.visible(bud.x,60))continue;const grown=this.bloomed.has(bud.id);
        ellipse(c,bud.x,bud.y+2,33,7,'#2b253e66');
        const gl=c.createRadialGradient(bud.x,bud.y-9,2,bud.x,bud.y-9,45);gl.addColorStop(0,grown?'#dcefab55':'#f4bddd66');gl.addColorStop(1,'transparent');ellipse(c,bud.x,bud.y-9,45,37,gl);
        if(window.NLUArt)window.NLUArt.lily(c,bud.x,bud.y-12,{scale:grown?.4:.29,time:this.phase,headOnly:true});else ellipse(c,bud.x,bud.y-11,23,12,grown?'#c8e4a0':'#e4acd4');
        if(!grown){line(c,bud.x,bud.y-49,bud.x,bud.y-35,'#f4d3eb',2);line(c,bud.x-5,bud.y-40,bud.x,bud.y-35,'#f4d3eb',2);line(c,bud.x+5,bud.y-40,bud.x,bud.y-35,'#f4d3eb',2);}
      }
      for(const pad of this.bouncePads){if(!this.visible(pad.x-35,70))continue;
        c.save();c.translate(pad.x,pad.y-7);c.scale(1,.32+pad.pulse*.13);
        if(window.NLUArt)window.NLUArt.vinyl(c,0,0,{scale:1.4,time:this.phase,color:'#b0e4df'});else ellipse(c,0,0,34,34,'#bcebe5');c.restore();
        for(let i=0;i<2;i++){const yy=pad.y-28-i*12-Math.sin(this.phase*2)*3;line(c,pad.x-7,yy+5,pad.x,yy,'#cbf6ed',2);line(c,pad.x,yy,pad.x+7,yy+5,'#cbf6ed',2);}
      }
      for(const m of this.movers){if(!this.visible(m.ox-m.rx,m.w+m.rx*2))continue;
        if(this.level===2){c.save();c.setLineDash([3,10]);line(c,m.ox-m.rx,m.oy+49,m.ox+m.rx+m.w,m.oy+49,'#f1c6c55a',2);c.restore();}
        else{c.strokeStyle='#bca5ed38';c.lineWidth=1;c.beginPath();c.ellipse(m.ox+m.w/2,m.oy+18,m.w*.6,m.ry+22,0,0,TAU);c.stroke();}
      }
    }
    groundAt(x) {const p=this.platforms.find(q=>q.base&&x>=q.x&&x<=q.x+q.w);return p?p.y:null;}
    drawPlatform(c,p) {
      const {x,y,w}=p;
      if(p.leaf){const bud=this.buds.find(b=>b.bridge===p.id),growth=bud?bud.growth:0;if(growth<=0)return;c.save();c.globalAlpha=Math.min(1,growth*2);for(let i=0;i<Math.ceil(w/46);i++){const xx=x+23+i*46,open=clamp(growth*2-i*.08,0,1);if(!open)continue;c.save();c.translate(xx,y+4);c.scale(open,open);const g=c.createLinearGradient(0,-9,0,16);g.addColorStop(0,'#c6dfa1');g.addColorStop(1,'#5d8c76');ellipse(c,0,0,30,11,g,i%2?.12:-.12);line(c,-23,0,24,0,'#e8ecc67a',1.2);c.restore();}c.restore();return;}
      if(this.level===3){
        const depth=p.base?90:29;c.fillStyle=p.base?'#47405e':'#66567d';c.beginPath();c.moveTo(x,y+7);c.lineTo(x+14,y);c.lineTo(x+w-14,y);c.lineTo(x+w,y+9);c.lineTo(x+w-17,y+depth*.63);c.lineTo(x+w*.72,y+depth);c.lineTo(x+w*.28,y+depth*.83);c.lineTo(x+14,y+depth*.58);c.closePath();c.fill();
        c.strokeStyle='#aba0cc';c.lineWidth=3;line(c,x+12,y,x+w-12,y,'#b1a1cd',3);
        for(let i=0;i<Math.floor(w/65);i++){const xx=x+20+i*65;ellipse(c,xx,y+19+(i%2)*12,8,5,'#332e4b');}
        c.strokeStyle='#94c9db66';c.lineWidth=2;c.beginPath();c.moveTo(x+16,y+10);c.lineTo(x+w-18,y+10);c.stroke();
        if(p.base)for(let j=0;j<4;j++){const xx=x+30+j*w/4;c.fillStyle=j%2?'#ad90ce':'#729aaa';c.beginPath();c.moveTo(xx,y);c.lineTo(xx+5,y-17);c.lineTo(xx+12,y);c.closePath();c.fill();}
      }else{
        const depth=p.base?150:27,g=c.createLinearGradient(0,y,0,y+depth);g.addColorStop(0,this.theme.soil);g.addColorStop(1,this.level===2?'#6a3f62':'#2e233f');c.fillStyle=g;
        round(c,x,y,w,depth,p.base?8:7);c.fill();c.fillStyle=this.theme.top;round(c,x,y,w,7,3);c.fill();
        if(this.level===0){
          for(let i=0;i<w/22;i++){const xx=x+i*22;line(c,xx,y+3,xx+6,y-7-(i%3)*2,'#91a181',2);}
          if(p.base)for(let i=0;i<w/53;i++){const xx=x+24+i*53;ellipse(c,xx,y+32+seed(i+x)*42,4,2,'#9d79a14a');}
        }else if(this.level===1){
          for(let i=0;i<w/33;i++)line(c,x+i*33,y+10,x+i*33-8,y+22,'#6a476c',1);
          line(c,x+6,y+22,x+w-6,y+22,'#bd7eaa66',1);
          if(p.base)for(let i=0;i<w/68;i++){c.fillStyle=i%3?'#c39ab322':'#d5b4cb44';c.fillRect(x+20+i*68,y+46,22,34);}
        }else{
          for(let i=0;i<w/56;i++){line(c,x+i*56,y+14,x+i*56,y+43,'#aa7993',1);if(p.base){line(c,x+i*56+25,y+44,x+i*56+25,y+78,'#9f6d8b',1);star(c,x+i*56+16,y+25,4,'#e9c4ca',.7);}}
          line(c,x,y+44,x+w,y+44,'#aa7993',1);
        }
      }
    }
    drawWayfinding(c) {
      for(const g of this.gates){if(!this.visible(g.x-145,40))continue;const x=g.x-125;line(c,x,g.y,x,g.y-40,'#d2bbd7',2);c.fillStyle=g.open?'#c3e2b1':'#d2a5d4';c.beginPath();c.moveTo(x,g.y-40);c.lineTo(x+25,g.y-30);c.lineTo(x,g.y-20);c.closePath();c.fill();}
    }
    drawItem(c,it) {
      const bob=this.reducedMotion?0:Math.sin(this.phase*2.5+it.x)*5;c.save();c.translate(it.x,it.y+bob);
      if(it.kind==='secret'){
        c.rotate(-.08);c.fillStyle='#f5deed';round(c,-19,-23,38,46,4);c.fill();c.fillStyle='#704d84';round(c,-14,-18,28,31,2);c.fill();star(c,0,-3,10,'#f5b5d3',.1);line(c,-10,17,10,17,'#ad819d',2);star(c,26,-23,4,'#f6d8f4',this.phase);
      }else if(it.kind==='tea'){
        if(window.NLUArt){window.NLUArt.tea(c,0,19,{scale:.85,time:this.phase});c.restore();return;}
        c.fillStyle='#e1e1ac';round(c,-10,-15,20,30,5);c.fill();line(c,-7,-11,7,-11,'#8b8b6a',2);ellipse(c,0,1,7,7,'#f5e9b4');line(c,-4,-3,4,5,'#bab986',1);line(c,0,-6,0,8,'#bab986',1);star(c,16,-15,3,'#ebedbb');
      }else{
        if(this.level===3){star(c,0,0,13,'#e8dcff',0);star(c,0,0,6,'#fff3ce',0);c.restore();return;}
        if(window.NLUArt){window.NLUArt.lily(c,0,0,{scale:.36,time:this.phase,headOnly:true});c.restore();return;}
        c.fillStyle='#f6b3de';for(let k=0;k<5;k++){c.save();c.rotate(k*TAU/5);ellipse(c,0,-7,5,10,'#f3badf');c.restore();}ellipse(c,0,0,4,4,'#ffebb7');
      }
      c.restore();
    }
    drawGate(c,g) {
      const x=g.x,y=g.y,open=g.open;
      c.save();c.translate(x,y);c.globalAlpha=open?.55:1;
      if(!open){const gl=c.createRadialGradient(0,-75,5,0,-75,90);gl.addColorStop(0,'#d2abed33');gl.addColorStop(1,'transparent');c.fillStyle=gl;c.fillRect(-95,-170,190,190);}
      c.strokeStyle=open?'#b4d5bf':'#bb94cf';c.lineWidth=8;c.beginPath();c.moveTo(-41,-2);c.lineTo(-41,-84);c.bezierCurveTo(-41,-148,41,-148,41,-84);c.lineTo(41,-2);c.stroke();
      c.strokeStyle=open?'#e0f7dc':'#f5caee';c.lineWidth=2;c.beginPath();c.moveTo(-38,-2);c.lineTo(-38,-84);c.bezierCurveTo(-38,-141,38,-141,38,-84);c.lineTo(38,-2);c.stroke();
      if(!open){
        c.fillStyle='#c7ace824';round(c,-34,-101,68,101,24);c.fill();
        for(let i=0;i<5;i++){const yy=-16-i*23+Math.sin(this.phase*1.7+i)*4;line(c,-32,yy,32,yy,'#d9bdf52b',2);}
        c.save();c.translate(0,-77);c.rotate(Math.PI/4);c.fillStyle='#9e77bd';round(c,-17,-17,34,34,6);c.fill();c.restore();text(c,'?',0,-78,24,'#f9e6f7');
      }else star(c,0,-117,9,'#d8f0d0',0);
      c.restore();
    }
    drawExit(c) {
      const {x,y}=this.exit;const unlocked=this.gates.every(g=>g.open),a=this.reducedMotion?0:Math.sin(this.phase)*3;
      c.save();c.translate(x,y);const glow=c.createRadialGradient(0,-74,5,0,-74,102);glow.addColorStop(0,unlocked?'#f0c2ee45':'#c3aed51c');glow.addColorStop(1,'transparent');c.fillStyle=glow;c.fillRect(-110,-180,220,220);
      c.strokeStyle=unlocked?'#efc0e8':'#a389b5';c.lineWidth=2;c.beginPath();c.ellipse(0,-75,56,80,0,0,TAU);c.stroke();
      for(let i=0;i<7;i++){const ang=i*TAU/7+this.phase*.12;star(c,Math.cos(ang)*58,-75+Math.sin(ang)*81,3,'#edc4e9',ang);}
      if(this.level===3){
        c.save();c.translate(0,-231+a);c.strokeStyle='#bc97e0';c.lineWidth=1.4;c.beginPath();c.arc(0,0,25,0,TAU);c.stroke();
        c.beginPath();c.ellipse(0,0,12,25,0,0,TAU);c.stroke();c.beginPath();c.ellipse(0,0,25,9,0,0,TAU);c.stroke();
        c.fillStyle='#e5a6da';c.beginPath();c.moveTo(0,11);c.bezierCurveTo(-23,-3,-8,-17,0,-7);c.bezierCurveTo(8,-17,23,-3,0,11);c.fill();c.restore();
      }
      lily(c,0,-14+a,91,this.phase);c.restore();
    }
    drawPlayer(c,x,bottom,s=1,dir=1,run=0,npc=false) {
      if(window.NLUArt){c.save();if(!npc&&this.player.invincible>0)c.globalAlpha=.65+Math.sin(this.phase*10)*.2;window.NLUArt.rat(c,x,bottom,{scale:s,dir,time:this.phase,walk:run,airborne:!npc&&!this.player.grounded,sir:npc});c.restore();return;}
      if(!npc&&this.player.invincible>0&&Math.floor(this.phase*12)%3===0)return;
      const step=Math.sin(this.phase*15)*run;c.save();c.translate(x,bottom);c.scale(s*dir,s);
      ellipse(c,0,3,21,4,'#1913264d');
      c.strokeStyle='#d79ab9';c.lineWidth=4;c.beginPath();c.moveTo(-13,-12);c.bezierCurveTo(-39,-8,-35,-35,-48,-25+step*2);c.stroke();
      ellipse(c,-9,-3,9,4,'#f3bbd1',step*.4);ellipse(c,11,-3,9,4,'#f3bbd1',-step*.4);
      ellipse(c,-1,-21,18,23,'#da94bb',-.09);ellipse(c,3,-19,10,16,'#f0b5cf',-.1);
      ellipse(c,-10,-45,12,14,'#e8a4c5');ellipse(c,-10,-45,7,9,'#b86d9a');ellipse(c,7,-46,12,14,'#f1b2d2');ellipse(c,7,-46,7,9,'#c77ba6');
      ellipse(c,7,-34,19,15,'#efb1cf');ellipse(c,21,-29,15,9,'#f5c4dc',-.1);ellipse(c,33,-30,4,3,'#995677');
      ellipse(c,13,-39,5,6,'#fff3ed');ellipse(c,15,-39,2.4,3.5,'#33213f');ellipse(c,15.8,-40,1,1,'#fff');
      line(c,27,-27,40,-25,'#edc8d9',1);line(c,27,-25,39,-21,'#edc8d9',1);
      c.fillStyle='#7d5a9f';round(c,-10,-27,25,7,3);c.fill();c.beginPath();c.moveTo(-9,-24);c.lineTo(-20,-10);c.lineTo(-10,-11);c.lineTo(-2,-25);c.fill();
      if(npc){c.fillStyle='#45344f';c.fillRect(-15,-60,30,5);round(c,-10,-77,20,19,3);c.fill();line(c,-9,-61,9,-61,'#bd91c2',3);}else{
        c.strokeStyle='#6a4d85';c.lineWidth=3;c.beginPath();c.arc(-1,-39,18,Math.PI,TAU);c.stroke();c.fillStyle='#b8a3d5';round(c,-20,-42,7,15,3);c.fill();
      }
      c.restore();
    }
    drawHazard(c,x,y,h) {
      if(window.NLUArt){window.NLUArt.enemy(c,x,y,{kind:['garden','kyoto','egypt','space'][this.level],scale:.9,time:this.phase,dir:Math.cos(this.elapsed*h.speed+h.p)>0?1:-1});return;}
      c.save();c.translate(x,y);const moving=Math.cos(this.elapsed*h.speed+h.p)>0?1:-1;c.scale(moving,1);
      ellipse(c,0,3,20,4,'#1b183042');
      if(this.level===0){
        c.fillStyle='#b0bb96';round(c,-14,-44,28,27,9);c.fill();c.fillStyle='#6b6686';round(c,-12,-21,25,20,5);c.fill();
        ellipse(c,4,-33,7,6,'#e0dfc6');ellipse(c,7,-33,2.2,2.5,'#49435b');line(c,-7,-23,8,-22,'#6d765f',2);line(c,-6,-1,-8,4,'#8e927c',5);line(c,8,-1,11,4,'#8e927c',5);
      }else if(this.level===1){
        c.fillStyle='#ae93b8';c.beginPath();c.moveTo(-20,-4);c.bezierCurveTo(-25,-51,25,-51,20,-4);c.lineTo(10,-11);c.lineTo(0,-3);c.lineTo(-10,-11);c.closePath();c.fill();ellipse(c,-6,-26,3,5,'#3d3156');ellipse(c,6,-26,3,5,'#3d3156');
      }else if(this.level===2){
        ellipse(c,0,-18,20,17,'#725674');ellipse(c,1,-21,15,10,'#a68baa');line(c,-20,-11,-28,-8,'#d2b0ba',3);line(c,20,-11,28,-8,'#d2b0ba',3);line(c,-20,-20,-27,-26,'#d2b0ba',3);line(c,20,-20,27,-26,'#d2b0ba',3);ellipse(c,8,-24,3,3,'#edddb7');
      }else{
        c.rotate(this.phase*.4);c.fillStyle='#8e7fa6';c.beginPath();for(let i=0;i<9;i++){const a=i*TAU/9,r=18+(i%3)*3;i?c.lineTo(Math.cos(a)*r,Math.sin(a)*r-22):c.moveTo(Math.cos(a)*r,Math.sin(a)*r-22);}c.closePath();c.fill();ellipse(c,-4,-27,5,4,'#62577c');ellipse(c,8,-18,4,4,'#62577c');
      }
      c.restore();
    }
    drawPlant(c,x,y) {
      if(window.NLUArt){window.NLUArt.plant(c,x,y,{scale:1,time:this.phase});return;}
      c.save();c.translate(x,y);line(c,0,0,-1,-32,'#85a27d',5);ellipse(c,-10,-9,14,5,'#91ac85',.5);ellipse(c,10,-15,14,5,'#91ac85',-.5);ellipse(c,-4,-40,18,17,'#b0c896');ellipse(c,16,-39,12,9,'#a4bc88');ellipse(c,22,-39,5,6,'#617f65');ellipse(c,-4,-46,3,4,'#465c51');c.restore();
    }
    drawTorii(c,x,y,h) {c.save();c.translate(x,y);c.fillStyle='#a76d91';c.fillRect(-54,-h,11,h);c.fillRect(43,-h,11,h);c.fillRect(-70,-h+21,140,10);c.beginPath();c.moveTo(-85,-h-3);c.quadraticCurveTo(0,-h+9,85,-h-3);c.lineTo(78,-h+9);c.quadraticCurveTo(0,-h+19,-78,-h+9);c.closePath();c.fill();line(c,-60,-h+33,60,-h+33,'#d59ab9',3);c.fillStyle='#d9b6ce';c.fillRect(-10,-h+17,20,28);text(c,'夜',0,-h+31,16,'#865876');c.restore();}
    drawSign(c,x,y,str,angle) {c.save();c.translate(x,y);c.rotate(angle);line(c,0,0,0,-73,'#b998be',4);c.fillStyle='#4b365e';round(c,-91,-104,182,40,5);c.fill();c.strokeStyle='#a786b5';c.lineWidth=1;c.stroke();text(c,str,0,-84,11,'#e7cdec');c.restore();}
    drawMummy(c,x,y) {if(window.NLUArt){window.NLUArt.mummy(c,x,y,{scale:1,time:this.phase});return;}c.save();c.translate(x,y);ellipse(c,0,-31,32,36,'#d3b8c0');ellipse(c,0,-65,22,20,'#e6c9cf');for(let i=0;i<5;i++)line(c,-22,-63+i*12,24,-58+i*12,'#ae8ba3',2);c.fillStyle='#634b65';round(c,-14,-70,29,9,4);c.fill();ellipse(c,-7,-66,3,2,'#e5ddb6');ellipse(c,8,-66,3,2,'#e5ddb6');ellipse(c,-18,-2,15,6,'#c8a6b5');ellipse(c,18,-2,15,6,'#c8a6b5');c.restore();}
    drawDoorman(c,x,y) {if(window.NLUArt){window.NLUArt.doorman(c,x,y,{scale:1,time:this.phase});return;}c.save();c.translate(x,y);c.fillStyle='#3c3050';c.beginPath();c.moveTo(-28,0);c.lineTo(-22,-48);c.bezierCurveTo(-34,-96,33,-96,22,-48);c.lineTo(28,0);c.closePath();c.fill();ellipse(c,0,-57,15,19,'#b2a0bf');ellipse(c,-6,-61,3,4,'#4a3b5b');ellipse(c,6,-61,3,4,'#4a3b5b');line(c,-6,-49,6,-49,'#695575',1);c.fillStyle='#b7a1c7';round(c,18,-31,20,27,2);c.fill();line(c,22,-24,33,-24,'#6c557f',2);c.restore();}
    destroy() {this.destroyed=true;this.active=false;cancelAnimationFrame(this.raf);if(this.resizeObserver)this.resizeObserver.disconnect();window.removeEventListener('resize',this.boundResize);}
  }
  window.NastyEngine=NastyEngine;
})();
