/********* CONFIG *********/
const MAX_LEVEL = 6;
const IMAGES = [
  { name:"cat1", path:"images/cat1.jpeg" },
  { name:"cat2", path:"images/cat2.jpeg" },
  { name:"cat3", path:"images/jigsaw1.jpeg" }
];

/********* DOM *********/
const cont  = document.getElementById("puzzle-container");
const levelLbl = document.getElementById("levelInfo");
const shuffleBtn = document.getElementById("shuffle");
const musicBtn   = document.getElementById("toggleMusic");
const solvedSFX  = document.getElementById("solvedSound");
const bgMusic    = document.getElementById("bgMusic");
const overlay    = document.getElementById("memeOverlay");
const memeVideo  = document.getElementById("memeVideo");

/********* STATE *********/
let level=1, rows, cols, size;
let pieces=[], positions=[], currentImg;

/********* INIT *********/
makePuzzle();

/********* BUILD *********/
function makePuzzle(){
  rows = cols = Math.min(3 + (level-1), MAX_LEVEL);
  size = 400 / rows;
  levelLbl.textContent = `Level ${level} (${rows} × ${cols})`;

  cont.innerHTML = "";
  hideMeme();

  pieces = []; positions = [];
  currentImg = IMAGES[Math.floor(Math.random()*IMAGES.length)];

  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const idx = r*cols + c;
      const d   = document.createElement("div");
      d.className="piece";
      d.style.width = d.style.height = `${size}px`;
      d.style.left  = `${c*size}px`;
      d.style.top   = `${r*size}px`;
      d.style.backgroundImage = `url('${currentImg.path}')`;
      d.style.backgroundPosition = `-${c*size}px -${r*size}px`;
      d.dataset.idx = idx;

      enableDrag(d);
      cont.appendChild(d);
      pieces.push(d);
      positions.push({left:c*size,top:r*size});
    }
  }
}

/********* DRAG *********/
function enableDrag(el){
  let oX,oY;
  const move = (X,Y)=>{ el.style.left=X-oX-cont.offsetLeft+"px";
                        el.style.top =Y-oY-cont.offsetTop +"px"; };
  const up = ()=>{ remove(); snap(el); checkSolved(); };
  const mm = e=>move(e.pageX,e.pageY);
  const tm = e=>move(e.touches[0].clientX,e.touches[0].clientY);
  const remove=()=>{
    document.removeEventListener("mousemove",mm);
    document.removeEventListener("mouseup",up);
    document.removeEventListener("touchmove",tm);
    document.removeEventListener("touchend",up);
  };

  el.addEventListener("mousedown",e=>{
    oX=e.offsetX; oY=e.offsetY; el.style.zIndex=1000;
    document.addEventListener("mousemove",mm);
    document.addEventListener("mouseup",up);
  });
  el.addEventListener("touchstart",e=>{
    const t=e.touches[0],r=el.getBoundingClientRect();
    oX=t.clientX-r.left; oY=t.clientY-r.top; el.style.zIndex=1000;
    document.addEventListener("touchmove",tm,{passive:false});
    document.addEventListener("touchend",up);
  },{passive:false});
}

/********* SNAP *********/
function snap(el){
  const idx=+el.dataset.idx, tgt=positions[idx];
  if(Math.abs(parseInt(el.style.left)-tgt.left)<size/2 &&
     Math.abs(parseInt(el.style.top )-tgt.top )<size/2){
    el.style.left=tgt.left+"px";
    el.style.top =tgt.top +"px";
  }
}

/********* SOLVED? *********/
function checkSolved(){
  if(pieces.every((p,i)=>{
       const t=positions[i];
       return Math.abs(parseInt(p.style.left)-t.left)<2 &&
              Math.abs(parseInt(p.style.top )-t.top )<2;})){
    solvedSFX.play();
    playMemeThenNext();
  }
}

/********* MEME POPUP *********/
function hideMeme(){ overlay.style.display="none"; memeVideo.pause(); }
function playMemeThenNext(){
  overlay.style.display="flex";
  memeVideo.src="videos/me.mp4";
  memeVideo.currentTime=0;

  // Try to play; if autoplay with sound fails, mute & retry.
  memeVideo.play().catch(()=>{
    memeVideo.muted=true;
    memeVideo.play().finally(()=>memeVideo.muted=false);
  });

  memeVideo.onended = ()=>{ hideMeme();
    setTimeout(()=>{ level=Math.min(level+1,MAX_LEVEL); makePuzzle(); }, 400);
  };
}

/********* CONTROLS *********/
shuffleBtn.onclick = ()=>{ hideMeme();
  pieces.forEach(p=>{
    p.style.left=Math.random()*(cont.clientWidth -size)+"px";
    p.style.top =Math.random()*(cont.clientHeight-size)+"px";
  });
};

musicBtn.onclick = ()=>{
  if(bgMusic.paused){ bgMusic.play(); musicBtn.textContent="🔇 Stop Music"; }
  else              { bgMusic.pause();musicBtn.textContent="🎵 Play Music"; }
};

/********* OPTIONAL TOAST (for debugging) *********/
// function toast(msg){
//   const d=document.createElement("div");
//   d.className="toast"; d.textContent=msg; document.body.appendChild(d);
//   setTimeout(()=>d.remove(),3000);
// }
