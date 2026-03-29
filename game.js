let runFrame = 0;
let runFrameTimer = 0;
let playerState = "idle"; 
// "idle" | "running" | "jumping"
let winPhase = 0; 
let introPhase = true;
let targetCenterX;
let isWinning = false;
let winAnimationProgress = 0;
let mobileMode = false;
let castleScreenX;
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let score = 0;
let floatingTexts = [];
let W, H;
let characterSize;
let groundHeight;
let gravity;
let jumpForce;
let speed;

let worldDistance = 6000;
let worldOffset = 0;

let player;
let obstacles = [];
let logos = [];
let birds = [];
let resultMessage = "";
let running = false;
let gameEnded = false;

const CHARACTER_SCALE = 1.9; // change freely
const OBSTACLE_SCALE = 1.5; // adjust freely
let obstacleBaseSize;


const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

const jumpSound = new Audio("assets/sounds/jump.mp3");
const collectSound = new Audio("assets/sounds/collect.mp3");

const images = {};
const imageList = [
    "character","pipe","brick","castle","flag",
    "cloud","bird",
    "logo1","logo2","logo3","logo4","logo5","logo6",
    "cactus","brick_step", "run1","run2","jump"
    ];

    let clouds = [];

    function generateClouds(){
      clouds = [];
      for(let i=0;i<6;i++){
        clouds.push({
          x: Math.random()*worldDistance,
          y: Math.random()*H*0.4,
          size: 80 + Math.random()*60
        });
      }
    }

function preloadImages(callback){
  let loaded = 0;
  imageList.forEach(name=>{
    images[name] = new Image();
    images[name].src = `assets/images/ai/${name}.webp`;
    images[name].onload = ()=>{
      loaded++;
      if(loaded === imageList.length) callback();
    };
  });
}

function resize(){

const container = document.querySelector(".game-inner");
    W = container.clientWidth;
    H = Math.min(window.innerHeight * 0.45, 500);
  

   characterSize = Math.max(60, W * 0.05);
    obstacleBaseSize = Math.max(50, W * 0.035);
    if (mobileMode) {
      obstacleBaseSize = Math.max(35, W * 0.035);
    } else {
      obstacleBaseSize = Math.max(50, W * 0.04);
    }

    mobileMode = W < 768;
  
    canvas.width = W;
    canvas.height = H;
  
    groundHeight = H * 0.10;
    if (mobileMode) {
      gravity = H * 0.0009;      // stronger gravity
      jumpForce = -H * 0.045;    // lower jump
  } else {
      gravity = H * 0.0012;
      jumpForce = -H * 0.04;
  }
    characterSize = Math.max(80, W * 0.08);
    obstacleBaseSize = Math.max(50, W * 0.04);


    const CHARACTER_RATIO = 310 / 290;  // your real image ratio

    player = {
      x: W * 0.15,
      width: characterSize,
      height: characterSize / CHARACTER_RATIO,
      velocity: 0
    };
  
    player.y = H - groundHeight - player.height;
  
    speed = mobileMode ? 1.8 : 3;  
    worldDistance = mobileMode ? 9000 : 6000;
  
    // 🔥 NOW define intro system (after everything exists)
    targetCenterX = W * 0.5 - player.width / 2;
    introPhase = !mobileMode;
  
    generateBirds();
    generateObstacles();
  }
function generateBirds(){
    birds = [];
    for(let i=0;i<5;i++){
      birds.push({
        x: Math.random()*worldDistance,
        y: H*0.1 + Math.random()*H*0.3,
        size: 40 + Math.random()*20,
        speed: 0.5 + Math.random()*0.5
      });
    }
  }



function generateObstacles(){
    obstacles = [];
    logos = [];
  
    let spacing;

    if (mobileMode) {
        spacing = 190;   // HUGE breathing space on mobile
    } else {
        spacing = 600;   // Keep desktop normal
    }

    let x = W * 1.2;
  
    while(x < worldDistance - 1000){
      let typeRand = Math.random();
      let type;
  
      if(typeRand < 0.4) type = "pipe";
      else if(typeRand < 0.7) type = "cactus";
      else if(typeRand < 0.85) type = "brick";
      else type = "brick_step";
  
      let obstacleHeight = obstacleBaseSize * 1.4;


      let obstacle = {
        type:type,
        x:x,
        y:H-groundHeight-obstacleHeight,
        width:obstacleBaseSize,
        height:obstacleHeight,
        harmful: type !== "brick_step"
    };

      if(type === "brick_step"){
        obstacle.height = obstacleBaseSize * 0.8;
    obstacle.y = H-groundHeight-obstacle.height;
        obstacle.harmful = false;
      }
  
      obstacles.push(obstacle);
      if (mobileMode) {
        x += 300;  // guaranteed flat recovery ground
    }


    
  
      if(Math.random() > 0.3){

        const logoIndex = Math.floor(Math.random() * 6) + 1;
      
        logos.push({
          image: "logo" + logoIndex,
          x: x + spacing * 0.4, // ALWAYS AFTER obstacle
          y: H*0.3 + Math.random()*H*0.3, // sky only
          size: 40,
          collected:false
        });
      }
  
      x += spacing;
    }
  }


function update(){
  player.velocity += gravity;
  player.y += player.velocity;
  // 🔥 ADD THIS BLOCK
  if (!isWinning && worldOffset >= worldDistance - targetCenterX) {
    isWinning = true;
    winPhase = 0;
}

  if (isWinning) {

    const castleScreenX = worldDistance - worldOffset;

    // Phase 0: scroll until exact center
    if (winPhase === 0) {

        if (castleScreenX > targetCenterX) {
            worldOffset += speed;
        } 
        else {
            // 🔥 Hard clamp immediately
            worldOffset = worldDistance - targetCenterX;
            winPhase = 1;
            playerState = "running";
        }
    }

    // Phase 1: character walks to castle
    else if (winPhase === 1) {

        if (player.x < targetCenterX - player.width - 10) {
            player.x += 2;
        } 
        else {
          playerState = "idle";
          speed = 0;
          gameEnded = true;
          resultMessage = "🚀 You Reached AGI!";
      
          setTimeout(() => {
              document.getElementById("game-popup").classList.add("active");
          }, 2000); // 1 second delay
      }
    }

    return;
}

if(player.y >= H-groundHeight-player.height){
    player.y = H-groundHeight-player.height;
    player.velocity = 0;

    if (playerState === "jumping") {
        playerState = "running";
    }
}

if (!mobileMode && introPhase) {

    if (player.x < targetCenterX) {
        player.x += 2;
        worldOffset += speed * 0.2; // slow ease
    } 
    else {
        introPhase = false;
    }

} 
else {
    worldOffset += speed;
}
obstacles.forEach(o=>{
  if(o.harmful && collide(player,o)){
    endGame(false);
  }

  if(!o.harmful && collide(player,o)){
    player.y = o.y - player.height;
    player.velocity = 0;
  }
});

logos.forEach(l=>{
    if(!l.collected && collide(player,{x:l.x,y:l.y,width:l.size,height:l.size})){
      l.collected = true;
      score += 10;
      collectSound.play();
  
      floatingTexts.push({
        x: l.x - worldOffset,
        y: l.y,
        life: 40,
        value: "+10"
      });
  
      document.getElementById("scoreBoard").textContent = "👾 " + score;
    }
  });



  let progress = Math.min(worldOffset/worldDistance,1);
  progressFill.style.width = progress*100+"%";
  progressText.textContent = Math.floor(progress*100)+"% to AGI";


}

function collide(a,b){
  return a.x < b.x-worldOffset + b.width &&
         a.x + a.width > b.x-worldOffset &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

function draw(){
  ctx.clearRect(0,0,W,H);

  ctx.drawImage(images.brick,0,H-groundHeight,W,groundHeight);
  birds.forEach(b=>{
    ctx.drawImage(images.bird, b.x - worldOffset * b.speed, b.y, b.size, b.size*0.7);
  });

  let charImg = images.character;

  if (playerState === "jumping" && images.jump) {
      charImg = images.jump;
  }
  else if (playerState === "running" && images.run1 && images.run2) {
  
      runFrameTimer++;
  
      if (runFrameTimer > 18) {
          runFrame = runFrame === 0 ? 1 : 0;
          runFrameTimer = 0;
      }
  
      charImg = runFrame === 0 ? images.run1 : images.run2;
  }
  
  ctx.drawImage(charImg, player.x, player.y, player.width, player.height);


  obstacles.forEach(o=>{
    let img = images[o.type];
    ctx.drawImage(img, o.x-worldOffset, o.y, o.width, o.height);
  });
  logos.forEach(l=>{
    if(!l.collected)
        ctx.drawImage(images[l.image], l.x-worldOffset, l.y, l.size, l.size);
  });
  if(worldOffset > worldDistance - W*1.3){
    ctx.drawImage(images.flag, worldDistance - 300 - worldOffset, H-groundHeight-150, 60,150);
  }



  if(worldOffset > worldDistance - W){

    const castleImg = images.castle;
    const desiredHeight = mobileMode ? 140 : 220;
    const ratio = castleImg.width / castleImg.height;
    const width = desiredHeight * ratio;

    ctx.drawImage(
        castleImg,
        worldDistance - worldOffset,
        H - groundHeight - desiredHeight,
        width,
        desiredHeight
    );
}


floatingTexts.forEach(f=>{
  ctx.globalAlpha = f.life / 40;  // fade out
  ctx.fillStyle = "#00ffcc";
  ctx.font = "bold 18px Arial";
  ctx.fillText(f.value, f.x, f.y);

  f.y -= 1.2;   // float up
  f.life--;
  ctx.globalAlpha = 1;
});
  floatingTexts = floatingTexts.filter(f=>f.life>0);

  if (gameEnded && resultMessage) {

    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.font = mobileMode ? "28px Inter" : "48px Inter";
    ctx.textAlign = "center";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 10;

    ctx.fillText(resultMessage, W / 2, H / 2);

    ctx.restore();
}
}

function loop(){
  if(!running || gameEnded) return;
  update();
  draw();
  requestAnimationFrame(loop);
}

function start(){
    if(running) return;
  
    running = true;
    playerState = "running";
  
    document.getElementById("startText").style.display="none";
    loop();
  }


function jump(){

    if(!running) return;
  
    if(player.velocity === 0){
        player.velocity = jumpForce;
        playerState = "jumping";
        jumpSound.play();
    }
  }

  function endGame(win){
    if(win){
        isWinning = true;
        return;
    }

    gameEnded = true;
    runFrame = 0;
    resultMessage = "💀 Game Over";

    setTimeout(() => {
        document.getElementById("game-popup").classList.add("active");
    }, 1000); // 1 second delay
}
document.addEventListener("keydown",e=>{
  if(e.code==="Space"){
    e.preventDefault();
    if(!running) start();
    else jump();
  }
});

document.addEventListener("touchstart",()=>{
  if(!running) start();
  else jump();
});

document.getElementById("game-closePopup").onclick = () => {
    const popup = document.getElementById("game-popup");
    popup.classList.remove("active");
    resetGame();
  };

  document.getElementById("game-popup").addEventListener("click", (e)=>{
    if(e.target.id === "game-popup"){
      document.getElementById("game-popup").classList.remove("active");
      resetGame();
    }
  });


  preloadImages(()=>{
    resize();
    draw();   // draw first frame
  });

function resetGame(){
    winPhase = 0;
    playerState = "idle";
    runFrame = 0;
    runFrameTimer = 0;
    worldDistance = mobileMode ? 9000 : 6000;    
    if (W < 768) speed = 1.8;
    else speed = 3;

    worldOffset = 0;
    gameEnded = false;
    running = false;
    player.velocity = 0;
    player.y = H - groundHeight - player.height;
  
    logos.forEach(l => l.collected = false);
  
    document.getElementById("startText").style.display = "block";
  
    progressFill.style.width = "0%";
    progressText.textContent = "0% to AGI";
  
    draw();
    score = 0;
    document.getElementById("scoreBoard").textContent = "👾 0";
    isWinning = false;
    winAnimationProgress = 0;
  }

  document.getElementById("ctaBtn").onclick = () => {
    document.getElementById("game-popup").classList.add("active");
  };

  document.querySelectorAll(".game-faq-item").forEach(item=>{
    const question = item.querySelector(".game-faq-question");

    question.addEventListener("click", ()=>{
        item.classList.toggle("active");
    });
});




window.addEventListener("resize",resize);

