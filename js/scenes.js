/* Small silent storybook scenes, drawn with the same art as the game. */
(function(){
  'use strict';
  const TAU=Math.PI*2,W=480,H=300;
  const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
  const ease=n=>{n=clamp(n);return n*n*(3-2*n);};
  const mix=(a,b,p)=>a+(b-a)*p;
  function shape(c,fn,fill,stroke=null,width=1){c.beginPath();fn(c);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
  function oval(c,x,y,rx,ry,fill,stroke=null,width=1,a=0){shape(c,k=>k.ellipse(x,y,rx,ry,a,0,TAU),fill,stroke,width);}
  function line(c,x,y,x2,y2,color,width=1){shape(c,k=>{k.moveTo(x,y);k.lineTo(x2,y2);},null,color,width);}
  function box(c,x,y,w,h,r,fill,stroke=null,width=1){shape(c,k=>{k.moveTo(x+r,y);k.lineTo(x+w-r,y);k.quadraticCurveTo(x+w,y,x+w,y+r);k.lineTo(x+w,y+h-r);k.quadraticCurveTo(x+w,y+h,x+w-r,y+h);k.lineTo(x+r,y+h);k.quadraticCurveTo(x,y+h,x,y+h-r);k.lineTo(x,y+r);k.quadraticCurveTo(x,y,x+r,y);k.closePath();},fill,stroke,width);}
  function gradient(c,x,y,x2,y2,colors){const g=c.createLinearGradient(x,y,x2,y2);colors.forEach((s,i)=>g.addColorStop(i/(colors.length-1),s));return g;}
  function sky(c,colors){c.fillStyle=gradient(c,0,0,0,H,colors);c.fillRect(0,0,W,H);}
  function seed(n){const s=Math.sin(n*127.1+13.7)*43758.5453;return s-Math.floor(s);}
  function stars(c,t,n=35){for(let i=0;i<n;i++){const x=15+seed(i+9)*450,y=16+seed(i+71)*174,r=.5+seed(i+1)*1.2;oval(c,x,y,r,r,`rgba(255,235,244,${.3+.35*(.5+.5*Math.sin(t+i))})`);}}
  function sparkle(c,x,y,size,color='#ffefd6'){shape(c,k=>{k.moveTo(x,y-size);k.quadraticCurveTo(x+1,y-1,x+size,y);k.quadraticCurveTo(x+1,y+1,x,y+size);k.quadraticCurveTo(x-1,y+1,x-size,y);k.quadraticCurveTo(x-1,y-1,x,y-size);},color);}
  function moon(c,x,y,r){oval(c,x,y,r,r,gradient(c,0,y-r,0,y+r,['#ffe8dc','#d9b7d9']));oval(c,x+8,y-5,r-1,r-1,'#3a294e');}
  function glow(c,x,y,r,color){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
  function grass(c,y,color){shape(c,k=>{k.moveTo(0,y);k.bezierCurveTo(140,y-10,295,y+11,480,y-3);k.lineTo(480,300);k.lineTo(0,300);k.closePath();},color);}
  function garden(c,t,m,A){
    sky(c,['#26213f','#5c3e68','#9c6b8d']);stars(c,m);moon(c,396,54,22);
    // A walled garden: architectural depth stays behind the playable silhouettes.
    box(c,20,106,440,118,10,'#664b70');box(c,16,101,448,10,4,'#9c759a');
    for(let row=0;row<4;row++){const yy=121+row*25;line(c,22,yy,458,yy,'#49384e',.6);for(let i=0;i<9;i++){const xx=29+i*56+(row%2)*27;line(c,xx,yy,xx,yy+23,'#81617e',.6);}}
    for(const xx of [70,240,410]){
      shape(c,k=>{k.moveTo(xx-31,195);k.lineTo(xx-31,142);k.bezierCurveTo(xx-31,97,xx+31,97,xx+31,142);k.lineTo(xx+31,195);k.closePath();},'#473a54','#ba93ae',2);
      for(let i=-2;i<=2;i++)line(c,xx+i*11,133,xx+i*11,195,'#91728d',.7);
      line(c,xx-28,153,xx+28,153,'#a384a1',.7);line(c,xx-30,176,xx+30,176,'#a384a1',.7);
    }
    grass(c,223,'#687566');grass(c,245,'#8f947d');
    for(let i=0;i<7;i++)oval(c,38+i*72,272+(i%2)*7,24,7,'#d1b0b545','#e4c4ca44',.6,-.05);
    // A quiet plinth for the flower, kept between the two faces.
    oval(c,275,243,34,7,'#39453a33');box(c,257,224,36,19,4,'#b2ac91','#62745d',1);oval(c,275,224,22,5,'#d3cbb0','#62745d',1);
    A.lily(c,35,244,{scale:.57,time:m,color:'purple'});A.lily(c,446,245,{scale:.59,time:m});
    const p=ease(t/3.4),rx=mix(95,178,p);
    A.rat(c,rx,246,{scale:1.42,time:m,walk:t<3.4?.75:0});
    A.rat(c,371,246,{scale:1.36,dir:-1,time:m,sir:true});
    const hand=ease((t-2.6)/2.4),fx=mix(rx+76,275,hand),fy=mix(241,222,hand);
    A.lily(c,fx,fy,{scale:.65,time:m});
    if(t>4.1){const a=ease((t-4.1)/1.2);c.globalAlpha=a;sparkle(c,242,150,3);sparkle(c,302,164,2.6);c.globalAlpha=1;}
    // Small foreground leaves frame the story rather than covering it.
    for(let i=0;i<6;i++){const xx=8+i*7;line(c,xx,300,xx+4,283+(i%3)*3,'#596f5b',2);line(c,480-xx,300,476-xx,282+(i%3)*3,'#596f5b',2);}
  }
  function kyoto(c,t,m,A){
    sky(c,['#221c3b','#674062','#bc7b91']);stars(c,m,23);
    // Distant roofs and a flowering branch leave a clean stage around the rat.
    shape(c,k=>{k.moveTo(0,190);k.lineTo(0,141);k.lineTo(27,122);k.lineTo(58,141);k.lineTo(58,166);k.lineTo(97,145);k.lineTo(130,163);k.lineTo(130,214);k.lineTo(0,214);k.closePath();},'#3d2e4a');
    line(c,16,0,40,65,'#604359',5);line(c,34,49,90,67,'#604359',3);line(c,31,40,8,70,'#604359',2);
    [[25,25],[40,50],[60,57],[81,65],[10,65]].forEach(([x,y],i)=>{for(let j=0;j<5;j++)oval(c,x+Math.cos(j*TAU/5)*4,y+Math.sin(j*TAU/5)*4,3.7,3.5,i%2?'#d8a0c2':'#ecc0d5');oval(c,x,y,1.7,1.7,'#f2d9b4');});
    // Record shop: large vinyl silhouettes, window mullions and warm light.
    box(c,229,71,218,172,5,'#694b66','#b987a1',1.4);
    box(c,246,102,108,94,3,'#bd839d','#372d48',4);
    c.fillStyle=gradient(c,250,103,350,195,['#dda1b5','#98748e']);c.fillRect(250,106,100,86);
    [[270,129],[329,129],[270,171],[329,171]].forEach(([x,y],i)=>A.vinyl(c,x,y,{scale:.55,time:.3,color:i%2?'#c0d9ce':'#efbdd1'}));
    line(c,299,107,299,192,'#665064',3);line(c,251,150,349,150,'#665064',3);
    box(c,369,99,55,138,3,'#342b48','#b88ca9',2);box(c,378,111,36,65,2,'#c899a9');line(c,396,112,396,175,'#72596f',2);oval(c,413,194,2.7,2.7,'#e8c9a0');
    // No microscopic logo: the shop's awning itself carries its character.
    shape(c,k=>{k.moveTo(222,70);k.lineTo(454,70);k.lineTo(444,90);k.lineTo(232,90);k.closePath();},'#ad7796','#e9b8d0',1.2);
    for(let i=0;i<8;i++)box(c,232+i*26,87,26,9,3,i%2?'#dda7c4':'#82617e');
    box(c,252,49,106,22,4,'#44334f','#bd8bac',1);A.vinyl(c,304,60,{scale:.31,color:'#dcb2cf'});
    line(c,429,64,429,103,'#dab5c4',1);oval(c,429,112,9,13,'#eac6b0','#b48194',1);line(c,421,108,437,108,'#bb8f9c',.7);line(c,421,116,437,116,'#bb8f9c',.7);
    grass(c,239,'#62566a');for(let i=0;i<9;i++)line(c,i*60,260,(i*60)-15,300,'#a58b9a44',1);line(c,0,269,480,269,'#b698a944',1);
    c.save();c.translate(127,248);c.scale(1,.27);A.vinyl(c,0,0,{scale:1.75,time:m*.35,color:'#caa3d8'});c.restore();
    const bounce=t<4.7?Math.abs(Math.sin(t*4))*11*(1-ease((t-3.3)/1.4)):0;
    A.rat(c,127,244-bounce,{scale:1.47,time:m,walk:t<4.8?.6:0,airborne:bounce>4});
    // A falling flower settles beside the turntable; never across the face.
    const p=ease((t-2.3)/2.6),yy=mix(89,246,p);
    c.save();c.translate(208,yy);c.rotate((1-p)*-.2);A.lily(c,0,0,{scale:.65,time:m,color:'purple'});c.restore();
    if(t>4.9){sparkle(c,184,168,2.5);sparkle(c,232,190,2.2);}
    box(c,439,221,27,23,3,'#94738d','#c19eb2',1);A.lily(c,452,223,{scale:.46,time:m});
  }
  function egypt(c,t,m,A){
    sky(c,['#604063','#b97590','#ecc0ad']);oval(c,118,72,31,31,'#f6d4b4');
    shape(c,k=>{k.moveTo(-25,202);k.lineTo(98,91);k.lineTo(220,202);k.closePath();},'#aa758b');shape(c,k=>{k.moveTo(98,91);k.lineTo(130,202);k.lineTo(220,202);k.closePath();},'#795570');
    shape(c,k=>{k.moveTo(146,205);k.lineTo(236,130);k.lineTo(317,205);k.closePath();},'#be8ba0');shape(c,k=>{k.moveTo(236,130);k.lineTo(253,205);k.lineTo(317,205);k.closePath();},'#966d87');
    grass(c,210,'#d7a2a7');grass(c,247,'#ecc0b4');
    for(let i=0;i<12;i++){const xx=seed(i+9)*480,yy=262+seed(i+33)*31;oval(c,xx,yy,2.2+(i%3),.7,'#a77a9566');}
    // A modest roadside tea counter, with shade for the mummy.
    box(c,283,98,142,142,7,'#b98792','#8d667f',1.4);box(c,298,122,112,95,5,'#6f526e');
    shape(c,k=>{k.moveTo(269,97);k.quadraticCurveTo(350,67,439,98);k.lineTo(430,118);k.lineTo(280,118);k.closePath();},'#e6b8ad','#97708c',1.5);
    for(let i=0;i<7;i++)box(c,280+i*22,112,22,12,5,i%2?'#d59db3':'#f0cbb7');
    line(c,282,117,282,242,'#8b687d',5);line(c,428,117,428,242,'#8b687d',5);
    A.mummy(c,356,242,{scale:1.22,time:m});
    box(c,278,213,153,11,3,'#ecd1b8','#886a7f',1);box(c,294,225,120,21,3,'#cf9c9f','#ab7c91',1);
    line(c,313,230,313,243,'#b58393',1);line(c,340,230,340,243,'#b58393',1);line(c,367,230,367,243,'#b58393',1);line(c,394,230,394,243,'#b58393',1);
    A.tea(c,407,213,{scale:.63});oval(c,390,211,7,2,'#ebcf9e');oval(c,388,207,5,4,'#ead58f','#b69d70',.6);
    const p=ease(t/3.1),rx=mix(98,183,p);
    A.rat(c,rx,253,{scale:1.44,time:m,walk:t<3.1?.65:0});
    const pass=ease((t-2.6)/2.5);A.tea(c,mix(rx+71,295,pass),mix(240,212,pass),{scale:.95,time:m});
    box(c,51,239,27,18,4,'#a77b91','#795d76',1);A.lily(c,64,240,{scale:.7,time:m});
    if(t>5){sparkle(c,307,174,2.7);sparkle(c,325,188,2);}
    // A pale breeze in the far foreground gives a settled, slow ending.
    shape(c,k=>{k.moveTo(225,283);k.bezierCurveTo(286,272,328,294,390,281);},null,'#f6d7c6',1);
  }
  function space(c,t,m,A){
    sky(c,['#18152f','#372451','#513059']);
    c.save();c.translate(250,142);c.rotate(-.4);c.scale(1.7,.5);glow(c,0,0,145,'#b36dc64f');glow(c,-80,20,125,'#8273d73d');glow(c,65,25,100,'#d994b63b');c.restore();
    stars(c,m,72);
    // Ringed planet remains entirely behind and above the bouquet.
    c.save();c.translate(391,77);c.rotate(-.27);oval(c,0,0,57,13,null,'#b9a2d2',5);oval(c,0,0,34,34,gradient(c,-20,-30,25,30,['#e8c9d8','#b89ac6','#806c9d']),'#ead7e344',.8);
    shape(c,k=>{k.moveTo(-27,-18);k.bezierCurveTo(-9,-9,10,-24,27,-16);k.moveTo(-32,-4);k.bezierCurveTo(-8,7,8,-9,32,0);k.moveTo(-26,18);k.bezierCurveTo(-8,25,10,11,28,18);},null,'#8c75aa77',3);
    shape(c,k=>k.ellipse(0,0,57,13,0,0,Math.PI),null,'#d5c2de',5);c.restore();
    oval(c,47,181,18,18,gradient(c,35,164,59,199,['#bf8fac','#76567e']));oval(c,43,176,4,3,'#a07394');oval(c,52,187,3,4,'#8f6688');
    const arrive=ease(t/3.6),float=Math.sin(m*1.4)*3;
    const rx=mix(116,175,arrive),ry=220+float;
    c.save();c.translate(rx,ry);c.rotate(-.07+Math.sin(m*.8)*.015);A.rat(c,0,0,{scale:1.5,time:m,airborne:true});c.restore();
    // Four gathered lilies float as one tidy bouquet below the rat's eye line.
    const bx=mix(259,292,arrive),by=248+float;
    [[-20,-3,.58,'pink'],[20,-4,.58,'purple'],[-8,6,.64,'purple'],[10,6,.65,'pink']].forEach(([dx,dy,s,color])=>A.lily(c,bx+dx,by+dy,{scale:s,time:m,color}));
    shape(c,k=>{k.moveTo(bx-13,by-22);k.lineTo(bx+15,by-22);k.lineTo(bx+7,by+2);k.lineTo(bx-5,by+3);k.closePath();},'#d3a6bbcc','#f3d4d9',.7);
    shape(c,k=>{k.moveTo(bx-1,by-14);k.bezierCurveTo(bx-24,by-25,bx-22,by-3,bx-1,by-11);k.bezierCurveTo(bx+20,by-23,bx+25,by-4,bx+1,by-10);k.closePath();},'#8d72b3','#c8a9d8',.8);
    line(c,bx,by-11,bx-8,by+9,'#baa0ce',2);line(c,bx+1,by-11,bx+10,by+7,'#baa0ce',2);
    // A small constellation resolves over six seconds, away from the figures.
    const points=[[92,59],[106,45],[125,47],[139,62],[153,46],[172,46],[187,60],[182,78],[139,108],[98,79],[92,59]],p=ease((t-2.1)/3.8);
    const count=p*(points.length-1);
    for(let i=0;i<points.length-1;i++){
      const a=clamp(count-i);if(a<=0)continue;
      line(c,points[i][0],points[i][1],mix(points[i][0],points[i+1][0],a),mix(points[i][1],points[i+1][1],a),'#d6bad17d',1.1);
      sparkle(c,points[i][0],points[i][1],2.6,'#f7dae5');
    }
    if(p>.99)sparkle(c,139,108,3.5,'#fff0d9');
    // Orbiting motes imply a shared movement without crossing either face.
    for(let i=0;i<5;i++){const a=m*.18+i*TAU/5,xx=256+Math.cos(a)*166,yy=267+Math.sin(a)*15;sparkle(c,xx,yy,1.6,'#d7c0df');}
  }
  const scenes=[garden,kyoto,egypt,space];
  function play(canvas,chapter,options={}){
    if(!canvas||!canvas.getContext||!window.NLUArt)return {destroy(){}};
    const c=canvas.getContext('2d'),idx=clamp(Math.floor(Number(chapter)||0),0,3),reduced=!!options.reducedMotion;
    let stopped=false,raf=0,last=0,elapsed=0;
    // The presentation's fixed coordinate space keeps every element aligned.
    canvas.width=960;canvas.height=600;
    function draw(t,m){c.setTransform(2,0,0,2,0,0);c.globalAlpha=1;c.lineCap='round';c.lineJoin='round';c.clearRect(0,0,W,H);scenes[idx](c,t,m,window.NLUArt);}
    function frame(now){
      if(stopped)return;
      const dt=last?Math.min((now-last)/1000,.05):0;last=now;
      if(!document.hidden){elapsed+=dt;draw(Math.min(elapsed,7),elapsed);}
      raf=requestAnimationFrame(frame);
    }
    draw(reduced?7:0,0);
    if(!reduced)raf=requestAnimationFrame(frame);
    return {destroy(){stopped=true;if(raf)cancelAnimationFrame(raf);raf=0;}};
  }
  window.NLUScenes={play};
})();
