(()=>{'use strict';
const $=id=>document.getElementById(id);
const panel=$('pawa-tour');if(!panel)return;
const steps=[
 {title:'Elige un producto',text:'Pulsa «Agregar al carrito» debajo de un producto.',target:'#demo-products [data-add]:not([disabled])',tab:'tienda',event:'add',origin:'tienda'},
 {title:'Abre tu carrito',text:'Ahora pulsa «Mi carrito» para revisar lo que agregaste.',target:'#demo-open-cart',tab:'tienda',event:'cart-open'},
 {title:'Cambia una cantidad',text:'Pulsa ＋ para aumentar la cantidad del producto que elegiste.',target:'#demo-cart-items [data-change="1"]',tab:'tienda',drawer:true,event:'quantity'},
 {title:'Pasa al escáner',text:'Pulsa «IR AL ESCÁNER» desde el carrito.',target:'#demo-cart-scanner',tab:'tienda',drawer:true,event:'tab',eventTab:'escaner'},
 {title:'Selecciona un código de ejemplo',text:'Pulsa «1002 · Leche» para completar el código automáticamente. No se utiliza cámara.',target:'[data-fill-code="1002"]',tab:'escaner',event:'code-filled'},
 {title:'Añade el producto escaneado',text:'Ahora pulsa «Añadir» para sumar la leche al carrito.',target:'#demo-add-scanned',tab:'escaner',event:'add',origin:'escaner'},
 {title:'Abre el cobro',text:'Pulsa «Cobrar y generar boleta» para abrir el formulario.',target:'#demo-scan-checkout',tab:'escaner',event:'checkout-open'},
 {title:'Ingresa el nombre del cliente',text:'Escribe un nombre ficticio de al menos dos letras. No ingreses datos personales reales.',target:'#demo-checkout-form [name="client"]',tab:'checkout',event:'client-entered'},
 {title:'Registra la venta de prueba',text:'Comprueba el total y pulsa «Cobrar y generar boleta». Puedes elegir Yape, Plin, efectivo o transferencia.',target:'#demo-checkout-form button[type="submit"]',tab:'checkout',event:'sale-complete'},
 {title:'Revisa la boleta y las ventas',text:'Mira tu boleta de demostración. Luego pulsa el botón resaltado «Ver ventas» para consultar el historial.',target:'#tour-go-sales',tab:'boleta',event:'tab',eventTab:'ventas'}
];
const counter=$('tour-counter'),percent=$('tour-percent'),bar=$('tour-progress'),title=$('tour-title'),copy=$('tour-text'),feedback=$('tour-feedback');
const startBtn=$('tour-start'),prevBtn=$('tour-prev'),exitBtn=$('tour-exit'),restartBtn=$('tour-restart');
let active=false,position=0,highest=0,highlighted=null,silent=false;
const salesButton=document.createElement('button');salesButton.id='tour-go-sales';salesButton.type='button';salesButton.className='tour-view-sales';salesButton.textContent='Ver ventas →';salesButton.hidden=true;
$('demo-receipt').insertAdjacentElement('afterend',salesButton);
salesButton.addEventListener('click',()=>document.querySelector('[data-demo-tab="ventas"]').click());
function clearMark(){if(highlighted){highlighted.classList.remove('tour-target');highlighted.removeAttribute('data-tour-instruction');highlighted=null}}
function mark(){clearMark();if(!active||position>=steps.length)return;const t=document.querySelector(steps[position].target);if(!t||t.disabled||t.closest('[hidden]'))return;t.classList.add('tour-target');t.setAttribute('data-tour-instruction','Paso '+(position+1));highlighted=t;}
function available(){if(position===0)return true;return position<=highest}
function update(message=''){
 const done=position>=steps.length;const st=steps[position];clearMark();
 counter.textContent=done?'Tutorial terminado':`Paso ${position+1} de ${steps.length}`;
 const progress=done?100:Math.round(position/steps.length*100);percent.textContent=progress+'%';bar.style.width=progress+'%';
 title.textContent=done?'¡Terminaste la demostración!':st.title;
 copy.textContent=done?'Completaste una venta ficticia: productos, carrito, escáner, cobro, boleta e historial. Puedes repetir la guía o explorar libremente.':st.text;
 feedback.textContent=message;
 startBtn.hidden=true;prevBtn.hidden=done||position===0;exitBtn.hidden=done;restartBtn.hidden=!done;
 panel.classList.toggle('tour-running',!done);salesButton.hidden=done||!active||position!==9;
 if(done){active=false;return}
 mark();
 // Cuando se vuelve a una acción ya realizada, se puede continuar sin repetir la venta.
 let next=$('tour-next');if(next)next.hidden=!(position<highest);
}
const nextBtn=document.createElement('button');nextBtn.type='button';nextBtn.id='tour-next';nextBtn.className='tour-alt';nextBtn.textContent='Continuar →';nextBtn.hidden=true;exitBtn.before(nextBtn);
function activateView(){if(!active)return;
 const st=steps[position];silent=true;
 try{
  // El cambio de pantalla solo se hace para pasos ya completados o estados que se deben restaurar.
  const current=document.querySelector('.demo-panel:not([hidden])');const requested=$('demo-'+st.tab);
  if(requested&&current!==requested){
    if(st.tab==='checkout'&&!highestReached(7)){return}
    if(st.tab==='boleta'&&!highestReached(9)){return}
    const b=document.querySelector(`[data-demo-tab="${st.tab}"]`);
    if(b)b.click();else if(current?.id!=='demo-'+st.tab){
      document.querySelectorAll('.demo-panel').forEach(x=>x.hidden=x!==requested);
    }
  }
  const drawer=$('demo-cart-drawer');
  if(st.drawer&&drawer.hidden){$('demo-open-cart').click()}
  if(!st.drawer&&!drawer.hidden){$('demo-close-cart').click()}
 }finally{silent=false}
 requestAnimationFrame(()=>{mark();let target=document.querySelector(st.target);if(target&&!target.closest('[hidden]'))target.scrollIntoView({block:'center',behavior:'instant'});});
}
function highestReached(n){return highest>=n}
function go(i,msg){position=i;update(msg);if(active)activateView()}
function start(){active=false;silent=true;$('demo-reset').click();silent=false;active=true;highest=0;go(0,'Sigue el control marcado con un borde turquesa.');}
function quit(){active=false;clearMark();panel.classList.remove('tour-running');salesButton.hidden=true;startBtn.hidden=false;startBtn.textContent='Iniciar tutorial guiado →';prevBtn.hidden=true;nextBtn.hidden=true;exitBtn.hidden=true;restartBtn.hidden=true;title.textContent='Haz tu primera venta paso a paso';copy.textContent='Pulsa «Iniciar tutorial» y te mostraremos qué hacer en cada pantalla.';counter.textContent='Tutorial disponible';percent.textContent='';bar.style.width='0%';feedback.textContent='';}
function finishStep(){if(!active)return;highest=Math.max(highest,position+1);go(position+1,'Correcto. Continúa con el control resaltado.');}
function back(){if(active&&position>0)go(position-1,'Paso anterior. Si ya completaste esta acción, pulsa «Continuar».')}
startBtn.addEventListener('click',start);restartBtn.addEventListener('click',start);exitBtn.addEventListener('click',quit);prevBtn.addEventListener('click',back);
nextBtn.addEventListener('click',()=>{if(active&&position<highest)go(position+1,'Continúa desde aquí.')});
document.querySelector('#demo-checkout-form [name="client"]').addEventListener('input',e=>{if(active&&!silent&&position===7&&e.target.value.trim().length>=2)finishStep()});
document.addEventListener('pawa-demo-action',e=>{
 const v=e.detail||{};if(silent)return;if(v.type==='reset'){if(active)quit();return}
 if(!active||position>=steps.length)return;
 const st=steps[position];if(v.type!==st.event)return;
 if(st.event==='tab'&&v.tab!==st.eventTab)return;
 if(st.event==='add'&&v.tab!==st.origin)return;
 if(st.event==='quantity'&&v.delta!==1)return;
 if(st.event==='code-filled'&&v.code&&v.code!=='1002')return;
 finishStep();
});
// Cuando el DOM vuelve a dibujarse, se identifica el nuevo botón sin avanzar automáticamente.
const observer=new MutationObserver(()=>{if(active)mark()});observer.observe($('demo-body')||document.querySelector('.demo-body'),{childList:true,subtree:true});
})();
