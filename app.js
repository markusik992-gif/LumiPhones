// LumiPhones Simulator
let balance = 1500;
let cart = [];
let inventory = []; // {uid,kind,...}
let uidC = 1;
let shopCat = 'phones';
let pcSub = 'ALL';
let phoneOffers = [];
let activePhoneUid = null;
let pcBuild = {CPU:null,GPU:null,RAM:null,BOARD:null,SSD:null,PSU:null,CASE:null};
let usbInserted = null; // {os:'windows'|'linux'|'macos', name}
let bios = {tab:0,sel:0,ram:8};
let installedApps = {};

const $ = s=>document.querySelector(s);
const toast = m=>{const t=$('#toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800);};
const money = n=>'$'+Number(n).toLocaleString();

// ---------- DATA : real photos ----------
const PHONES=[
 {name:'iPhone 13',img:'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13.jpg',base:620},
 {name:'iPhone 14 Pro',img:'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-pro.jpg',base:850},
 {name:'Samsung Galaxy S23',img:'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-5g.jpg',base:640},
 {name:'Google Pixel 8',img:'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8.jpg',base:560},
 {name:'iPhone 12',img:'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12.jpg',base:430},
 {name:'Galaxy Z Flip 4',img:'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip4-5g.jpg',base:590},
 {name:'OnePlus 11',img:'https://fdn2.gsmarena.com/vv/bigpic/oneplus-11.jpg',base:520},
 {name:'Xiaomi 13',img:'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-13.jpg',base:480},
 {name:'Motorola Edge 40',img:'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-40.jpg',base:320},
 {name:'Nothing Phone (2)',img:'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-2.jpg',base:450},
];
const DAMAGES=[
 {id:'display',name:'Cracked Display',part:'Display'},
 {id:'battery',name:'Dead Battery',part:'Battery'},
 {id:'port',name:'Faulty Charging Port',part:'Charging Port'},
 {id:'back',name:'Broken Back Glass',part:'Back Glass'},
 {id:'camera',name:'Faulty Camera',part:'Camera Module'},
 {id:'speaker',name:'No Speaker Sound',part:'Speaker'},
 {id:'water',name:'Water Damage',part:'Logic Board Clean'},
 {id:'buttons',name:'Broken Buttons',part:'Button Flex'},
 {id:'board',name:'Faulty Motherboard',part:'Motherboard'},
 {id:'frame',name:'Scratched Frame',part:'Frame'},
 {id:'faceid',name:'Faulty FaceID Sensor',part:'FaceID Sensor'},
 {id:'swollen',name:'Swollen Battery',part:'Battery Pro'},
];
const PC_CATALOG=[
 {sub:'CPU',name:'Ryzen 5 5600',spec:'6c/12t 4.4GHz',price:130,img:'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400&q=80'},
 {sub:'CPU',name:'Intel i7-12700K',spec:'12c/20t 5.0GHz',price:280,img:'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&q=80'},
 {sub:'CPU',name:'Ryzen 7 7800X3D',spec:'8c/16t 5.0GHz',price:390,img:'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400&q=80'},
 {sub:'GPU',name:'RTX 3060 12GB',spec:'12GB GDDR6',price:290,img:'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&q=80'},
 {sub:'GPU',name:'RTX 4070 12GB',spec:'12GB DLSS3',price:590,img:'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&q=80'},
 {sub:'GPU',name:'RX 6600 8GB',spec:'8GB budget',price:190,img:'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&q=80'},
 {sub:'RAM',name:'Corsair 16GB DDR4',spec:'2x8GB 3200MHz =16GB',price:55,gb:16,img:'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400&q=80'},
 {sub:'RAM',name:'G.Skill 32GB DDR5',spec:'2x16GB 6000MHz =32GB',price:110,gb:32,img:'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400&q=80'},
 {sub:'RAM',name:'Kingston 8GB DDR4',spec:'1x8GB 3200MHz =8GB',price:28,gb:8,img:'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400&q=80'},
 {sub:'BOARD',name:'MSI B550 Tomahawk',spec:'AM4 ATX',price:140,img:'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80'},
 {sub:'BOARD',name:'ASUS Z790 Prime',spec:'LGA1700 ATX',price:220,img:'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80'},
 {sub:'SSD',name:'Samsung 970 1TB NVMe',spec:'1TB 3500MB/s',price:75,img:'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&q=80'},
 {sub:'SSD',name:'WD Black 2TB NVMe',spec:'2TB 7000MB/s',price:140,img:'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&q=80'},
 {sub:'PSU',name:'Corsair 650W Bronze',spec:'650W 80+ Bronze',price:70,img:'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&q=80'},
 {sub:'PSU',name:'Seasonic 850W Gold',spec:'850W 80+ Gold',price:130,img:'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&q=80'},
 {sub:'CASE',name:'NZXT H510 Glass',spec:'ATX Mid Tower',price:90,img:'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&q=80'},
 {sub:'CASE',name:'Lian Li O11 RGB',spec:'ATX Show Case',price:150,img:'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&q=80'},
 {sub:'OS',name:'Windows 11 USB',spec:'Windows 11 Pro installer',price:25,os:'windows',img:'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=400&q=80'},
 {sub:'OS',name:'Ubuntu 24.04 USB',spec:'Linux Ubuntu installer',price:15,os:'linux',img:'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=400&q=80'},
 {sub:'OS',name:'macOS Sonoma USB',spec:'macOS installer',price:25,os:'macos',img:'https://images.unsplash.com/photo-1618410320928-25228d811631?w=400&q=80'},
];
const UNITS=[
 {name:'Small Locker',price:200,img:'https://images.unsplash.com/photo-1590247813698-77379d6c9628?w=400&q=80',loot:2},
 {name:'Garage Unit',price:500,img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',loot:4},
 {name:'Warehouse Unit',price:950,img:'https://images.unsplash.com/photo-1553413077-190dd305871c?w=400&q=80',loot:6},
];

// ---------- SHOP GENERATION ----------
function genPhoneOffers(){
  phoneOffers=[];
  for(let i=0;i<6;i++){
    const p=PHONES[Math.floor(Math.random()*PHONES.length)];
    const nD=1+Math.floor(Math.random()*3);
    const dmg=[...DAMAGES].sort(()=>Math.random()-.5).slice(0,nD);
    const discount=dmg.length*0.22+Math.random()*0.1;
    const buy=Math.max(40,Math.round(p.base*(1-discount)));
    phoneOffers.push({...p,damages:dmg,buy,fixed:p.base+40,id:'offer'+i+Date.now()});
  }
  renderShop();
}
function renderBalance(){$('#balance').textContent=money(balance);}
function filteredPC(){
  const q=($('#search').value||'').toLowerCase();
  return PC_CATALOG.filter(p=>(pcSub==='ALL'||p.sub===pcSub)&&p.name.toLowerCase().includes(q));
}
function renderShop(){
  const list=$('#shopList');list.innerHTML='';
  $('#pcSubcats').style.display=shopCat==='pc'?'flex':'none';
  if(shopCat==='pc'){
    const subs=['ALL','CPU','GPU','RAM','BOARD','SSD','PSU','CASE','OS'];
    $('#pcSubcats').innerHTML=subs.map(s=>`<button class="chip ${pcSub===s?'active':''}" data-sub="${s}">${s}</button>`).join('');
    document.querySelectorAll('[data-sub]').forEach(b=>b.onclick=()=>{pcSub=b.dataset.sub;renderShop();});
  }
  if(shopCat==='phones'){
    phoneOffers.forEach((o,i)=>{
      const el=document.createElement('div');el.className='item-card';
      el.innerHTML=`<img src="${o.img}" onerror="this.src='https://via.placeholder.com/86?text=Phone'"><div class="info"><b>${o.name}</b> <span class="tag">used</span><div>${o.damages.map(d=>`<span class="dmg">⚠ ${d.name}</span>`).join('')}</div><div class="price">${money(o.buy)} <small style="color:#888">→ fixed ${money(o.fixed)}</small></div><div class="row"><button class="btn small primary">Buy now</button><button class="btn small">+ Cart</button></div></div>`;
      const [buy,cartB]=el.querySelectorAll('button');
      buy.onclick=()=>buyPhoneOffer(i,false);
      cartB.onclick=()=>buyPhoneOffer(i,true);
      list.appendChild(el);
    });
  }else if(shopCat==='pc'){
    filteredPC().forEach(p=>{
      const el=document.createElement('div');el.className='item-card';
      el.innerHTML=`<img src="${p.img}" loading="lazy" onerror="this.src='https://via.placeholder.com/86?text=PC'"><div class="info"><b>${p.name}</b> <span class="tag">${p.sub}</span><div class="muted">${p.spec}</div><div class="price">${money(p.price)}</div><div class="row"><button class="btn small primary">Buy now</button><button class="btn small">+ Cart</button></div></div>`;
      const [b,c]=el.querySelectorAll('button');
      b.onclick=()=>buyDirect({kind:p.sub==='OS'?'usb':'part',sub:p.sub,...p},p.price,false);
      c.onclick=()=>buyDirect({kind:p.sub==='OS'?'usb':'part',sub:p.sub,...p},p.price,true);
      list.appendChild(el);
    });
  }else{
    UNITS.forEach(u=>{
      const el=document.createElement('div');el.className='item-card';
      el.innerHTML=`<img src="${u.img}" onerror="this.src='https://via.placeholder.com/86?text=Unit'"><div class="info"><b>${u.name}</b> <span class="tag">mystery ${u.loot} items</span><div class="muted">Random loot — profit or loss?</div><div class="price">${money(u.price)}</div><div class="row"><button class="btn small primary">Buy now</button><button class="btn small">+ Cart</button></div></div>`;
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
  inventory.push({uid:uidC++,kind:'phone',...o,repairs:o.damages.map(d=>({...d,removed:false,fixed:false}))});
  phoneOffers.splice(i,1);renderBalance();renderShop();renderInv();
  toast('Phone bought! Check inventory 🎒');
}
function buyDirect(payload,price,toCart){
  if(toCart){cart.push({label:payload.name,price,payload});renderCart();toast('Added to cart 🛒');return;}
  if(balance<price){toast('Not enough money!');return;}
  balance-=price;giveItem(payload);renderBalance();renderInv();
}
function giveItem(p){
  if(p.kind==='phone')inventory.push({uid:uidC++,kind:'phone',...p,repairs:(p.damages||[]).map(d=>({...d,removed:false,fixed:false}))});
  else inventory.push({uid:uidC++,kind:p.kind,sub:p.sub,...p});
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
  balance-=t;cart.forEach(c=>giveItem(c.payload));cart=[];renderBalance();renderCart();renderInv();
  $('#cartDrawer').classList.remove('open');toast('Checkout complete! 🎉');
};
// ---------- INVENTORY ----------
function renderInv(){
  const box=$('#invList');box.innerHTML=inventory.length?'':'<div class="empty">Empty — buy something!</div>';
  inventory.forEach(it=>{
    const d=document.createElement('div');d.className='inv-item';d.draggable=true;
    const img=it.img||(it.kind==='unit'?'https://images.unsplash.com/photo-1590247813698-77379d6c9628?w=400&q=80':'https://via.placeholder.com/52');
    let sub=it.kind==='phone'?`${it.repairs.filter(r=>r.fixed).length}/${it.repairs.length} fixed`:it.kind==='usb'?('USB • '+it.os):(it.sub||it.kind);
    d.innerHTML=`<img src="${img}" onerror="this.src='https://via.placeholder.com/52?text=X'"><div style="flex:1"><b>${it.name}</b><div class="muted">${sub}</div></div><span>${it.kind==='phone'?money(it.fixed):money(it.price||it.buy||0)}</span>`;
    d.onclick=()=>loadToWorkshop(it);
    d.ondragstart=e=>e.dataTransfer.setData('text/plain',it.uid);
    box.appendChild(d);
  });
}
function loadToWorkshop(it){
  document.querySelectorAll('[data-wstab]').forEach(b=>b.classList.remove('active'));
  if(it.kind==='phone'){
    document.querySelector('[data-wstab="phone"]').classList.add('active');
    showWs('phone');activePhoneUid=it.uid;renderPhoneBench();
  }else if(it.kind==='part'||it.kind==='usb'){
    document.querySelector('[data-wstab="pc"]').classList.add('active');
    showWs('pc');installPart(it.uid);
  }else if(it.kind==='unit'){openUnit(it.uid);}
}
function showWs(which){
  $('#wsPhone').classList.toggle('hidden',which!=='phone');
  $('#wsPc').classList.toggle('hidden',which!=='pc');
  $('#wsScreen').classList.toggle('hidden',which!=='screen');
}
// ---------- PHONE REPAIR (drag off old, drag on new) ----------
function renderPhoneBench(){
  const it=inventory.find(x=>x.uid===activePhoneUid);
  if(!it){$('#phoneEmpty').classList.remove('hidden');$('#phoneBench').classList.add('hidden');return;}
  $('#phoneEmpty').classList.add('hidden');$('#phoneBench').classList.remove('hidden');
  $('#pbImg').src=it.img;$('#pbName').innerHTML=`<b>${it.name}</b>`;
  $('#pbBuy').textContent=money(it.buy);$('#pbFixed').textContent=money(it.fixed);
  $('#repairTitle').textContent='🔧 Repair: '+it.name;
  const slots=$('#repairSlots');slots.innerHTML='';
  it.repairs.forEach((r,idx)=>{
    const s=document.createElement('div');s.className='slot'+(r.fixed?' done':'');
    s.dataset.idx=idx;
    s.innerHTML=r.fixed?`✅ <b>${r.name}</b> — fixed!`:`🔴 <b>${r.name}</b> — needs <b>${r.part}</b><div class="part old" data-old="${idx}">♻️ ${r.part} (BROKEN — drag to 🗑️)</div><div class="muted slot-status">${r.removed?'Old removed ✔ — now drag the NEW part up':'Drag the red part to the bin first'}</div>`;
    slots.appendChild(s);
  });
  const np=$('#newParts');np.innerHTML='';
  it.repairs.forEach((r,idx)=>{
    if(r.fixed||!r.removed)return;
    const p=document.createElement('div');p.className='part new';p.dataset.new=idx;p.textContent='✨ New '+r.part;
    np.appendChild(p);
  });
  if(!np.children.length)np.innerHTML='<span class="muted">All new parts installed ✅</span>';
  bindDragParts();
}
let dragEl=null,dragData=null;
function bindDragParts(){
  document.querySelectorAll('.part').forEach(p=>{
    p.onpointerdown=e=>{
      e.preventDefault();
      dragEl=p;dragData={old:p.dataset.old,new:p.dataset.new};
      p.classList.add('drag');p.setPointerCapture(e.pointerId);
      const move=ev=>{p.style.position='fixed';p.style.left=(ev.clientX-60)+'px';p.style.top=(ev.clientY-20)+'px';p.style.zIndex=999;
        document.querySelectorAll('.slot,#trashBin').forEach(z=>z.classList.remove('over'));
        const t=document.elementFromPoint(ev.clientX,ev.clientY);
        const zone=t&&t.closest?t.closest('.slot,#trashBin'):null;
        if(zone)zone.classList.add('over');
      };
      const up=ev=>{
        p.classList.remove('drag');p.style.position='';p.style.left='';p.style.top='';
        const t=document.elementFromPoint(ev.clientX,ev.clientY);
        const trash=t&&t.closest?t.closest('#trashBin'):null;
        const slot=t&&t.closest?t.closest('.slot'):null;
        handleDrop(dragData,trash,slot);
        p.onpointermove=null;p.onpointerup=null;
      };
      p.onpointermove=move;p.onpointerup=up;
    };
  });
}
function handleDrop(data,trash,slot){
  const it=inventory.find(x=>x.uid===activePhoneUid);if(!it)return;
  if(data.old!==undefined&&trash){
    const r=it.repairs[+data.old];
    if(!r.removed){r.removed=true;toast('Old part removed! Now install new ✨');renderPhoneBench();}
    return;
  }
  if(data.new!==undefined&&slot){
    const idx=+slot.dataset.idx;
    if(+data.new!==idx){toast('Wrong slot! Match the part name ❌');return;}
    const r=it.repairs[idx];
    if(!r.removed){toast('Remove old part first!');return;}
    r.fixed=true;toast('Part installed! 🔧');renderPhoneBench();renderInv();checkPhoneDone(it);
    return;
  }
  if(data.new!==undefined&&!slot)toast('Drag the NEW part onto its phone slot 🎯');
  if(data.old!==undefined&&!trash)toast('Drag the BROKEN part to the 🗑️ bin');
}
function checkPhoneDone(it){
  if(it.repairs.every(r=>r.fixed))toast('Phone fully refurbished! Resell for '+money(it.fixed)+' 💰');
}
$('#resellPhoneBtn').onclick=()=>{
  const i=inventory.findIndex(x=>x.uid===activePhoneUid);if(i<0)return;
  const it=inventory[i];
  const val=it.repairs.every(r=>r.fixed)?it.fixed:Math.round(it.buy*0.6);
  balance+=val;inventory.splice(i,1);activePhoneUid=null;renderBalance();renderInv();renderPhoneBench();toast('Sold for '+money(val)+' 💰');
};
// ---------- PC BUILD ----------
const SLOTS=['CPU','GPU','RAM','BOARD','SSD','PSU','CASE'];
function renderPc(){
  const box=$('#pcSlots');box.innerHTML='';
  SLOTS.forEach(s=>{
    const v=pcBuild[s];
    const d=document.createElement('div');d.className='pc-slot'+(v?' filled':'');d.dataset.slot=s;
    d.innerHTML=v?`✅ <b>${s}</b><br>${v.name}`:`<b>${s}</b><br><small>empty — drag/tap part</small>`;
    d.ondragover=e=>{e.preventDefault();d.classList.add('over');};
    d.ondragleave=()=>d.classList.remove('over');
    d.ondrop=e=>{e.preventDefault();d.classList.remove('over');installPart(+e.dataTransfer.getData('text/plain'),s);};
    box.appendChild(d);
  });
  const val=Object.values(pcBuild).filter(Boolean).reduce((a,p)=>a+(p.price||0),0);
  $('#pcValue').textContent='Build value: '+money(val)+(usbInserted?' + USB:'+usbInserted.name:'');
  $('#usbSlot').textContent=usbInserted?('🔌 '+usbInserted.name+' ('+usbInserted.os+')'):'— drag OS flash drive here —';
}
function installPart(uid,forceSlot){
  const i=inventory.findIndex(x=>x.uid===uid);if(i<0)return;
  const it=inventory[i];
  if(it.kind==='usb'){usbInserted=it;inventory.splice(i,1);renderInv();renderPc();toast('USB plugged in 🔌');return;}
  if(it.kind!=='part'){toast('That is not a PC part');return;}
  const slot=forceSlot||it.sub;
  if(!SLOTS.includes(slot)){toast('Wrong slot');return;}
  if(pcBuild[slot]){inventory.push(pcBuild[slot]);}
  pcBuild[slot]=it;inventory.splice(i,1);renderInv();renderPc();toast(slot+' installed ✅');
}
$('#usbSlot').ondragover=e=>{e.preventDefault();$('#usbSlot').classList.add('over');};
$('#usbSlot').ondragleave=()=>$('#usbSlot').classList.remove('over');
$('#usbSlot').ondrop=e=>{e.preventDefault();$('#usbSlot').classList.remove('over');installPart(+e.dataTransfer.getData('text/plain'));};
$('#clearPcBtn').onclick=()=>{Object.keys(pcBuild).forEach(k=>{if(pcBuild[k]){inventory.push(pcBuild[k]);pcBuild[k]=null;}});if(usbInserted){inventory.push(usbInserted);usbInserted=null;}renderInv();renderPc();};
$('#sellPcBtn').onclick=()=>{
  const parts=Object.values(pcBuild).filter(Boolean);
  if(!parts.length){toast('Build is empty');return;}
  const base=parts.reduce((a,p)=>a+p.price,0);
  const v=base+80;balance+=v;Object.keys(pcBuild).forEach(k=>pcBuild[k]=null);
  renderBalance();renderPc();toast('PC sold for '+money(v)+' 💰');
};
$('#powerBtn').onclick=()=>{
  showWs('screen');
  document.querySelectorAll('[data-wstab]').forEach(b=>b.classList.toggle('active',b.dataset.wstab==='screen'));
  if(!pcBuild.BOARD||!pcBuild.CPU||!pcBuild.RAM||!pcBuild.PSU){biosScreen('NO BOOT: need BOARD+CPU+RAM+PSU ❌');return;}
  const maxGb=pcBuild.RAM.gb||16;
  bios={tab:0,sel:0,ram:Math.min(8,maxGb),max:maxGb};
  renderBios();
};
// ---------- BIOS ----------
const BTABS=['System','Boot','Memory','Exit'];
function biosScreen(msg){$('#screenLabel').textContent='DISPLAY — NO SIGNAL';$('#screen').className='screen off';$('#screen').innerHTML='<div class="screen-off-msg">'+msg+'</div>';}
function renderBios(){
  $('#screenLabel').textContent='DISPLAY — BIOS SETUP';
  const s=$('#screen');s.className='screen';s.innerHTML='';
  const b=document.createElement('div');b.className='bios';
  const drives=[usbInserted?('USB: '+usbInserted.name+' ['+usbInserted.os+']'):null,pcBuild.SSD?('SSD: '+pcBuild.SSD.name):null].filter(Boolean);
  let body='';
  if(bios.tab===0)body=`<p>LumiPhones BIOS v2.4 — Chill Edition</p><p>CPU: ${pcBuild.CPU.name}<br>Board: ${pcBuild.BOARD.name}<br>RAM installed: ${bios.max}GB<br>GPU: ${pcBuild.GPU?pcBuild.GPU.name:'—'}</p><p>Use ▲▼ + ENTER (buttons below work on touch)</p>`;
  if(bios.tab===1)body=`<p>Boot priority (ENTER to boot):</p>`+ (drives.length?drives.map((d,i)=>`<div class="${i===bios.sel?'sel':''}">${i===bios.sel?'▶ ':''}${d}</div>`).join(''):'<p>No bootable devices! Plug USB / install SSD.</p>');
  if(bios.tab===2)body=`<p>Allocate RAM (max ${bios.max}GB):</p><h2>◀ ${bios.ram} GB ▶</h2><p>ENTER = save</p>`;
  if(bios.tab===3)body=`<p>Save & Exit?</p><div class="${bios.sel===0?'sel':''}">▶ Save changes and reboot</div><div class="${bios.sel===1?'sel':''}">Discard and exit</div>`;
  b.innerHTML=`<div style="display:flex;gap:8px">${BTABS.map((t,i)=>`<span style="padding:4px 10px;${i===bios.tab?'background:#fff;color:#0b1e9e':''}">${t}</span>`).join('')}</div><hr>${body}<hr><small>←→ tabs • ▲▼ select • F: touch buttons below • Keyboard works too</small>`;
  s.appendChild(b);
}
function biosKey(k){
  if(!$('#wsScreen')||$('#wsScreen').classList.contains('hidden'))return;
  if(!pcBuild.CPU)return;
  if(k==='left')bios.tab=(bios.tab+3)%4,bios.sel=0;
  if(k==='right')bios.tab=(bios.tab+1)%4,bios.sel=0;
  if(k==='up')bios.sel=Math.max(0,bios.sel-1);
  if(k==='down')bios.sel++;
  if(k==='enter'){
    if(bios.tab===1)doBoot(bios.sel);
    if(bios.tab===2)toast('RAM set to '+bios.ram+'GB ✅');
    if(bios.tab===3&&bios.sel===0)doBoot(0);
    if(bios.tab===3){showWs('pc');return;}
  }
  if(bios.tab===2){if(k==='left')bios.ram=Math.max(2,bios.ram-2);if(k==='right')bios.ram=Math.min(bios.max,bios.ram+2);}
  renderBios();
}
document.querySelectorAll('[data-bioskey]').forEach(b=>b.onclick=()=>biosKey(b.dataset.bioskey));
document.addEventListener('keydown',e=>{
  if(e.key==='ArrowUp')biosKey('up');if(e.key==='ArrowDown')biosKey('down');
  if(e.key==='ArrowLeft')biosKey('left');if(e.key==='ArrowRight')biosKey('right');if(e.key==='Enter')biosKey('enter');
});
// ---------- BOOT + OS ----------
function doBoot(idx){
  const s=$('#screen');$('#screenLabel').textContent='DISPLAY — BOOTING';
  let target=null;
  if(usbInserted&&idx===0)target=usbInserted.os;
  else if(pcBuild.SSD&&((usbInserted&&idx===1)||(!usbInserted&&idx===0)))target=usbInserted?usbInserted.os:'windows';
  else if(!usbInserted&&pcBuild.SSD)target='windows';
  if(!usbInserted&&!pcBuild.SSD){biosScreen('No boot device ❌');return;}
  if(idx===0&&!usbInserted&&pcBuild.SSD)target='windows';
  if(usbInserted&&idx===0)target=usbInserted.os;
  const logs=['LumiPhones BIOS — checking RAM '+bios.ram+'GB OK','CPU '+pcBuild.CPU.name+' OK','Loading bootloader from '+(usbInserted&&idx===0?'USB':'SSD')+'...','Mounting filesystem...','Starting kernel...','Starting desktop environment...'];
  s.className='screen';s.innerHTML='';
  let i=0;
  const tick=()=>{if(i<logs.length){s.innerHTML+='<div>> '+logs[i++]+'</div>';setTimeout(tick,450);}else setTimeout(()=>renderOS(target||'windows'),600);};
  tick();
}
function renderOS(os){
  $('#screenLabel').textContent='DISPLAY — '+os.toUpperCase()+' ('+bios.ram+'GB RAM)';
  const s=$('#screen');s.className='screen';s.innerHTML='';
  const d=document.createElement('div');d.className='desktop '+(os==='windows'?'win':os==='linux'?'ubuntu':'mac');
  const bar=os==='mac'?`<div style="background:rgba(255,255,255,.9);color:#222;padding:6px;border-radius:8px">🍎 LumiOS — ${os} • ${bios.ram}GB RAM • ⏻</div>`:`<div style="font-weight:800">${os==='windows'?'🪟 Windows 12':'🐧 Ubuntu 24'} — ${bios.ram}GB RAM</div>`;
  d.innerHTML=bar+`<div id="osApps" style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap"></div><div id="osWin"></div><div class="taskbar" id="osBar"></div>`;
  s.appendChild(d);
  const apps=['Browser','Notes','Calculator','Terminal','Store'];
  const bar2=d.querySelector('#osBar');
  apps.forEach(a=>{
    const ic=document.createElement('div');ic.className='appicon';ic.textContent=a;
    ic.onclick=()=>openApp(os,a,d);bar2.appendChild(ic);
  });
  if(os==='windows')d.style.border='4px solid #0a3d7a';
}
function openApp(os,name,root){
  const w=root.querySelector('#osWin');w.innerHTML='';
  const box=document.createElement('div');box.className='window';
  const key=os+name;
  if(name==='Store'){
    box.innerHTML=`<b>📦 Store — install apps</b><div>${['Music','Paint','Files'].map(a=>`<div>${installedApps[key+a]?'✅ ':'⬜ '}${a} <button class="btn small primary">${installedApps[key+a]?'Open':'Install'}</button></div>`).join('')}</div><button class="btn small">Close</button>`;
    box.querySelectorAll('.btn.primary').forEach((b,i)=>b.onclick=()=>{installedApps[key+['Music','Paint','Files'][i]]=true;toast('Installed! 🎉');openApp(os,name,root);});
  }else if(name==='Calculator'){
    box.innerHTML=`<b>🧮 Calculator</b><br><input id="c1" type="number" placeholder="a"> + <input id="c2" type="number" placeholder="b"> <button class="btn small primary">=</button> <b id="cr"></b><br><br><button class="btn small">Close</button>`;
    box.querySelector('.btn.primary').onclick=()=>{box.querySelector('#cr').textContent='= '+((+box.querySelector('#c1').value)+(+box.querySelector('#c2').value));};
  }else if(name==='Notes'){
    box.innerHTML=`<b>📝 Notes</b><br><textarea style="width:100%;height:80px">Hello from ${os}!</textarea><br><button class="btn small">Close</button>`;
  }else if(name==='Terminal'){
    box.innerHTML=`<b>💻 Terminal (${os})</b><div style="background:#111;color:#0f0;padding:8px;border-radius:8px">lumi@${os}:~$ neofetch<br>OS: ${os} | RAM: ${bios.ram}GB | CPU: ${pcBuild.CPU.name}</div><button class="btn small">Close</button>`;
  }else{
    box.innerHTML=`<b>🌐 Browser</b><p>Welcome to LumiPhones web on <b>${os}</b>! All systems nominal ✅ (${bios.ram}GB RAM)</p><button class="btn small">Close</button>`;
  }
  box.querySelector('.btn.small:last-child').onclick=()=>w.innerHTML='';
  // close button for store extra
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
  const anim=$('#unitAnim');anim.style.animation='';anim.textContent='📦';
  pendingLoot=[];
  for(let k=0;k<u.loot;k++){
    if(Math.random()<0.5){const p=PHONES[Math.floor(Math.random()*PHONES.length)];pendingLoot.push({kind:'phone',name:p.name,img:p.img,buy:0,fixed:p.base,damages:[],repairs:[],price:p.base});}
    else{const p=PC_CATALOG[Math.floor(Math.random()*PC_CATALOG.length)];pendingLoot.push({kind:p.sub==='OS'?'usb':'part',sub:p.sub,...p});}
  }
  setTimeout(()=>{
    const total=pendingLoot.reduce((a,l)=>a+(l.fixed||l.price||0),0);
    const pl=total-u.price;
    $('#unitTitle').textContent=u.name+' — '+(pl>=0?('+$'+pl+' PROFIT ✅'):('−$'+Math.abs(pl)+' LOSS ❌'));
    $('#unitResult').innerHTML='<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">'+pendingLoot.map(l=>`<div style="border:2px solid #dbe7ff;border-radius:12px;padding:6px;width:120px"><img src="${l.img}" style="width:100%;height:80px;object-fit:cover;border-radius:8px"><div style="font-size:12px"><b>${l.name}</b><br>${money(l.fixed||l.price)}</div></div>`).join('')+'</div><p>Total loot: <b>'+money(total)+'</b> vs paid '+money(u.price)+'</p>';
    $('#claimLootBtn').classList.remove('hidden');anim.textContent='🎉';
  },1900);
}
$('#claimLootBtn').onclick=()=>{
  const i=inventory.findIndex(x=>x.uid===pendingUnitUid);if(i>=0)inventory.splice(i,1);
  pendingLoot.forEach(l=>inventory.push({uid:uidC++,...l}));
  $('#unitModal').classList.add('hidden');renderInv();toast('Loot claimed! 🎉');
};
$('#closeUnitBtn').onclick=()=>$('#unitModal').classList.add('hidden');
// ---------- NAV ----------
document.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{shopCat=b.dataset.cat;document.querySelectorAll('[data-cat]').forEach(x=>x.classList.toggle('active',x===b));renderShop();});
document.querySelectorAll('[data-wstab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-wstab]').forEach(x=>x.classList.remove('active'));b.classList.add('active');showWs(b.dataset.wstab);});
$('#refreshPhones').onclick=()=>{genPhoneOffers();toast('New offers generated 🎲');};
$('#search').oninput=()=>renderShop();
// init
genPhoneOffers();renderBalance();renderCart();renderInv();renderPc();
