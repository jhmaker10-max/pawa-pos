(()=>{
  'use strict';
  const config=window.PAWA_CONFIG||{};
  const posUrl=String(config.POS_URL||'').trim();
  const whatsapp=String(config.WHATSAPP||'51986109354').replace(/\D/g,'');
  const whatsappMessages={
    buy:'Hola, quiero solicitar la licencia de PAWA POS de S/ 10 mensuales. ¿Me indican los medios de pago, vigencia exacta, renovación, dispositivos incluidos y cómo se activa?' ,
    info:'Hola, quisiera información sobre PAWA POS.'
  };
  const mobileMenu=document.querySelector('.menu-toggle');
  const nav=document.getElementById('site-nav');
  const mobileShade=document.getElementById('mobile-nav-shade');
  const isMobile=()=>window.matchMedia('(max-width:690px)').matches;
  const closeMobileNav=()=>{
    nav?.classList.remove('open');
    mobileMenu?.setAttribute('aria-expanded','false');
    if(mobileMenu)mobileMenu.textContent='☰';
    if(mobileShade)mobileShade.hidden=true;
    document.body.classList.remove('mobile-menu-open');
  };
  mobileShade?.addEventListener('click',closeMobileNav);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMobileNav();});
  window.addEventListener('resize',()=>{if(!isMobile())closeMobileNav()});
    mobileMenu?.addEventListener('click',()=>{
    const expanded=mobileMenu.getAttribute('aria-expanded')==='true';
    mobileMenu.setAttribute('aria-expanded',String(!expanded));
    mobileMenu.textContent=expanded?'☰':'✕';
    nav?.classList.toggle('open',!expanded);
    if(mobileShade)mobileShade.hidden=expanded || !isMobile();
    document.body.classList.toggle('mobile-menu-open',!expanded && isMobile());
  });
  nav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
    nav.classList.remove('open');mobileMenu?.setAttribute('aria-expanded','false');
    if(mobileMenu)mobileMenu.textContent='☰';
    if(mobileShade)mobileShade.hidden=true;
    document.body.classList.remove('mobile-menu-open');
  }));
  document.querySelectorAll('[data-whatsapp]').forEach(a=>{
    const type=a.dataset.whatsapp==='info'?'info':'buy';
    a.href=`https://wa.me/${whatsapp}?text=${encodeURIComponent(whatsappMessages[type])}`;
    a.target='_blank';a.rel='noopener noreferrer';
  });
  const isValidPosUrl=(()=>{try { const u=new URL(posUrl); return u.protocol==='https:' && u.hostname.length>0; }catch{return false}})();
  document.querySelectorAll('[data-pos-link]').forEach(a=>{
    if(isValidPosUrl){a.href=posUrl;}
    else {
      a.href='#prueba';
      a.addEventListener('click',e=>{
        e.preventDefault();
        alert('Antes de publicar la página comercial, agrega la URL real del POS Clientes en el archivo config.js (campo POS_URL).');
      });
    }
  });
  // La instalación PWA debe iniciarse en el origen del POS, no en esta web comercial.
  // El botón abre la página de instalación del mismo repositorio del POS Clientes.
  const installUrl=String(config.INSTALL_URL||'').trim();
  const isValidInstallUrl=(()=>{
    try {
      const u=new URL(installUrl);
      return u.protocol==='https:' && u.hostname.length>0 &&
        (isValidPosUrl && u.origin===new URL(posUrl).origin && u.pathname.startsWith(new URL(posUrl).pathname));
    } catch {return false}
  })();
  document.querySelectorAll('[data-install-pos]').forEach(a=>{
    if(isValidInstallUrl){ a.href=installUrl; }
    else { a.href='#prueba';a.addEventListener('click',e=>{e.preventDefault();alert('Configura INSTALL_URL con la dirección de instalar.html del POS Clientes.');}); }
  });
  // Carrusel móvil de planes. Desplazamiento nativo con apoyo de flechas.
  const plans=document.getElementById('plans-carousel');
  const planCards=plans?[...plans.querySelectorAll('.plan')]:[];
  const prev=document.querySelector('[data-plan-prev]');
  const next=document.querySelector('[data-plan-next]');
  const counter=document.getElementById('plan-carousel-count');
  let activePlan=0;
  function nearestPlan(){if(!plans||!planCards.length)return 0;const left=plans.scrollLeft;let best=0,dist=Infinity;planCards.forEach((card,i)=>{const d=Math.abs(card.offsetLeft-planCards[0].offsetLeft-left);if(d<dist){dist=d;best=i}});return best}
  function updatePlans(){activePlan=nearestPlan();if(counter)counter.textContent=`${activePlan+1} / ${planCards.length}`;if(prev)prev.disabled=activePlan===0;if(next)next.disabled=activePlan===planCards.length-1}
  function goPlan(index){if(!plans||!planCards.length)return;const i=Math.max(0,Math.min(index,planCards.length-1));plans.scrollTo({left:planCards[i].offsetLeft-planCards[0].offsetLeft,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});activePlan=i;if(counter)counter.textContent=`${i+1} / ${planCards.length}`;if(prev)prev.disabled=i===0;if(next)next.disabled=i===planCards.length-1}
  prev?.addEventListener('click',()=>goPlan(activePlan-1));
  next?.addEventListener('click',()=>goPlan(activePlan+1));
  plans?.addEventListener('scroll',()=>window.requestAnimationFrame(updatePlans),{passive:true});
  window.addEventListener('resize',updatePlans);
  updatePlans();
  const status=document.getElementById('pos-config-status');
  if(status&&!isValidPosUrl)status.textContent='Pendiente: configura el enlace del POS en config.js antes de publicar.';
  const year=document.getElementById('year');if(year)year.textContent=String(new Date().getFullYear());
})();

// Interactive illustrative walkthrough. Does not connect to live POS data.
(()=>{'use strict';
 const states={
 ventas:{title:'Ventas y carrito',desc:'Selecciona productos y revisa el total antes de continuar.',items:[['Producto A','S/ 25.00'],['Producto B','S/ 15.00']],total:['Total ilustrativo','S/ 40.00']},
 inventario:{title:'Productos e inventario',desc:'Organiza los artículos que ofreces en tu tienda.',items:[['Producto A','Código 001'],['Producto B','Código 002']],total:['Catálogo ilustrativo','2 artículos']},
 escaner:{title:'Escáner',desc:'Busca productos por código cuando tu dispositivo sea compatible.',items:[['Código detectado','000001'],['Producto encontrado','Producto A']],total:['Estado ilustrativo','Encontrado']},
 boletas:{title:'Boletas internas',desc:'Revisa los datos del pedido y prepara una impresión o PDF.',items:[['Cliente','Ejemplo'],['2 productos','S/ 40.00']],total:['Total ilustrativo','S/ 40.00']}
 };
 const title=document.getElementById('demo-title'),desc=document.getElementById('demo-desc'),box=document.getElementById('demo-content');
 if(!title||!desc||!box)return;
 function view(key){const item=states[key];if(!item)return;title.textContent=item.title;desc.textContent=item.desc;box.replaceChildren();
  for(const pair of item.items){const row=document.createElement('div');row.className='demo-unit';const label=document.createElement('span');label.textContent=pair[0];const value=document.createElement('strong');value.textContent=pair[1];row.append(label,value);box.append(row)}
  const total=document.createElement('div');total.className='demo-total';const label=document.createElement('span');label.textContent=item.total[0];const value=document.createElement('strong');value.textContent=item.total[1];total.append(label,value);box.append(total);
  document.querySelectorAll('[data-demo]').forEach(b=>{const active=b.dataset.demo===key;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
 }
 document.querySelectorAll('[data-demo]').forEach(b=>b.addEventListener('click',()=>view(b.dataset.demo)));
})();
