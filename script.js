document.body.style.backgroundImage = 'url("background-image/bg1.png")';

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
    label: 'Dr Zeus Kangna',
    type: 'video'
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
  oliviaDean: {
    id: 'BcQnHzrc24Y',
    label: 'Olivia Dean',
    type: 'video'
  },
  olivia: {
    id: 'PLNE0tq7X_7rNvN1BihL2Dyd5UMJdmxXrV',
    label: 'Olivia Playlist'
  },
  southIndianBanger: {
    id: 'JgO5ly6YvGI',
    label: 'South indian Banger',
    type: 'video'
  },
  kishorKumar: {
    id: 'ebw1zHtleFY',
    label: 'Kishor Kumar',
    type: 'video'
  }
};

let playlistId = playlists.kk.id;

const playlistSelect = document.getElementById('playlistSelect');
const scanmeButton = document.getElementById('scanmeButton');
const scanUploadPanel = document.getElementById('scanUploadPanel');
const songCodeFile = document.getElementById('songCodeFile');
const scanUploadStatus = document.getElementById('scanUploadStatus');
const moreOptionsButton = document.getElementById('moreOptionsButton');
const quickOptions = document.getElementById('quickOptions');
const playlistPickerWrap = document.querySelector('.playlist-picker-wrap');
const chooseCodeOption = document.getElementById('chooseCodeOption');
const switchViewOption = document.getElementById('switchViewOption');
const secondView = document.getElementById('secondView');
const secondTrackTitle = document.getElementById('secondTrackTitle');
const secondCurrentTime = document.getElementById('secondCurrentTime');
const secondDuration = document.getElementById('secondDuration');
const secondProgressBar = document.getElementById('secondProgressBar');
const secondThumbnail = document.getElementById('secondThumbnail');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const rewindBtn = document.getElementById('rewindBtn');
const forwardBtn = document.getElementById('forwardBtn');
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
const songCodeEl = document.getElementById('songCode');

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
    playerVars: {controls:0, disablekb:1, modestbranding:1, rel:0, playsinline:1},
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

function updateMediaSession(){
  if(!('mediaSession' in navigator) || !('MediaMetadata' in window) || !player) return;
  const videoData = player.getVideoData && player.getVideoData();
  const title = videoData && videoData.title ? videoData.title : titleEl.textContent;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: title || 'Cool Music Player',
    artist: 'YouTube playlist',
    album: 'Cool Music Player'
  });
}

function setMediaSessionPlaybackState(state){
  if('mediaSession' in navigator) navigator.mediaSession.playbackState = state;
}

if('mediaSession' in navigator){
  navigator.mediaSession.setActionHandler('play', () => player && player.playVideo());
  navigator.mediaSession.setActionHandler('pause', () => player && player.pauseVideo());
  navigator.mediaSession.setActionHandler('previoustrack', () => prevBtn.click());
  navigator.mediaSession.setActionHandler('nexttrack', () => nextBtn.click());
  navigator.mediaSession.setActionHandler('seekbackward', () => player && player.seekTo(Math.max(0, player.getCurrentTime() - 10), true));
  navigator.mediaSession.setActionHandler('seekforward', () => player && player.seekTo(player.getCurrentTime() + 10, true));
}

function onPlayerStateChange(e){
  const YTstate = YT.PlayerState;
  if(e.data === YTstate.PLAYING){ setPlayPauseIcon(true); setMediaSessionPlaybackState('playing'); }
  if(e.data === YTstate.PAUSED){ setPlayPauseIcon(false); setMediaSessionPlaybackState('paused'); }
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
  try{ updateMediaSession(); }catch(e){}
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
  secondTrackTitle.textContent = title;
  updateMediaSession();
  // update thumbnail for current video
  try{
    const vid = playlist && playlist.length ? playlist[idx] : null;
    if(vid) setThumbnailByVideoId(vid);
  }catch(e){}
}

function setThumbnailByVideoId(id){
  if(!artEl) return;
  updateSongCode(id);
  // prefer high quality thumbnail, fallback to hqdefault
  const urls = [
    `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${id}/sddefault.jpg`,
    `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
  ];
  // try each url by setting it; browser will show best available
  artEl.style.backgroundImage = `url('${urls[0]}')`;
  if(secondThumbnail){
    secondThumbnail.src = urls[0];
    secondThumbnail.onerror = () => { secondThumbnail.src = urls[2]; };
  }
  // also set backgroundImage to the fallback after a short delay if first 404s (best-effort)
  setTimeout(()=>{ artEl.style.backgroundImage = `url('${urls[2]}')`; }, 500);
}

function updateSongCode(id){
  if(!songCodeEl || !id) return;
  let seed = 0;
  for(let i=0;i<id.length;i++) seed = (seed * 31 + id.charCodeAt(i)) >>> 0;
  songCodeEl.replaceChildren();
  for(let i=0;i<34;i++){
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const bar = document.createElement('span');
    bar.className = 'song-code-bar';
    bar.style.height = `${12 + (seed % 27)}px`;
    songCodeEl.appendChild(bar);
  }
  const logo = document.createElement('span');
  logo.className = 'song-code-logo';
  logo.setAttribute('aria-hidden', 'true');
  songCodeEl.insertBefore(logo, songCodeEl.children[Math.floor(songCodeEl.children.length / 2)]);
}

function extractVideoId(value){
  const match = String(value).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})|^([\w-]{11})$/);
  return match ? (match[1] || match[2]) : null;
}

function playUploadedVideo(videoId){
  if(!player){
    scanUploadStatus.textContent = 'Player is still loading. Try again in a moment.';
    return;
  }
  playlistId = videoId;
  playlist = [videoId];
  player.loadVideoById({videoId});
  setThumbnailByVideoId(videoId);
  scanUploadStatus.textContent = 'Code loaded. Press play to listen.';
}

async function handleSongCodeFile(file){
  if(!file) return;
  scanUploadStatus.textContent = 'Reading code...';
  if(file.type === 'text/plain' || file.name.endsWith('.json')){
    const videoId = extractVideoId(await file.text());
    if(videoId) playUploadedVideo(videoId);
    else scanUploadStatus.textContent = 'No YouTube song ID found in that file.';
    return;
  }
  if('BarcodeDetector' in window){
    try{
      const detector = new BarcodeDetector({formats:['qr_code','code_128','code_39','ean_13']});
      const results = await detector.detect(await createImageBitmap(file));
      const videoId = results.map(result => extractVideoId(result.rawValue)).find(Boolean);
      if(videoId) playUploadedVideo(videoId);
      else scanUploadStatus.textContent = 'No supported song code found in that image.';
      return;
    }catch(e){}
  }
  scanUploadStatus.textContent = 'Image selected. This browser cannot decode barcode images.';
}

scanmeButton.addEventListener('click', () => {
  scanUploadPanel.hidden = false;
  scanmeButton.setAttribute('aria-expanded', 'true');
  songCodeFile.click();
});
songCodeFile.addEventListener('change', event => handleSongCodeFile(event.target.files[0]));
function closeQuickOptions(){
  quickOptions.hidden = true;
  playlistPickerWrap.classList.remove('options-open');
  moreOptionsButton.setAttribute('aria-expanded', 'false');
}
moreOptionsButton.addEventListener('click', () => {
  const shouldOpen = quickOptions.hidden;
  quickOptions.hidden = !shouldOpen;
  playlistPickerWrap.classList.toggle('options-open', shouldOpen);
  moreOptionsButton.setAttribute('aria-expanded', String(shouldOpen));
});
switchViewOption.addEventListener('click', () => {
  const showingSecondView = secondView.hidden;
  secondView.hidden = !showingSecondView;
  document.querySelector('.bottom-player').hidden = showingSecondView;
  switchViewOption.textContent = showingSecondView ? 'Back to player' : 'Switch player view';
  closeQuickOptions();
});
document.querySelectorAll('[data-player-action]').forEach(button => {
  button.addEventListener('click', () => {
    const action = button.dataset.playerAction;
    if(action === 'prev') prevBtn.click();
    if(action === 'rewind') rewindBtn.click();
    if(action === 'replay') replayBtn.click();
    if(action === 'play') playPauseBtn.click();
    if(action === 'forward') forwardBtn.click();
    if(action === 'next') nextBtn.click();
    if(action === 'shuffle') shuffleBtn.click();
    if(action === 'loop') loopBtn.click();
  });
});
secondView.addEventListener('click', event => {
  if(event.target === secondView){
    secondView.hidden = true;
    document.querySelector('.bottom-player').hidden = false;
  }
});
chooseCodeOption.addEventListener('click', () => {
  closeQuickOptions();
  songCodeFile.click();
});

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

function seekBySeconds(deltaSeconds){
  if(!player) return;
  try{
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration() || 0;
    const nextTime = Math.min(Math.max(currentTime + deltaSeconds, 0), duration);
    player.seekTo(nextTime, true);
  }catch(e){}
}

rewindBtn.addEventListener('click', ()=> seekBySeconds(-10));
replayBtn.addEventListener('click', ()=>{ if(player) player.seekTo(0); });
forwardBtn.addEventListener('click', ()=> seekBySeconds(10));
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
    secondCurrentTime.textContent = formatTime(cur);
    secondDuration.textContent = formatTime(dur);
    secondProgressBar.style.width = pct + '%';
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

// ── Bus Quote Ticker ──
(function(){
  const quotes = [
    "कृपया खिड़की से बाहर हाथ या सिर न निकालें",
    "बुरी नज़र वाले तेरा मुँह काला",
    "जल्दी का काम शैतान का",
    "मेरी माँ की दुआ मेरे साथ है",
    "हॉर्न ओके प्लीज़",
    "तेरी मेहनत ही तेरी तकदीर है",
    "दारू पीके गाड़ी मत चलाओ",
    "जान है तो जहान है",
    "भगवान भरोसे मत बैठो — वो भी बिज़ी हैं",
    "सीट बेल्ट लगाओ, ज़िंदगी बचाओ",
    "यह गाड़ी नहीं, मेरी जान है",
    "सवारी से प्यार, ड्राइवर का कर्तव्य",
    "धीरे चलो, घर पहुँचो",
    "ओवरटेक करने की जल्दी में मत पड़ो",
    "रोड पर ध्यान, मोबाइल बाद में",
    "मेरा भारत महान",
    "जय हो बाबा का",
    "माँ की दुआ, साथ सदा",
    "टूटे नहीं ये सपने मेरे",
    "खाली पेट गाड़ी मत चलाओ",
    "नींद में मत गाड़ी चलाओ",
    "फोन बाद में, पहले जान",
    "आज नहीं तो कल, कल नहीं तो परसों",
    "दिल्ली अभी दूर है",
    "मुसाफिर हूँ यारों",
    "जहाँ चाह वहाँ राह",
    "कदम कदम बढ़ाए जा",
    "ये रास्ते पूछते हैं मंज़िल कहाँ है",
    "घर की याद आए तो मुस्कुराओ",
    "गाड़ी चलाना ज़िम्मेदारी है",
    "पहले सुरक्षा, फिर मंज़िल",
    "यह सफर ज़िंदगी भर याद रहेगा",
    "हर घड़ी हो ख़याल तेरा",
    "इस गाड़ी में भगवान का वास है",
    "शुक्रिया सफर में साथ देने के लिए",
    "रफ्तार कम, ज़िंदगी लंबी",
    "जय बजरंग बली",
    "हर हर महादेव",
    "वाहे गुरु दा खालसा, वाहे गुरु दी फतेह",
    "इंशाल्लाह सलामत पहुँचेंगे",
    "बिस्मिल्लाह",
    "जय माता दी",
    "सत श्री अकाल",
    "जय श्री राम",
    "भगवान की कृपा से",
    "नज़र लागे ना किसी की",
    "जिंदगी एक सफर है सुहाना",
    "चलते रहो, रुकना मत",
    "मंज़िल मिलेगी ज़रूर",
    "हिम्मत रखो, राह मिलेगी",
    "Buri nazar wale tera muh kala",
    "Horn OK Please",
    "Use Dipper at Night",
    "Keep Distance",
    "Speed Thrills But Kills",
    "Life is a Journey, Enjoy the Ride",
    "My Road, My Rules",
    "Touch Me Not",
    "Blow Horn",
    "Dekh Ke Chalna Bhai",
    "India is Great",
    "God is My Co-Pilot",
    "Drive Like Hell and You Will Be There",
    "Accident Proof Vehicle",
    "This Vehicle Runs on Prayers",
    "No Entry For Evil Eye",
    "Jai Mata Di",
    "Safe Drive, Save Life",
    "Don't Drink and Drive",
    "Wear Seat Belt",
    "Keep Your Distance",
    "Slow Down, Save a Life",
    "मेरे देश की धरती सोना उगले",
    "यारों की यारी, जिंदगी से प्यारी",
    "बस वाला आ रहा है, हट जाओ",
    "टाइम से चलो, टाइम पर पहुँचो",
    "ड्राइवर भी इंसान है, उसे भी आराम दो",
    "ज़िंदगी छोटी है, सफर लंबा",
    "रात को लाइट जलाओ",
    "दाएँ मुड़ो, बाएँ मुड़ो, पर सोच-समझकर",
    "मेरी गाड़ी मेरी जान",
    "सड़क पर ध्यान दो",
    "जय हो माँ वैष्णो देवी",
    "शिरडी वाले साईं बाबा की जय",
    "तिरुपति बालाजी की जय",
    "गुरु का आशीर्वाद साथ है",
    "पेड़ लगाओ, जीवन बचाओ",
    "हरियाली से है खुशहाली",
    "सफर में दोस्त बनाओ",
    "अकेला चना भाड़ नहीं फोड़ता",
    "एकता में बल है",
    "सब का साथ, सब का विकास",
    "वंदे मातरम्",
    "जय हिंद",
    "इंकलाब ज़िंदाबाद",
    "मेरे सपने मेरी मंज़िल",
    "हार मत मानो, चलते रहो",
    "समय से चलो, समय पर पहुँचो",
    "ज़िंदगी में रिस्क लो, पर सड़क पर नहीं",
    "आगे बढ़ते रहो",
    "हमसफर मिले तो सफर आसान लगे",
    "यह बस आपकी अपनी है — संभाल कर रखें"
  ];

  const el = document.getElementById('busQuoteText');
  if(!el) return;

  let qi = 0;

  function showQuote(idx){
    el.classList.add('fade-out');
    setTimeout(function(){
      el.textContent = quotes[idx];
      el.classList.remove('fade-out');
    }, 420);
  }

  el.textContent = quotes[0];

  setInterval(function(){
    qi = (qi + 1) % quotes.length;
    showQuote(qi);
  }, 12000);
})();

// ── Playlist button toggle ──
(function(){
  const btn = document.getElementById('playlistToggleBtn');
  const picker = document.querySelector('.playlist-picker-wrap');
  if(!btn || !picker) return;
  btn.addEventListener('click', function(){
    picker.classList.toggle('playlist-highlight');
    // scroll the select into view / open it
    const sel = document.getElementById('playlistSelect');
    if(sel) sel.focus();
  });
})();

// ── Destination Board — 29 States & Districts ──
(function(){
  // Each entry: [state abbreviation, [district1, district2, district3, district4, district5]]
  var stateRoutes = [
    ['AP', ['VISAKHAPATNAM','VIJAYAWADA','GUNTUR','NELLORE','KURNOOL','TIRUPATI','KADAPA','ANANTAPUR','CHITTOOR','RAJAHMUNDRY','ELURU','MACHILIPATNAM','ONGOLE','HINDUPUR','TADIPATRI']],
    ['AR', ['ITANAGAR','NAHARLAGUN','PASIGHAT','ZIRO','BOMDILA','TAWANG','ALONG','TEZU','ROING','CHANGLANG','KHONSA','AALO','DAPORIJO','YINGKIONG','NAMSAI']],
    ['AS', ['GUWAHATI','DIBRUGARH','JORHAT','SILCHAR','NAGAON','TEZPUR','TINSUKIA','BONGAIGAON','SIVASAGAR','DHUBRI','GOALPARA','KARIMGANJ','DIPHU','HAFLONG','MANGALDOI']],
    ['BR', ['PATNA','GAYA','MUZAFFARPUR','BHAGALPUR','PURNIA','DARBHANGA','ARRAH','BEGUSARAI','KATIHAR','MUNGER','SAMASTIPUR','CHAPRA','SIWAN','MOTIHARI','HAJIPUR']],
    ['CG', ['RAIPUR','BILASPUR','DURG','KORBA','RAJNANDGAON','JAGDALPUR','AMBIKAPUR','RAIGARH','MAHASAMUND','KAWARDHA','KANKER','KONDAGAON','DHAMTARI','JANJGIR','BEMETARA']],
    ['GA', ['PANAJI','MARGAO','VASCO','MAPUSA','PONDA','BICHOLIM','SANQUELIM','QUEPEM','CURCHOREM','CANACONA','PERNEM','SANGUEM','CALANGUTE','CANDOLIM','ALDONA']],
    ['GJ', ['AHMEDABAD','SURAT','VADODARA','RAJKOT','BHAVNAGAR','JAMNAGAR','JUNAGADH','GANDHINAGAR','ANAND','NAVSARI','MEHSANA','PATAN','VALSAD','PORBANDAR','MORBI']],
    ['HR', ['GURUGRAM','FARIDABAD','AMBALA','HISAR','ROHTAK','KARNAL','PANIPAT','SONIPAT','YAMUNANAGAR','PANCHKULA','SIRSA','BHIWANI','REWARI','JHAJJAR','KAITHAL']],
    ['HP', ['SHIMLA','MANALI','DHARAMSHALA','SOLAN','MANDI','KULLU','KANGRA','HAMIRPUR','UNA','BILASPUR','CHAMBA','KINNAUR','SIRMAUR','LAHAUL','NAHAN']],
    ['JH', ['RANCHI','JAMSHEDPUR','DHANBAD','BOKARO','HAZARIBAGH','DEOGHAR','GIRIDIH','DUMKA','PALAMU','CHAIBASA','KODERMA','LOHARDAGA','PAKUR','SAHIBGANJ','RAMGARH']],
    ['KA', ['BENGALURU','MYSURU','HUBLI','MANGALURU','BELAGAVI','KALABURAGI','DAVANGERE','SHIVAMOGGA','TUMAKURU','BIDAR','RAICHUR','HASSAN','UDUPI','VIJAYAPURA','CHITRADURGA']],
    ['KL', ['THIRUVANANTHAPURAM','KOCHI','KOZHIKODE','THRISSUR','KANNUR','KOLLAM','PALAKKAD','MALAPPURAM','ALAPPUZHA','KOTTAYAM','PATHANAMTHITTA','IDUKKI','KASARAGOD','WAYANAD','ERNAKULAM']],
    ['MP', ['BHOPAL','INDORE','JABALPUR','GWALIOR','UJJAIN','SAGAR','REWA','SATNA','DEWAS','CHHINDWARA','RATLAM','SINGRAULI','VIDISHA','SHIVPURI','MANDSAUR']],
    ['MH', ['MUMBAI','PUNE','NAGPUR','NASHIK','AURANGABAD','SOLAPUR','AMRAVATI','KOLHAPUR','THANE','SANGLI','LATUR','JALGAON','AHMEDNAGAR','NANDED','SATARA']],
    ['MN', ['IMPHAL','THOUBAL','BISHNUPUR','CHURACHANDPUR','SENAPATI','UKHRUL','CHANDEL','TAMENGLONG','KANGPOKPI','JIRIBAM','NONEY','KAMJONG','PHERZAWL','TENGNOUPAL','KAKCHING']],
    ['ML', ['SHILLONG','TURA','JOWAI','NONGSTOIN','BAGHMARA','WILLIAMNAGAR','AMPATI','RESUBELPARA','MAIRANG','CHERRAPUNJEE','MAWKYRWAT','KHLIEHRIAT','MAWSYNRAM','SOHRA','NONGPOH']],
    ['MZ', ['AIZAWL','LUNGLEI','CHAMPHAI','KOLASIB','SERCHHIP','MAMIT','LAWNGTLAI','SAIHA','HNAHTHIAL','KHAWZAWL','SAITUAL','NORTH VANLAIPHAI','THENZAWL','BIATE','BAIRABI']],
    ['NL', ['KOHIMA','DIMAPUR','MOKOKCHUNG','WOKHA','TUENSANG','MON','ZUNHEBOTO','PHEK','KIPHIRE','LONGLENG','PEREN','NOKLAK','TSEMINYU','SHAMATOR','CHUMOUKEDIMA']],
    ['OD', ['BHUBANESWAR','CUTTACK','ROURKELA','BERHAMPUR','SAMBALPUR','PURI','BALASORE','BARIPADA','BHADRAK','KORAPUT','BALANGIR','DHENKANAL','KENDRAPARA','PHULBANI','SUNDARGARH']],
    ['PB', ['LUDHIANA','AMRITSAR','JALANDHAR','PATIALA','BATHINDA','MOHALI','HOSHIARPUR','GURDASPUR','PATHANKOT','FEROZEPUR','MOGA','SANGRUR','KAPURTHALA','FARIDKOT','MUKTSAR']],
    ['RJ', ['JAIPUR','JODHPUR','KOTA','BIKANER','AJMER','UDAIPUR','BHILWARA','ALWAR','BHARATPUR','SIKAR','TONK','SAWAI MADHOPUR','PALI','NAGAUR','CHURU']],
    ['SK', ['GANGTOK','NAMCHI','GYALSHING','MANGAN','PAKYONG','SORENG','RONGLI','RAVANGLA','JORETHANG','NAYABAZAR','SINGTAM','RANGPO','MELLI','CHUNGTHANG','LACHUNG']],
    ['TN', ['CHENNAI','COIMBATORE','MADURAI','TIRUCHIRAPPALLI','SALEM','TIRUNELVELI','ERODE','TIRUPPUR','VELLORE','THANJAVUR','DINDIGUL','VIRUDHUNAGAR','KARUR','NAMAKKAL','NILGIRIS']],
    ['TG', ['HYDERABAD','WARANGAL','NIZAMABAD','KARIMNAGAR','KHAMMAM','NALGONDA','ADILABAD','SURYAPET','SIDDIPET','MAHBUBNAGAR','MEDAK','RANGAREDDY','JAGTIAL','MANCHERIAL','BHADRADRI']],
    ['TR', ['AGARTALA','UDAIPUR','DHARMANAGAR','BELONIA','KAILASAHAR','AMBASSA','SABROOM','KHOWAI','KAMALPUR','SONAMURA','MELAGHAR','JIRANIA','BISHALGARH','SANTIRBAZAR','KUMARGHAT']],
    ['UP', ['LUCKNOW','KANPUR','VARANASI','AGRA','PRAYAGRAJ','MEERUT','GHAZIABAD','NOIDA','BAREILLY','ALIGARH','MORADABAD','SAHARANPUR','GORAKHPUR','FAIZABAD','MATHURA']],
    ['UK', ['DEHRADUN','HARIDWAR','RISHIKESH','MUSSOORIE','NAINITAL','HALDWANI','ROORKEE','KASHIPUR','ALMORA','RUDRAPUR','KOTDWAR','PITHORAGARH','BAGESHWAR','CHAMOLI','TEHRI']],
    ['WB', ['KOLKATA','HOWRAH','SILIGURI','DURGAPUR','ASANSOL','BARDHAMAN','MALDA','BARASAT','KRISHNANAGAR','HALDIA','JALPAIGURI','COOCH BEHAR','BANKURA','PURULIA','RAIGANJ']],
    ['DL', ['NEW DELHI','SOUTH DELHI','EAST DELHI','NORTH DELHI','WEST DELHI','DWARKA','ROHINI','SHAHDARA','MEHRAULI','NARELA','NAJAFGARH','ALIPUR','DEFENCE COLONY','LAJPAT NAGAR','KAROL BAGH']],
  ];

  // Build flat list of routes (4 stops each, sliding window within each state)
  var routes = [];
  stateRoutes.forEach(function(entry){
    var abbr = entry[0];
    var districts = entry[1];
    for(var i = 0; i <= districts.length - 4; i++){
      routes.push({ stops: districts.slice(i, i + 4), state: abbr });
    }
  });

  // Shuffle for variety
  for(var i = routes.length - 1; i > 0; i--){
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = routes[i]; routes[i] = routes[j]; routes[j] = tmp;
  }

  var el = document.getElementById('busBoardRoute');
  if(!el) return;

  var current = 0;

  function renderRoute(route){
    el.innerHTML = '';
    route.stops.forEach(function(stop, i){
      var s = document.createElement('span');
      s.className = 'stop';
      s.textContent = stop;
      el.appendChild(s);
      if(i < route.stops.length - 1){
        var a = document.createElement('span');
        a.className = 'arrow';
        a.textContent = '→';
        el.appendChild(a);
      }
    });
    var tag = document.createElement('span');
    tag.className = 'state-tag';
    tag.textContent = '| ' + route.state;
    el.appendChild(tag);
  }

  function cycleBoard(){
    el.classList.add('fade-out');
    setTimeout(function(){
      current = (current + 1) % routes.length;
      renderRoute(routes[current]);
      el.classList.remove('fade-out');
    }, 400);
  }

  renderRoute(routes[0]);
  setInterval(cycleBoard, 4000);
})();

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


