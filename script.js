const images = [
  'background-image/bg1.png',
  'background-image/bg2.jpeg',
  'background-image/bg3.jpeg',
  'background-image/4011087179538207.jpeg',
  'background-image/7388786884697592.jpeg',
  'background-image/Mountain Gazer in Anime Style.jpeg',
  'background-image/tangled movie.jpeg'
];

function setRandomBackground(){
  const choice = images[Math.floor(Math.random()*images.length)];
  document.body.style.backgroundImage = `url("${choice}")`;
}
setRandomBackground();

const dtEl = document.getElementById('datetime');
function updateDateTime(){
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const suffix = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  dtEl.textContent = `${hours}:${minutes} ${suffix}`;
}
updateDateTime();
setInterval(updateDateTime,1000);

// --- YouTube playlist setup ---
const playlists = {
  kk: {
    id: 'PLxU7zIeb6ameVyzZ45r_4OQyRid3_VSha',
    label: 'KK Playlist'
  },
  busWala: {
    id: 'PL0umg_TNpoZTTdZVIi5tfX69pRmoMFGna',
    label: 'Bus Wala Playlist'
  },
  love: {
    id: 'PL3-sRm8xAzY8LhlTyJ2uf-EcQSm_vzSqw',
    label: 'Love Playlist'
  },
  drZeusKangna: {
    id: 'ua_jvj9dZJQ',
    label: 'Dr Zeus Kangna'
  },
  rajasthaniBanger: {
    id: '04ygfVQjMxY',
    label: 'Rajasthani Banger',
    type: 'video'
  },
  saiAbhyankar: {
    id: 'PLnO8uDr9uT6Elyipct9SiAXh2s_SfHshD',
    label: 'Sai Abhyankar'
  },
  olivia: {
    id: 'PLNE0tq7X_7rNvN1BihL2Dyd5UMJdmxXrV',
    label: 'Olivia Playlist'
  },
  southIndianBanger: {
    id: 'JgO5ly6YvGI',
    label: 'South indian Banger',
    type: 'video'
  }
};

let playlistId = playlists.kk.id;

const playlistSelect = document.getElementById('playlistSelect');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const loopBtn = document.getElementById('loopBtn');
const replayBtn = document.getElementById('replayBtn');
const titleEl = document.getElementById('trackTitle');
const progress = document.getElementById('progress');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const artEl = document.querySelector('.art');

let player;
let playlist = [];
let index = 0;
let isShuffle = false;
let isLoop = false;
let shuffledOrder = [];

// Load YouTube IFrame API
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

function onYouTubeIframeAPIReady(){
  player = new YT.Player('yt-player', {
    height: '1', width: '1',
    playerVars: {controls:0, disablekb:1, modestbranding:1, rel:0},
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
}

function loadSelectedPlaylist(){
  if (!player) return;

  try {
    player.stopVideo();
  } catch (e) {}

  const selected = Object.values(playlists).find(item => item.id === playlistId && item.type === 'video') || null;

  if (selected) {
    player.loadVideoById({videoId: selected.id});
    playlist = [selected.id];
    updateTitle();
    setThumbnailByVideoId(selected.id);
    return;
  }

  player.loadPlaylist({list: playlistId, listType: 'playlist', index: 0});

  const t = setInterval(()=>{
    const pl = player.getPlaylist();
    if(pl && pl.length){
      clearInterval(t);
      playlist = pl.slice();
      updateTitle();
      try{ setThumbnailByVideoId(playlist[0]); }catch(e){}
      try {
        setTimeout(() => player.playVideo(), 200);
      } catch (e) {}
    }
  },250);
}

function onPlayerReady(){
  loadSelectedPlaylist();
}

function setPlayPauseIcon(isPlaying){
  const pauseSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 6.5h3.5v11H7zm6.5 0H17v11h-3.5z"/></svg>';
  const playSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6.4v11.2l9.2-5.6z"/></svg>';
  playPauseBtn.innerHTML = isPlaying ? pauseSvg : playSvg;
}

function onPlayerStateChange(e){
  const YTstate = YT.PlayerState;
  if(e.data === YTstate.PLAYING){ setPlayPauseIcon(true); }
  if(e.data === YTstate.PAUSED){ setPlayPauseIcon(false); }
  if(e.data === YTstate.ENDED){
    const idx = player.getPlaylistIndex();
    const len = playlist.length || 0;
    if(isLoop){ player.seekTo(0); player.playVideo(); }
    else if(isShuffle){ nextShuffled(); }
    else if(idx >= len-1){ /* reached end */ player.stopVideo(); setPlayPauseIcon(false); }
    else { player.nextVideo(); }
  }
  // update title on state changes
  try{ updateTitle(); }catch(e){}
  // toggle rotating disk when playing/paused
  try{
    const state = player.getPlayerState();
    if(state === YT.PlayerState.PLAYING) artEl && artEl.classList.add('rotating');
    else artEl && artEl.classList.remove('rotating');
  }catch(e){}
}

function updateTitle(){
  if(!player) return;
  const idx = typeof player.getPlaylistIndex === 'function' ? player.getPlaylistIndex() : 0;
  const videoData = player.getVideoData && player.getVideoData();
  const title = (videoData && videoData.title) ? videoData.title : `Video ${idx+1}`;
  titleEl.textContent = title;
  // update thumbnail for current video
  try{
    const vid = playlist && playlist.length ? playlist[idx] : null;
    if(vid) setThumbnailByVideoId(vid);
  }catch(e){}
}

function setThumbnailByVideoId(id){
  if(!artEl) return;
  // prefer high quality thumbnail, fallback to hqdefault
  const urls = [
    `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${id}/sddefault.jpg`,
    `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
  ];
  // try each url by setting it; browser will show best available
  artEl.style.backgroundImage = `url('${urls[0]}')`;
  // also set backgroundImage to the fallback after a short delay if first 404s (best-effort)
  setTimeout(()=>{ artEl.style.backgroundImage = `url('${urls[2]}')`; }, 500);
}

playPauseBtn.addEventListener('click', ()=>{
  if(!player) return;
  const state = player.getPlayerState();
  if(state === YT.PlayerState.PLAYING) player.pauseVideo();
  else player.playVideo();
});

if (playlistSelect) {
  playlistSelect.value = 'kk';
  playlistSelect.addEventListener('change', (event) => {
    const key = event.target.value;
    const selected = playlists[key];
    if (!selected) return;
    playlistId = selected.id;
    loadSelectedPlaylist();
  });
}

setPlayPauseIcon(false);

prevBtn.addEventListener('click', ()=>{
  if(!player) return;
  try{ const cur = player.getCurrentTime(); if(cur>3){ player.seekTo(0); return; } }catch(e){}
  const idx = player.getPlaylistIndex();
  const len = playlist.length || 0;
  const prev = (idx-1+len)%len;
  player.playVideoAt(prev);
});

replayBtn.addEventListener('click', ()=>{ if(player) player.seekTo(0); });

nextBtn.addEventListener('click', ()=>{ if(player) player.nextVideo(); });

shuffleBtn.addEventListener('click', ()=>{
  isShuffle = !isShuffle;
  shuffleBtn.style.background = isShuffle ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.38)';
  shuffleBtn.style.borderColor = isShuffle ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.18)';
  if(isShuffle){
    const len = playlist.length;
    shuffledOrder = [...Array(len).keys()];
    // Fisher-Yates shuffle
    for(let i=len-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [shuffledOrder[i],shuffledOrder[j]]=[shuffledOrder[j],shuffledOrder[i]]; }
  }
});

loopBtn.addEventListener('click', ()=>{
  isLoop = !isLoop;
  loopBtn.style.background = isLoop ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.38)';
  loopBtn.style.borderColor = isLoop ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.18)';
});

function nextShuffled(){
  if(!player) return;
  const idx = player.getPlaylistIndex();
  const pos = shuffledOrder.indexOf(idx);
  const nextPos = (pos+1) % shuffledOrder.length;
  const nextIdx = shuffledOrder[nextPos];
  player.playVideoAt(nextIdx);
}

// progress polling
setInterval(()=>{
  if(!player) return;
  try{
    const cur = player.getCurrentTime();
    const dur = player.getDuration() || 0;
    const pct = dur ? (cur/dur)*100 : 0;
    progressBar.style.width = pct + '%';
    currentTimeEl.textContent = formatTime(cur);
    durationEl.textContent = formatTime(dur);
  }catch(e){}
},250);

progress.addEventListener('click', (e)=>{
  if(!player) return;
  const rect = progress.getBoundingClientRect();
  const pct = (e.clientX - rect.left)/rect.width;
  const dur = player.getDuration() || 0;
  player.seekTo(pct * dur, true);
});

function formatTime(sec){
  if(!isFinite(sec)) return '0:00';
  const s = Math.floor(sec%60).toString().padStart(2,'0');
  const m = Math.floor(sec/60);
  return `${m}:${s}`;
}

// Expose API callback
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

// Platform detection and body class for responsive sizing
function detectPlatformClass(){
  const ua = navigator.userAgent || navigator.vendor || window.opera || '';
  const b = document.body;
  if(/android/i.test(ua)) b.classList.add('platform-android');
  else if(/iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document)) b.classList.add('platform-ios');
  else if(/Win/i.test(ua)) b.classList.add('platform-windows');
  else if(/Mac/i.test(ua)) b.classList.add('platform-mac');
  else if(/Linux/i.test(ua)) b.classList.add('platform-linux');
  else b.classList.add('platform-unknown');
}
detectPlatformClass();


