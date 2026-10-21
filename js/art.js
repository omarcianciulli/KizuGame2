/* Original illustrated characters and flowers. Canvas-only; no remote assets. */
(function () {
  'use strict';
  const TAU=Math.PI*2;
  const palette={ink:'#553956',pink:'#edafc8',pale:'#ffe0e5',purple:'#8c6db0',green:'#86a97e',gold:'#e9c878'};
  function grad(c,x1,y1,x2,y2,stops){const g=c.createLinearGradient(x1,y1,x2,y2);stops.forEach((v,i)=>g.addColorStop(i/(stops.length-1),v));return g;}
  function shape(c,fn,fill,stroke=palette.ink,width=1.15){c.beginPath();fn(c);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
  function oval(c,x,y,rx,ry,fill,stroke=null,width=1,angle=0){c.beginPath();c.ellipse(x,y,rx,ry,angle,0,TAU);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
  function line(c,pts,color,width=1){shape(c,k=>{k.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)k.lineTo(pts[i],pts[i+1]);},null,color,width);}
  function bez(c,pts,color,width=1){shape(c,k=>{k.moveTo(pts[0],pts[1]);k.bezierCurveTo(...pts.slice(2));},null,color,width);}
  function begin(c,x,y,o){c.save();c.translate(x,y);c.scale((o.scale||1)*(o.dir||1),o.scale||1);c.lineCap='round';c.lineJoin='round';}
  function shine(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);shape(c,k=>{k.moveTo(0,-5);k.quadraticCurveTo(1,-1,5,0);k.quadraticCurveTo(1,1,0,5);k.quadraticCurveTo(-1,1,-5,0);k.quadraticCurveTo(-1,-1,0,-5);},'#fff2dd',null);c.restore();}
  function shadow(c,w=21){oval(c,0,2,w,3.2,'#261a342d');}

  function rat(c,x,y,o={}){
    begin(c,x,y,o);
    const t=o.time||0,walk=Math.min(1,Math.abs(o.walk||0)),step=Math.sin(t*13)*walk,bob=o.airborne?-2:Math.abs(Math.sin(t*13))*walk*1.3;
    shadow(c,22);c.translate(0,bob);
    // A flexible tail, with a bright edge that remains readable on dark scenes.
    const tail=[-13,-16,-34,-9,-47,-22,-39,-32+Math.sin(t*3)*2];
    bez(c,tail,'#a36791',5.2);bez(c,tail,'#eaa7c3',3.2);
    bez(c,[-14,-17,-30,-12,-38,-19,-39,-26+Math.sin(t*3)*2],'#ffd1de',.8);
    // The far ear and hand are tucked behind the silhouette.
    oval(c,-12,-52,11,13,grad(c,-20,-60,-5,-44,['#fdd3df','#c989ae']),palette.ink,1.25,-.27);
    oval(c,-12,-52,6.6,8.4,'#d588b2',null,1,-.27);
    oval(c,-13,-53,3.4,5.4,'#f3b3cb',null,1,-.27);
    oval(c,13,-21,5,8,'#f6bfd2',palette.ink,1,-.35+step*.16);
    // Feet have a real heel, rounded toes, and a two-step walking cycle.
    c.save();c.translate(-9,-2);c.rotate(step*.27-(o.airborne?.25:0));
    shape(c,k=>{k.moveTo(-6,-5);k.bezierCurveTo(-12,-6,-13,1,-8,2);k.lineTo(3,2);k.bezierCurveTo(9,2,10,-1,6,-3);k.lineTo(1,-6);k.closePath();},'#f1aec6');
    line(c,[2,-.3,2,1.6],'#be7c9f',.65);line(c,[5,-.7,5,1.2],'#be7c9f',.65);c.restore();
    c.save();c.translate(9,-1);c.rotate(-step*.27+(o.airborne?.2:0));
    shape(c,k=>{k.moveTo(-6,-5);k.bezierCurveTo(-10,-6,-11,1,-7,2);k.lineTo(6,2);k.bezierCurveTo(12,2,11,-1,8,-3);k.lineTo(1,-6);k.closePath();},grad(c,0,-6,0,3,['#ffcad7','#dfa1bd']));
    line(c,[4,-.3,4,1.6],'#be7c9f',.7);line(c,[7,-.6,7,1.2],'#be7c9f',.7);c.restore();
    // Pear-shaped coat, pale belly, and a small scalloped fur edge.
    shape(c,k=>{k.moveTo(-12,-35);k.bezierCurveTo(-22,-25,-20,-10,-12,-5);k.bezierCurveTo(-4,0,11,-2,17,-10);k.bezierCurveTo(23,-20,15,-33,7,-38);k.closePath();},grad(c,-15,-30,15,-6,['#f7c5d7','#d796b9']));
    shape(c,k=>{k.moveTo(-2,-30);k.bezierCurveTo(-10,-23,-10,-9,-2,-7);k.bezierCurveTo(7,-4,13,-12,11,-20);k.bezierCurveTo(10,-26,6,-31,-2,-30);},'#ffdae3',null);
    line(c,[-10,-12,-8,-10,-8,-13],'#edbbd0',.8);
    // Scarf tails are behind the face and arm.
    shape(c,k=>{k.moveTo(-8,-31);k.bezierCurveTo(-15,-26,-13,-17,-23,-14);k.lineTo(-20,-9);k.bezierCurveTo(-9,-12,-6,-20,-3,-29);k.closePath();},grad(c,-20,-20,-2,-30,['#9f82ba','#76608f']));
    line(c,[-20,-13,-18,-10],'#e7d6ef',1);line(c,[-16,-15,-14,-12],'#e7d6ef',1);
    // Cheek and pointed rat muzzle are one continuous organic shape.
    shape(c,k=>{k.moveTo(-15,-45);k.bezierCurveTo(-13,-60,7,-62,17,-51);k.bezierCurveTo(23,-45,23,-40,31,-37);k.bezierCurveTo(38,-33,34,-27,27,-27);k.bezierCurveTo(17,-23,8,-23,-1,-27);k.bezierCurveTo(-14,-29,-20,-37,-15,-45);k.closePath();},grad(c,-8,-55,16,-27,['#ffe0e4','#edacc9']));
    // Ear layers, rim highlight, and a subtle notch give the character texture.
    oval(c,0,-54,11,13.5,grad(c,-8,-64,10,-44,['#ffdae4','#e4a1c4']),palette.ink,1.2,.12);
    oval(c,0,-54,7.1,9,'#d684ad',null,1,.12);
    oval(c,.4,-53,4.8,6.3,'#efabc7',null,1,.12);
    bez(c,[-6,-61,-3,-65,4,-65,7,-60],'#ffedf0',1.3);
    // Soft muzzle, blush, very dark iris, and two pinpoint eye highlights.
    shape(c,k=>{k.moveTo(13,-37);k.bezierCurveTo(19,-40,26,-36,31,-33);k.bezierCurveTo(35,-29,26,-25,19,-28);k.bezierCurveTo(14,-28,10,-32,13,-37);},'#ffe2e5',null);
    oval(c,12,-34,5.4,3.4,'#e987ad66',null,1,.15);
    const blink=!o.airborne&&Math.sin(t*.85)>.998;
    if(blink){bez(c,[12,-43,15,-40,18,-40,20,-44],palette.ink,1.5);}
    else{
      oval(c,16,-43,5.1,6.4,'#fff9f0',palette.ink,.9,-.1);
      oval(c,17.6,-42.7,2.9,4.7,'#47344e');oval(c,18.2,-44.9,1.3,1.7,'#fff');oval(c,16.5,-40.6,.65,.75,'#c8a4d0');
      bez(c,[12,-49,15,-51,19,-50,20,-48],'#a26490',1.05);
    }
    shape(c,k=>{k.moveTo(30,-36);k.bezierCurveTo(36,-38,38,-33,33,-31);k.bezierCurveTo(30,-32,28,-34,30,-36);},'#9f5c83',null);
    oval(c,32.2,-35.2,1.3,.7,'#f0b3cb');
    bez(c,[26,-29,23,-26,19,-26,18,-28],'#a86c92',.85);
    oval(c,26,-31.5,.65,.65,'#b77c9e');oval(c,23,-32,.65,.65,'#b77c9e');
    bez(c,[27,-30,34,-29,37,-29,41,-30],'#fbe2eb',.9);
    bez(c,[26,-28,33,-26,36,-24,38,-23],'#fbe2eb',.85);
    // A neatly folded purple scarf, no miniature lettering.
    shape(c,k=>{k.moveTo(-12,-30);k.quadraticCurveTo(1,-23,15,-29);k.lineTo(14,-23);k.quadraticCurveTo(0,-18,-12,-24);k.closePath();},grad(c,0,-30,0,-20,['#a98ac5','#806295']),palette.ink,.8);
    line(c,[-9,-27,4,-24,12,-26],'#d2b5e4',.85);
    oval(c,-10,-25,3.7,4.5,'#a989c0',palette.ink,.8,-.25);
    // Front paw with fingers, held a little forward while jumping.
    const arm=o.airborne?-5:step*2;
    shape(c,k=>{k.moveTo(-2,-22);k.bezierCurveTo(-7,-20,-5,-12+arm,0,-11+arm);k.bezierCurveTo(6,-10+arm,10,-14+arm,6,-16+arm);k.lineTo(3,-18);k.closePath();},'#f8c8d8',palette.ink,.9);
    line(c,[5,-13+arm,7,-14+arm],'#bd7c9e',.6);line(c,[2,-12+arm,4,-13+arm],'#bd7c9e',.6);
    if(o.sir){
      shape(c,k=>{k.moveTo(-13,-67);k.lineTo(-10,-83);k.quadraticCurveTo(0,-87,11,-82);k.lineTo(14,-66);k.closePath();},grad(c,-10,-78,12,-66,['#5d4768','#332d47']));
      shape(c,k=>{k.moveTo(-19,-65);k.quadraticCurveTo(-2,-60,20,-65);k.lineTo(19,-69);k.quadraticCurveTo(-1,-65,-18,-69);k.closePath();},'#40334e');
      bez(c,[-11,-71,-3,-69,6,-69,12,-72],'#dfb583',3);
      oval(c,17,-43,7,8,null,'#cda776',1);bez(c,[22,-37,28,-28,18,-25,18,-18],'#e4c590',.65);
    }else{
      // Offset headphones keep both ears and expression visible.
      bez(c,[-16,-47,-19,-68,1,-74,12,-58],'#594568',4.4);
      bez(c,[-16,-48,-17,-66,1,-70,10,-59],'#bba3cf',2.2);
      oval(c,-16,-42,5.8,9,grad(c,-21,-45,-10,-38,['#b6a1d0','#826795']),palette.ink,1,-.12);
      oval(c,-17,-42,2.6,5.5,'#d9c7e5',null,1,-.12);
      line(c,[-19,-45,-19,-40],'#f2e5f7',.75);
    }
    c.restore();
  }

  function leaf(c,x,y,size,angle,light=false){c.save();c.translate(x,y);c.rotate(angle);shape(c,k=>{k.moveTo(0,0);k.bezierCurveTo(-size*.28,-size*.3,-size*.25,-size*.79,0,-size);k.bezierCurveTo(size*.34,-size*.65,size*.3,-size*.2,0,0);},grad(c,-size*.2,-size, size*.3,0,light?['#c5d4a0','#7eaa80']:['#a7bf91','#5f8f76']),'#547a65',.55);bez(c,[0,0,-size*.03,-size*.3,size*.02,-size*.6,0,-size*.9],'#d8dfac',.75);for(let i=1;i<4;i++){const yy=-size*.17*i;line(c,[0,yy,size*.16,yy-size*.14],'#d7dfa24d',.5);}c.restore();}
  function lily(c,x,y,o={}){
    begin(c,x,y,o);const t=o.time||0;
    c.rotate(o.headOnly?0:Math.sin(t*1.5+x*.01)*.018);
    if(!o.headOnly){
      bez(c,[0,0,3,-23,-4,-42,1,-64],'#466f62',3.2);bez(c,[.8,-1,4,-23,-2,-43,2,-64],'#b3c899',1.1);
      leaf(c,1,-16,30,-.93);leaf(c,-.5,-34,31,.98,true);leaf(c,1,-47,20,-.67,true);c.translate(0,-65);
    }
    // Six separate recurved petals, bright edges and rose-throat veins.
    const violet=o.color==='purple';
    const outer=violet?['#fbddf8','#d2a0e0','#9867bc']:['#ffebed','#f5b8d2','#d77cae'];
    const inner=violet?['#f5ccf2','#b079cc','#784a9a']:['#ffe6eb','#ed9bc1','#bd568e'];
    [0,2,4,1,3,5].forEach(i=>{
      c.save();c.rotate(i*TAU/6+.12);const rear=i%2===0;
      shape(c,k=>{k.moveTo(0,3);k.bezierCurveTo(-7,-4,-18,-17,-10,-29);k.bezierCurveTo(-7,-33,-3,-35,0,-39);k.bezierCurveTo(1,-28,12,-23,10,-14);k.bezierCurveTo(9,-4,3,-1,0,3);k.closePath();},grad(c,0,-36,1,2,rear?outer:inner),violet?'#aa72b8':'#ce79a0',.6);
      shape(c,k=>{k.moveTo(0,-38);k.bezierCurveTo(1,-30,4,-27,6,-24);k.bezierCurveTo(1,-26,-2,-30,0,-38);},'#fff4f0',null);
      bez(c,[0,2,1,-8,-3,-21,0,-35],violet?'#814896':'#b85488',.65);
      bez(c,[-1,-3,-5,-10,-8,-17,-6,-24],violet?'#eed2f0':'#ffe4eb',.65);
      for(let j=0;j<7;j++){
        const yy=-6-j*2.2,xx=(j%2?1:-1)*(2.4+(j%3)*1.1);
        oval(c,xx,yy,.6+(j%2)*.15,.9+(j%3)*.2,violet?'#8a4a9caa':'#ac3d76aa',null,1,(j-3)*.13);
      }
      c.restore();
    });
    oval(c,0,0,4.2,3.5,'#efdca1');
    // Six filaments terminate in individually angled pollen-covered anthers.
    [[-11,-13,-.6],[-5,-18,-.3],[3,-19,.2],[11,-13,.6],[-11,-4,-.8],[9,-4,.7]].forEach(([xx,yy,a],i)=>{
      bez(c,[0,2,xx*.45,-3,xx*.6,yy+3,xx,yy],'#fff0b9',1.1);
      oval(c,xx,yy,1.6,3.2,grad(c,xx-1,yy-2,xx+1,yy+3,['#f5d77c','#b78b41']),null,1,a);
      oval(c,xx-.4,yy-.9,.55,1.2,'#fff0b7',null,1,a);
    });
    bez(c,[0,3,3,-1,3,-5,4,-7],'#b2b87d',1.45);oval(c,4,-8,2.3,1.5,'#d8d8a4');
    c.restore();
  }

  function zombie(c,t){
    const walk=Math.sin(t*6);
    // Work boots and loose, patched overalls.
    oval(c,-9,-2,8,4,'#5b4e6b',palette.ink,1,-walk*.12);oval(c,9,-1,8,4,'#6c5a78',palette.ink,1,walk*.12);
    shape(c,k=>{k.moveTo(-13,-30);k.lineTo(13,-30);k.lineTo(14,-10);k.lineTo(9,-4);k.lineTo(1,-6);k.lineTo(-1,-13);k.lineTo(-3,-5);k.lineTo(-12,-6);k.closePath();},grad(c,-12,-26,15,-5,['#aaa1ba','#797693']));
    shape(c,k=>{k.moveTo(-9,-30);k.lineTo(-7,-18);k.lineTo(9,-18);k.lineTo(11,-30);},'#77748d',null);
    line(c,[-7,-28,-5,-17,7,-17,9,-28],'#dac5cf',1.2);oval(c,-5,-19,1,1,'#f7d587');oval(c,7,-19,1,1,'#f7d587');
    shape(c,k=>{k.moveTo(-8,-13);k.lineTo(-3,-14);k.lineTo(-2,-8);k.lineTo(-8,-8);k.closePath();},'#c59bb1','#6f647a',.6);
    line(c,[-7,-12,-5,-11,-7,-10],'#ecd4c9',.6);
    // Long sleepy arms and knuckles, with a little sleeve cuff.
    bez(c,[-12,-27,-20,-29,-20,-18,-24,-18],'#607c68',8);bez(c,[-12,-27,-20,-29,-20,-18,-24,-18],'#a9bf93',5.8);
    bez(c,[11,-27,20,-25,20,-18,25,-21],'#607c68',8);bez(c,[11,-27,20,-25,20,-18,25,-21],'#b8c99c',5.8);
    line(c,[-24,-19,-27,-19],'#58715f',.8);line(c,[25,-22,28,-22],'#58715f',.8);
    // Asymmetrical head, ear, stitched temple and a gently baffled expression.
    oval(c,-15,-43,4,6,'#b5c79c',palette.ink,.8);
    shape(c,k=>{k.moveTo(-14,-48);k.bezierCurveTo(-18,-66,16,-67,16,-49);k.lineTo(15,-34);k.quadraticCurveTo(1,-25,-12,-34);k.closePath();},grad(c,-14,-59,15,-32,['#d6dcad','#91b18a']));
    oval(c,-4,-45,6.1,6.5,'#f5e8cb','#748b70',.8,.1);oval(c,9,-43,5.5,6.1,'#f5e8cb','#748b70',.8,-.1);
    oval(c,-2,-44,1.9,2.5,'#55485c');oval(c,10,-41,1.9,2.5,'#55485c');
    bez(c,[-10,-48,-7,-51,-2,-50,1,-48],'#8c9f7b',2);bez(c,[5,-48,9,-49,13,-47,15,-46],'#8c9f7b',1.8);
    shape(c,k=>{k.moveTo(-6,-36);k.quadraticCurveTo(3,-32,10,-35);k.lineTo(9,-30);k.quadraticCurveTo(0,-29,-5,-32);k.closePath();},'#697661',null);
    shape(c,k=>{k.moveTo(2,-34);k.lineTo(6,-34);k.lineTo(6,-30);k.lineTo(2,-30);k.closePath();},'#f5eacf',null);
    line(c,[-11,-51,-7,-54],'#71866b',.7);line(c,[-11,-53,-9,-50],'#71866b',.7);line(c,[-8,-55,-6,-52],'#71866b',.7);
    // Creased straw hat; the tiny seedling makes the gardener role readable.
    shape(c,k=>{k.moveTo(-12,-58);k.lineTo(-10,-68);k.quadraticCurveTo(1,-73,12,-66);k.lineTo(16,-58);k.closePath();},grad(c,-10,-69,14,-58,['#ecd9a4','#bbaa7e']));
    oval(c,1,-58,23,4,'#d9c595',palette.ink,.9,-.08);bez(c,[-10,-62,-2,-59,7,-60,13,-62],'#9b7b86',2.5);
    leaf(c,10,-65,10,.6,true);leaf(c,10,-65,8,-.65,true);
  }
  function lantern(c,t){
    const sway=Math.sin(t*2)*.05;c.rotate(sway);c.translate(0,Math.sin(t*3)*2-3);
    bez(c,[0,-65,-6,-72,7,-73,6,-66],'#c7aecb',1.8);
    shape(c,k=>{k.moveTo(-12,-59);k.bezierCurveTo(-29,-52,-28,-23,-13,-16);k.quadraticCurveTo(0,-11,13,-16);k.bezierCurveTo(29,-25,27,-52,12,-59);k.closePath();},grad(c,-23,-50,24,-25,['#d690bd','#f5c4d7','#b978a8']));
    for(let i=0;i<6;i++){const yy=-54+i*6;bez(c,[-20+(i===0?4:0),yy,-8,yy+4,9,yy+4,20-(i===0?4:0),yy],'#a66b955e',.7);}
    bez(c,[-8,-59,-15,-44,-15,-28,-7,-16],'#ffdeea88',1);bez(c,[8,-59,15,-44,15,-28,7,-16],'#a4659544',1);
    oval(c,0,-59,13,3.8,'#73637e',palette.ink,.8);oval(c,0,-16,13,3.5,'#73637e',palette.ink,.8);
    // Friendly kasa-obake-style single eye, folding paper tongue and tassels.
    oval(c,1,-39,10,10,'#ffeedc',palette.ink,1.2);oval(c,3,-39,4.4,6,'#5e466a');oval(c,4,-42,1.7,2.2,'#fff5e8');
    bez(c,[-7,-48,-2,-52,7,-51,10,-46],'#916189',1.6);
    shape(c,k=>{k.moveTo(-4,-25);k.quadraticCurveTo(3,-22,9,-27);k.bezierCurveTo(11,-15,4,-10,1,-18);k.closePath();},'#bf628d',palette.ink,.6);line(c,[5,-22,5,-17],'#f4b7c9',.65);
    bez(c,[-7,-14,-11,-7,-4,-4,-9,1],'#e5bd86',1.8);bez(c,[0,-14,4,-8,-5,-4,0,3],'#efce9e',1.8);bez(c,[7,-14,12,-9,5,-4,9,0],'#d5ab80',1.8);
    oval(c,-9,1,2.2,2.5,'#eed49b');oval(c,0,3,2.2,2.5,'#eed49b');oval(c,9,0,2.2,2.5,'#eed49b');
  }
  function beetle(c,t){
    // Rounded jewel scarab with six articulated legs and polished wing cases.
    [-1,1].forEach(side=>{for(let i=0;i<3;i++){const yy=-13-i*8,d=Math.sin(t*7+i)*2;line(c,[side*13,yy,side*23,yy-3+d,side*28,yy+4+d],'#d9b681',3.2);line(c,[side*13,yy,side*23,yy-3+d,side*28,yy+4+d],'#6d4f75',1.25);}});
    oval(c,0,-22,18,22,grad(c,-18,-38,18,-6,['#8fb9af','#536b88','#463d67']),palette.ink,1.2);
    shape(c,k=>{k.moveTo(-1,-40);k.bezierCurveTo(-19,-40,-22,-14,-2,-3);k.closePath();},grad(c,-18,-35,-1,-9,['#b4d4bc','#709a9d','#606983']),null);
    shape(c,k=>{k.moveTo(1,-40);k.bezierCurveTo(19,-40,22,-14,2,-3);k.closePath();},grad(c,1,-37,18,-5,['#8fb6b1','#596887','#423954']),null);
    bez(c,[0,-40,-2,-25,1,-13,0,-3],'#d7c28a',1.2);bez(c,[-8,-37,-17,-31,-17,-18,-9,-10],'#d8e4c688',.9);
    [-1,1].forEach(side=>{for(let i=0;i<3;i++){bez(c,[side*3,-32+i*7,side*6,-28+i*7,side*10,-27+i*7,side*13,-24+i*7],'#3b4a69aa',.65);}});
    oval(c,0,-43,12,10,grad(c,-10,-50,10,-37,['#b6ceaf','#6c9a99']),palette.ink,1);
    shape(c,k=>{k.moveTo(-13,-42);k.quadraticCurveTo(0,-49,13,-42);k.lineTo(10,-37);k.quadraticCurveTo(0,-43,-10,-37);k.closePath();},'#c9b47d',palette.ink,.65);
    oval(c,-6,-47,3.3,3.8,'#faf0c8');oval(c,6,-47,3.3,3.8,'#faf0c8');oval(c,-5,-47,1.3,2.2,'#55435f');oval(c,7,-47,1.3,2.2,'#55435f');
    bez(c,[-6,-52,-11,-57,-9,-59,-12,-60],'#c3ad7e',1.5);bez(c,[6,-52,11,-57,9,-59,12,-60],'#c3ad7e',1.5);
    shine(c,-10,-28,.55);
  }
  function meteor(c,t){
    c.translate(0,-24);c.rotate(Math.sin(t*.7)*.08);
    shape(c,k=>{k.moveTo(-23,-7);k.lineTo(-16,-23);k.quadraticCurveTo(-9,-29,-1,-26);k.lineTo(13,-23);k.lineTo(24,-11);k.lineTo(25,3);k.lineTo(16,16);k.lineTo(1,23);k.lineTo(-15,17);k.lineTo(-26,4);k.closePath();},grad(c,-20,-23,20,20,['#cbc1dc','#9587b5','#62577f']),palette.ink,1.3);
    shape(c,k=>{k.moveTo(-23,-7);k.lineTo(-16,-23);k.lineTo(-3,-18);k.lineTo(-9,-5);k.lineTo(-21,3);k.closePath();},'#ded5e955',null);
    shape(c,k=>{k.moveTo(17,-18);k.lineTo(24,-11);k.lineTo(25,3);k.lineTo(16,16);k.lineTo(8,11);k.lineTo(14,0);k.closePath();},'#534c7566',null);
    [[-13,-10,5,4],[12,8,5,6],[-10,12,3.5,2.8],[9,-17,3,2.3]].forEach(([xx,yy,rx,ry])=>{oval(c,xx,yy,rx,ry,'#73648f','#b3a3cc',.7,-.2);bez(c,[xx-rx*.7,yy+1,xx-rx*.4,yy+ry,xx+rx*.5,yy+ry,xx+rx*.8,yy+1],'#cec0df77',.65);});
    // A mildly offended little face instead of a featureless rock.
    oval(c,-4,-3,3.7,5.1,'#eee1ee',palette.ink,.7);oval(c,7,-3,3.7,5.1,'#eee1ee',palette.ink,.7);
    oval(c,-3,-2,1.6,2.7,'#574569');oval(c,8,-2,1.6,2.7,'#574569');
    bez(c,[-8,-8,-5,-10,-2,-8,-1,-7],'#736085',1.2);bez(c,[4,-7,7,-9,10,-9,12,-7],'#736085',1.2);
    bez(c,[-1,8,2,6,4,6,7,8],'#6e4e79',1.15);
    oval(c,-7,5,3,1.5,'#d7a3c266');oval(c,10,5,3,1.5,'#d7a3c266');
  }
  function enemy(c,x,y,o={}){begin(c,x,y,o);shadow(c,22);const t=o.time||0;({garden:zombie,kyoto:lantern,egypt:beetle,space:meteor}[o.kind]||zombie)(c,t);c.restore();}

  function tea(c,x,y,o={}){
    begin(c,x,y,o);const t=o.time||0;
    // Cold lemon tea in a clear cup; actual wedge, rim, ice, straw, condensation.
    shape(c,k=>{k.moveTo(-11,-28);k.lineTo(-8,-2);k.quadraticCurveTo(0,1,8,-2);k.lineTo(11,-28);k.closePath();},grad(c,-10,-22,10,-2,['#fff4bc','#d5c47d']),palette.ink,1);
    shape(c,k=>{k.moveTo(-10,-21);k.lineTo(-8,-3);k.quadraticCurveTo(0,-1,8,-3);k.lineTo(10,-21);k.closePath();},grad(c,0,-21,0,0,['#f0d682','#cfae68']),null);
    oval(c,0,-28,11,3.3,'#e9dcb9',palette.ink,.9);oval(c,0,-27.5,8.2,1.7,'#a89968');
    bez(c,[3,-8,3,-16,4,-27,6,-37],'#816783',2.1);line(c,[6,-37,11,-40],'#816783',2.1);
    shape(c,k=>{k.moveTo(-7,-22);k.lineTo(-2,-24);k.lineTo(2,-19);k.lineTo(-3,-16);k.closePath();},'#fff9e98c','#fffce4',.5);
    shape(c,k=>{k.moveTo(2,-16);k.lineTo(6,-18);k.lineTo(8,-12);k.lineTo(4,-10);k.closePath();},'#fff9e98c','#fffce4',.5);
    oval(c,-7,-24,6.2,7.1,'#f5e397','#c2b168',.9,-.25);oval(c,-7,-24,4.5,5.4,'#faf1bb',null,1,-.25);
    for(let i=0;i<5;i++){const a=i*TAU/5;line(c,[-7,-24,-7+Math.cos(a)*3.5,-24+Math.sin(a)*4.1],'#d6c075',.7);}
    bez(c,[-7,-18,-7,-13,-7,-9,-6,-6],'#fffbed99',1.2);oval(c,8,-17,1,1.6,'#fff9ef88');oval(c,-8,-10,.7,1,'#fff9ef99');
    if(o.sparkle)shine(c,17,-32+Math.sin(t*2)*2,.6);
    c.restore();
  }
  function vinyl(c,x,y,o={}){
    begin(c,x,y,o);c.rotate(o.time||0);
    oval(c,0,0,26,26,grad(c,-24,-24,24,24,['#403747','#1e202f','#59455d']), '#c6a3c4',1);
    [11,15,19,23].forEach((r,i)=>oval(c,0,0,r,r,null,i%2?'#7b638044':'#bca1c42e',.7));
    shape(c,k=>{k.moveTo(-22,-9);k.quadraticCurveTo(-12,-23,5,-24);k.lineTo(8,-17);k.quadraticCurveTo(-7,-18,-16,-7);k.closePath();},'#f1cfee1f',null);
    shape(c,k=>{k.moveTo(22,9);k.quadraticCurveTo(12,23,-5,24);k.lineTo(-8,17);k.quadraticCurveTo(7,18,16,7);k.closePath();},'#f1cfee13',null);
    oval(c,0,0,9,9,o.color||'#e9aacd', '#eec9e1',.7);oval(c,0,0,5.7,5.7,null,'#875d8580',.65);oval(c,0,0,2,2,'#211c2d');
    c.restore();
  }

  function plant(c,x,y,o={}){
    begin(c,x,y,o);const t=o.time||0;shadow(c,24);
    leaf(c,0,-4,29,-.92);leaf(c,1,-8,29,1.04,true);leaf(c,-1,-6,19,-.23,true);
    bez(c,[1,-6,6,-17,-1,-29,1,-37],'#5d866c',6);bez(c,[1,-7,4,-17,-2,-28,0,-36],'#bad29b',1.8);
    c.translate(0,Math.sin(t*2)*1.2);
    shape(c,k=>{k.moveTo(-20,-43);k.bezierCurveTo(-25,-66,7,-74,19,-54);k.lineTo(30,-53);k.quadraticCurveTo(35,-41,27,-35);k.lineTo(16,-36);k.bezierCurveTo(4,-20,-17,-29,-20,-43);k.closePath();},grad(c,-18,-60,20,-30,['#d3e1a8','#9dbe83','#79a17c']));
    oval(c,29,-44,8,10,'#bdd59a',palette.ink,1,-.08);oval(c,31,-44,4.8,7,'#4c7460',null,1,-.08);oval(c,32,-46,2,3,'#314b46');
    oval(c,-4,-51,4.1,5.6,'#fff1ce',palette.ink,.65);oval(c,-2.6,-51,1.8,3.6,'#3f594a');oval(c,-2,-53, .7,1,'#fff');
    bez(c,[-10,-58,-6,-61,-2,-61,1,-59],'#769a70',1.2);oval(c,-10,-43,4,2.5,'#d8b0b477');
    bez(c,[-15,-54,-18,-51,-18,-46,-16,-43],'#eef0be',1.2);leaf(c,-7,-66,14,-.5,true);
    c.restore();
  }
  function mummy(c,x,y,o={}){
    begin(c,x,y,o);shadow(c,30);
    oval(c,-13,-3,13,6,'#cbb4bd',palette.ink,.8);oval(c,13,-3,13,6,'#dec6ce',palette.ink,.8);
    shape(c,k=>{k.moveTo(-20,-47);k.bezierCurveTo(-32,-38,-30,-12,-16,-6);k.bezierCurveTo(-3,1,21,-3,26,-20);k.bezierCurveTo(29,-32,18,-48,12,-52);k.closePath();},grad(c,-22,-45,24,-8,['#f4e2d1','#d1b7c5','#bba2b8']));
    oval(c,0,-62,23,22,grad(c,-20,-78,20,-45,['#f5e2d5','#d8bdc9']),palette.ink,1.15,-.07);
    const bands=[[-22,-66,18,-70],[-22,-56,22,-63],[-18,-48,20,-52],[-23,-40,22,-46],[-27,-29,26,-34],[-26,-19,24,-23],[-18,-9,18,-13]];
    bands.forEach(([a,b,d,e])=>{line(c,[a,b,d,e],'#a28ca4',1.05);line(c,[a,b+2,d,e+2],'#fff0de88',1.4);});
    shape(c,k=>{k.moveTo(-17,-65);k.quadraticCurveTo(-1,-71,16,-66);k.lineTo(15,-56);k.quadraticCurveTo(0,-53,-16,-57);k.closePath();},'#66566f',null);
    oval(c,-7,-61,4.2,4.6,'#efe1ac');oval(c,7,-61,4.2,4.6,'#efe1ac');oval(c,-5.6,-60,1.5,2.8,'#57425d');oval(c,8.4,-60,1.5,2.8,'#57425d');
    shape(c,k=>{k.moveTo(18,-52);k.bezierCurveTo(29,-47,31,-43,35,-45);k.lineTo(36,-39);k.bezierCurveTo(27,-36,24,-44,17,-44);k.closePath();},'#e3cbd0','#a28ca4',.7);
    bez(c,[-7,-31,-3,-27,3,-27,6,-31],'#af8ca2',.8);
    c.restore();
  }
  function doorman(c,x,y,o={}){
    begin(c,x,y,o);shadow(c,23);
    // A shy long-faced visitor in a lavender hood, holding a programme.
    shape(c,k=>{k.moveTo(-23,0);k.lineTo(-20,-47);k.bezierCurveTo(-29,-65,-19,-88,1,-90);k.bezierCurveTo(24,-88,31,-65,20,-47);k.lineTo(24,0);k.closePath();},grad(c,-25,-70,25,-5,['#756281','#453d5c']),palette.ink,1.2);
    shape(c,k=>{k.moveTo(-14,-68);k.bezierCurveTo(-12,-84,13,-84,16,-66);k.lineTo(12,-46);k.quadraticCurveTo(2,-34,-9,-45);k.closePath();},grad(c,-10,-74,14,-43,['#e4d3d6','#bba4be']));
    oval(c,-5,-64,3,4.2,'#6f5475');oval(c,8,-64,3,4.2,'#6f5475');oval(c,-4,-65.3,.7,.9,'#eadce6');oval(c,9,-65.3,.7,.9,'#eadce6');
    bez(c,[1,-61,-2,-55,2,-52,5,-55],'#a28ca7',.9);bez(c,[-5,-47,0,-44,6,-45,9,-48],'#8c6f91',1);
    bez(c,[-18,-38,-15,-27,-15,-14,-18,-5],'#8c789f',1);bez(c,[14,-38,17,-27,17,-14,20,-5],'#2d2c45',1.2);
    shape(c,k=>{k.moveTo(8,-33);k.lineTo(28,-34);k.lineTo(30,-9);k.lineTo(10,-8);k.closePath();},'#e0c2d5','#9a79a1',.8);
    oval(c,19,-22,6,6,'#80628f');oval(c,19,-22,2,2,'#deb6cf');line(c,[15,-13,26,-14],'#ad89a6',1);
    oval(c,9,-23,4,6,'#c5a9c0',palette.ink,.8,-.25);
    c.restore();
  }
  window.NLUArt={palette,rat,lily,enemy,tea,vinyl,plant,mummy,doorman};
})();
