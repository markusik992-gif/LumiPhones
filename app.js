// LumiPhones Simulator v2 — marketplace photos + deeper mechanics
let balance = 1500;
let cart = [];
let inventory = [];
let uidC = 1;
let shopCat = 'phones';
let pcSub = 'ALL';
let phoneOffers = [];
let activePhoneUid = null;
let pcBuild = {CPU:null,GPU:null,RAM:null,BOARD:null,SSD:null,PSU:null,CASE:null};
let usbInserted = null;
let bios = {tab:0,sel:0,ram:8,max:16};
let installedApps = {};
let stats = {profit:0,repairs:0,pcs:0,units:0,xp:0};
let haggled = {};

const $ = s=>document.querySelector(s);
const toast = m=>{const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),2000);};
const money = n=>'$'+Number(Math.round(n)).toLocaleString();
const U = id=>`https://images.unsplash.com/${id}?w=400&q=80`;
const AMZ = id=>`https://m.media-amazon.com/images/I/${id}._AC_SL800_.jpg`;

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
// PC: primary = marketplace CDN photo (Amazon media), backup = real Unsplash hardware photo
const PC_CATALOG=[
 {sub:'CPU',name:'Ryzen 5 5600',spec:'AM4 • 6c/12t 4.4GHz',price:130,socket:'AM4',img:AMZ('61vGQNUEsGL'),fb:U('photo-1555617981-dac3880eac6e'),mk:'Amazon'},
 {sub:'CPU',name:'Ryzen 5 3600',spec:'AM4 • 6c/12t budget',price:85,socket:'AM4',img:AMZ('61vGQNUEsGL'),fb:U('photo-1555617981-dac3880eac6e'),mk:'eBay'},
 {sub:'CPU',name:'Intel i5-12400F',spec:'LGA1700 • 6c/12t',price:150,socket:'LGA1700',img:AMZ('61bSNcsoLxL'),fb:U('photo-1591799264318-7e6ef8ddb7ea'),mk:'Amazon'},
 {sub:'CPU',name:'Intel i7-12700K',spec:'LGA1700 • 12c/20t',price:280,socket:'LGA1700',img:AMZ('61bSNcsoLxL'),fb:U('photo-1591799264318-7e6ef8ddb7ea'),mk:'Newegg'},
 {sub:'CPU',name:'Intel i9-13900K',spec:'LGA1700 • 24c/32t beast',price:520,socket:'LGA1700',img:AMZ('61bSNcsoLxL'),fb:U('photo-1591405351990-4726e331f141'),mk:'BestBuy'},
 {sub:'CPU',name:'Ryzen 7 7800X3D',spec:'AM5 • 8c/16t X3D',price:390,socket:'AM5',img:AMZ('81RLhx3J1PL'),fb:U('photo-1555617981-dac3880eac6e'),mk:'BestBuy'},
 {sub:'CPU',name:'Ryzen 9 7950X',spec:'AM5 • 16c/32t monster',price:540,socket:'AM5',img:AMZ('81RLhx3J1PL'),fb:U('photo-1591405351990-4726e331f141'),mk:'Newegg'},
 {sub:'GPU',name:'GTX 1660 Super 6GB',spec:'6GB • needs 450W',price:140,watt:450,img:AMZ('51bL9UDoiTL'),fb:U('photo-1591488320449-011701bb6704'),mk:'eBay'},
 {sub:'GPU',name:'RX 6600 8GB',spec:'8GB • needs 450W',price:190,watt:450,img:AMZ('51bL9UDoiTL'),fb:U('photo-1591488320449-011701bb6704'),mk:'eBay'},
 {sub:'GPU',name:'RTX 3060 12GB',spec:'12GB • needs 550W',price:290,watt:550,img:AMZ('81U5H5c0iEL'),fb:U('photo-1591488320449-011701bb6704'),mk:'Amazon'},
 {sub:'GPU',name:'RTX 4060 8GB',spec:'8GB DLSS3 • needs 550W',price:330,watt:550,img:AMZ('81U5H5c0iEL'),fb:U('photo-1587202372775-e229f172b9d7'),mk:'BestBuy'},
 {sub:'GPU',name:'RTX 4070 12GB',spec:'12GB DLSS3 • needs 650W',price:590,watt:650,img:AMZ('810znq8uspL'),fb:U('photo-1587202372775-e229f172b9d7'),mk:'Newegg'},
 {sub:'GPU',name:'RX 7900 XT 20GB',spec:'20GB • needs 750W',price:750,watt:750,img:AMZ('810znq8uspL'),fb:U('photo-1591488320449-011701bb6704'),mk:'Newegg'},
 {sub:'GPU',name:'RTX 4090 24GB',spec:'24GB flagship • needs 850W',price:1600,watt:850,img:AMZ('810znq8uspL'),fb:U('photo-1587202372775-e229f172b9d7'),mk:'BestBuy'},
 {sub:'RAM',name:'Kingston 8GB DDR4',spec:'1x8GB • DDR4',price:28,gb:8,ddr:'DDR4',img:AMZ('61fkBa7oMcL'),fb:U('photo-1562976540-1502c2145186'),mk:'BestBuy'},
 {sub:'RAM',name:'Corsair 16GB DDR4',spec:'2x8GB 3200 =16GB • DDR4',price:55,gb:16,ddr:'DDR4',img:AMZ('61etedMbxoL'),fb:U('photo-1562976540-1502c2145186'),mk:'Amazon'},
 {sub:'RAM',name:'Corsair 32GB DDR4',spec:'2x16GB 3600 =32GB • DDR4',price:85,gb:32,ddr:'DDR4',img:AMZ('61etedMbxoL'),fb:U('photo-1562976540-1502c2145186'),mk:'Newegg'},
 {sub:'RAM',name:'G.Skill 16GB DDR5',spec:'2x8GB 5600 =16GB • DDR5',price:65,gb:16,ddr:'DDR5',img:AMZ('81Tg4n5x4IL'),fb:U('photo-1562976540-1502c2145186'),mk:'Amazon'},
 {sub:'RAM',name:'G.Skill 32GB DDR5',spec:'2x16GB 6000 =32GB • DDR5',price:110,gb:32,ddr:'DDR5',img:AMZ('81Tg4n5x4IL'),fb:U('photo-1562976540-1502c2145186'),mk:'Newegg'},
 {sub:'RAM',name:'Dominators 64GB DDR5',spec:'2x32GB 6000 =64GB • DDR5',price:220,gb:64,ddr:'DDR5',img:AMZ('81Tg4n5x4IL'),fb:U('photo-1562976540-1502c2145186'),mk:'BestBuy'},
 {sub:'BOARD',name:'MSI B450 Tomahawk',spec:'AM4 • DDR4 budget',price:90,socket:'AM4',ddr:'DDR4',img:AMZ('71dN8dA5BiL'),fb:U('photo-1518770660439-4636190af475'),mk:'eBay'},
 {sub:'BOARD',name:'MSI B550 Tomahawk',spec:'AM4 • DDR4',price:140,socket:'AM4',ddr:'DDR4',img:AMZ('71dN8dA5BiL'),fb:U('photo-1518770660439-4636190af475'),mk:'Newegg'},
 {sub:'BOARD',name:'Gigabyte H610M',spec:'LGA1700 • DDR4 budget',price:110,socket:'LGA1700',ddr:'DDR4',img:AMZ('71q0SSxDKAL'),fb:U('photo-1518770660439-4636190af475'),mk:'Amazon'},
 {sub:'BOARD',name:'ASUS Z790 Prime',spec:'LGA1700 • DDR5',price:220,socket:'LGA1700',ddr:'DDR5',img:AMZ('71q0SSxDKAL'),fb:U('photo-1518770660439-4636190af475'),mk:'Amazon'},
 {sub:'BOARD',name:'Gigabyte B650M',spec:'AM5 • DDR5',price:180,socket:'AM5',ddr:'DDR5',img:AMZ('71q0SSxDKAL'),fb:U('photo-1518770660439-4636190af475'),mk:'BestBuy'},
 {sub:'BOARD',name:'ASUS X670E Hero',spec:'AM5 • DDR5 flagship',price:320,socket:'AM5',ddr:'DDR5',img:AMZ('71q0SSxDKAL'),fb:U('photo-1518770660439-4636190af475'),mk:'Newegg'},
 {sub:'SSD',name:'Kingston 256GB SATA',spec:'256GB SATA budget',price:28,img:AMZ('61pDkKY9zOL'),fb:U('photo-1597872200969-2b65d56bd16b'),mk:'eBay'},
 {sub:'SSD',name:'Samsung 500GB NVMe',spec:'500GB 3000MB/s',price:45,img:AMZ('61pDkKY9zOL'),fb:U('photo-1597872200969-2b65d56bd16b'),mk:'Amazon'},
 {sub:'SSD',name:'Samsung 970 1TB NVMe',spec:'1TB 3500MB/s',price:75,img:AMZ('61pDkKY9zOL'),fb:U('photo-1597872200969-2b65d56bd16b'),mk:'Amazon'},
 {sub:'SSD',name:'WD Black 2TB NVMe',spec:'2TB 7000MB/s',price:140,img:AMZ('61g8TvisioMcL'),fb:U('photo-1597872200969-2b65d56bd16b'),mk:'BestBuy'},
 {sub:'SSD',name:'Samsung 990 4TB NVMe',spec:'4TB 7450MB/s flagship',price:300,img:AMZ('61g8TvisioMcL'),fb:U('photo-1597872200969-2b65d56bd16b'),mk:'Newegg'},
 {sub:'PSU',name:'EVGA 450W',spec:'450W budget',price:38,watts:450,img:AMZ('61k5oW1a8EL'),fb:U('photo-1587202372634-32705e3bf49c'),mk:'eBay'},
 {sub:'PSU',name:'EVGA 500W',spec:'500W budget',price:45,watts:500,img:AMZ('61k5oW1a8EL'),fb:U('photo-1587202372634-32705e3bf49c'),mk:'eBay'},
 {sub:'PSU',name:'Corsair 650W Bronze',spec:'650W 80+ Bronze',price:70,watts:650,img:AMZ('61k5oW1a8EL'),fb:U('photo-1587202372634-32705e3bf49c'),mk:'Newegg'},
 {sub:'PSU',name:'Seasonic 850W Gold',spec:'850W 80+ Gold',price:130,watts:850,img:AMZ('71dN8dA5BiL'),fb:U('photo-1587202372634-32705e3bf49c'),mk:'Amazon'},
 {sub:'PSU',name:'Corsair 1000W Platinum',spec:'1000W 80+ Platinum',price:220,watts:1000,img:AMZ('71dN8dA5BiL'),fb:U('photo-1587202372634-32705e3bf49c'),mk:'Newegg'},
 {sub:'CASE',name:'DeepCool Mini ITX',spec:'Mini ITX compact',price:65,img:AMZ('71dN8dA5BiL'),fb:U('photo-1587202372775-e229f172b9d7'),mk:'Amazon'},
 {sub:'CASE',name:'NZXT H510 Glass',spec:'ATX Mid Tower',price:90,img:AMZ('71dN8dA5BiL'),fb:U('photo-1587202372775-e229f172b9d7'),mk:'BestBuy'},
 {sub:'CASE',name:'Lian Li O11 RGB',spec:'ATX Show Case',price:150,img:AMZ('71q0SSxDKAL'),fb:U('photo-1587202372775-e229f172b9d7'),mk:'Newegg'},
 {sub:'CASE',name:'Corsair 7000D Full Tower',spec:'Full Tower RGB flagship',price:240,img:AMZ('71q0SSxDKAL'),fb:U('photo-1587202372775-e229f172b9d7'),mk:'BestBuy'},
 {sub:'OS',name:'Windows 10 USB',spec:'Win10 installer',price:20,os:'windows',img:U('photo-1629654297299-c8506221ca97'),fb:U('photo-1629654297299-c8506221ca97'),mk:'eBay'},
 {sub:'OS',name:'Windows 11 USB',spec:'Win11 Pro installer',price:25,os:'windows',img:U('photo-1629654297299-c8506221ca97'),fb:U('photo-1629654297299-c8506221ca97'),mk:'Amazon'},
 {sub:'OS',name:'Ubuntu 24.04 USB',spec:'Linux installer',price:15,os:'linux',img:U('photo-1629654297299-c8506221ca97'),fb:U('photo-1629654297299-c8506221ca97'),mk:'Newegg'},
 {sub:'OS',name:'Kali Linux USB',spec:'Pen-test distro',price:18,os:'linux',img:U('photo-1629654297299-c8506221ca97'),fb:U('photo-1629654297299-c8506221ca97'),mk:'Amazon'},
 {sub:'OS',name:'macOS Sonoma USB',spec:'macOS installer',price:25,os:'macos',img:U('photo-1618410320928-25228d811631'),fb:U('photo-1618410320928-25228d811631'),mk:'eBay'},
];
const UNITS=[
 {name:'Small Locker',price:200,img:U('photo-1590247813698-77379d6c9628'),loot:2},
 {name:'Garage Unit',price:500,img:U('photo-1558618666-fcd25c85cd64'),loot:4},
 {name:'Tech Pallet',price:700,img:U('photo-1587293852726-70cdb56c2866'),loot:5},
 {name:'Warehouse Unit',price:950,img:U('photo-1553413077-190dd305871c'),loot:6},
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
    const subs=['ALL','CPU','GPU','RAM','BOARD','SSD','PSU','CASE','OS'];
    $('#pcSubcats').innerHTML=subs.map(s=>`<button class="chip ${pcSub===s?'active':''}" data-sub="${s}">${s}</button>`).join('');
    document.querySelectorAll('[data-sub]').forEach(b=>b.onclick=()=>{pcSub=b.dataset.sub;renderShop();});
  }
  if(shopCat==='phones'){
    const q=($('#search').value||'').toLowerCase();
    phoneOffers.filter(o=>o.name.toLowerCase().includes(q)).forEach((o)=>{
      const i=phoneOffers.indexOf(o);
      const el=document.createElement('div');el.className='item-card';
      el.innerHTML=`${imgTag(o.img)}<div class="info"><b>${o.name}</b>${mkBadge(o.mk||'Amazon')}<span class="tag">${o.cond}</span><div>${o.diag?o.damages.map(d=>`<span class="dmg">⚠ ${d.name} ($${d.cost})</span>`).join(''):'<span class="muted">❓ Un-diagnosed — buy & Diagnose in workshop</span>'}</div><div class="price">${money(o.buy)} <small style="color:#888">→ fixed ${money(o.fixed)}</small></div><div class="row"><button class="btn small primary">Buy now</button><button class="btn small">+ Cart</button></div></div>`;
      const [buy,cartB]=el.querySelectorAll('button');
      buy.onclick=()=>buyPhoneOffer(i,false);cartB.onclick=()=>buyPhoneOffer(i,true);
      list.appendChild(el);
    });
  }else if(shopCat==='pc'){
    filteredPC().forEach(p=>{
      const el=document.createElement('div');el.className='item-card';
      el.innerHTML=`${imgTag(p.img,p.fb)}<div class="info"><b>${p.name}</b><span class="tag">${p.sub}</span>${mkBadge(p.mk||'Amazon')}<div class="muted">${p.spec}</div><div class="price">${money(p.price)}</div><div class="row"><button class="btn small primary">Buy now</button><button class="btn small">+ Cart</button></div></div>`;
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
    const d=document.createElement('div');d.className='inv-item';d.draggable=true;
    const [rc,rl]=rarity(it);
    let sub=it.kind==='phone'?`${it.repairs.filter(r=>r.fixed).length}/${it.repairs.length} fixed • ${it.diag?'diagnosed':'tap Diagnose'}`:it.kind==='usb'?('USB • '+it.os):(it.sub||it.kind);
    d.innerHTML=`${imgTag(it.img||it.fb||'https://via.placeholder.com/52',it.fb)}<div style="flex:1"><b>${it.name}</b> <span class="rar ${rc}">${rl}</span><div class="muted">${sub}</div></div><span>${it.kind==='phone'?money(it.fixed):money(it.price||it.buy||0)}</span>`;
    d.onclick=()=>loadToWorkshop(it);
    d.ondragstart=e=>e.dataTransfer.setData('text/plain',it.uid);
    box.appendChild(d);
  });
}
function loadToWorkshop(it){
  document.querySelectorAll('[data-wstab]').forEach(b=>b.classList.remove('active'));
  if(it.kind==='phone'){document.querySelector('[data-wstab="phone"]').classList.add('active');showWs('phone');activePhoneUid=it.uid;renderPhoneBench();}
  else if(it.kind==='part'||it.kind==='usb'){document.querySelector('[data-wstab="pc"]').classList.add('active');showWs('pc');installPart(it.uid);}
  else if(it.kind==='unit'){openUnit(it.uid);}
}
function showWs(w){$('#wsPhone').classList.toggle('hidden',w!=='phone');$('#wsPc').classList.toggle('hidden',w!=='pc');$('#wsScreen').classList.toggle('hidden',w!=='screen');}
// ---------- PHONE BENCH v2 ----------
function renderPhoneBench(){
  const it=inventory.find(x=>x.uid===activePhoneUid);
  if(!it){$('#phoneEmpty').classList.remove('hidden');$('#phoneBench').classList.add('hidden');return;}
  $('#phoneEmpty').classList.add('hidden');$('#phoneBench').classList.remove('hidden');
  $('#pbImg').src=it.img;$('#pbName').innerHTML=`<b>${it.name}</b> ${mkBadge(it.mk||'Amazon')}`;
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
const SLOTS=['CPU','GPU','RAM','BOARD','SSD','PSU','CASE'];
function compat(){
  const b=pcBuild,msgs=[];
  if(b.CPU&&b.BOARD&&b.CPU.socket!==b.BOARD.socket)msgs.push(['bad',`Socket mismatch: CPU ${b.CPU.socket} vs Board ${b.BOARD.socket} ❌`]);
  else if(b.CPU&&b.BOARD)msgs.push(['ok',`Socket ${b.CPU.socket} match ✅`]);
  if(b.RAM&&b.BOARD&&b.RAM.ddr!==b.BOARD.ddr)msgs.push(['bad',`RAM ${b.RAM.ddr} vs Board ${b.BOARD.ddr} ❌`]);
  else if(b.RAM&&b.BOARD)msgs.push(['ok',`${b.RAM.ddr} match ✅`]);
  if(b.GPU&&b.PSU&&(b.PSU.watts||0)<(b.GPU.watt||0))msgs.push(['bad',`PSU ${b.PSU.watts}W < GPU needs ${b.GPU.watt}W ❌`]);
  else if(b.GPU&&b.PSU)msgs.push(['ok',`Power OK ✅`]);
  return msgs;
}
function benchScore(){
  let s=0;const b=pcBuild;
  if(b.CPU)s+=b.CPU.price*2;if(b.GPU)s+=b.GPU.price*3;if(b.RAM)s+=(b.RAM.gb||8)*15;if(b.SSD)s+=80;
  return Math.round(s);
}
function renderPc(){
  const box=$('#pcSlots');box.innerHTML='';
  SLOTS.forEach(s=>{
    const v=pcBuild[s];
    const d=document.createElement('div');d.className='pc-slot'+(v?' filled':'');d.dataset.slot=s;
    d.innerHTML=v?`✅ <b>${s}</b><br>${v.name}<br><small>${v.spec||''}</small>`:`<b>${s}</b><br><small>empty — drag/tap</small>`;
    d.ondragover=e=>{e.preventDefault();d.classList.add('over');};
    d.ondragleave=()=>d.classList.remove('over');
    d.ondrop=e=>{e.preventDefault();d.classList.remove('over');installPart(+e.dataTransfer.getData('text/plain'),s);};
    box.appendChild(d);
  });
  const val=Object.values(pcBuild).filter(Boolean).reduce((a,p)=>a+(p.price||0),0);
  const score=benchScore();
  $('#pcValue').innerHTML='Build value: '+money(val)+(usbInserted?'<br>🔌 '+usbInserted.name:'')
    +'<br>'+compat().map(([k,m])=>`<span class="compat-${k}">${m}</span>`).join('<br>')
    +(score?`<br><span class="bench-score">⚡ Benchmark ${score} pts (+$${Math.round(score/20)} bonus on sale)</span>`:'');
  $('#usbSlot').textContent=usbInserted?('🔌 '+usbInserted.name+' ('+usbInserted.os+')'):'— drag OS flash drive here —';
}
function installPart(uid,forceSlot){
  const i=inventory.findIndex(x=>x.uid===uid);if(i<0)return;
  const it=inventory[i];
  if(it.kind==='usb'){usbInserted=it;inventory.splice(i,1);renderInv();renderPc();save();toast('USB plugged in 🔌');return;}
  if(it.kind!=='part'){toast('Not a PC part');return;}
  const slot=forceSlot||it.sub;
  if(!SLOTS.includes(slot)){toast('Wrong slot');return;}
  if(slot==='CPU'&&pcBuild.BOARD&&it.socket!==pcBuild.BOARD.socket){toast(`Incompatible! Board is ${pcBuild.BOARD.socket} ❌`);return;}
  if(slot==='BOARD'){
    if(pcBuild.CPU&&pcBuild.CPU.socket!==it.socket){toast(`CPU is ${pcBuild.CPU.socket}, board is ${it.socket} ❌`);return;}
    if(pcBuild.RAM&&pcBuild.RAM.ddr!==it.ddr){toast(`RAM is ${pcBuild.RAM.ddr}, board needs ${it.ddr} ❌`);return;}
  }
  if(slot==='RAM'&&pcBuild.BOARD&&it.ddr!==pcBuild.BOARD.ddr){toast(`Board needs ${pcBuild.BOARD.ddr} ❌`);return;}
  if(pcBuild[slot])inventory.push(pcBuild[slot]);
  pcBuild[slot]=it;inventory.splice(i,1);renderInv();renderPc();save();addXP(10);toast(slot+' installed ✅');
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
  bios={tab:0,sel:0,ram:Math.min(8,maxGb),max:maxGb};
  renderBios();
};
// ---------- BIOS ----------
const BTABS=['System','Boot','Memory','Exit'];
function biosScreen(msg){$('#screenLabel').textContent='DISPLAY — NO SIGNAL';$('#screen').className='screen off';$('#screen').innerHTML='<div class="screen-off-msg">'+msg+'</div>';}
function renderBios(){
  $('#screenLabel').textContent='DISPLAY — LumiPhones BIOS';
  const s=$('#screen');s.className='screen';s.innerHTML='';
  const b=document.createElement('div');b.className='bios';
  const drives=[usbInserted?('USB: '+usbInserted.name+' ['+usbInserted.os+']'):null,pcBuild.SSD?('SSD: '+pcBuild.SSD.name):null].filter(Boolean);
  let body='';
  if(bios.tab===0)body=`<p>LumiPhones BIOS v2.4</p><p>CPU: ${pcBuild.CPU.name} (${pcBuild.CPU.socket})<br>Board: ${pcBuild.BOARD.name}<br>RAM: ${bios.max}GB ${pcBuild.RAM.ddr}<br>GPU: ${pcBuild.GPU?pcBuild.GPU.name:'—'} • PSU ${pcBuild.PSU.name}</p>`;
  if(bios.tab===1)body=`<p>Boot priority (ENTER):</p>`+(drives.length?drives.map((d,i)=>`<div class="${i===bios.sel?'sel':''}">${i===bios.sel?'▶ ':''}${d}</div>`).join(''):'<p>No bootable devices!</p>');
  if(bios.tab===2)body=`<p>Allocate RAM (max ${bios.max}GB):</p><h2>◀ ${bios.ram} GB ▶</h2>`;
  if(bios.tab===3)body=`<p>Save & Exit?</p><div class="${bios.sel===0?'sel':''}">Save & reboot</div><div class="${bios.sel===1?'sel':''}">Discard</div>`;
  b.innerHTML=`<div style="display:flex;gap:8px;flex-wrap:wrap">${BTABS.map((t,i)=>`<span style="padding:4px 10px;${i===bios.tab?'background:#fff;color:#0b1e9e':''}">${t}</span>`).join('')}</div><hr>${body}<hr><small>touch buttons below work on mobile</small>`;
  s.appendChild(b);
}
function biosKey(k){
  if($('#wsScreen').classList.contains('hidden')||!pcBuild.CPU)return;
  if(k==='left'){if(bios.tab===2)bios.ram=Math.max(2,bios.ram-2);else{bios.tab=(bios.tab+3)%4;bios.sel=0;}}
  if(k==='right'){if(bios.tab===2)bios.ram=Math.min(bios.max,bios.ram+2);else{bios.tab=(bios.tab+1)%4;bios.sel=0;}}
  if(k==='up')bios.sel=Math.max(0,bios.sel-1);
  if(k==='down')bios.sel++;
  if(k==='enter'){
    if(bios.tab===1)doBoot(bios.sel);
    if(bios.tab===2)toast('RAM '+bios.ram+'GB ✅');
    if(bios.tab===3&&bios.sel===0)doBoot(0);
    if(bios.tab===3){showWs('pc');return;}
  }
  renderBios();
}
document.querySelectorAll('[data-bioskey]').forEach(b=>b.onclick=()=>biosKey(b.dataset.bioskey));
document.addEventListener('keydown',e=>{if(e.key==='ArrowUp')biosKey('up');if(e.key==='ArrowDown')biosKey('down');if(e.key==='ArrowLeft')biosKey('left');if(e.key==='ArrowRight')biosKey('right');if(e.key==='Enter')biosKey('enter');});
// ---------- BOOT + OS ----------
function doBoot(idx){
  const s=$('#screen');$('#screenLabel').textContent='DISPLAY — BOOTING';
  let target='windows';
  if(usbInserted&&idx===0)target=usbInserted.os;
  else if(pcBuild.SSD)target=usbInserted?usbInserted.os:'windows';
  if(!usbInserted&&!pcBuild.SSD){biosScreen('No boot device ❌');return;}
  const logs=['LumiPhones BIOS — RAM '+bios.ram+'GB OK','CPU '+pcBuild.CPU.name+' OK','GPU '+(pcBuild.GPU?pcBuild.GPU.name:'iGPU'),'Boot from '+(usbInserted&&idx===0?'USB':'SSD')+'...','Kernel + drivers...','Desktop...'];
  s.className='screen';s.innerHTML='';let i=0;
  const tick=()=>{if(i<logs.length){s.innerHTML+='<div>> '+logs[i++]+'</div>';setTimeout(tick,400);}else setTimeout(()=>renderOS(target),500);};
  tick();
}
function renderOS(os){
  $('#screenLabel').textContent='DISPLAY — '+os.toUpperCase()+' ('+bios.ram+'GB)';
  const s=$('#screen');s.className='screen';s.innerHTML='';
  const d=document.createElement('div');d.className='desktop '+(os==='windows'?'win':os==='linux'?'ubuntu':'mac');
  const bar=os==='mac'?`<div style="background:rgba(255,255,255,.92);color:#222;padding:6px;border-radius:8px">🍎 LumiOS ${os} • ${bios.ram}GB • ${new Date().toLocaleTimeString()} • ⚡${benchScore()}</div>`:`<div style="font-weight:800">${os==='windows'?'🪟 Windows 12':'🐧 Ubuntu 24'} • ${bios.ram}GB • ⚡${benchScore()} • ${new Date().toLocaleTimeString()}</div>`;
  d.innerHTML=bar+`<div id="osWin"></div><div class="taskbar" id="osBar"></div>`;
  s.appendChild(d);
  ['Browser','Notes','Calculator','Terminal','Paint','Store'].forEach(a=>{
    const ic=document.createElement('div');ic.className='appicon';ic.textContent=a;
    ic.onclick=()=>openApp(os,a,d);d.querySelector('#osBar').appendChild(ic);
  });
}
function openApp(os,name,root){
  const w=root.querySelector('#osWin');w.innerHTML='';
  const box=document.createElement('div');box.className='window';
  const key=os+name;
  if(name==='Store'){
    box.innerHTML=`<b>📦 Store</b><div>${['Music','Files','Crypto'].map(a=>`<div>${installedApps[key+a]?'✅':'⬜'} ${a} <button class="btn small primary">${installedApps[key+a]?'Open':'Install $10'}</button></div>`).join('')}</div><button class="btn small">Close</button>`;
    box.querySelectorAll('.btn.primary').forEach((b,i)=>b.onclick=()=>{
      const a=['Music','Files','Crypto'][i];
      if(installedApps[key+a]){openApp(os,a,root);return;}
      installedApps[key+a]=true;toast(a+' installed 🎉');openApp(os,name,root);save();
    });
  }else if(name==='Calculator'){
    box.innerHTML=`<b>🧮 Calculator</b><br><input id="c1" type="number"> + <input id="c2" type="number"> <button class="btn small primary">=</button> <b id="cr"></b><br><br><button class="btn small">Close</button>`;
    box.querySelector('.btn.primary').onclick=()=>{box.querySelector('#cr').textContent='= '+((+box.querySelector('#c1').value)+(+box.querySelector('#c2').value));};
  }else if(name==='Notes'){box.innerHTML=`<b>📝 Notes</b><br><textarea style="width:100%;height:80px">Hello from ${os}!</textarea><br><button class="btn small">Close</button>`;}
  else if(name==='Terminal'){box.innerHTML=`<b>💻 Terminal</b><div style="background:#111;color:#0f0;padding:8px;border-radius:8px">lumi@${os}:~$ neofetch<br>OS:${os} RAM:${bios.ram}GB CPU:${pcBuild.CPU.name} SCORE:${benchScore()}</div><button class="btn small">Close</button>`;}
  else if(name==='Paint'){box.innerHTML=`<b>🎨 Paint</b><br><canvas id="pc2" width="260" height="120" style="border:2px solid #333;border-radius:8px;touch-action:none"></canvas><br><button class="btn small">Close</button>`;
    const cv=box.querySelector('#pc2'),cx=cv.getContext('2d');cx.lineWidth=3;let dr=false;
    cv.onpointerdown=()=>dr=true;cv.onpointerup=()=>dr=false;cv.onpointermove=e=>{if(!dr)return;const r=cv.getBoundingClientRect();cx.fillStyle='#2f7bff';cx.fillRect(e.clientX-r.left,e.clientY-r.top,5,5);};
  }else if(name==='Music'){box.innerHTML=`<b>🎵 Music</b><p>8-bit jingle:</p><button class="btn small primary">▶ Play</button> <button class="btn small">Close</button>`;
    box.querySelector('.btn.primary').onclick=()=>{try{const a=new (window.AudioContext||window.webkitAudioContext)();[440,554,659,880].forEach((f,i)=>{const o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.value=f;o.start(a.currentTime+i*.15);o.stop(a.currentTime+i*.15+.14);});}catch(e){toast('No audio');}};
  }else if(name==='Files'){box.innerHTML=`<b>📁 Files</b><p>📄 invoice.txt<br>📁 builds/ — score ${benchScore()}<br>📁 photos/</p><button class="btn small">Close</button>`;}
  else if(name==='Crypto'){box.innerHTML=`<b>📈 Crypto</b><p>LUMI: $${(Math.random()*10+2).toFixed(2)} ${(Math.random()>.5?'🟢':'🔴')}</p><button class="btn small">Close</button>`;}
  else{box.innerHTML=`<b>🌐 Browser</b><p>LumiPhones web on <b>${os}</b> ✅ ${bios.ram}GB</p><button class="btn small">Close</button>`;}
  box.querySelector('.btn.small:last-child').onclick=()=>w.innerHTML='';
  const c=box.querySelectorAll('.btn.small');if(c.length&&name==='Store')c[c.length-1].onclick=()=>w.innerHTML='';
  w.appendChild(box);
}
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
    $('#unitResult').innerHTML='<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">'+pendingLoot.map(l=>{const[rc,rl]=rarity(l);return `<div style="border:2px solid #dbe7ff;border-radius:12px;padding:6px;width:124px"><img src="${l.img||l.fb}" onerror="this.src='https://via.placeholder.com/100'" style="width:100%;height:80px;object-fit:cover;border-radius:8px"><div style="font-size:12px"><b>${l.name}</b><br><span class="rar ${rc}">${rl}</span><br>${money(l.fixed||l.price)}</div></div>`;}).join('')+'</div><p>Total <b>'+money(total)+'</b> vs paid '+money(u.price)+'</p>';
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
