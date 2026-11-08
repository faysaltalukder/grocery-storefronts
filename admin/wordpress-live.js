(() => {
"use strict";
const $=id=>document.getElementById(id),esc=v=>String(v??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const categoryNames={"hospital-healthcare":"Hospital & Healthcare","real-estate-property":"Real Estate & Property","medicine-pharmacy":"Medicine & Pharmacy","ecommerce-grocery":"E-commerce & Grocery","clothing-fashion":"Clothing & Fashion"};
let websites=[];
function status(message,kind="info"){$("wpLiveStatus").textContent=message;$("wpLiveStatus").dataset.state=kind;}
function liveUrl(site){return "../storefront.html?site="+encodeURIComponent(site.slug)+"&preview=1";}
function render(){
 const filter=$("wpLiveCategoryFilter").value,rows=websites.filter(w=>!filter||w.category_slug===filter);
 const published=websites.filter(w=>w.status==="published").length,drafts=websites.filter(w=>w.status!=="published").length,showcases=websites.filter(w=>w.settings?.showcase_mode===true).length;
 $("wpLivePublishedCount").textContent=published;$("wpLiveDraftCount").textContent=drafts;$("wpLiveShowcaseCount").textContent=showcases;
 $("wpLiveSitesGrid").innerHTML=rows.length?rows.map(w=>{
  const isLive=w.status==="published",showcase=w.settings?.showcase_mode===true;
  const badge=isLive?'<span class="hf-live-site-badge is-live">LIVE</span>':'<span class="hf-live-site-badge is-draft">DRAFT</span>';
  const publicLink=isLive?'<a class="hf-live-site-action primary" href="'+liveUrl(w)+'" target="_blank" rel="noopener">Open live website ↗</a>':'<a class="hf-live-site-action" href="'+liveUrl(w)+'" target="_blank" rel="noopener">Open private preview ↗</a>';
  return '<article class="hf-live-site-card"><div class="hf-live-site-card-top"><span class="hf-live-site-category">'+esc(categoryNames[w.category_slug]||w.category_slug)+'</span>'+badge+'</div><h2>'+esc(w.name)+'</h2><p class="hf-live-site-template">'+esc(w.template_key)+'</p><div class="hf-live-site-meta"><span>'+(showcase?'Public sample showcase':'Merchant website')+'</span><span>'+esc(w.status)+'</span></div><div class="hf-live-site-url">'+esc(location.origin+"/storefront.html?site="+w.slug)+'</div><div class="hf-live-site-actions">'+publicLink+'<a class="hf-live-site-action" href="./website-builder.html?template='+encodeURIComponent(w.template_key)+'">Edit Website</a><a class="hf-live-site-action" href="./website-pages.html?template='+encodeURIComponent(w.template_key)+'">Manage Pages</a><a class="hf-live-site-action" href="./website-catalog.html?template='+encodeURIComponent(w.template_key)+'">Products &amp; Categories</a></div>'+(showcase?'<p class="hf-live-site-note">Sample content only · checkout and enquiries disabled</p>':"")+'</article>';
 }).join(""):'<article class="hf-live-sites-empty">No websites match this category yet.</article>';
}
async function load(){
 const api=window.WPNeonBuilderApi;if(!api)throw new Error("Neon website API did not load.");
 websites=await api.loadOwnerWebsites();if(!Array.isArray(websites))websites=[];
 render();status(websites.length+" websites loaded from Neon · "+websites.filter(w=>w.status==="published").length+" publicly published","success");
}
function wait(){const ready=window.WPAuthReady;if(!ready||typeof ready.then!=="function"){status("Secure admin session is unavailable.","error");return;}ready.then(async session=>{if(!session?.user?.id){status("Admin access required.","error");return;}try{await load();}catch(e){console.error(e);status(e.message||"Could not load live websites.","error");$("wpLiveSitesGrid").innerHTML='<article class="hf-live-sites-empty">Website register could not be loaded. '+esc(e.message||"Check the Neon connection.")+'</article>';}}).catch(e=>status(e.message||"Secure admin initialization failed.","error"));}
$("wpLiveRefresh")?.addEventListener("click",async()=>{const b=$("wpLiveRefresh");b.disabled=true;try{await load();}catch(e){status(e.message||"Refresh failed.","error");}finally{b.disabled=false;}});
$("wpLiveCategoryFilter")?.addEventListener("change",render);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",wait,{once:true});else wait();
})();