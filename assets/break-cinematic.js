/* A.S. Pool & Snooker — cinematic break scene.
   Self-contained WebGL2 ray-rendered 3D spheres and felt, with 2D rigid-ball
   collisions. No external JS dependency, no autoplay, no audio, optional.
   The opening photograph is real supplied artwork; the moving scene is
   a 3D illustration (not a video recording of a specific branch). */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const escapeHTML = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const smooth=(a,b,t)=>{const x=clamp((t-a)/(b-a),0,1);return x*x*(3-2*x);};
  const VERT=`precision highp float;
  attribute vec2 aPosition;
  varying vec2 vUv;
  void main(){vUv=aPosition;gl_Position=vec4(aPosition,0.,1.);}`;
  const FRAG=`precision highp float;
  varying vec2 vUv;
  uniform vec2 uRes;
  uniform vec3 uEye,uLook;
  uniform float uFov,uTime,uAccent;
  uniform vec4 uBalls[16];
  const float PI=3.14159265359;
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float sphereIntersect(vec3 ro,vec3 rd,vec3 center,float r){
    vec3 q=ro-center;float b=dot(q,rd);float h=b*b-dot(q,q)+r*r;
    if(h<0.)return 1e5;
    float t=-b-sqrt(h);return t>.003?t:1e5;
  }
  vec3 ballBase(float id){
    if(id<.5)return vec3(.93,.91,.82);
    if(abs(id-8.)<.5)return vec3(.014,.021,.024);
    if(id==1.||id==9.)return vec3(.96,.65,.11);
    if(id==2.||id==10.)return vec3(.11,.32,.80);
    if(id==3.||id==11.)return vec3(.81,.14,.11);
    if(id==4.||id==12.)return vec3(.38,.16,.63);
    if(id==5.||id==13.)return vec3(.97,.32,.055);
    if(id==6.||id==14.)return vec3(.05,.39,.25);
    return vec3(.55,.09,.17);
  }
  vec3 labelBall(vec3 color, vec3 n, float id){
    // White circular number enamel oriented toward the visitor initially.
    vec3 badgeForward=normalize(vec3(0.,.12,-.99));
    float facing=dot(n,badgeForward);
    if(facing>.888){
      vec3 right=normalize(cross(vec3(0.,1.,0.),badgeForward));
      vec3 up=cross(badgeForward,right);
      vec2 p=vec2(dot(n,right),dot(n,up));
      float rim=smoothstep(.90,.91,facing);
      color=mix(color,vec3(.96,.95,.84),rim);
      // Two distinct ink loops, rendering a clear 8 on the near black ball.
      if(abs(id-8.)<.5){
        vec2 a=(p-vec2(0.,.105))*vec2(1.12,1.07);
        vec2 b=(p-vec2(0.,-.092))*vec2(.93,1.0);
        float top=abs(length(a)-.108);
        float bottom=abs(length(b)-.129);
        float ink=(1.-smoothstep(.027,.045,min(top,bottom)))*rim;
        color=mix(color,vec3(.040,.053,.053),ink);
      }
    }
    return color;
  }
  vec3 shadeBall(vec3 pos,vec3 n,vec3 rd,float id){
    vec3 base=ballBase(id);
    vec3 key=normalize(vec3(-.50,1.,-.65));
    vec3 fill=normalize(vec3(.72,.55,.38));
    float diffuse=max(dot(n,key),0.);
    float f=max(dot(n,fill),0.);
    float ambient=.17+max(n.y,0.)*.12;
    vec3 c=base*(ambient+diffuse*.82+f*.24);
    float spec=pow(max(dot(reflect(-key,n),-rd),0.),58.);
    float spec2=pow(max(dot(reflect(-fill,n),-rd),0.),95.);
    c+=vec3(1.,.95,.80)*spec*.77+vec3(.51,.76,.90)*spec2*.39;
    // Broad window reflection makes the black 8-ball read as polished enamel.
    vec3 refl=reflect(rd,n);
    float pane=smoothstep(.70,.92,refl.y)*smoothstep(.04,.16,refl.x)* (1.-smoothstep(.52,.72,refl.x));
    c+=vec3(.45,.56,.50)*pane*.27;
    float edge=pow(1.-max(dot(n,-rd),0.),2.0);
    c+=vec3(.18,.20,.15)*edge*.20;
    if(id>0.5 && id>8.5){
      // Subtle ivory stripes on 9–15, still truly spherical in the shader.
      float stripe=smoothstep(.55,.63,abs(n.y));
      c=mix(c,vec3(.76,.75,.69)*(.37+diffuse*.72)+vec3(spec*.6),stripe);
    }
    if(id>.5)c=labelBall(c,n,id);
    return c;
  }
  vec3 felt(vec3 p){
    vec2 z=p.xz;
    vec2 a=abs(z);
    float grain=hash(floor(z*145.));
    float band=sin(z.x*26.+z.y*4.)*.008;
    if(a.x<3.20 && a.y<7.5){
      float v=.92+.055*sin(z.y*.72)+grain*.045+band;
      vec3 green=mix(vec3(.018,.17,.118),vec3(.052,.34,.23),clamp((7.5-z.y)/18.,0.,1.));
      green*=v;
      float edge= max(smoothstep(3.08,3.19,a.x),smoothstep(7.37,7.49,a.y));
      green=mix(green,vec3(.016,.13,.081),edge*.70);
      float shadow=1.;
      for(int i=0;i<16;i++){
        vec2 d=z-uBalls[i].xz;
        float r=dot(d,d);
        shadow*=1.-.48*exp(-r*7.4);
      }
      return green*shadow;
    }
    if(a.x<3.53 && a.y<7.8){
      float rail=clamp((a.x-3.2)*2.3+(a.y-7.5)*2.6,0.,1.);
      float wave=sin(z.y*5.+sin(z.x*6.))*.04;
      return mix(vec3(.095,.067,.043),vec3(.31,.204,.113),rail)*(.83+wave+grain*.19);
    }
    return vec3(.018,.027,.025);
  }
  vec3 wall(vec3 p){
    float vertical=sin(p.x*.8+1.0)*.075;
    float stripe=smoothstep(.26,.29,abs(sin((p.x+5.)*.72)));
    float trim=smoothstep(2.9,3.1,p.y);
    vec3 wood=mix(vec3(.028,.027,.025),vec3(.17,.073,.041),stripe*.52);
    return wood*(.85+vertical+hash(p.xz)*.055)+trim*.014;
  }
  void main(){
    vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;
    vec3 forward=normalize(uLook-uEye);
    vec3 right=normalize(cross(forward,vec3(0.,1.,0.)));
    vec3 up=normalize(cross(right,forward));
    vec3 rd=normalize(forward + (right*uv.x+up*uv.y)*tan(radians(uFov)*.5)*2.);
    vec3 ro=uEye;
    float depth=1e5; float pickedID=-1.; vec3 pickedPos=vec3(0.);
    for(int i=0;i<16;i++){
      float t=sphereIntersect(ro,rd,uBalls[i].xyz,.295);
      if(t<depth){depth=t;pickedID=uBalls[i].w;pickedPos=uBalls[i].xyz;}
    }
    float ft=rd.y<-.00001?(-ro.y/rd.y):1e5;
    float wt=rd.z>.00001?(8.8-ro.z)/rd.z:1e5;
    vec3 col;
    if(pickedID>=0. && depth<ft && depth<wt){
      vec3 pos=ro+rd*depth;
      vec3 n=normalize(pos-pickedPos);
      col=shadeBall(pos,n,rd,pickedID);
    } else if(ft<wt && ft<1e5){
      vec3 p=ro+rd*ft;
      col=felt(p);
      float dist=length(p-ro);
      float fog=1.-exp(-dist*.022);
      col=mix(col,vec3(.028,.054,.039),fog*.55);
      // Four restrained overhead reflections on the felt.
      float poolGlow=exp(-pow(p.z-3.8,2.)*.15)*(.06*exp(-pow(p.x+1.5,2.)*3.)+.07*exp(-pow(p.x-1.0,2.)*3.));
      col+=vec3(poolGlow*.6,poolGlow,poolGlow*.66);
    } else if(wt<1e5){
      col=wall(ro+rd*wt);
    } else {
      float glow=exp(-pow(uv.x*.75,2.)*2.-pow(uv.y-.4,2.)*8.);
      col=vec3(.011,.016,.017)+glow*vec3(.04,.027,.022);
    }
    // Cinematic highlights and subtle corner falloff. No cartoon HUD.
    vec2 p=gl_FragCoord.xy/uRes;
    float vig=1.-.22*pow(length((p-.5)*vec2(1.24,1.0)),1.6);
    col*=vig;
    col=col/(1.+col*.32);
    col=pow(max(col,vec3(0.)),vec3(.84));
    float dither=(hash(gl_FragCoord.xy+uTime*31.)-.5)*.005;
    gl_FragColor=vec4(clamp(col+vec3(dither),0.,1.),1.);
  }`;
  function createGL(canvas){
    const gl=canvas.getContext('webgl',{alpha:false,antialias:true,depth:false,powerPreference:'high-performance',preserveDrawingBuffer:true}) || canvas.getContext('experimental-webgl');
    if(!gl)throw Error('WebGL unavailable');
    const sh=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
    const program=gl.createProgram();gl.attachShader(program,sh(gl.VERTEX_SHADER,VERT));gl.attachShader(program,sh(gl.FRAGMENT_SHADER,FRAG));gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    const posAttr=gl.getAttribLocation(program,'aPosition');gl.enableVertexAttribArray(posAttr);gl.vertexAttribPointer(posAttr,2,gl.FLOAT,false,0,0);
    return {gl,program,u:{res:gl.getUniformLocation(program,'uRes'),eye:gl.getUniformLocation(program,'uEye'),look:gl.getUniformLocation(program,'uLook'),fov:gl.getUniformLocation(program,'uFov'),time:gl.getUniformLocation(program,'uTime'),balls:gl.getUniformLocation(program,'uBalls[0]')}};
  }
  function init(){
    const canvas=$('break-canvas'),stage=$('break-stage'),play=$('break-play'),poster=$('break-photo-trigger'),trigger=$('break-trigger'),skip=$('break-skip'),reset=$('break-reset'),result=$('break-results'),grid=$('break-results-grid'),note=$('break-stage-note'),status=$('break-live-status');
    const locations=Array.isArray(window.CLUB_LOCATIONS)?window.CLUB_LOCATIONS:[];
    if(!canvas||!stage||!poster||!trigger||!skip||!reset||!grid||!locations.length)return;
    let render=null;
    try{render=createGL(canvas);}catch(e){console.warn('3D break unavailable; location browsing remains accessible:',e);}
    const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
    let mode='ready',frame=0,last=0,startAt=0,elapsed=0,physicsElapsed=0,impact=false,breakImpact=false,balls=[],postTimer=0;
    let portrait=false,renderQuality=1,resizeTimer;
    const colors=['#eec554','#4877c0','#d7554a','#a178ca','#e7a253','#5cac84','#c9776a','#262a2d','#82b3d4','#dbc26a','#7b9fdb','#bb7b73','#9b91cb'];
    grid.innerHTML=locations.map((l,i)=>`<button type="button" class="break-location" data-club-id="${Number(l.id)}" aria-label="Explore ${escapeHTML(l.name)}"><span class="break-location-ball" style="--ball-tone:${colors[i%colors.length]}">${String(i+1).padStart(2,'0')}</span><span class="break-location-name">${escapeHTML(l.name)}</span><span class="break-location-arrow" aria-hidden="true">↗</span></button>`).join('');
    grid.addEventListener('click',e=>{const b=e.target.closest('[data-club-id]');if(b)document.dispatchEvent(new CustomEvent('as:open-club',{detail:{id:Number(b.dataset.clubId)}}));});
    const ids=[0,8,1,2,3,4,5,6,7,9,10,11,12,13,14,15];
    const R=.295;
    function rack(){
      balls=[{id:0,x:.045,z:-5.65,vx:0,vz:0}];
      // Full 8-ball rack: the 8 is in the center, with opposite groups at the back corners.
      const rackIds=[1,10,3,6,8,14,12,7,2,15,4,13,5,9,11];
      let k=0;
      for(let row=0;row<5;row++)for(let j=0;j<=row;j++){
        const x=(j-row/2)*(R*2+.002);
        const z=1.45+row*(Math.sqrt(3)*(R+.001));
        balls.push({id:rackIds[k++],x,z,vx:0,vz:0});
      }
    }
    function size(){
      const b=stage.getBoundingClientRect();if(b.width<5)return;
      portrait=b.width<565;
      if(render){
        // 3D reflection shading is expensive on older phones; cap pixels.
        const dpr=Math.min(window.devicePixelRatio||1,portrait?1:1.12);
        const maxw=portrait?430:1050;
        const w=Math.max(1,Math.min(maxw,Math.round(b.width*dpr))),h=Math.max(1,Math.round(w*b.height/b.width));
        canvas.width=w;canvas.height=h;render.gl.viewport(0,0,w,h);
      }
      if(mode==='ready')draw(0);
    }
    function physics(dt){
      const count=balls.length;
      if(physicsElapsed<.46 && physicsElapsed+dt>=.46)balls[0].vz=13.5;
      const damp=Math.exp(-dt*(breakImpact?.55:.18));
      for(let i=0;i<count;i++){
        let b=balls[i];b.x+=b.vx*dt;b.z+=b.vz*dt;
        b.vx*=damp;b.vz*=damp;
        if(b.x<-3.20+R){b.x=-3.20+R;b.vx=Math.abs(b.vx)*.79;}
        if(b.x>3.20-R){b.x=3.20-R;b.vx=-Math.abs(b.vx)*.79;}
        if(b.z<-7.5+R){b.z=-7.5+R;b.vz=Math.abs(b.vz)*.79;}
        if(b.z>7.5-R){b.z=7.5-R;b.vz=-Math.abs(b.vz)*.79;}
      }
      for(let a=0;a<count;a++)for(let j=a+1;j<count;j++){
        const A=balls[a],B=balls[j];const dx=B.x-A.x,dz=B.z-A.z;
        const dsq=dx*dx+dz*dz;if(dsq>(2*R+.01)**2)continue;
        const dist=Math.max(.00001,Math.sqrt(dsq)),nx=dx/dist,nz=dz/dist;
        const overlap=Math.max(0,2*R-dist);
        A.x-=nx*overlap*.5;B.x+=nx*overlap*.5;
        A.z-=nz*overlap*.5;B.z+=nz*overlap*.5;
        const rv=(B.vx-A.vx)*nx+(B.vz-A.vz)*nz;
        if(rv>=0)continue;
        const impulse=-(1+.93)*rv*.5;
        A.vx-=impulse*nx;A.vz-=impulse*nz;
        B.vx+=impulse*nx;B.vz+=impulse*nz;
        if(!impact&&(A.id===0||B.id===0)){
          impact=true;breakImpact=true;
          status.textContent='The cue ball strikes the front ball of the rack; the balls scatter.';
        }
      }
    }
    const e=(a,b,t)=>smooth(a,b,t);
    function camera(t){
      // Keep the cue ball and rack in view through first contact.
      const q=e(.85,2.8,t);
      const eye=[lerp(.7,1.9,q),lerp(portrait?10.8:9,6.5,q),lerp(-9,-7,q)];
      const look=[0,0,lerp(-.2,1.3,q)];
      return {eye,look,fov:portrait?57:55};
    }
    function draw(t){
      if(!render)return;
      const {gl,u}=render;
      const {eye,look,fov}=camera(t);
      gl.uniform2f(u.res,canvas.width,canvas.height);
      gl.uniform3fv(u.eye,eye);gl.uniform3fv(u.look,look);
      gl.uniform1f(u.fov,fov);gl.uniform1f(u.time,t);
      let packed=new Float32Array(16*4);
      for(let i=0;i<Math.min(16,balls.length);i++){
        const b=balls[i];packed[4*i]=b.x;packed[4*i+1]=R;packed[4*i+2]=b.z;packed[4*i+3]=b.id;
      }
      gl.uniform4fv(u.balls,packed);gl.drawArrays(gl.TRIANGLES,0,3);
    }
    function reveal(){
      result.hidden=false;reset.hidden=false;trigger.hidden=true;skip.hidden=true;
      play.classList.add('is-revealed');status.textContent='All 13 clubs are ready to explore.';
    }
    function finish(){
      if(mode==='finished')return;
      window.cancelAnimationFrame(frame);frame=0;mode='finished';
      poster.hidden=true;play.classList.remove('is-playing');note.textContent='THE NEXT SHOT IS YOURS';
      reveal();draw(3.3);
      // No automatic jump unless the location choices are offscreen.
      postTimer=window.setTimeout(()=>{
        if(document.hidden||result.hidden)return;
        const r=result.getBoundingClientRect();if(r.bottom>innerHeight-20&&r.top>innerHeight-40)result.scrollIntoView({behavior:reduce.matches?'auto':'smooth',block:'nearest'});
      },220);
    }
    function loop(now){
      if(mode!=='playing')return;
      if(!startAt)startAt=now;
      elapsed=Math.min(4.5,(now-startAt)/1000);
      // Simulation follows wall time, not render frame count. Slow devices do not
      // turn a four-second animation into a fifteen-second wait.
      while(physicsElapsed+1e-6<elapsed){
        const sub=Math.min(1/165,elapsed-physicsElapsed);
        physics(sub);physicsElapsed+=sub;
      }
      draw(elapsed);
      if(elapsed>=4.5){finish();return;}
      frame=requestAnimationFrame(loop);
    }
    function start(instant=false){
      if(mode==='playing')return;
      if(mode==='finished')rerack();
      if(instant||reduce.matches||!render){finish();return;}
      mode='playing';trigger.disabled=true;poster.disabled=true;
      play.classList.add('is-playing');note.textContent='THE SHOT · IN MOTION';
      elapsed=0;physicsElapsed=0;last=0;startAt=0;impact=false;breakImpact=false;
      status.textContent='3D pool break: cue ball rolling toward the full rack.';
      frame=requestAnimationFrame(loop);
    }
    function rerack(){
      if(frame)cancelAnimationFrame(frame);window.clearTimeout(postTimer);
      frame=0;mode='ready';last=0;startAt=0;elapsed=0;physicsElapsed=0;impact=false;breakImpact=false;
      rack();draw(0);play.classList.remove('is-playing','is-revealed');
      poster.hidden=false;poster.disabled=false;
      result.hidden=true;trigger.hidden=false;trigger.disabled=false;skip.hidden=false;reset.hidden=true;
      note.textContent='THE SHOT · IN MOTION';status.textContent='Ready to take another shot.';
    }
    trigger.addEventListener('click',()=>start());poster.addEventListener('click',()=>start());skip.addEventListener('click',()=>start(true));reset.addEventListener('click',rerack);
    rack();new ResizeObserver(size).observe(stage);size();
    if(!render){
      // Honest fallback: no false claim of animated 3D if graphics unavailable.
      trigger.textContent='Explore 13 locations';poster.setAttribute('aria-label','Show all 13 club locations');
      note.textContent='YOUR NEXT CLUB';
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
