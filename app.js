// LumiPhones Simulator v2 — marketplace photos + deeper mechanics
let balance = 1500;
let cart = [];
let inventory = [];
let uidC = 1;
let shopCat = 'phones';
let pcSub = 'ALL';
let phoneOffers = [];
let activePhoneUid = null;
let pcBuild = {CPU:null,GPU:null,RAM:null,BOARD:null,SSD:null,PSU:null,CASE:null,COOLER:null};
let usbInserted = null;
let bios = {tab:0,sel:0,ram:8,max:16};
let installedApps = {};
let stats = {profit:0,repairs:0,pcs:0,units:0,xp:0};
let haggled = {};
let selectedPartUid = null;

const $ = s=>document.querySelector(s);
const toast = m=>{const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),2000);};
const money = n=>'$'+Number(Math.round(n)).toLocaleString();
const U = id=>`https://images.unsplash.com/${id}?w=400&q=80&auto=format&fit=crop`;
// Type-accurate photo pools (every photo matches its component type).
// Variants use imgix params so each model gets a UNIQUE but still correct photo.
const PHOTO={
 CPU:['photo-1555617981-dac3880eac6e','photo-1591799264318-7e6ef8ddb7ea','photo-1591405351990-4726e331f141'],
 GPU:['photo-1591488320449-011701bb6704','photo-1587202372775-e229f172b9d7','photo-1587831990711-23ca6441447b'],
 RAM:['photo-1562976540-1502c2145186'],
 BOARD:['photo-1518770660439-4636190af475'],
 SSD:['photo-1597872200969-2b65d56bd16b'],
 PSU:['photo-1587202372634-32705e3bf49c'],
 CASE:['photo-1587202372775-e229f172b9d7','photo-1593642632823-8f785ba67e45'],
 COOLER:['photo-1591799264318-7e6ef8ddb7ea','photo-1555617981-dac3880eac6e'],
 USB:['photo-1629654297299-c8506221ca97'],
 MACUSB:['photo-1618410320928-25228d811631'],
};
const ICON={CPU:'🔲',GPU:'🎮',RAM:'🧠',BOARD:'🟩',SSD:'💾',PSU:'🔌',CASE:'🖥️',COOLER:'🌀',OS:'💿'};
// Unique-but-accurate photo per item: pool[type][index] + tone variant. idx = position in catalog.
const PX=(type,idx)=>{const p=PHOTO[type]||PHOTO.BOARD;const base=p[idx%p.length];const tones=['','&sat=-40','&sat=30','&con=15','&sat=-70&con=10','&sat=50'];return U(base)+tones[Math.floor(idx/p.length)%tones.length]+`&sig=${idx}`;};
// Phone photo fallback: GSMArena mirror host (fdn <-> fdn2)
const phoneFb = img=>img.replace('fdn2.gsmarena.com','fdn.gsmarena.com');

// save / load
function save(){try{localStorage.setItem('lumi_v2',JSON.stringify({balance,inventory,stats,uidC}));}catch(e){}}
function load(){try{const d=JSON.parse(localStorage.getItem('lumi_v2'));if(d){balance=d.balance;inventory=d.inventory||[];stats=d.stats||stats;uidC=d.uid||100;}}catch(e){}}
function addXP(n){stats.xp+=n;save();renderStats();}
function renderStats(){
  const lvl=1+Math.floor(stats.xp/100);
  $('#statPill').textContent=`⭐ Lv${lvl} • ${stats.profit>=0?'+':''}${money(stats.profit)} • 🔧${stats.repairs} 🖥️${stats.pcs}`;
  const pct=stats.xp%100;
  const f=$('#xpFill');if(f){f.style.width=pct+'%';$('#xpLabel').textContent=`Level ${lvl} — ${pct}/100 XP • Profit ${money(stats.profit)} • Repairs ${stats.repairs} • PCs ${stats.pcs} • Units ${stats.units}`;}
}

// ---------- DATA : marketplace-sourced photos ----------
// Phones: real GSMArena retail photos (same as Amazon/eBay listings) + marketplace tag
const PHONES=[
 {name:'iPhone 13',img:'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13.jpg',base:620,mk:'Amazon Renewed'},
 {name:'iPhone 14 Pro',img:'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-pro.jpg',base:850,mk:'eBay Refurb'},
 {name:'iPhone 15',img:'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15.jpg',base:900,mk:'BestBuy'},
 {name:'iPhone 15 Pro',img:'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro.jpg',base:1050,mk:'Amazon'},
 {name:'iPhone 11',img:'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-11.jpg',base:350,mk:'eBay'},
 {name:'iPhone X',img:'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-x.jpg',base:280,mk:'eBay'},
 {name:'Samsung Galaxy S23',img:'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-5g.jpg',base:640,mk:'Amazon'},
 {name:'Samsung Galaxy S24',img:'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-5g.jpg',base:750,mk:'Amazon'},
 {name:'Galaxy S22',img:'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s22-5g.jpg',base:450,mk:'eBay'},
 {name:'Galaxy S21',img:'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-5g.jpg',base:360,mk:'eBay Refurb'},
 {name:'Google Pixel 8',img:'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8.jpg',base:560,mk:'eBay'},
 {name:'Google Pixel 9',img:'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9.jpg',base:700,mk:'BestBuy'},
 {name:'Pixel 7',img:'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7.jpg',base:420,mk:'Amazon'},
 {name:'Pixel 6',img:'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-6.jpg',base:300,mk:'eBay'},
 {name:'iPhone 12',img:'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12.jpg',base:430,mk:'eBay'},
 {name:'Galaxy Z Flip 4',img:'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip4-5g.jpg',base:590,mk:'Amazon'},
 {name:'Galaxy Z Fold 5',img:'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold5-5g.jpg',base:1150,mk:'BestBuy'},
 {name:'OnePlus 11',img:'https://fdn2.gsmarena.com/vv/bigpic/oneplus-11.jpg',base:520,mk:'Newegg'},
 {name:'OnePlus 10 Pro',img:'https://fdn2.gsmarena.com/vv/bigpic/oneplus-10-pro.jpg',base:440,mk:'Amazon'},
 {name:'Xiaomi 13',img:'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-13.jpg',base:480,mk:'eBay'},
 {name:'Xiaomi 12',img:'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-12.jpg',base:350,mk:'eBay'},
 {name:'Xiaomi Redmi Note 13',img:'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13.jpg',base:280,mk:'eBay'},
 {name:'Motorola Edge 40',img:'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-40.jpg',base:320,mk:'Amazon'},
 {name:'Nothing Phone (2)',img:'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-2.jpg',base:450,mk:'Amazon'},
 {name:'iPhone SE 2022',img:'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-se-2022.jpg',base:300,mk:'eBay'},
 {name:'Galaxy A54',img:'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a54.jpg',base:330,mk:'Amazon'},
 {name:'Pixel 8 Pro',img:'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8-pro.jpg',base:720,mk:'BestBuy'},
 {name:'Redmi 12',img:'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-12.jpg',base:200,mk:'eBay'},
 {name:'OnePlus Nord 3',img:'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-3.jpg',base:380,mk:'Newegg'},
 {name:'Xperia 1 V',img:'https://fdn2.gsmarena.com/vv/bigpic/sony-xperia-1-v.jpg',base:680,mk:'eBay'},
];
const DAMAGES=[
 {id:'display',name:'Cracked Display',part:'Display',cost:45},
 {id:'battery',name:'Dead Battery',part:'Battery',cost:22},
 {id:'port',name:'Faulty Charging Port',part:'Charging Port',cost:18},
 {id:'back',name:'Broken Back Glass',part:'Back Glass',cost:30},
 {id:'camera',name:'Faulty Camera',part:'Camera Module',cost:35},
 {id:'speaker',name:'No Speaker Sound',part:'Speaker',cost:15},
 {id:'water',name:'Water Damage',part:'Logic Board Clean',cost:28},
 {id:'buttons',name:'Broken Buttons',part:'Button Flex',cost:12},
 {id:'board',name:'Faulty Motherboard',part:'Motherboard',cost:60},
 {id:'frame',name:'Scratched Frame',part:'Frame',cost:20},
 {id:'faceid',name:'Faulty FaceID Sensor',part:'FaceID Sensor',cost:32},
 {id:'swollen',name:'Swollen Battery',part:'Battery Pro',cost:26},
];
// PC catalog — every photo matches its component type (PX pool), unique per model
const PC_CATALOG=[
 {sub:'CPU',name:'Ryzen 5 3600',spec:'AM4 • 6c/12t budget',price:85,socket:'AM4',img:PX('CPU',0),mk:'eBay'},
 {sub:'CPU',name:'Ryzen 5 5600',spec:'AM4 • 6c/12t 4.4GHz',price:130,socket:'AM4',img:PX('CPU',1),mk:'Amazon'},
 {sub:'CPU',name:'Intel i3-12100F',spec:'LGA1700 • 4c/8t budget',price:95,socket:'LGA1700',img:PX('CPU',2),mk:'Newegg'},
 {sub:'CPU',name:'Intel i5-12400F',spec:'LGA1700 • 6c/12t',price:150,socket:'LGA1700',img:PX('CPU',3),mk:'Amazon'},
 {sub:'CPU',name:'Intel i7-12700K',spec:'LGA1700 • 12c/20t',price:280,socket:'LGA1700',img:PX('CPU',4),mk:'Newegg'},
 {sub:'CPU',name:'Ryzen 5 7600',spec:'AM5 • 6c/12t Zen4',price:210,socket:'AM5',img:PX('CPU',5),mk:'Amazon'},
 {sub:'CPU',name:'Ryzen 7 7800X3D',spec:'AM5 • 8c/16t X3D',price:390,socket:'AM5',img:PX('CPU',6),mk:'BestBuy'},
 {sub:'CPU',name:'Intel i9-13900K',spec:'LGA1700 • 24c/32t beast',price:520,socket:'LGA1700',img:PX('CPU',7),mk:'BestBuy'},
 {sub:'CPU',name:'Ryzen 9 7950X',spec:'AM5 • 16c/32t monster',price:540,socket:'AM5',img:PX('CPU',8),mk:'Newegg'},
 {sub:'GPU',name:'GTX 1660 Super 6GB',spec:'6GB • needs 450W',price:140,watt:450,img:PX('GPU',0),mk:'eBay'},
 {sub:'GPU',name:'RX 6600 8GB',spec:'8GB • needs 450W',price:190,watt:450,img:PX('GPU',1),mk:'eBay'},
 {sub:'GPU',name:'RTX 3050 8GB',spec:'8GB • needs 450W',price:220,watt:450,img:PX('GPU',2),mk:'Amazon'},
 {sub:'GPU',name:'RTX 3060 12GB',spec:'12GB • needs 550W',price:290,watt:550,img:PX('GPU',3),mk:'Amazon'},
 {sub:'GPU',name:'RX 7600 8GB',spec:'8GB RDNA3 • needs 550W',price:270,watt:550,img:PX('GPU',4),mk:'Newegg'},
 {sub:'GPU',name:'RTX 4060 8GB',spec:'8GB DLSS3 • needs 550W',price:330,watt:550,img:PX('GPU',5),mk:'BestBuy'},
 {sub:'GPU',name:'RTX 4070 12GB',spec:'12GB DLSS3 • needs 650W',price:590,watt:650,img:PX('GPU',6),mk:'Newegg'},
 {sub:'GPU',name:'RX 7900 XT 20GB',spec:'20GB • needs 750W',price:750,watt:750,img:PX('GPU',7),mk:'Newegg'},
 {sub:'GPU',name:'RTX 4090 24GB',spec:'24GB flagship • needs 850W',price:1600,watt:850,img:PX('GPU',8),mk:'BestBuy'},
 {sub:'RAM',name:'Kingston 8GB DDR4',spec:'1x8GB • DDR4',price:28,gb:8,ddr:'DDR4',img:PX('RAM',0),mk:'BestBuy'},
 {sub:'RAM',name:'Corsair 16GB DDR4',spec:'2x8GB 3200 =16GB • DDR4',price:55,gb:16,ddr:'DDR4',img:PX('RAM',1),mk:'Amazon'},
 {sub:'RAM',name:'Corsair 32GB DDR4',spec:'2x16GB 3600 =32GB • DDR4',price:85,gb:32,ddr:'DDR4',img:PX('RAM',2),mk:'Newegg'},
 {sub:'RAM',name:'G.Skill 8GB DDR5',spec:'1x8GB 5200 • DDR5',price:38,gb:8,ddr:'DDR5',img:PX('RAM',3),mk:'Amazon'},
 {sub:'RAM',name:'G.Skill 16GB DDR5',spec:'2x8GB 5600 =16GB • DDR5',price:65,gb:16,ddr:'DDR5',img:PX('RAM',4),mk:'Amazon'},
 {sub:'RAM',name:'G.Skill 32GB DDR5',spec:'2x16GB 6000 =32GB • DDR5',price:110,gb:32,ddr:'DDR5',img:PX('RAM',5),mk:'Newegg'},
 {sub:'RAM',name:'Dominators 64GB DDR5',spec:'2x32GB 6000 =64GB • DDR5',price:220,gb:64,ddr:'DDR5',img:PX('RAM',6),mk:'BestBuy'},
 {sub:'BOARD',name:'MSI B450 Tomahawk',spec:'AM4 • DDR4 budget',price:90,socket:'AM4',ddr:'DDR4',img:PX('BOARD',0),mk:'eBay'},
 {sub:'BOARD',name:'ASUS A520M-K',spec:'AM4 • DDR4 compact',price:70,socket:'AM4',ddr:'DDR4',img:PX('BOARD',1),mk:'Amazon'},
 {sub:'BOARD',name:'MSI B550 Tomahawk',spec:'AM4 • DDR4',price:140,socket:'AM4',ddr:'DDR4',img:PX('BOARD',2),mk:'Newegg'},
 {sub:'BOARD',name:'Gigabyte H610M',spec:'LGA1700 • DDR4 budget',price:110,socket:'LGA1700',ddr:'DDR4',img:PX('BOARD',3),mk:'Amazon'},
 {sub:'BOARD',name:'MSI B760M Mortar',spec:'LGA1700 • DDR5',price:160,socket:'LGA1700',ddr:'DDR5',img:PX('BOARD',4),mk:'Newegg'},
 {sub:'BOARD',name:'ASUS Z790 Prime',spec:'LGA1700 • DDR5',price:220,socket:'LGA1700',ddr:'DDR5',img:PX('BOARD',5),mk:'Amazon'},
 {sub:'BOARD',name:'Gigabyte B650M',spec:'AM5 • DDR5',price:180,socket:'AM5',ddr:'DDR5',img:PX('BOARD',6),mk:'BestBuy'},
 {sub:'BOARD',name:'ASUS X670E Hero',spec:'AM5 • DDR5 flagship',price:320,socket:'AM5',ddr:'DDR5',img:PX('BOARD',7),mk:'Newegg'},
 {sub:'SSD',name:'Kingston 256GB SATA',spec:'256GB SATA budget',price:28,img:PX('SSD',0),mk:'eBay'},
 {sub:'SSD',name:'Samsung 500GB NVMe',spec:'500GB 3000MB/s',price:45,img:PX('SSD',1),mk:'Amazon'},
 {sub:'SSD',name:'Samsung 970 1TB NVMe',spec:'1TB 3500MB/s',price:75,img:PX('SSD',2),mk:'Amazon'},
 {sub:'SSD',name:'WD Black 2TB NVMe',spec:'2TB 7000MB/s',price:140,img:PX('SSD',3),mk:'BestBuy'},
 {sub:'SSD',name:'Samsung 990 4TB NVMe',spec:'4TB 7450MB/s flagship',price:300,img:PX('SSD',4),mk:'Newegg'},
 {sub:'SSD',name:'Seagate 8TB HDD',spec:'8TB archive • slow',price:120,img:PX('SSD',5),mk:'eBay'},
 {sub:'PSU',name:'EVGA 450W',spec:'450W budget',price:38,watts:450,img:PX('PSU',0),mk:'eBay'},
 {sub:'PSU',name:'EVGA 500W',spec:'500W budget',price:45,watts:500,img:PX('PSU',1),mk:'eBay'},
 {sub:'PSU',name:'Corsair 650W Bronze',spec:'650W 80+ Bronze',price:70,watts:650,img:PX('PSU',2),mk:'Newegg'},
 {sub:'PSU',name:'Seasonic 750W Gold',spec:'750W 80+ Gold',price:105,watts:750,img:PX('PSU',3),mk:'Amazon'},
 {sub:'PSU',name:'Seasonic 850W Gold',spec:'850W 80+ Gold',price:130,watts:850,img:PX('PSU',4),mk:'Amazon'},
 {sub:'PSU',name:'Corsair 1000W Platinum',spec:'1000W 80+ Platinum',price:220,watts:1000,img:PX('PSU',5),mk:'Newegg'},
 {sub:'CASE',name:'DeepCool Mini ITX',spec:'Mini ITX compact',price:65,img:PX('CASE',0),mk:'Amazon'},
 {sub:'CASE',name:'NZXT H510 Glass',spec:'ATX Mid Tower',price:90,img:PX('CASE',1),mk:'BestBuy'},
 {sub:'CASE',name:'Fractal Meshify 2',spec:'ATX airflow mesh',price:120,img:PX('CASE',2),mk:'Newegg'},
 {sub:'CASE',name:'Lian Li O11 RGB',spec:'ATX Show Case',price:150,img:PX('CASE',3),mk:'Newegg'},
 {sub:'CASE',name:'Lian Li O11 Mini',spec:'Compact show case',price:130,img:PX('CASE',4),mk:'Amazon'},
 {sub:'CASE',name:'Corsair 7000D Full Tower',spec:'Full Tower RGB flagship',price:240,img:PX('CASE',5),mk:'BestBuy'},
 {sub:'COOLER',name:'Stock Cooler',spec:'Basic • +6°C',price:15,cool:6,img:PX('COOLER',0),mk:'eBay'},
 {sub:'COOLER',name:'Hyper 212 Tower',spec:'Air tower • -8°C',price:35,cool:-8,img:PX('COOLER',1),mk:'Amazon'},
 {sub:'COOLER',name:'Arctic Liquid 240',spec:'AIO water • -18°C',price:95,cool:-18,img:PX('COOLER',2),mk:'Newegg'},
 {sub:'COOLER',name:'Noctua NH-D15',spec:'Flagship air • -14°C',price:100,cool:-14,img:PX('COOLER',3),mk:'BestBuy'},
 {sub:'OS',name:'Windows 10 USB',spec:'Win10 installer',price:20,os:'windows',img:PX('USB',0),mk:'eBay'},
 {sub:'OS',name:'Windows 11 USB',spec:'Win11 Pro installer',price:25,os:'windows',img:PX('USB',1),mk:'Amazon'},
 {sub:'OS',name:'Ubuntu 24.04 USB',spec:'Linux installer',price:15,os:'linux',img:PX('USB',2),mk:'Newegg'},
 {sub:'OS',name:'Fedora 40 USB',spec:'Linux workstation',price:16,os:'linux',img:PX('USB',3),mk:'Amazon'},
 {sub:'OS',name:'Kali Linux USB',spec:'Pen-test distro',price:18,os:'linux',img:PX('USB',4),mk:'Amazon'},
 {sub:'OS',name:'macOS Sonoma USB',spec:'macOS installer',price:25,os:'macos',img:PX('MACUSB',0),mk:'eBay'},
];
const UNITS=[
 {name:'Small Locker',price:200,img:U('photo-1590247813698-77379d6c9628'),loot:2},
 {name:'Garage Unit',price:500,img:U('photo-1558618666-fcd25c85cd64'),loot:4},
 {name:'Office Clearance',price:350,img:U('photo-1497366216548-37526070297c'),loot:3},
 {name:'Tech Pallet',price:700,img:U('photo-1587293852726-70cdb56c2866'),loot:5},
 {name:'Warehouse Unit',price:950,img:U('photo-1553413077-190dd305871c'),loot:6},
 {name:'Server Farm Lot',price:1200,img:U('photo-1558494949-ef010cbdcc31'),loot:7},
 {name:'Mystery Truckload',price:1500,img:U('photo-1519003722824-194d4455a60c'),loot:9},
];
const imgTag=(p,fb)=>`<img src="${p}" onerror="this.onerror=null;this.src='${fb||'https://via.placeholder.com/86?text=Lumi'}'" loading="lazy">`;

// ---------- SHOP ----------
function genPhoneOffers(){
  phoneOffers=[];
  const conds=['Cracked','Worn','For parts'];
  for(let i=0;i<8;i++){
    const p=PHONES[Math.floor(Math.random()*PHONES.length)];
    const nD=1+Math.floor(Math.random()*3);
    const dmg=[...DAMAGES].sort(()=>Math.random()-.5).slice(0,nD);
    const discount=dmg.length*0.2+Math.random()*0.12;
    const buy=Math.max(40,Math.round(p.base*(1-discount)));
    phoneOffers.push({...p,damages:dmg,buy,fixed:p.base+40,cond:conds[Math.floor(Math.random()*3)],diag:false,id:'o'+i+Date.now()});
  }
  renderShop();
}
function renderBalance(){$('#balance').textContent=money(balance);}
function filteredPC(){const q=($('#search').value||'').toLowerCase();return PC_CATALOG.filter(p=>(pcSub==='ALL'||p.sub===pcSub)&&p.name.toLowerCase().includes(q));}
function mkBadge(m){const c=m==='Amazon'?'amz':(m==='eBay'||m==='eBay Refurb')?'eby':'bb';return `<span class="mk ${c}">🛒 ${m}</span>`;}
function renderShop(){
  const list=$('#shopList');list.innerHTML='';
  $('#pcSubcats').style.display=shopCat==='pc'?'flex':'none';
  if(shopCat==='pc'){
    const subs=['ALL','CPU','GPU','RAM','BOARD','SSD','PSU','CASE','COOLER','OS'];
    $('#pcSubcats').innerHTML=subs.map(s=>`<button class="chip ${pcSub===s?'active':''}" data-sub="${s}">${s}</button>`).join('');
    document.querySelectorAll('[data-sub]').forEach(b=>b.onclick=()=>{pcSub=b.dataset.sub;renderShop();});
  }
  if(shopCat==='phones'){
    const q=($('#search').value||'').toLowerCase();
    phoneOffers.filter(o=>o.name.toLowerCase().includes(q)).forEach((o)=>{
      const i=phoneOffers.indexOf(o);
      const el=document.createElement('div');el.className='item-card';
      el.innerHTML=`${imgTag(o.img,phoneFb(o.img))}<div class="info"><b>${o.name}</b>${mkBadge(o.mk||'Amazon')}<span class="tag">${o.cond}</span><div>${o.diag?o.damages.map(d=>`<span class="dmg">⚠ ${d.name} ($${d.cost})</span>`).join(''):'<span class="muted">❓ Un-diagnosed — buy & Diagnose in workshop</span>'}</div><div class="price">${money(o.buy)} <small style="color:#888">→ fixed ${money(o.fixed)}</small></div><div class="row"><button class="btn small primary">Buy now</button><button class="btn small">+ Cart</button></div></div>`;
      const [buy,cartB]=el.querySelectorAll('button');
      buy.onclick=()=>buyPhoneOffer(i,false);cartB.onclick=()=>buyPhoneOffer(i,true);
      list.appendChild(el);
    });
  }else if(shopCat==='pc'){
    filteredPC().forEach(p=>{
      const el=document.createElement('div');el.className='item-card';
      el.innerHTML=`${imgTag(p.img,p.img)}<div class="info"><b>${ICON[p.sub]||'🔧'} ${p.name}</b><span class="tag">${p.sub}</span>${mkBadge(p.mk||'Amazon')}<div class="muted">${p.spec}</div><div class="price">${money(p.price)}</div><div class="row"><button class="btn small primary">Buy now</button><button class="btn small">+ Cart</button></div></div>`;
      const [b,c]=el.querySelectorAll('button');
      b.onclick=()=>buyDirect({kind:p.sub==='OS'?'usb':'part',sub:p.sub,...p},p.price,false);
      c.onclick=()=>buyDirect({kind:p.sub==='OS'?'usb':'part',sub:p.sub,...p},p.price,true);
      list.appendChild(el);
    });
  }else{
    UNITS.forEach(u=>{
      const el=document.createElement('div');el.className='item-card';
      el.innerHTML=`${imgTag(u.img)}<div class="info"><b>${u.name}</b><span class="tag">mystery ${u.loot}</span>${mkBadge('Auction')}<div class="muted">Rarity ⭐ • jackpot 10% • P/L shown on open</div><div class="price">${money(u.price)}</div><div class="row"><button class="btn small primary">Bid & Win</button><button class="btn small">+ Cart</button></div></div>`;
      const [b,c]=el.querySelectorAll('button');
      b.onclick=()=>buyDirect({kind:'unit',...u},u.price,false);
      c.onclick=()=>buyDirect({kind:'unit',...u},u.price,true);
      list.appendChild(el);
    });
  }
}
function buyPhoneOffer(i,toCart){
  const o=phoneOffers[i];
  if(toCart){cart.push({label:o.name+' (damaged)',price:o.buy,payload:{kind:'phone',...o}});renderCart();toast('Added to cart 🛒');return;}
  if(balance<o.buy){toast('Not enough money!');return;}
  balance-=o.buy;
  inventory.push({uid:uidC++,kind:'phone',...o,repairs:o.damages.map(d=>({...d,removed:false,fixed:false,unscrewed:false}))});
  phoneOffers.splice(i,1);renderBalance();renderShop();renderInv();save();
  toast('Phone bought! Diagnose it in Workshop 🔍');
}
function buyDirect(payload,price,toCart){
  if(toCart){cart.push({label:payload.name,price,payload});renderCart();toast('Added to cart 🛒');return;}
  if(balance<price){toast('Not enough money!');return;}
  balance-=price;giveItem(payload);renderBalance();renderInv();save();
}
function giveItem(p){
  if(p.kind==='phone')inventory.push({uid:uidC++,kind:'phone',...p,repairs:(p.damages||[]).map(d=>({...d,removed:false,fixed:false,unscrewed:false}))});
  else inventory.push({uid:uidC++,...p});
}
// ---------- CART ----------
function renderCart(){
  $('#cartCount').textContent=cart.length;
  const box=$('#cartItems');box.innerHTML=cart.length?'':'<div class="empty">Cart empty</div>';
  cart.forEach((c,i)=>{
    const d=document.createElement('div');d.className='inv-item';
    d.innerHTML=`<div style="flex:1"><b>${c.label}</b><div class="price">${money(c.price)}</div></div><button class="btn small">✕</button>`;
    d.querySelector('button').onclick=()=>{cart.splice(i,1);renderCart();};
    box.appendChild(d);
  });
  $('#cartTotal').textContent='Total: '+money(cart.reduce((a,c)=>a+c.price,0));
}
$('#cartBtn').onclick=()=>$('#cartDrawer').classList.add('open');
$('#closeCart').onclick=()=>$('#cartDrawer').classList.remove('open');
$('#checkoutBtn').onclick=()=>{
  const t=cart.reduce((a,c)=>a+c.price,0);
  if(!cart.length||balance<t){toast('Not enough money!');return;}
  balance-=t;cart.forEach(c=>giveItem(c.payload));cart=[];renderBalance();renderCart();renderInv();save();
  $('#cartDrawer').classList.remove('open');toast('Checkout complete! 🎉');
};
// ---------- INVENTORY ----------
function rarity(it){
  const v=it.fixed||it.price||0;
  if(v>600)return['legend','LEGENDARY ★★★'];if(v>350)return['epic','EPIC ★★'];if(v>150)return['rare','RARE ★'];return['common','COMMON'];
}
function renderInv(){
  const box=$('#invList');box.innerHTML=inventory.length?'':'<div class="empty">Empty — buy something!</div>';
  inventory.forEach(it=>{
    const d=document.createElement('div');d.className='inv-item'+(it.uid===selectedPartUid?' selected':'');d.draggable=true;d.dataset.uid=it.uid;
    const [rc,rl]=rarity(it);
    let sub=it.kind==='phone'?`${it.repairs.filter(r=>r.fixed).length}/${it.repairs.length} fixed • ${it.diag?'diagnosed':'tap Diagnose'}`:it.kind==='usb'?('USB • '+it.os):((ICON[it.sub]||'')+' '+(it.sub||it.kind)+' • drag to PC table ➜');
    d.innerHTML=`${imgTag(it.img||'https://via.placeholder.com/52',it.img&&it.img.includes('gsmarena')?phoneFb(it.img):(it.sub&&PHOTO[it.sub]?PX(it.sub,0):'https://via.placeholder.com/52?text=Lumi'))}<div style="flex:1"><b>${it.name}</b> <span class="rar ${rc}">${rl}</span><div class="muted">${sub}</div></div><span>${it.kind==='phone'?money(it.fixed):money(it.price||it.buy||0)}</span>`;
    d.onclick=()=>{if(d.dataset.dragged)return;loadToWorkshop(it);};
    d.ondragstart=e=>e.dataTransfer.setData('text/plain',it.uid);
    if(it.kind==='part'||it.kind==='usb')bindInvPartDrag(d,it);
    box.appendChild(d);
  });
}
// Pointer drag (mouse + touch): drag a part card onto the PC table slots
function bindInvPartDrag(el,it){
  el.style.touchAction='pan-y'; // vertical scroll still works; horizontal drag places the part
  el.onpointerdown=e=>{
    if(e.button!==undefined&&e.button!==0)return;
    const sx=e.clientX,sy=e.clientY;let ghost=null,active=false;
    const move=ev=>{
      if(!active&&Math.hypot(ev.clientX-sx,ev.clientY-sy)<10)return;
      if(!active){
        active=true;
        ghost=document.createElement('div');ghost.className='drag-ghost';
        ghost.innerHTML=`<img src="${it.img}" onerror="this.style.display='none'"><span>${ICON[it.sub]||'🔧'} ${it.name}</span>`;
        document.body.appendChild(ghost);
        document.querySelectorAll('.pc-slot,.usb-slot').forEach(z=>z.classList.add('drop-hint'));
      }
      ghost.style.left=(ev.clientX-70)+'px';ghost.style.top=(ev.clientY-24)+'px';
      document.querySelectorAll('.pc-slot,.usb-slot').forEach(z=>z.classList.remove('over'));
      const t=document.elementFromPoint(ev.clientX,ev.clientY);
      const zone=t&&t.closest?t.closest('.pc-slot,.usb-slot'):null;
      if(zone)zone.classList.add('over');
    };
    const up=ev=>{
      el.onpointermove=null;el.onpointerup=null;el.onpointercancel=null;
      document.querySelectorAll('.pc-slot,.usb-slot').forEach(z=>z.classList.remove('drop-hint','over'));
      if(!active)return; // plain tap → handled by click
      el.dataset.dragged='1';setTimeout(()=>delete el.dataset.dragged,150);
      if(ghost)ghost.remove();
      const t=document.elementFromPoint(ev.clientX,ev.clientY);
      const slot=t&&t.closest?t.closest('.pc-slot'):null;
      const usb=t&&t.closest?t.closest('.usb-slot'):null;
      if(usb){installPart(it.uid);flashPlaced(null);return;}
      if(slot){installPart(it.uid,slot.dataset.slot);flashPlaced(slot.dataset.slot);return;}
      toast('Drop onto a glowing PC slot 🖥️');
    };
    el.onpointermove=move;el.onpointerup=up;el.onpointercancel=up;
  };
}
function flashPlaced(slot){
  renderPc();
  const el=slot?document.querySelector(`.pc-slot[data-slot="${slot}"]`):document.querySelector('.usb-slot');
  if(el){el.classList.add('placed');setTimeout(()=>el.classList.remove('placed'),900);}
}
function loadToWorkshop(it){
  document.querySelectorAll('[data-wstab]').forEach(b=>b.classList.remove('active'));
  if(it.kind==='phone'){document.querySelector('[data-wstab="phone"]').classList.add('active');showWs('phone');activePhoneUid=it.uid;renderPhoneBench();}
  else if(it.kind==='part'||it.kind==='usb'){
    // select-for-placement: tap a part, then tap its slot on the PC table (or drag it)
    selectedPartUid=(selectedPartUid===it.uid)?null:it.uid;
    document.querySelector('[data-wstab="pc"]').classList.add('active');
    showWs('pc');renderInv();renderPc();
    if(selectedPartUid)toast(`Selected ${it.name} — tap a ${it.kind==='usb'?'USB port':it.sub+' slot'} to place it 👆 (or drag)`);
  }
  else if(it.kind==='unit'){openUnit(it.uid);}
}
function showWs(w){$('#wsPhone').classList.toggle('hidden',w!=='phone');$('#wsPc').classList.toggle('hidden',w!=='pc');$('#wsScreen').classList.toggle('hidden',w!=='screen');}
// ---------- PHONE BENCH v2 ----------
function renderPhoneBench(){
  const it=inventory.find(x=>x.uid===activePhoneUid);
  if(!it){$('#phoneEmpty').classList.remove('hidden');$('#phoneBench').classList.add('hidden');return;}
  $('#phoneEmpty').classList.add('hidden');$('#phoneBench').classList.remove('hidden');
  $('#pbImg').onerror=function(){this.onerror=null;this.src=phoneFb(it.img);};$('#pbImg').src=it.img;$('#pbName').innerHTML=`<b>${it.name}</b> ${mkBadge(it.mk||'Amazon')}`;
  const done=it.repairs.filter(r=>r.fixed).length,total=it.repairs.length||1;
  const cond=Math.round(done/total*100);
  $('#pbBuy').textContent=money(it.buy);$('#pbFixed').textContent=money(it.fixed);
  $('#pbDamageList').innerHTML=`<div class="cond-bar"><div style="width:${cond}%"></div></div><small>Condition ${cond}% • ${done}/${total} fixed</small><div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap"><button class="btn small primary" id="diagBtn">🔍 Diagnose ($5)</button><button class="btn small" id="hagBtn">🤝 Haggle offer</button></div><div id="hagOut" class="muted"></div>`;
  $('#repairTitle').textContent='🔧 Repair: '+it.name;
  $('#diagBtn').onclick=()=>{
    if(it.diag){toast('Already diagnosed');return;}
    if(balance<5){toast('Need $5');return;}
    balance-=5;it.diag=true;renderBalance();renderPhoneBench();renderInv();save();toast('Diagnosed! Damages revealed 🔍');
  };
  $('#hagBtn').onclick=()=>{
    const base=it.repairs.every(r=>r.fixed)?it.fixed:Math.round(it.buy*0.6);
    const offer=Math.round(base*(0.9+Math.random()*0.25));
    haggled[it.uid]=offer;
    $('#hagOut').innerHTML=`Buyer offers <b>${money(offer)}</b> (base ${money(base)}) — hit Resell to accept! <button class="btn small" id="reHag">reroll</button>`;
    $('#reHag').onclick=()=>$('#hagBtn').click();
  };
  const slots=$('#repairSlots');slots.innerHTML='';
  if(!it.diag){slots.innerHTML='<div class="empty">🔍 Press Diagnose first to reveal repair steps.</div>';$('#newParts').innerHTML='';return;}
  it.repairs.forEach((r,idx)=>{
    const s=document.createElement('div');s.className='slot'+(r.fixed?' done':'');s.dataset.idx=idx;
    if(r.fixed){s.innerHTML=`✅ <b>${r.name}</b> — fixed!`;slots.appendChild(s);return;}
    s.innerHTML=`🔴 <b>${r.name}</b> — needs <b>${r.part}</b> ($${r.cost})`
      +(r.unscrewed?`<div class="part old" data-old="${idx}">♻️ ${r.part} (BROKEN — drag to 🗑️)</div>`
      :`<div class="holdbtn" data-hold="${idx}">🔩 HOLD 1s to unscrew ${r.part}</div>`)
      +`<div class="muted">${r.removed?'Old removed ✔ — drag NEW part here (costs $'+r.cost+')':'Unscrew → drag red part to bin first'}</div>`;
    slots.appendChild(s);
  });
  const np=$('#newParts');np.innerHTML='';
  it.repairs.forEach((r,idx)=>{
    if(r.fixed||!r.removed)return;
    const p=document.createElement('div');p.className='part new';p.dataset.new=idx;p.textContent=`✨ New ${r.part} ($${r.cost})`;
    np.appendChild(p);
  });
  if(!np.children.length)np.innerHTML='<span class="muted">All new parts installed ✅</span>';
  bindHold();bindDragParts();
}
function bindHold(){
  document.querySelectorAll('[data-hold]').forEach(b=>{
    let t=null;
    const start=e=>{e.preventDefault();b.classList.add('holding');t=setTimeout(()=>{
      const it=inventory.find(x=>x.uid===activePhoneUid);it.repairs[+b.dataset.hold].unscrewed=true;
      renderPhoneBench();toast('Unscrewed! 🔩');save();
    },900);};
    const cancel=()=>{clearTimeout(t);b.classList.remove('holding');};
    b.onpointerdown=start;b.onpointerup=cancel;b.onpointerleave=cancel;
  });
}
function bindDragParts(){
  document.querySelectorAll('.part').forEach(p=>{
    p.onpointerdown=e=>{
      e.preventDefault();
      const data={old:p.dataset.old,new:p.dataset.new};
      p.classList.add('drag');try{p.setPointerCapture(e.pointerId);}catch(_){}
      const move=ev=>{p.style.position='fixed';p.style.left=(ev.clientX-60)+'px';p.style.top=(ev.clientY-20)+'px';p.style.zIndex=999;
        document.querySelectorAll('.slot,#trashBin').forEach(z=>z.classList.remove('over'));
        const t=document.elementFromPoint(ev.clientX,ev.clientY);const zone=t&&t.closest?t.closest('.slot,#trashBin'):null;
        if(zone)zone.classList.add('over');};
      const up=ev=>{p.classList.remove('drag');p.style.position='';p.style.left='';p.style.top='';
        const t=document.elementFromPoint(ev.clientX,ev.clientY);
        handleDrop(data,t&&t.closest?t.closest('#trashBin'):null,t&&t.closest?t.closest('.slot'):null);
        p.onpointermove=null;p.onpointerup=null;};
      p.onpointermove=move;p.onpointerup=up;
    };
  });
}
function handleDrop(data,trash,slot){
  const it=inventory.find(x=>x.uid===activePhoneUid);if(!it)return;
  if(data.old!==undefined&&trash){
    const r=it.repairs[+data.old];
    if(!r.unscrewed){toast('Hold to unscrew first! 🔩');return;}
    if(!r.removed){r.removed=true;toast('Old part removed! Buy+install new ✨');renderPhoneBench();save();}
    return;
  }
  if(data.new!==undefined&&slot){
    const idx=+slot.dataset.idx;
    if(+data.new!==idx){toast('Wrong slot! ❌');return;}
    const r=it.repairs[idx];
    if(!r.removed){toast('Remove old part first!');return;}
    if(balance<r.cost){toast('Need $'+r.cost+' for new part!');return;}
    balance-=r.cost;r.fixed=true;stats.repairs++;addXP(20);
    renderBalance();renderPhoneBench();renderInv();save();
    if(it.repairs.every(x=>x.fixed)){toast('Fully refurbished! Resell '+money(it.fixed)+' 💰');addXP(30);}
    else toast('Installed! 🔧');
    return;
  }
  toast(data.new!==undefined?'Drag NEW part onto its slot 🎯':'Drag BROKEN part to 🗑️');
}
$('#resellPhoneBtn').onclick=()=>{
  const i=inventory.findIndex(x=>x.uid===activePhoneUid);if(i<0)return;
  const it=inventory[i];
  const base=it.repairs.every(r=>r.fixed)?it.fixed:Math.round(it.buy*0.6);
  const val=haggled[it.uid]||base;
  balance+=val;stats.profit+=val-it.buy;addXP(15);
  inventory.splice(i,1);delete haggled[it.uid];activePhoneUid=null;
  renderBalance();renderInv();renderPhoneBench();save();toast('Sold for '+money(val)+' 💰');
};
// ---------- PC BUILD v2 ----------
const SLOTS=['CPU','COOLER','GPU','RAM','BOARD','SSD','PSU','CASE'];
function compat(){
  const b=pcBuild,msgs=[];
  if(b.CPU&&b.BOARD&&b.CPU.socket!==b.BOARD.socket)msgs.push(['bad',`Socket mismatch: CPU ${b.CPU.socket} vs Board ${b.BOARD.socket} ❌`]);
  else if(b.CPU&&b.BOARD)msgs.push(['ok',`Socket ${b.CPU.socket} match ✅`]);
  if(b.RAM&&b.BOARD&&b.RAM.ddr!==b.BOARD.ddr)msgs.push(['bad',`RAM ${b.RAM.ddr} vs Board ${b.BOARD.ddr} ❌`]);
  else if(b.RAM&&b.BOARD)msgs.push(['ok',`${b.RAM.ddr} match ✅`]);
  if(b.GPU&&b.PSU&&(b.PSU.watts||0)<(b.GPU.watt||0))msgs.push(['bad',`PSU ${b.PSU.watts}W < GPU needs ${b.GPU.watt}W ❌`]);
  else if(b.GPU&&b.PSU)msgs.push(['ok',`Power OK ✅`]);
  if(b.CPU&&!b.COOLER)msgs.push(['warn',`No cooler — CPU will run hot 🌀`]);
  else if(b.COOLER)msgs.push(['ok',`Cooling ${b.COOLER.name} ✅`]);
  return msgs;
}
function benchScore(){
  let s=0;const b=pcBuild;
  if(b.CPU)s+=b.CPU.price*2;if(b.GPU)s+=b.GPU.price*3;if(b.RAM)s+=(b.RAM.gb||8)*15;if(b.SSD)s+=80;if(b.COOLER)s+=30;if(b.CASE)s+=20;
  return Math.round(s);
}
function renderPc(){
  const box=$('#pcSlots');box.innerHTML='';
  const sel=inventory.find(x=>x.uid===selectedPartUid);
  SLOTS.forEach(s=>{
    const v=pcBuild[s];
    const d=document.createElement('div');d.className='pc-slot'+(v?' filled':'')+((sel&&sel.sub===s)?' match':'');d.dataset.slot=s;
    d.innerHTML=v?`<img class="slot-thumb" src="${v.img}" onerror="this.style.display='none'"><div>✅ <b>${ICON[s]||''} ${s}</b><br>${v.name}<br><small>${v.spec||''}</small><br><small class="muted">tap to unplug ↩</small></div>`:`<b>${ICON[s]||''} ${s}</b><br><small>${sel&&sel.sub===s?'👆 tap to PLACE '+sel.name:'empty — drag a part here'}</small>`;
    d.ondragover=e=>{e.preventDefault();d.classList.add('over');};
    d.ondragleave=()=>d.classList.remove('over');
    d.ondrop=e=>{e.preventDefault();d.classList.remove('over');try{installPart(+e.dataTransfer.getData('text/plain'),s);flashPlaced(s);}catch(_){}};
    d.onclick=()=>{
      if(v&&!sel){ // unplug back to inventory
        inventory.push(v);pcBuild[s]=null;renderInv();renderPc();save();toast(s+' unplugged ↩');return;
      }
      if(sel&&s===(sel.sub)){installPart(sel.uid,s);flashPlaced(s);return;}
      if(sel){toast(`${sel.name} goes in ${sel.sub}, not ${s} ❌`);d.classList.add('shake');setTimeout(()=>d.classList.remove('shake'),500);return;}
      toast(`Drag a ${s} part here — or tap one in Inventory 👆`);
    };
    box.appendChild(d);
  });
  const val=Object.values(pcBuild).filter(Boolean).reduce((a,p)=>a+(p.price||0),0);
  const score=benchScore();
  const filled=Object.values(pcBuild).filter(Boolean).length;
  $('#pcValue').innerHTML=`Build ${filled}/${SLOTS.length} parts • value: `+money(val)+(usbInserted?'<br>🔌 '+usbInserted.name:'')
    +'<br>'+compat().map(([k,m])=>`<span class="compat-${k}">${m}</span>`).join('<br>')
    +(score?`<br><span class="bench-score">⚡ Benchmark ${score} pts (+$${Math.round(score/20)} bonus on sale)</span>`:'');
  const us=$('#usbSlot');
  us.innerHTML=usbInserted?(`🔌 ${usbInserted.name} (${usbInserted.os}) <small>• tap to unplug</small>`):(sel&&sel.kind==='usb'?'👆 tap to plug USB here':'— drag OS flash drive here —');
  us.onclick=()=>{
    if(usbInserted){inventory.push(usbInserted);usbInserted=null;renderInv();renderPc();save();toast('USB unplugged ↩');return;}
    if(sel&&sel.kind==='usb'){installPart(sel.uid);flashPlaced(null);return;}
  };
}
function installPart(uid,forceSlot){
  const i=inventory.findIndex(x=>x.uid===uid);if(i<0)return;
  const it=inventory[i];
  if(it.kind==='usb'){usbInserted=it;inventory.splice(i,1);if(selectedPartUid===uid)selectedPartUid=null;renderInv();renderPc();save();toast('USB plugged in 🔌');return;}
  if(it.kind!=='part'){toast('Not a PC part');return;}
  const slot=forceSlot||it.sub;
  if(!SLOTS.includes(slot)){toast('Wrong slot');return;}
  if(slot!==it.sub){toast(`${it.name} is a ${it.sub} part, not ${slot} ❌`);return;}
  if(slot==='CPU'&&pcBuild.BOARD&&it.socket!==pcBuild.BOARD.socket){toast(`Incompatible! Board is ${pcBuild.BOARD.socket} ❌`);return;}
  if(slot==='BOARD'){
    if(pcBuild.CPU&&pcBuild.CPU.socket!==it.socket){toast(`CPU is ${pcBuild.CPU.socket}, board is ${it.socket} ❌`);return;}
    if(pcBuild.RAM&&pcBuild.RAM.ddr!==it.ddr){toast(`RAM is ${pcBuild.RAM.ddr}, board needs ${it.ddr} ❌`);return;}
  }
  if(slot==='RAM'&&pcBuild.BOARD&&it.ddr!==pcBuild.BOARD.ddr){toast(`Board needs ${pcBuild.BOARD.ddr} ❌`);return;}
  if(pcBuild[slot])inventory.push(pcBuild[slot]);
  pcBuild[slot]=it;inventory.splice(i,1);if(selectedPartUid===uid)selectedPartUid=null;renderInv();renderPc();save();addXP(10);toast(slot+' installed ✅ '+ (ICON[slot]||''));
}
$('#usbSlot').ondragover=e=>{e.preventDefault();$('#usbSlot').classList.add('over');};
$('#usbSlot').ondragleave=()=>$('#usbSlot').classList.remove('over');
$('#usbSlot').ondrop=e=>{e.preventDefault();$('#usbSlot').classList.remove('over');installPart(+e.dataTransfer.getData('text/plain'));};
$('#clearPcBtn').onclick=()=>{Object.keys(pcBuild).forEach(k=>{if(pcBuild[k]){inventory.push(pcBuild[k]);pcBuild[k]=null;}});if(usbInserted){inventory.push(usbInserted);usbInserted=null;}renderInv();renderPc();save();};
$('#sellPcBtn').onclick=()=>{
  const parts=Object.values(pcBuild).filter(Boolean);
  if(!parts.length){toast('Build is empty');return;}
  if(compat().some(([k])=>k==='bad')){toast('Fix compatibility first! ❌');return;}
  const base=parts.reduce((a,p)=>a+p.price,0);
  const bonus=Math.round(benchScore()/20)+80;
  const v=base+bonus;balance+=v;stats.pcs++;stats.profit+=bonus;addXP(50);
  Object.keys(pcBuild).forEach(k=>pcBuild[k]=null);
  renderBalance();renderPc();save();toast('PC sold '+money(v)+' (bonus $'+bonus+') 💰');
};
$('#powerBtn').onclick=()=>{
  showWs('screen');
  document.querySelectorAll('[data-wstab]').forEach(b=>b.classList.toggle('active',b.dataset.wstab==='screen'));
  if(compat().some(([k])=>k==='bad')){biosScreen('INCOMPATIBLE PARTS ❌ — back to PC bench');return;}
  if(!pcBuild.BOARD||!pcBuild.CPU||!pcBuild.RAM||!pcBuild.PSU){biosScreen('NO BOOT: need BOARD+CPU+RAM+PSU ❌');return;}
  const maxGb=pcBuild.RAM.gb||16;
  bios={tab:0,sel:0,ram:maxGb,max:maxGb,ratio:40,fan:60,xmp:pcBuild.RAM.ddr==='DDR5',fast:true,secure:false,hour:12,min:30,order:[0,1]};
  renderBios();
};
// ---------- BIOS v3 : full UEFI, easy RAM, mouse+touch+keys ----------
const BTABS=['System','Boot','Memory','OC & Fan','Monitor','Security','Exit'];
function biosScreen(msg){$('#screenLabel').textContent='DISPLAY — NO SIGNAL';$('#screen').className='screen off';$('#screen').innerHTML='<div class="screen-off-msg">'+msg+'</div>';}
function biosBoost(){let m=1+(Math.max(0,(bios.ratio||40)-40)*0.015);if(bios.xmp)m*=1.05;return m;}
function biosCpuTemp(){const cool=pcBuild.COOLER?pcBuild.COOLER.cool:8;return Math.round(32+(bios.ratio-34)*2.2+(100-bios.fan)*0.25+(bios.xmp?2:0)+cool);}
function renderBios(){
  $('#screenLabel').textContent='DISPLAY — LumiPhones UEFI BIOS';
  const s=$('#screen');s.className='screen';s.innerHTML='';
  const b=document.createElement('div');b.className='bios';
  b.style.cssText='background:linear-gradient(180deg,#10238f,#0b1e9e);min-height:440px;font-size:14px';
  const allDrives=[usbInserted?('USB: '+usbInserted.name+' ['+usbInserted.os+']'):null,pcBuild.SSD?('SSD: '+pcBuild.SSD.name):null].filter(Boolean);
  const order=(bios.order||[0,1]).filter(i=>i<allDrives.length);
  while(order.length<allDrives.length)order.push(order.length);
  bios.order=order;
  const temp=biosCpuTemp();
  let body='';
  if(bios.tab===0){
    body=`<p><b>LumiPhones UEFI v3.0</b> • ${pcBuild.BOARD.name}</p>
    <p>CPU: ${pcBuild.CPU.name} @ ${(bios.ratio/10).toFixed(1)}GHz • ${temp}°C<br>RAM installed: <b>${bios.max}GB ${pcBuild.RAM.ddr}</b> • Allocated: <b>${bios.ram}GB</b><br>GPU: ${pcBuild.GPU?pcBuild.GPU.name:'iGPU'} • SSD: ${pcBuild.SSD?pcBuild.SSD.name:'—'}</p>
    <p>🕒 Time: <button data-b="h-" class="btn small">−</button> ${String(bios.hour).padStart(2,'0')}:${String(bios.min).padStart(2,'0')} <button data-b="h+" class="btn small">+</button> <button data-b="m+" class="btn small">+10m</button></p>
    <p><small>TIP: click tabs / buttons directly — keyboard & touch pad below also work. F9 = defaults.</small></p>`;
  }else if(bios.tab===1){
    body=`<p><b>Boot priority</b> — tap a drive to boot now, ▲▼ reorders:</p>`+(allDrives.length?order.map((di,pos)=>`<div data-boot="${di}" class="${pos===bios.sel?'sel':''}" style="padding:8px;border-radius:8px;cursor:pointer">${pos===bios.sel?'▶ ':''}#${pos+1} ${allDrives[di]} <button data-mv="${pos}|-1" class="btn small">▲</button> <button data-mv="${pos}|1" class="btn small">▼</button> <button data-bnow="${di}" class="btn small primary">Boot ➜</button></div>`).join(''):'<p>No bootable devices! Plug USB / install SSD.</p>')
    +`<p>Fast Boot: <button data-b="fast" class="btn small ${bios.fast?'primary':''}">${bios.fast?'ON':'OFF'}</button></p>`;
  }else if(bios.tab===2){
    const pct=Math.round(bios.ram/bios.max*100);
    body=`<p><b>Memory — easy mode ✅</b> (installed <b>${bios.max}GB</b>)</p>
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
      <button data-b="ram-" class="btn primary" style="font-size:22px;padding:10px 18px">− 1GB</button>
      <div style="font-size:34px;font-weight:800;background:#fff;color:#0b1e9e;border-radius:12px;padding:6px 18px">${bios.ram}GB</div>
      <button data-b="ram+" class="btn primary" style="font-size:22px;padding:10px 18px">+ 1GB</button>
      <button data-b="rammax" class="btn small">MAX (${bios.max})</button>
      <button data-b="ramhalf" class="btn small">½ (${Math.ceil(bios.max/2)})</button>
    </div>
    <input data-r="ram" type="range" min="2" max="${bios.max}" step="1" value="${bios.ram}" style="width:100%;height:34px;accent-color:#fff">
    <div class="meter" style="background:rgba(255,255,255,.25)"><div style="width:${pct}%"></div></div>
    <p>XMP Profile: <button data-b="xmp" class="btn small ${bios.xmp?'primary':''}">${bios.xmp?'ON (+5% speed)':'OFF'}</button> • Effective speed boost ×${biosBoost().toFixed(2)}</p>`;
  }else if(bios.tab===3){
    body=`<p><b>OC & Fan</b> — overclock = faster but hotter!</p>
    <p>CPU Ratio: <button data-b="oc-" class="btn small">−</button> <b>${(bios.ratio/10).toFixed(1)}GHz</b> <button data-b="oc+" class="btn small">+</button> <small>(3.4–6.0)</small></p>
    <input data-r="oc" type="range" min="34" max="60" step="1" value="${bios.ratio}" style="width:100%;height:30px;accent-color:#fff">
    <p>Fan speed: <button data-b="fan-" class="btn small">−10%</button> <b>${bios.fan}%</b> <button data-b="fan+" class="btn small">+10%</button></p>
    <input data-r="fan" type="range" min="0" max="100" step="5" value="${bios.fan}" style="width:100%;height:30px;accent-color:#7CFFB2">
    <p>Est. temp <b style="color:${temp>85?'#ff8080':'#7CFFB2'}">${temp}°C</b> ${temp>90?'🔥 DANGER: will fail boot — raise fan / lower OC!':temp>80?'⚠️ hot':'✅ cool'} • Boost ×${biosBoost().toFixed(2)}</p>`;
  }else if(bios.tab===4){
    body=`<p><b>Hardware Monitor</b> (live)</p>
    <p>🌡️ CPU ${temp}°C • Board 34°C • GPU ${pcBuild.GPU?38+Math.round((100-bios.fan)/10):31}°C<br>🌀 Fan ${Math.round(bios.fan*32)} RPM (${bios.fan}%) • ⚡ ${(3.2+(bios.ratio-34)*0.08).toFixed(1)}V<br>🔋 PSU ${pcBuild.PSU.watts}W • Load ~${Math.min(95,30+benchScore()/120)}%</p>
    <button data-b="fanmax" class="btn small primary">Max fans 🌀</button> <button data-b="fanauto" class="btn small">Auto 60%</button>`;
  }else if(bios.tab===5){
    body=`<p><b>Security</b></p><p>Secure Boot: <button data-b="sec" class="btn small ${bios.secure?'primary':''}">${bios.secure?'ON':'OFF'}</button></p><p>Admin password: <button data-b="pwd" class="btn small">Set 1234 🔑</button> ${bios.pwd?'✅ set':'⬜ not set'}</p><p><small>Secure Boot ON = macOS refuses to boot (Apple quirks 😅). Turn OFF for Hackintosh.</small></p>`;
  }else{
    body=`<p><b>Exit</b></p>
    <div data-x="save" style="padding:10px;background:${bios.sel===0?'#fff;color:#0b1e9e':''};border-radius:8px;cursor:pointer">💾 Save changes & reboot (boots #1)</div>
    <div data-x="boot1" style="padding:10px;cursor:pointer">🚀 Boot override: ${allDrives[order[0]]||'—'}</div>
    <div data-x="def" style="padding:10px;cursor:pointer">↩ Restore optimized defaults (F9)</div>
    <div data-x="off" style="padding:10px;cursor:pointer">⏻ Discard & shutdown</div>`;
  }
  b.innerHTML=`<div style="display:flex;gap:6px;flex-wrap:wrap">${BTABS.map((t,i)=>`<span data-t="${i}" style="padding:6px 10px;border-radius:8px;cursor:pointer;${i===bios.tab?'background:#fff;color:#0b1e9e;font-weight:800':''}">${t}</span>`).join('')}</div><hr>${body}<hr><small>🖱️ click everything • ⌨️ ←→ tabs ▲▼ select ENTER confirm • F9 defaults • touch pad below = same keys</small>`;
  s.appendChild(b);
  b.querySelectorAll('[data-t]').forEach(t=>t.onclick=()=>{bios.tab=+t.dataset.t;bios.sel=0;renderBios();});
  b.querySelectorAll('[data-boot]').forEach(d2=>d2.onclick=e=>{if(e.target.dataset.mv||e.target.dataset.bnow)return;bios.sel=order.indexOf(+d2.dataset.boot);renderBios();});
  b.querySelectorAll('[data-bnow]').forEach(x=>x.onclick=()=>doBoot(+x.dataset.bnow));
  b.querySelectorAll('[data-mv]').forEach(x=>x.onclick=()=>{const[p,d]=x.dataset.mv.split('|').map(Number);const np=p+d;if(np<0||np>=order.length)return;const t=order[p];order[p]=order[np];order[np]=t;bios.sel=np;renderBios();});
  b.querySelectorAll('[data-x]').forEach(x=>x.onclick=()=>{
    const v=x.dataset.x;
    if(v==='save')doBoot(bios.order[0]??0);
    if(v==='boot1')doBoot(bios.order[0]??0);
    if(v==='def'){biosDefault();renderBios();toast('Defaults restored ↩');}
    if(v==='off'){showWs('pc');toast('Shutdown ⏻');}
  });
  b.querySelectorAll('[data-b]').forEach(x=>x.onclick=()=>biosBtn(x.dataset.b));
  b.querySelectorAll('[data-r]').forEach(r=>r.oninput=()=>{
    if(r.dataset.r==='ram')bios.ram=+r.value;
    if(r.dataset.r==='oc')bios.ratio=+r.value;
    if(r.dataset.r==='fan')bios.fan=+r.value;
    renderBios();
  });
}
function biosDefault(){const m=bios.max;bios={tab:bios.tab,sel:0,ram:m,max:m,ratio:40,fan:60,xmp:false,fast:true,secure:false,hour:12,min:30,order:[0,1]};}
function biosBtn(a){
  if(a==='ram-')bios.ram=Math.max(2,bios.ram-1);
  if(a==='ram+')bios.ram=Math.min(bios.max,bios.ram+1);
  if(a==='rammax')bios.ram=bios.max;
  if(a==='ramhalf')bios.ram=Math.max(2,Math.ceil(bios.max/2));
  if(a==='oc-')bios.ratio=Math.max(34,bios.ratio-1);
  if(a==='oc+')bios.ratio=Math.min(60,bios.ratio+1);
  if(a==='fan-')bios.fan=Math.max(0,bios.fan-10);
  if(a==='fan+')bios.fan=Math.min(100,bios.fan+10);
  if(a==='fanmax')bios.fan=100;
  if(a==='fanauto')bios.fan=60;
  if(a==='xmp')bios.xmp=!bios.xmp;
  if(a==='fast')bios.fast=!bios.fast;
  if(a==='sec')bios.secure=!bios.secure;
  if(a==='pwd'){bios.pwd=true;toast('Password set 🔑');}
  if(a==='h+')bios.hour=(bios.hour+1)%24;
  if(a==='h-')bios.hour=(bios.hour+23)%24;
  if(a==='m+')bios.min=(bios.min+10)%60;
  renderBios();
}
function biosKey(k){
  if($('#wsScreen').classList.contains('hidden')||!pcBuild.CPU||!bios.max)return;
  const nT=BTABS.length;
  if(bios.tab===2){
    // EASY RAM: every direction key adjusts RAM, no tab-trap
    if(k==='left'||k==='down')bios.ram=Math.max(2,bios.ram-1);
    if(k==='right'||k==='up')bios.ram=Math.min(bios.max,bios.ram+1);
    if(k==='enter'){toast('RAM set '+bios.ram+'GB / '+bios.max+'GB ✅');}
    renderBios();return;
  }
  if(k==='left')bios.tab=(bios.tab+nT-1)%nT,bios.sel=0;
  if(k==='right')bios.tab=(bios.tab+1)%nT,bios.sel=0;
  if(k==='up')bios.sel=Math.max(0,bios.sel-1);
  if(k==='down')bios.sel++;
  if(k==='enter'){
    if(bios.tab===1)doBoot(bios.order[bios.sel]??0);
    if(bios.tab===3)toast('OC '+(bios.ratio/10).toFixed(1)+'GHz • '+biosCpuTemp()+'°C');
    if(bios.tab===6&&bios.sel===0)doBoot(bios.order[0]??0);
    if(bios.tab===6){showWs('pc');return;}
  }
  if(k==='f9'){biosDefault();toast('Defaults ↩');}
  renderBios();
}
document.querySelectorAll('[data-bioskey]').forEach(b=>b.onclick=()=>biosKey(b.dataset.bioskey));
document.addEventListener('keydown',e=>{if(e.key==='ArrowUp')biosKey('up');if(e.key==='ArrowDown')biosKey('down');if(e.key==='ArrowLeft')biosKey('left');if(e.key==='ArrowRight')biosKey('right');if(e.key==='Enter')biosKey('enter');if(e.key==='F9')biosKey('f9');});
// ---------- BOOT + OS ----------
function doBoot(idx){
  const s=$('#screen');$('#screenLabel').textContent='DISPLAY — BOOTING';
  let target='windows';
  if(usbInserted&&idx===0)target=usbInserted.os;
  else if(pcBuild.SSD)target=usbInserted?usbInserted.os:'windows';
  if(!usbInserted&&!pcBuild.SSD){biosScreen('No boot device ❌');return;}
  if(target==='macos'&&bios.secure){biosScreen('⛔ Secure Boot blocked macOS.<br>Go to Security tab → Secure Boot OFF.');return;}
  const temp=biosCpuTemp();
  if(temp>90){biosScreen(`🔥 CPU OVERHEAT (${temp}°C)!<br>Lower OC or raise fan in OC & Fan tab,<br>then Save & reboot.`);return;}
  const oc=(bios.ratio/10).toFixed(1);
  let logs=bios.fast
    ?[`LumiPhones UEFI — Fast Boot`,`RAM ${bios.ram}/${bios.max}GB OK • XMP ${bios.xmp?'ON':'OFF'}`,`CPU ${oc}GHz ${temp}°C OK`,`Booting ${usbInserted&&idx===0?'USB':'SSD'} → ${target}...`]
    :['LumiPhones BIOS — RAM '+bios.ram+'/'+bios.max+'GB OK'+(bios.xmp?' (XMP)':''),'CPU '+pcBuild.CPU.name+' @ '+oc+'GHz '+temp+'°C OK','GPU '+(pcBuild.GPU?pcBuild.GPU.name:'iGPU'),'Detecting USB/SSD...','Boot from '+(usbInserted&&idx===0?'USB':'SSD')+' → '+target+'...','Loading kernel + drivers...','Starting desktop...'];
  s.className='screen';s.innerHTML='';let i=0;
  const tick=()=>{if(i<logs.length){s.innerHTML+='<div>> '+logs[i++]+'</div>';setTimeout(tick,bios.fast?220:400);}else setTimeout(()=>renderOS(target),500);};
  tick();
}
// ---------- RICH OS : window manager + per-OS apps ----------
let osCtx=null;
function osFSDefault(os){return {docs:[{n:'welcome.txt',c:'Welcome to '+(os==='windows'?'Windows 12':os==='linux'?'Ubuntu 24':'macOS Sonoma')+' on LumiPhones!\nRAM: '+bios.ram+'GB\nTry Terminal > neofetch'}],pics:[],dl:[]};}
function getFS(os){try{const all=JSON.parse(localStorage.getItem('lumi_fs')||'{}');if(!all[os])all[os]=osFSDefault(os);return all;}catch(e){const o={};o[os]=osFSDefault(os);return o;}}
function setFS(all){try{localStorage.setItem('lumi_fs',JSON.stringify(all));}catch(e){}}
function getNotes(os){try{return JSON.parse(localStorage.getItem('lumi_notes_'+os)||'[{"t":"Todo","c":"Resell 3 phones today!"}]');}catch(e){return[];}}
function setNotes(os,n){try{localStorage.setItem('lumi_notes_'+os,JSON.stringify(n));}catch(e){}}
const OS_APPS={
 windows:['Browser','Files','Photos','Notes','Calculator','Terminal','Paint','Music','Mail','Games','Store','Settings','TaskMan'],
 linux:['Browser','Files','Photos','Notes','Calculator','Terminal','Paint','Music','Mail','Games','Store','Settings','Monitor'],
 macos:['Browser','Files','Photos','Notes','Calculator','Terminal','Paint','Music','Mail','Games','Store','Settings','Activity']
};
const OS_NAMES={windows:{Browser:'Edge',Files:'Explorer',Photos:'Photos',Notes:'Notepad',Calculator:'Calculator',Terminal:'PowerShell',Paint:'Paint',Music:'Media Player',Mail:'Mail',Games:'Minesweeper',Store:'MS Store',Settings:'Settings',TaskMan:'Task Manager'},linux:{Browser:'Firefox',Files:'Files',Photos:'Photos',Notes:'Gedit',Calculator:'Calc',Terminal:'Bash',Paint:'Drawing',Music:'Rhythmbox',Mail:'Thunderbird',Games:'Snake',Store:'Snap Store',Settings:'Settings',Monitor:'Monitor'},macos:{Browser:'Safari',Files:'Finder',Photos:'Photos',Notes:'Notes',Calculator:'Calculator',Terminal:'zsh',Paint:'Preview',Music:'Music',Mail:'Mail',Games:'Memory',Store:'App Store',Settings:'System Settings',Activity:'Activity'}};
const WALLS={
 windows:['linear-gradient(160deg,#3aa0ff,#0a3d9e 60%,#062a6e)','linear-gradient(160deg,#7CFFB2,#0a6e4d)','linear-gradient(160deg,#b388ff,#3d0a9e)','linear-gradient(160deg,#ff9e5e,#9e2a0a)','linear-gradient(160deg,#5ef2e0,#0a4d9e)','linear-gradient(160deg,#222,#000)'],
 linux:['linear-gradient(180deg,#3d0a2e,#2c001e)','linear-gradient(180deg,#0a3d2e,#062a1e)','linear-gradient(180deg,#1a2a6e,#0a0a2e)','linear-gradient(180deg,#4d2a0a,#241206)','linear-gradient(180deg,#0a2e4d,#04121f)','linear-gradient(180deg,#222,#000)'],
 macos:['linear-gradient(180deg,#9ecfff,#e8f4ff 70%)','linear-gradient(180deg,#ffd89e,#ff9e9e)','linear-gradient(180deg,#222,#555)','linear-gradient(180deg,#c9ffe8,#7ec8ff)','linear-gradient(180deg,#ffe8f4,#c86ed8)','linear-gradient(180deg,#f4f4f6,#b0b0c0)']
};
function renderOS(os){
  $('#screenLabel').textContent='DISPLAY — '+os.toUpperCase()+' ('+bios.ram+'GB RAM)';
  const s=$('#screen');s.className='screen';s.innerHTML='';
  osCtx={os,wins:[],z:10,seq:1,wall:0,bootedAt:Date.now()};
  const d=document.createElement('div');d.className='desktop '+(os==='windows'?'win':os==='linux'?'ubuntu':'mac');d.id='osDesk';
  const time=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  const topHtml=os==='macos'
    ?`<div class="os-top"><span>🍎 Lumi • Finder • File • Edit • View • ⚡${benchScore()}</span><span><button class="btn small" id="osSpot" style="padding:1px 8px">🔍</button> 🔋100% • 📶 • <span id="osClock">${time}</span> <button class="btn small" id="osPow" style="padding:1px 8px">⏻</button></span></div>`
    :os==='linux'?`<div class="os-top"><span><button class="btn small" id="osActs" style="padding:1px 8px">Activities</button> • Firefox • Files • ⚡${benchScore()}</span><span>🔊 • 🔋 • <span id="osClock">${time}</span> <button class="btn small" id="osPow" style="padding:1px 8px">⏻</button></span></div>`
    :`<div class="os-top"><span>🪟 Windows 12 • ⚡${benchScore()} pts • ${bios.ram}GB</span><span>🔼 🔊 📶 🔋 • <span id="osClock">${time}</span> <button class="btn small" id="osPow" style="padding:1px 8px">⏻</button></span></div>`;
  d.innerHTML=topHtml
    +(os==='linux'?`<div class="os-dock-v" id="osDockV"></div>`:`<div class="os-icons" id="osDeskIcons"></div>`)
    +`<div class="os-wins" id="osWins"></div>`
    +`<div class="taskbar" id="osBar"></div><div id="osPop"></div>`;
  d.dataset.wall=0;
  s.appendChild(d);
  d._walls=WALLS[os];
  d.style.background=WALLS[os][0];
  const bar=d.querySelector('#osBar');
  const mkBtn=(label,fn)=>{const b=document.createElement('div');b.className='appicon';b.textContent=label;b.onclick=fn;bar.appendChild(b);return b;};
  if(os==='windows'){
    mkBtn('🪟 Start',()=>toggleStart(d));
    OS_APPS.windows.forEach(a=>mkBtn((OS_NAMES.windows[a]||a),()=>osOpen(a)));
    mkBtn('🔍',()=>osOpen('Browser'));
    d.oncontextmenu=e=>{e.preventDefault();winContextMenu(d,e.clientX,e.clientY);};
  }else if(os==='linux'){
    const dock=d.querySelector('#osDockV');
    OS_APPS.linux.forEach(a=>{const b=document.createElement('div');b.className='appicon';b.textContent=({Browser:'🦊',Files:'📁',Photos:'🖼️',Notes:'📝',Calculator:'🧮',Terminal:'💻',Paint:'🎨',Music:'🎵',Mail:'✉️',Games:'🐍',Store:'📦',Settings:'⚙️',Monitor:'📊'})[a]||a;b.title=a;b.onclick=()=>osOpen(a);dock.appendChild(b);});
    OS_APPS.linux.forEach(a=>mkBtn(a,()=>osOpen(a)));
  }else{
    OS_APPS.macos.forEach(a=>{const b=document.createElement('div');b.className='appicon';b.textContent=({Browser:'🧭',Files:'🙂',Photos:'🌅',Notes:'📝',Calculator:'🧮',Terminal:'💻',Paint:'🖌️',Music:'🎵',Mail:'✉️',Games:'🃏',Store:'🅰️',Settings:'⚙️',Activity:'📊'})[a]||a;b.title=a;b.onclick=()=>osOpen(a);bar.appendChild(b);});
    const icons=[['Safari','Browser'],['Finder','Files'],['Photos','Photos'],['Memory','Games']];
    const box=d.querySelector('#osDeskIcons');
    if(os==='windows'){[['This PC','Files'],['Edge','Browser'],['Photos','Photos'],['Minesweeper','Games'],['Recycle','Files']].forEach(([l,a])=>{const e=document.createElement('div');e.className='os-icon';e.innerHTML=`<div>${{'This PC':'🖥️',Edge:'🌐',Photos:'🖼️',Minesweeper:'💣',Recycle:'♻️'}[l]||'📦'}</div>${l}`;e.onclick=()=>osOpen(a);box.appendChild(e);});}
    else icons.forEach(([l,a])=>{const e=document.createElement('div');e.className='os-icon';e.innerHTML=`<div>${{Safari:'🧭',Finder:'🙂',Photos:'🌅',Memory:'🃏'}[l]||'📦'}</div>${l}`;e.onclick=()=>osOpen(a);box.appendChild(e);});
  }
  d.querySelector('#osPow').onclick=()=>osPowerMenu(d);
  const sp=d.querySelector('#osSpot');if(sp)sp.onclick=()=>toggleSpotlight(d);
  const ac=d.querySelector('#osActs');if(ac)ac.onclick=()=>toggleActivities(d);
  // lock / login screen per OS
  const lock=document.createElement('div');lock.className='os-lock';
  const user=os==='windows'?'Lumi User':os==='linux'?'lumi':'Lumi';
  lock.innerHTML=os==='macos'
    ?`<div style="font-size:52px">👤</div><b>${user}</b><div class="muted">Touch ID… accepted ✅</div><div style="font-size:12px">${time}</div><button class="btn primary">Log in ➜</button>`
    :os==='linux'?`<div><b>${user} login</b><div class="muted">password •••••• ✅</div><div>${time} • Ubuntu 24</div><button class="btn primary">Log in ➜</button></div>`
    :`<div style="font-size:40px">🪟</div><b>${user}</b><div class="muted">PIN **** ✅ Hello!</div><div>${time}</div><button class="btn primary">Sign in ➜</button>`;
  lock.querySelector('button').onclick=()=>{lock.remove();toast(`Welcome to ${(OS_NAMES[os]||{}).Browser||os}! 🎉`);};
  lock.onclick=e=>{if(e.target===lock)lock.remove();};
  d.appendChild(lock);
  setInterval(()=>{const t=d.querySelector('#osClock');if(t&&document.body.contains(d))t.textContent=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});},15000);
}
function osPowerMenu(d){
  const p=d.querySelector('#osPop');
  if(p.innerHTML){p.innerHTML='';return;}
  p.innerHTML=`<div class="startmenu"><button data-p="re">🔄 Restart OS</button><button data-p="off">⏻ Shut down</button></div>`;
  p.querySelector('[data-p="re"]').onclick=()=>renderOS(osCtx.os);
  p.querySelector('[data-p="off"]').onclick=()=>{biosScreen('Powered off ⏻<br><small>Go to PC bench → Power ON to boot again</small>');toast('PC off ⏻');};
}
function toggleSpotlight(d){
  const p=d.querySelector('#osPop');
  if(p.innerHTML){p.innerHTML='';return;}
  p.innerHTML=`<div class="startmenu" style="width:320px"><input id="spIn" placeholder="🔍 Spotlight — type app name…" style="grid-column:1/-1"><div id="spOut" style="grid-column:1/-1"></div></div>`;
  const inp=p.querySelector('#spIn'),out=p.querySelector('#spOut');
  const draw=()=>{const q=inp.value.toLowerCase();const apps=OS_APPS[osCtx.os].filter(a=>(OS_NAMES[osCtx.os][a]||a).toLowerCase().includes(q)||a.toLowerCase().includes(q));out.innerHTML=apps.map(a=>`<button data-a="${a}">${OS_NAMES[osCtx.os][a]||a}</button>`).join('')||'<small class="muted">No match</small>';out.querySelectorAll('button').forEach(x=>x.onclick=()=>{p.innerHTML='';osOpen(x.dataset.a);});};
  inp.oninput=draw;draw();setTimeout(()=>inp.focus(),50);
}
function toggleActivities(d){
  const p=d.querySelector('#osPop');
  if(p.innerHTML){p.innerHTML='';return;}
  const wins=osCtx.wins;
  p.innerHTML=`<div class="startmenu" style="width:320px"><b style="grid-column:1/-1">🗂️ ${wins.length} open window(s)</b>${wins.map(w=>`<button data-w="${w.id}">${OS_NAMES[osCtx.os][w.app]||w.app}</button>`).join('')||'<small class="muted">None — open something from the dock!</small>'}<button data-w="__all">🙈 Minimize all</button></div>`;
  p.querySelectorAll('button').forEach(x=>x.onclick=()=>{
    if(x.dataset.w==='__all'){osCtx.wins.forEach(w=>w.el.querySelector('.os-body').style.display='none');}
    else{const w=osCtx.wins.find(v=>v.id==x.dataset.w);if(w){w.el.querySelector('.os-body').style.display='';w.el.style.zIndex=++osCtx.z;}}
    p.innerHTML='';
  });
}
function winContextMenu(d,x,y){
  const old=d.querySelector('.ctxmenu');if(old)old.remove();
  const m=document.createElement('div');m.className='ctxmenu';
  m.innerHTML=`<button data-c="wall">🎨 Next wallpaper</button><button data-c="term">💻 Open PowerShell</button><button data-c="set">⚙️ Open Settings</button>`;
  m.style.left=Math.min(x,220)+'px';m.style.top=Math.max(40,y-40)+'px';
  d.appendChild(m);
  m.querySelector('[data-c="wall"]').onclick=()=>{cycleWall();m.remove();};
  m.querySelector('[data-c="term"]').onclick=()=>{osOpen('Terminal');m.remove();};
  m.querySelector('[data-c="set"]').onclick=()=>{osOpen('Settings');m.remove();};
  setTimeout(()=>m.remove(),4000);
}
function toggleStart(d){
  const p=d.querySelector('#osPop');
  if(p.innerHTML){p.innerHTML='';return;}
  p.innerHTML=`<div class="startmenu">${OS_APPS[osCtx.os].map(a=>`<button data-a="${a}">${OS_NAMES[osCtx.os][a]||a}</button>`).join('')}<button data-a="__wall">🎨 Wallpaper</button></div>`;
  p.querySelectorAll('button').forEach(b=>b.onclick=()=>{p.innerHTML='';if(b.dataset.a==='__wall')cycleWall();else osOpen(b.dataset.a);});
}
function cycleWall(){const d=$('#osDesk');if(!d)return;osCtx.wall=(osCtx.wall+1)%d._walls.length;d.style.background=d._walls[osCtx.wall];toast('Wallpaper changed 🎨');}
function osOpen(app){
  const ctx=osCtx,os=ctx.os;
  const id=ctx.seq++;
  const names=OS_NAMES[os]||{};
  const title=(names[app]||app)+' — '+os;
  const wins=$('#osWins');
  const w=document.createElement('div');w.className='os-win';w.id='osw'+id;
  w.style.left=(8+(ctx.wins.length*26)%160)+'px';w.style.top=(8+(ctx.wins.length*30)%120)+'px';w.style.zIndex=++ctx.z;
  const ctrls=os==='macos'?`<div class="ctl"><span data-c="x" style="background:#ff5f57">•</span><span data-c="m" style="background:#febc2e">•</span></div><span>${title}</span><span></span>`
    :`<span>${title}</span><div class="ctl"><span data-c="m">—</span><span data-c="x">✕</span></div>`;
  w.innerHTML=`<div class="os-title">${ctrls}</div><div class="os-body" id="osb${id}"></div>`;
  wins.appendChild(w);
  const rec={id,app,el:w};ctx.wins.push(rec);
  document.querySelectorAll('#osBar .appicon').forEach(b=>{if(b.textContent.includes(names[app]||app))b.classList.add('open');});
  w.onpointerdown=()=>w.style.zIndex=++ctx.z;
  const tb=w.querySelector('.os-title');
  let sx,sy,ox,oy,drag=false;
  tb.onpointerdown=e=>{if(e.target.dataset.c)return;drag=true;sx=e.clientX;sy=e.clientY;const r=w.getBoundingClientRect(),pr=wins.getBoundingClientRect();ox=r.left-pr.left;oy=r.top-pr.top;tb.setPointerCapture(e.pointerId);};
  tb.onpointermove=e=>{if(!drag)return;w.style.left=(ox+e.clientX-sx)+'px';w.style.top=Math.max(0,oy+e.clientY-sy)+'px';};
  tb.onpointerup=()=>drag=false;
  w.querySelector('[data-c="x"]').onclick=()=>{w.remove();ctx.wins=ctx.wins.filter(x=>x.id!==id);};
  w.querySelector('[data-c="m"]').onclick=()=>{const b=w.querySelector('.os-body');b.style.display=b.style.display==='none'?'':'none';};
  renderAppBody(os,app,id);
}
function renderAppBody(os,app,id){
  const b=$('#osb'+id);if(!b)return;
  const fs=getFS(os);
  if(app==='Calculator'){
    b.innerHTML=`<div style="font-size:24px;text-align:right;background:#111;color:#0f0;border-radius:8px;padding:8px" id="cd${id}">0</div><div style="margin:4px 0"><button class="btn small" id="sci${id}">🔬 scientific</button></div><div id="scir${id}" style="display:none"><div class="calc-grid" style="margin-bottom:6px">${['√','x²','%','±'].map(k=>`<button data-s="${k}">${k}</button>`).join('')}</div></div><div class="calc-grid" style="margin-top:6px">${['C','⌫','%','/','7','8','9','*','4','5','6','-','1','2','3','+','0','.','=','⏎'].map(k=>`<button data-k="${k}">${k}</button>`).join('')}</div><small class="muted">History: <span id="ch${id}">—</span></small>`;
    let expr='';
    const show=()=>b.querySelector('#cd'+id).textContent=expr||'0';
    b.querySelector('#sci'+id).onclick=function(){const r=b.querySelector('#scir'+id);r.style.display=r.style.display==='none'?'':'none';};
    b.querySelectorAll('[data-s]').forEach(btn=>btn.onclick=()=>{
      let v;try{v=Function('"use strict";return ('+(expr||'0')+')')();}catch(e){expr='Error';show();return;}
      const k=btn.dataset.s;
      if(k==='√')v=Math.sqrt(v);if(k==='x²')v=v*v;if(k==='%')v=v/100;if(k==='±')v=-v;
      expr=String(Math.round(v*1e8)/1e8);show();
    });
    b.querySelectorAll('[data-k]').forEach(btn=>btn.onclick=()=>{
      const k=btn.dataset.k;
      if(k==='C')expr='';
      else if(k==='⌫')expr=expr.slice(0,-1);
      else if(k==='='){try{const r=Function('"use strict";return ('+(expr||'0')+')')();b.querySelector('#ch'+id).textContent=expr+' = '+r;expr=String(Math.round(r*1e8)/1e8);}catch(e){expr='Error';}}
      else expr+=k;
      show();
    });
  }else if(app==='Terminal'){
    const prompt=os==='windows'?'PS C:\\lumi>':os==='linux'?'lumi@ubuntu:~$':'lumi@mac ~ %';
    b.innerHTML=`<div class="term" id="tm${id}"><div>lumi terminal (${os}) — type <b>help</b></div><div id="tout${id}"></div><div>${prompt} <input id="tin${id}" placeholder="help"></div></div>`;
    const inp=b.querySelector('#tin'+id),out=b.querySelector('#tout'+id);
    const hist=[];let hi=-1;
    inp.onkeydown=e=>{
      if(e.key==='ArrowUp'){e.preventDefault();if(hist.length){hi=Math.max(0,hi<0?hist.length-1:hi-1);inp.value=hist[hi];}return;}
      if(e.key==='ArrowDown'){e.preventDefault();if(hist.length){hi=Math.min(hist.length-1,hi+1);inp.value=hist[hi];}return;}
      if(e.key!=='Enter')return;
      const c=inp.value.trim();inp.value='';if(c)hist.push(c);hi=hist.length;
      const print=t=>out.innerHTML+=`<div>${t}</div>`;
      print(prompt+' '+c);
      const lc=c.toLowerCase();
      const jokes={windows:'Why did the GPU go to therapy? Too many pipeline stalls 😅',linux:'There are 10 kinds of people: those who get binary and those who don\'t 🐧',macos:'I\'d tell you a UDP joke, but you might not get it… 📦'};
      if(lc==='help')print('help • neofetch • bench • ls/dir • echo [t] • open [app] • xp • balance • fortune • clear • whoami • date • sudo • uptime');
      else if(lc==='neofetch'||lc==='sysinfo')print(`OS:${os} • CPU:${pcBuild.CPU?pcBuild.CPU.name:'?'} • RAM:${bios.ram}GB • GPU:${pcBuild.GPU?pcBuild.GPU.name:'iGPU'} • COOLER:${pcBuild.COOLER?pcBuild.COOLER.name:'—'} • SCORE:${benchScore()}`);
      else if(lc==='bench')print('Benchmark: '+benchScore()+' pts ⚡ '+(benchScore()>3000?'BEAST 🔥':benchScore()>1500?'solid ✅':'budget 🌱'));
      else if(lc==='ls'||lc==='dir')print('docs/ pics/ downloads/ • welcome.txt');
      else if(lc.startsWith('echo'))print(c.slice(5)||'...');
      else if(lc.startsWith('open ')){const a=c.slice(5).trim();const found=OS_APPS[os].find(x=>x.toLowerCase()===a.toLowerCase()||((OS_NAMES[os][x]||'').toLowerCase()===a.toLowerCase()));if(found){print('Opening '+found+'…');osOpen(found);}else print('No app "'+a+'" — try: '+OS_APPS[os].join(', '));}
      else if(lc==='xp')print('XP: '+stats.xp+' • Level '+(1+Math.floor(stats.xp/100))+' • Profit '+money(stats.profit));
      else if(lc==='balance'||lc==='money')print('Wallet: '+money(balance)+' 💰');
      else if(lc==='fortune'||lc==='joke')print('🔮 '+jokes[os]);
      else if(lc==='uptime')print('up '+(osCtx?Math.floor((Date.now()-osCtx.bootedAt)/1000):0)+'s • load '+Math.round(20+Math.random()*40)+'%');
      else if(lc==='clear')out.innerHTML='';
      else if(lc==='whoami')print(os==='windows'?'lumi\\reseller':'lumi');
      else if(lc==='date')print(new Date().toString());
      else if(lc==='sudo')print(os==='linux'?'[sudo] you are already root 😎':'nice try 😏');
      else if(lc)print(`'${c}' not found — try help`);
      b.scrollTop=b.scrollHeight;
    };
    setTimeout(()=>inp.focus(),100);
  }else if(app==='Notes'){
    const notes=getNotes(os);
    b.innerHTML=`<div style="display:flex;gap:6px"><select id="nl${id}">${notes.map((n,i)=>`<option value="${i}">${n.t}</option>`).join('')}</select><button class="btn small" id="nn${id}">+ New</button><button class="btn small" id="nd${id}">Delete</button></div><input id="nt${id}" placeholder="title"><textarea id="nc${id}" style="height:110px"></textarea><div style="display:flex;gap:6px;align-items:center"><button class="btn small primary" id="ns${id}">💾 Save</button><small class="muted" id="nw${id}"></small></div>`;
    const sel=b.querySelector('#nl'+id),ti=b.querySelector('#nt'+id),tx=b.querySelector('#nc'+id);
    const fill=()=>{const n=notes[+sel.value||0];if(n){ti.value=n.t;tx.value=n.c;}};
    sel.onchange=fill;fill();
    b.querySelector('#ns'+id).onclick=()=>{const i=+sel.value||0;notes[i]={t:ti.value||'Untitled',c:tx.value};setNotes(os,notes);renderAppBody(os,app,id);toast('Note saved 💾');};
    const wc=()=>{const w=(tx.value.match(/\S+/g)||[]).length;b.querySelector('#nw'+id).textContent=w+' words • '+tx.value.length+' chars';};
    tx.oninput=wc;wc();
    b.querySelector('#nn'+id).onclick=()=>{notes.push({t:'New note',c:''});setNotes(os,notes);renderAppBody(os,app,id);};
    b.querySelector('#nd'+id).onclick=()=>{notes.splice(+sel.value||0,1);setNotes(os,notes.length?notes:[{t:'Todo',c:''}]);renderAppBody(os,app,id);};
  }else if(app==='Files'){
    b.innerHTML=`<div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn small" data-f="docs">📄 Docs</button><button class="btn small" data-f="pics">🖼️ Pics</button><button class="btn small" data-f="dl">⬇️ DL</button><button class="btn small primary" id="nf${id}">+ File</button></div><input id="fs${id}" placeholder="🔍 filter files…" style="margin-top:4px"><div id="fl${id}" style="margin-top:6px"></div><div class="meter"><div style="width:${Math.min(90,20+fs.docs.length*8)}%"></div></div><small>SSD ${pcBuild.SSD?pcBuild.SSD.name:'virtual'} • ${bios.ram}GB RAM</small>`;
    let folder='docs',fq='';
    const draw=()=>{const list=fs[folder].map((f,i)=>({f,i})).filter(({f})=>f.n.toLowerCase().includes(fq));b.querySelector('#fl'+id).innerHTML=list.map(({f,i})=>`<div class="file-row"><span>📄 ${f.n}</span><span><button class="btn small" data-o="${i}">Open</button> <button class="btn small" data-d="${i}">✕</button></span></div>`).join('')||'<div class="muted">Empty folder</div>';
      b.querySelectorAll('[data-o]').forEach(x=>x.onclick=()=>{toast('Opened '+fs[folder][+x.dataset.o].n+' 📄');osOpen('Notes');});
      b.querySelectorAll('[data-d]').forEach(x=>x.onclick=()=>{fs[folder].splice(+x.dataset.d,1);setFS(fs);draw();});
    };
    b.querySelectorAll('[data-f]').forEach(x=>x.onclick=()=>{folder=x.dataset.f;draw();});
    b.querySelector('#fs'+id).oninput=e=>{fq=e.target.value.toLowerCase();draw();};
    b.querySelector('#nf'+id).onclick=()=>{const n=prompt('File name?','note.txt');if(n){fs[folder].push({n,c:'...'});setFS(fs);draw();}};
    draw();
  }else if(app==='Browser'){
    const bn=os==='windows'?'Edge':os==='linux'?'Firefox':'Safari';
    const tabs=[{url:'lumi://store',hist:['lumi://store'],hi:0}];let ti=0;
    b.innerHTML=`<div style="display:flex;gap:4px;align-items:center"><div id="bt${id}" style="display:flex;gap:4px;flex:1;overflow-x:auto"></div><button class="btn small" id="bplus${id}">＋</button></div><div style="display:flex;gap:6px;margin-top:4px"><button class="btn small" id="bb${id}">◀</button><button class="btn small" id="bf${id}">▶</button><input id="bu${id}" value="lumi://store" style="flex:1"><button class="btn small primary" id="bg${id}">Go</button></div><div style="display:flex;gap:6px;margin:6px 0"><button class="btn small" data-u="lumi://store">🏪 Store</button><button class="btn small" data-u="lumi://news">📰 News</button><button class="btn small" data-u="lumi://bench">⚡ Bench</button></div><div id="bp${id}" style="background:#f4f8ff;border-radius:8px;padding:8px;min-height:120px"></div>`;
    const bar2=b.querySelector('#bt'+id);
    const drawTabs=()=>{bar2.innerHTML='';tabs.forEach((t,i)=>{const x=document.createElement('button');x.className='btn small'+(i===ti?' primary':'');x.textContent=(t.url.replace('lumi://','')||'new').slice(0,10)+(tabs.length>1?' ✕':'');x.onclick=e=>{if(tabs.length>1&&(e.offsetX>x.offsetWidth-24)){tabs.splice(i,1);ti=Math.max(0,ti-1);}else{ti=i;}sync();};bar2.appendChild(x);});};
    const page=u=>{
      const t=tabs[ti];
      if(t.hist[t.hi]!==u){t.hist=t.hist.slice(0,t.hi+1);t.hist.push(u);t.hi=t.hist.length-1;}
      t.url=u;b.querySelector('#bu'+id).value=u;
      const p=b.querySelector('#bp'+id);
      if(u.includes('news'))p.innerHTML=`<b>📰 LumiNews</b><p>• GPU prices down 8% — great time to build!<br>• Rare phones sell +15% on weekends<br>• Benchmark over 3000 = WHALE buyer 🐳<br>• Cooler stock just landed 🌀</p>`;
      else if(u.includes('bench'))p.innerHTML=`<b>⚡ Your rig</b><p>Score <b>${benchScore()}</b> • CPU ${pcBuild.CPU?pcBuild.CPU.name:'—'}<br>GPU ${pcBuild.GPU?pcBuild.GPU.name:'—'} • RAM ${bios.ram}GB • Cooler ${pcBuild.COOLER?pcBuild.COOLER.name:'stock'}</p><button class="btn small primary" id="rb${id}">Re-run (+5 XP)</button>`;
      else if(u.includes('store'))p.innerHTML=`<b>🏪 ${bn} — LumiStore</b><p>Free driver pack + shop coupon:</p><button class="btn small primary" id="cl${id}">Claim $5 coupon</button>`;
      else{const q=u.replace(/^lumi:\/\//,'').replace(/\+/g,' ');p.innerHTML=`<b>🔍 Results for "${q}"</b><p>• <b>${bn} recommends:</b> lumi://store — best drivers<br>• lumi://news — today's market<br>• lumi://bench — test your rig<br>• Tip: type <b>open [app]</b> in Terminal to launch apps fast</p>`;}
      const rb=b.querySelector('#rb'+id);if(rb)rb.onclick=()=>{addXP(5);toast('Benchmark verified ⚡');};
      const cl=b.querySelector('#cl'+id);if(cl)cl.onclick=()=>{balance+=5;renderBalance();save();toast('+$5 coupon! 🎟️');cl.disabled=true;};
      drawTabs();
    };
    const sync=()=>{const t=tabs[ti];b.querySelector('#bu'+id).value=t.url;page(t.url);};
    b.querySelector('#bg'+id).onclick=()=>page(b.querySelector('#bu'+id).value||'lumi://store');
    b.querySelector('#bu'+id).onkeydown=e=>{if(e.key==='Enter')page(b.querySelector('#bu'+id).value||'lumi://store');};
    b.querySelector('#bb'+id).onclick=()=>{const t=tabs[ti];if(t.hi>0){t.hi--;page(t.hist[t.hi]);}};
    b.querySelector('#bf'+id).onclick=()=>{const t=tabs[ti];if(t.hi<t.hist.length-1){t.hi++;page(t.hist[t.hi]);}};
    b.querySelector('#bplus'+id).onclick=()=>{tabs.push({url:'lumi://store',hist:['lumi://store'],hi:0});ti=tabs.length-1;sync();};
    b.querySelectorAll('[data-u]').forEach(x=>x.onclick=()=>page(x.dataset.u));
    drawTabs();page('lumi://store');
  }else if(app==='Paint'){
    b.innerHTML=`<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><input type="color" id="pc${id}" value="#2f7bff" style="width:44px"><input type="range" id="ps${id}" min="2" max="20" value="5"><button class="btn small" data-m="brush">✏️</button><button class="btn small" data-m="rect">▭</button><button class="btn small" data-m="circ">◯</button><button class="btn small" id="pe${id}">Eraser</button><button class="btn small" id="pu${id}">↩ Undo</button><button class="btn small" id="px${id}">Clear</button><button class="btn small primary" id="pv${id}">💾 Save</button></div><canvas id="cv${id}" width="340" height="160" style="border:2px solid #333;border-radius:8px;touch-action:none;margin-top:6px;background:#fff"></canvas>`;
    const cv=b.querySelector('#cv'+id),cx=cv.getContext('2d');let dr=false,sx2=0,sy2=0,mode='brush',snap=null;const undo=[];
    const col=b.querySelector('#pc'+id),sz=b.querySelector('#ps'+id);let er=false;
    cx.fillStyle='#fff';cx.fillRect(0,0,340,160);
    const pos=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*(340/r.width),(e.clientY-r.top)*(160/r.height)];};
    const pushUndo=()=>{try{undo.push(cv.toDataURL());if(undo.length>15)undo.shift();}catch(e){}};
    cv.onpointerdown=e=>{dr=true;const[x,y]=pos(e);sx2=x;sy2=y;pushUndo();cx.beginPath();cx.moveTo(x,y);try{cv.setPointerCapture(e.pointerId);}catch(_){}snap=null;try{snap=cv.toDataURL();}catch(_){}};
    cv.onpointerup=e=>{if(!dr)return;dr=false;const[x,y]=pos(e);cx.strokeStyle=er?'#fff':col.value;cx.fillStyle=er?'#fff':col.value;cx.lineWidth=+sz.value;
      if(mode==='rect'&&snap){const im=new Image();im.onload=()=>{cx.clearRect(0,0,340,160);cx.drawImage(im,0,0);cx.strokeRect(sx2,sy2,x-sx2,y-sy2);};im.src=snap;}
      else if(mode==='circ'&&snap){const im=new Image();im.onload=()=>{cx.clearRect(0,0,340,160);cx.drawImage(im,0,0);cx.beginPath();cx.ellipse((sx2+x)/2,(sy2+y)/2,Math.abs(x-sx2)/2,Math.abs(y-sy2)/2,0,0,7);cx.stroke();};im.src=snap;}};
    cv.onpointermove=e=>{if(!dr||mode!=='brush')return;const[x,y]=pos(e);cx.strokeStyle=er?'#fff':col.value;cx.lineWidth=+sz.value;cx.lineTo(x,y);cx.stroke();};
    b.querySelectorAll('[data-m]').forEach(x=>x.onclick=()=>{mode=x.dataset.m;er=false;toast('Tool: '+mode+' ✏️');});
    b.querySelector('#pe'+id).onclick=function(){er=!er;this.classList.toggle('primary',er);};
    b.querySelector('#pu'+id).onclick=()=>{const u2=undo.pop();if(!u2){toast('Nothing to undo');return;}const im=new Image();im.onload=()=>{cx.clearRect(0,0,340,160);cx.drawImage(im,0,0);};im.src=u2;};
    b.querySelector('#px'+id).onclick=()=>{pushUndo();cx.fillStyle='#fff';cx.fillRect(0,0,340,160);};
    b.querySelector('#pv'+id).onclick=()=>{const all=getFS(os);all.pics.push({n:'drawing-'+Date.now()+'.png',c:''});setFS(all);toast('Saved to Photos 🖼️');};
  }else if(app==='Music'){
    const tunes={windows:['Startup Chime','Office Groove','Night Drive'],linux:['Kernel Panic','Bash Beat','Penguin Walk'],macos:['Marimba','Catalina','Sonoma Breeze']};
    b.innerHTML=`<b>🎵 ${os==='windows'?'Media Player':os==='linux'?'Rhythmbox':'Music'}</b><div class="viz" id="vz${id}">${'<div></div>'.repeat(14)}</div>${tunes[os].map((t,i)=>`<div class="file-row"><span>${i===0?'▶':'♪'} ${t}</span><button class="btn small primary" data-t="${i}">Play</button></div>`).join('')}<button class="btn small" id="stp${id}">⏹ Stop</button>`;
    let actx=null;
    const play=i=>{try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();const base=[523,587,659,784][i%4];[0,4,7,12,7,4].forEach((s,k)=>{const o=actx.createOscillator(),g=actx.createGain();o.connect(g);g.connect(actx.destination);o.type=i===2?'triangle':'square';o.frequency.value=base*Math.pow(2,s/12);o.start(actx.currentTime+k*.14);o.stop(actx.currentTime+k*.14+.13);});b.querySelector('#vz'+id).style.animation='';toast('Playing '+tunes[os][i]+' 🎵');}catch(e){toast('No audio');}};
    b.querySelectorAll('[data-t]').forEach(x=>x.onclick=()=>play(+x.dataset.t));
    b.querySelector('#stp'+id).onclick=()=>{try{actx&&actx.close();actx=null;}catch(e){}};
  }else if(app==='Store'){
    const extra=[['Crypto','📈','4.8'],['Assistant','✨','4.9'],['Antivirus','🛡️','4.7']];
    b.innerHTML=`<b>📦 ${OS_NAMES[os].Store}</b><input id="stq${id}" placeholder="🔍 search store…" style="margin:4px 0"><div id="stl${id}"></div><div class="meter"><div style="width:60%"></div></div><small>Featured: Lumi Drivers ✅ compatible</small>`;
    const drawSt=()=>{const q=(b.querySelector('#stq'+id).value||'').toLowerCase();
      b.querySelector('#stl'+id).innerHTML=extra.filter(([a])=>a.toLowerCase().includes(q)).map(([a,ic,rt])=>`<div class="file-row"><span>${ic} ${a} <small>★${rt}</small> ${installedApps[os+a]?'✅':''}</span><button class="btn small primary" data-a="${a}">${installedApps[os+a]?'Open':'Get'}</button></div>`).join('')||'<small class="muted">No apps found</small>';
      b.querySelectorAll('#stl'+id+' [data-a]').forEach(x=>x.onclick=()=>{const a=x.dataset.a;if(installedApps[os+a]){osOpen(a==='Assistant'?'Terminal':a);}else{installedApps[os+a]=true;save();toast(a+' installed 🎉');drawSt();}});};
    b.querySelector('#stq'+id).oninput=drawSt;drawSt();
  }else if(app==='Settings'){
    const walls=WALLS[os];
    b.innerHTML=`<b>⚙️ Settings (${os})</b><div><small>Wallpaper gallery:</small><div class="wallgrid">${walls.map((w,i)=>`<div data-w="${i}" style="background:${w}"></div>`).join('')}</div></div><div class="file-row"><span>🌙 Dark windows</span><button class="btn small" id="dk${id}">Toggle</button></div><div style="background:#eef4ff;border-radius:8px;padding:8px;margin-top:6px"><b>About this rig</b><br>OS: ${os} • RAM: ${bios.ram}/${bios.max}GB ${pcBuild.RAM?pcBuild.RAM.ddr:''}<br>CPU: ${pcBuild.CPU?pcBuild.CPU.name:'—'} • Cooler: ${pcBuild.COOLER?pcBuild.COOLER.name:'—'}<br>GPU: ${pcBuild.GPU?pcBuild.GPU.name:'iGPU'} • Score: ${benchScore()}</div><button class="btn small primary" id="upd${id}">Check updates</button>`;
    b.querySelectorAll('[data-w]').forEach(x=>x.onclick=()=>{osCtx.wall=+x.dataset.w;const d=$('#osDesk');d.style.background=d._walls[osCtx.wall];save();toast('Wallpaper set 🎨');});
    b.querySelector('#dk'+id).onclick=()=>{b.style.filter=b.style.filter?'':'invert(0.92)';};
    b.querySelector('#upd'+id).onclick=()=>toast('All updates installed ✅');
  }else if(app==='TaskMan'||app==='Monitor'||app==='Activity'){
    const up=osCtx?Math.floor((Date.now()-osCtx.bootedAt)/1000):0;
    const procs=os==='windows'?['lumi-shell','explorer','edge','drivers','defender']:os==='linux'?['lumi-shell','gnome','firefox','snapd','kernel']:['lumi-shell','Finder','Safari','launchd','mds'];
    b.innerHTML=`<b>📊 ${app} — live</b> <small>up ${up}s</small><div>CPU <div class="meter"><div id="mc${id}" style="width:30%"></div></div></div><div>RAM ${bios.ram}GB <div class="meter"><div id="mr${id}" style="width:50%"></div></div></div><button class="btn small" id="ea${id}">End all (+XP)</button><div id="pl${id}">${procs.map(p=>`<div class="file-row"><span>• ${p} — ${(Math.random()*15+2).toFixed(1)}% </span><button class="btn small" data-p="${p}">End</button></div>`).join('')}</div>`;
    const iv=setInterval(()=>{const m=b.querySelector('#mc'+id),r=b.querySelector('#mr'+id);if(!document.body.contains(b)){clearInterval(iv);return;}if(m)m.style.width=(20+Math.random()*60)+'%';if(r)r.style.width=(30+Math.random()*50)+'%';},900);
    b.querySelectorAll('[data-p]').forEach(x=>x.onclick=()=>{x.closest('.file-row').remove();addXP(2);toast('Freed memory ⚡');});
    b.querySelector('#ea'+id).onclick=()=>{b.querySelector('#pl'+id).innerHTML='<small class="muted">All clear ✨ so fresh!</small>';addXP(8);toast('System optimized +8 XP ⚡');};
  }else if(app==='Crypto'||app==='Assistant'||app==='Antivirus'){
    if(app==='Crypto')b.innerHTML=`<b>📈 LUMI Coin</b><p style="font-size:22px">LUMI $${(Math.random()*10+2).toFixed(2)} 🟢</p><canvas id="ch${id}" width="300" height="80" style="border:1px solid #ccc;border-radius:8px"></canvas><br><button class="btn small primary" id="by${id}">Buy $20</button>`;
    if(app==='Assistant')b.innerHTML=`<b>✨ Assistant</b><p>Ask me anything:</p><input id="aq${id}" placeholder="when to sell?"><button class="btn small primary" id="ab${id}">Ask</button><div id="ao${id}"></div>`;
    if(app==='Antivirus')b.innerHTML=`<b>🛡️ Scan</b><p>System clean ✅</p><button class="btn small primary" id="sc${id}">Full scan (+10 XP)</button><div id="so${id}"></div>`;
    const cv=b.querySelector('#ch'+id);
    if(cv){const cx=cv.getContext('2d');cx.strokeStyle='#2f7bff';cx.lineWidth=2;cx.beginPath();let y=40;for(let x=0;x<300;x+=10){y=40+Math.sin(x/20)*20*(Math.random()*.5+.5);x===0?cx.moveTo(x,y):cx.lineTo(x,y);}cx.stroke();}
    const by=b.querySelector('#by'+id);if(by)by.onclick=()=>{if(balance>=20){balance-=20;renderBalance();addXP(5);toast('Bought LUMI 📈');}else toast('Need $20');};
    const ab=b.querySelector('#ab'+id);if(ab)ab.onclick=()=>{b.querySelector('#ao'+id).innerHTML='<p>🤖 Sell when condition is 100% and haggle is high. PCs with score >3000 get whale buyers! 🐳</p>';};
    const sc=b.querySelector('#sc'+id);if(sc)sc.onclick=()=>{b.querySelector('#so'+id).textContent='Scanning… 0 threats ✅';addXP(10);};
  }else if(app==='Photos'){
    const pics=getFS(os).pics;
    const stock=[['Sunset build','linear-gradient(135deg,#ff9e5e,#c81e5e)'],['Ocean cool','linear-gradient(135deg,#5ef2e0,#0a4d9e)'],['Forest','linear-gradient(135deg,#7CFFB2,#0a6e4d)'],['Neon night','linear-gradient(135deg,#b388ff,#22114d)'],['Desert','linear-gradient(135deg,#ffe89e,#b7791f)'],['Mono','linear-gradient(135deg,#eee,#444)']];
    b.innerHTML=`<b>🖼️ Photos</b><div class="photogrid" style="margin-top:6px">${pics.map((p,i)=>`<div data-ph="${i}" style="background:linear-gradient(135deg,#2f7bff,#7CFFB2)">${p.n.slice(0,12)}</div>`).join('')}${stock.map((s2,i)=>`<div data-st="${i}" style="background:${s2[1]}">${s2[0]}</div>`).join('')}</div><div id="pv${id}"></div><small>${pics.length} drawing(s) saved from Paint 🎨</small>`;
    b.querySelectorAll('[data-st]').forEach(x=>x.onclick=()=>{const s2=stock[+x.dataset.st];b.querySelector('#pv'+id).innerHTML=`<div style="height:130px;border-radius:10px;background:${s2[1]};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800">${s2[0]} 🌅</div>`;});
    b.querySelectorAll('[data-ph]').forEach(x=>x.onclick=()=>{const p=pics[+x.dataset.ph];b.querySelector('#pv'+id).innerHTML=`<div style="padding:10px;background:#eef4ff;border-radius:10px">🎨 <b>${p.n}</b><br><small>Saved from Paint — full bitmap editing lives in Paint.</small></div>`;});
  }else if(app==='Mail'){
    const offer=Math.max(60,Math.round((inventory.find(x=>x.kind==='phone'&&x.repairs.every(r=>r.fixed))||{fixed:300}).fixed*1.05));
    b.innerHTML=`<b>✉️ Mail — 3 unread</b>
    <div class="mailmsg"><b>💰 Buyer Mike:</b> "I'll pay <b>${money(offer)}</b> for any FULLY FIXED phone!"<br><button class="btn small primary" id="m1${id}">Sell one fixed phone</button></div>
    <div class="mailmsg"><b>🖥️ PC Hunter:</b> "Show me a rig with score 2000+ and I'll tip you!"<br><button class="btn small primary" id="m2${id}">Claim tip (score ${benchScore()})</button></div>
    <div class="mailmsg"><b>🎟️ LumiDeals:</b> "A coupon fell behind the couch…"<br><button class="btn small primary" id="m3${id}">Claim $8 coupon</button></div>`;
    b.querySelector('#m1'+id).onclick=()=>{
      const i=inventory.findIndex(x=>x.kind==='phone'&&x.repairs.every(r=>r.fixed));
      if(i<0){toast('No fully-fixed phone in inventory 🔧');return;}
      const it=inventory[i];inventory.splice(i,1);balance+=offer;stats.profit+=offer-it.buy;addXP(20);renderBalance();renderInv();save();toast('Sold via Mail for '+money(offer)+' 💰');renderAppBody(os,app,id);
    };
    b.querySelector('#m2'+id).onclick=()=>{if(benchScore()>=2000){balance+=30;renderBalance();save();addXP(10);toast('Tip claimed +$30 🤑');}else toast('Score too low — upgrade the rig! (need 2000)');};
    b.querySelector('#m3'+id).onclick=function(){balance+=8;renderBalance();save();toast('+$8 🎟️');this.disabled=true;};
  }else if(app==='Games'){
    if(os==='windows')msGame(b,os,app,id);
    else if(os==='linux')snakeGame(b,os,app,id);
    else memoryGame(b,os,app,id);
  }else{
    b.innerHTML=`<b>${app}</b><p>Running on ${os} • ${bios.ram}GB RAM ⚡</p>`;
  }
}
// ---------- per-OS games ----------
function msGame(b,os,app,id){
  const N=8,MINES=10;let over=false,win=false,flags=0;
  const mines=new Set();while(mines.size<MINES)mines.add(Math.floor(Math.random()*N*N));
  const rev=new Set(),flag=new Set();
  b.innerHTML=`<b>💣 Minesweeper</b> <small>tap = dig • 🚩 mode = flag</small><div><button class="btn small" id="mm${id}">⛏️ dig</button> <span id="mc${id}">${MINES} 💣</span></div><div class="msgrid" id="mg${id}"></div><div id="mo${id}"></div>`;
  let mode='dig';
  b.querySelector('#mm'+id).onclick=function(){mode=mode==='dig'?'flag':'dig';this.textContent=mode==='dig'?'⛏️ dig':'🚩 flag';};
  const g=b.querySelector('#mg'+id);
  const near=i=>{const x=i%N,y=(i/N)|0;let n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=N||ny>=N)continue;if(mines.has(ny*N+nx))n++;}return n;};
  const draw=()=>{g.innerHTML='';for(let i=0;i<N*N;i++){const btn=document.createElement('button');if(rev.has(i)){btn.className='open';btn.textContent=mines.has(i)?'💥':(near(i)||'');}else btn.textContent=flag.has(i)?'🚩':'';btn.onclick=()=>click(i);g.appendChild(btn);}b.querySelector('#mc'+id).textContent=(MINES-flag.size)+' 💣';};
  const click=i=>{
    if(over||rev.has(i))return;
    if(mode==='flag'){flag.has(i)?flag.delete(i):flag.add(i);draw();return;}
    if(mines.has(i)){over=true;rev.add(i);draw();b.querySelector('#mo'+id).innerHTML='💥 Boom! <button class="btn small" id="mr'+id+'">Retry</button>';b.querySelector('#mr'+id).onclick=()=>msGame(b,os,app,id);return;}
    const flood=j=>{if(rev.has(j)||flag.has(j))return;rev.add(j);if(near(j)===0){const x=j%N,y=(j/N)|0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=N||ny>=N)continue;flood(ny*N+nx);}}};
    flood(i);draw();
    if(rev.size===N*N-MINES){over=true;win=true;addXP(20);b.querySelector('#mo'+id).innerHTML='🏆 Cleared! +20 XP 🎉';toast('Minesweeper cleared! 🏆');}
  };
  draw();
}
function snakeGame(b,os,app,id){
  b.innerHTML=`<b>🐍 Snake</b> <small>eat • don't crash • +XP per 50</small><div>Score: <b id="ss${id}">0</b></div><canvas id="sc${id}" width="264" height="160" style="border:2px solid #333;border-radius:8px;background:#0d1117;touch-action:none"></canvas><div style="display:flex;gap:4px;justify-content:center;margin-top:4px"><button class="btn small" data-d="0,-1">▲</button></div><div style="display:flex;gap:4px;justify-content:center"><button class="btn small" data-d="-1,0">◀</button><button class="btn small" data-d="0,1">▼</button><button class="btn small" data-d="1,0">▶</button></div>`;
  const cv=b.querySelector('#sc'+id),cx=cv.getContext('2d');
  let sn=[[5,5],[4,5]],dx=1,dy=0,food=[12,8],score=0,alive=true,iv=null;
  const step=()=>{
    if(!alive||!document.body.contains(cv)){clearInterval(iv);return;}
    const h=[sn[0][0]+dx,sn[0][1]+dy];
    if(h[0]<0||h[1]<0||h[0]>=22||h[1]>=13||sn.some(s2=>s2[0]===h[0]&&s2[1]===h[1])){alive=false;clearInterval(iv);toast('Game over — '+score+' 🐍');return;}
    sn.unshift(h);
    if(h[0]===food[0]&&h[1]===food[1]){score+=10;b.querySelector('#ss'+id).textContent=score;food=[(Math.random()*22)|0,(Math.random()*13)|0];if(score%50===0)addXP(5);}
    else sn.pop();
    cx.fillStyle='#0d1117';cx.fillRect(0,0,264,160);
    cx.fillStyle='#ff5d5d';cx.fillRect(food[0]*12,food[1]*12,11,11);
    cx.fillStyle='#3ffb74';sn.forEach(s2=>cx.fillRect(s2[0]*12,s2[1]*12,11,11));
  };
  iv=setInterval(step,140);
  b.querySelectorAll('[data-d]').forEach(x=>x.onclick=()=>{const[a,c]=x.dataset.d.split(',').map(Number);if(a!==-dx||c!==-dy){dx=a;dy=c;}});
  document.addEventListener('keydown',function h(e){if(!document.body.contains(cv)){document.removeEventListener('keydown',h);return;}if(e.key==='ArrowUp'&&dy!==1){dx=0;dy=-1;}if(e.key==='ArrowDown'&&dy!==-1){dx=0;dy=1;}if(e.key==='ArrowLeft'&&dx!==1){dx=-1;dy=0;}if(e.key==='ArrowRight'&&dx!==-1){dx=1;dy=0;}});
  let tx=0,ty=0;cv.onpointerdown=e=>{tx=e.clientX;ty=e.clientY;};
  cv.onpointerup=e=>{const ddx=e.clientX-tx,ddy=e.clientY-ty;if(Math.abs(ddx)<12&&Math.abs(ddy)<12)return;if(Math.abs(ddx)>Math.abs(ddy)){if(ddx>0&&dx!==-1){dx=1;dy=0;}else if(ddx<0&&dx!==1){dx=-1;dy=0;}}else{if(ddy>0&&dy!==-1){dx=0;dy=1;}else if(ddy<0&&dy!==1){dx=0;dy=-1;}}};
}
function memoryGame(b,os,app,id){
  const faces=['🍎','🚀','🐧','🎮','🌅','⚡','🎵','💾'];
  let deck=[...faces,...faces].sort(()=>Math.random()-.5);
  let first=-1,moves=0,found=0,lock2=false;
  b.innerHTML=`<b>🃏 Memory Match</b> <small>moves: <b id="mv${id}">0</b></small><div class="memgrid" id="mmg${id}"></div><div id="mmo${id}"></div>`;
  const g=b.querySelector('#mmg'+id);
  const draw=()=>{g.innerHTML='';deck.forEach((f,i)=>{const btn=document.createElement('button');btn.textContent=(i===first||deck['s'+i])?f:'❓';btn.onclick=()=>flip(i);g.appendChild(btn);});};
  const flip=i=>{
    if(lock2||deck['s'+i]||i===first)return;
    if(first<0){first=i;draw();return;}
    moves++;b.querySelector('#mv'+id).textContent=moves;
    if(deck[first]===deck[i]){deck['s'+first]=1;deck['s'+i]=1;found++;first=-1;draw();
      if(found===faces.length){addXP(20);b.querySelector('#mmo'+id).innerHTML=`🏆 Done in ${moves} moves! +20 XP 🎉`;}
    }else{const a=first;first=i;draw();lock2=true;setTimeout(()=>{first=-1;lock2=false;draw();},650);}
  };
  draw();
}
// keep alias for old calls
function openApp(os,name,root){osOpen(name);}
// ---------- UNITS ----------
let pendingLoot=null,pendingUnitUid=null;
function openUnit(uid){
  const i=inventory.findIndex(x=>x.uid===uid);if(i<0)return;
  const u=inventory[i];pendingUnitUid=uid;
  $('#unitModal').classList.remove('hidden');$('#claimLootBtn').classList.add('hidden');
  $('#unitResult').innerHTML='';$('#unitTitle').textContent='📦 Opening '+u.name+'…';
  $('#unitAnim').textContent='📦';
  pendingLoot=[];
  const jackpot=Math.random()<0.1;
  const n=u.loot+(jackpot?2:0);
  for(let k=0;k<n;k++){
    if(Math.random()<0.5){const p=PHONES[Math.floor(Math.random()*PHONES.length)];const dmg=Math.random()<0.6?[...DAMAGES].sort(()=>Math.random()-.5).slice(0,1+Math.floor(Math.random()*2)):[];pendingLoot.push({kind:'phone',name:p.name,img:p.img,mk:p.mk,buy:0,fixed:p.base,damages:dmg,repairs:dmg.map(d=>({...d,removed:false,fixed:false,unscrewed:false})),price:p.base,diag:false});}
    else{const p=PC_CATALOG[Math.floor(Math.random()*PC_CATALOG.length)];pendingLoot.push({kind:p.sub==='OS'?'usb':'part',sub:p.sub,...p});}
  }
  setTimeout(()=>{
    const total=pendingLoot.reduce((a,l)=>a+(l.fixed||l.price||0),0);
    const pl=total-u.price;
    $('#unitTitle').textContent=(jackpot?'🎰 JACKPOT! ':'')+u.name+' — '+(pl>=0?`+$${pl} PROFIT ✅`:`−$${Math.abs(pl)} LOSS ❌`);
    $('#unitResult').innerHTML='<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">'+pendingLoot.map(l=>{const[rc,rl]=rarity(l);const li=l.img||(l.sub&&PHOTO[l.sub]?PX(l.sub,0):'https://via.placeholder.com/100');return `<div style="border:2px solid #dbe7ff;border-radius:12px;padding:6px;width:124px"><img src="${li}" onerror="this.onerror=null;this.src='https://via.placeholder.com/100?text=Lumi'" style="width:100%;height:80px;object-fit:cover;border-radius:8px"><div style="font-size:12px"><b>${l.name}</b><br><span class="rar ${rc}">${rl}</span><br>${money(l.fixed||l.price)}</div></div>`;}).join('')+'</div><p>Total <b>'+money(total)+'</b> vs paid '+money(u.price)+'</p>';
    $('#claimLootBtn').classList.remove('hidden');$('#unitAnim').textContent=jackpot?'🎰':'🎉';
  },1900);
}
$('#claimLootBtn').onclick=()=>{
  const i=inventory.findIndex(x=>x.uid===pendingUnitUid);if(i>=0)inventory.splice(i,1);
  pendingLoot.forEach(l=>inventory.push({uid:uidC++,...l}));
  stats.units++;addXP(25);
  $('#unitModal').classList.add('hidden');renderInv();save();toast('Loot claimed! 🎉');
};
$('#closeUnitBtn').onclick=()=>$('#unitModal').classList.add('hidden');
// ---------- NAV ----------
document.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{shopCat=b.dataset.cat;document.querySelectorAll('[data-cat]').forEach(x=>x.classList.toggle('active',x===b));renderShop();});
document.querySelectorAll('[data-wstab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-wstab]').forEach(x=>x.classList.remove('active'));b.classList.add('active');showWs(b.dataset.wstab);});
$('#refreshPhones').onclick=()=>{genPhoneOffers();toast('New marketplace offers 🎲');};
$('#search').oninput=()=>renderShop();
load();genPhoneOffers();renderBalance();renderCart();renderInv();renderPc();renderStats();save();
