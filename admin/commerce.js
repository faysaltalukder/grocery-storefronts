(() => {
"use strict";
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const api=()=>window.WPNeonBuilderApi;
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money=v=>"৳"+Number(v||0).toLocaleString("en-BD",{maximumFractionDigits:2});
const date=v=>v?new Date(v).toLocaleString("en-BD",{dateStyle:"medium",timeStyle:"short"}):"—";
const dateOnly=v=>v?new Date(v).toLocaleDateString("en-BD"):"—";
const csvCell=v=>'"'+String(v??"").replaceAll('"','""')+'"';
function parseCSV(text){
 const source=String(text||"").replace(/^\uFEFF/,""),rows=[];
 let row=[],cell="",quoted=false;
 for(let i=0;i<source.length;i++){
  const ch=source[i];
  if(quoted){
   if(ch==='"'&&source[i+1]==='"'){cell+='"';i++;}
   else if(ch==='"')quoted=false;
   else cell+=ch;
  }else if(ch==='"'&&cell==="")quoted=true;
  else if(ch===","){row.push(cell);cell="";}
  else if(ch==="\n"){row.push(cell);rows.push(row);row=[];cell="";}
  else if(ch!=="\r")cell+=ch;
 }
 if(cell.length||row.length){row.push(cell);rows.push(row);}
 if(!rows.length)return [];
 const headers=rows.shift().map(h=>h.trim().toLowerCase().replace(/[^a-z0-9]+/g,"_"));
 return rows.filter(r=>r.some(v=>String(v||"").trim())).map(r=>Object.fromEntries(headers.map((h,i)=>[h,String(r[i]??"").trim()])));
}
function downloadCSVFile(filename,content){
 const blob=new Blob(["\uFEFF"+content],{type:"text/csv;charset=utf-8"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
let state={data:null,tab:"overview",store:"all",search:"",editingProduct:null,selectedOrder:null,selectedPO:null};

function notice(message,type="info"){
 const el=$("#ocNotice");if(!el)return;
 el.textContent=message;el.className="oc-notice is-visible"+(type==="success"?" success":type==="error"?" error":"");
 if(type!=="error")setTimeout(()=>{if(el.textContent===message)el.className="oc-notice";},5000);
}
function status(message){const el=$("#ocConnection");if(el)el.textContent=message;}
function formObj(form){return Object.fromEntries(new FormData(form).entries());}
function site(id){return (state.data?.websites||[]).find(x=>x.id===id)||null;}
function siteName(id){return site(id)?.brand?.name||site(id)?.name||"Unknown business";}
function categoryLabel(slug){
 const labels={"ecommerce-grocery":"E-commerce & Grocery","clothing-fashion":"Clothing & Fashion","medicine-pharmacy":"Medicine & Pharmacy","hospital-healthcare":"Hospital & Healthcare","real-estate-property":"Real Estate & Property","restaurant-food":"Restaurant & Food","education-training":"Education & Training","travel-tourism":"Travel & Tourism","hotel-accommodation":"Hotel & Accommodation","beauty-salon":"Beauty & Salon","fitness-gym":"Fitness & Gym","automotive-services":"Automotive & Vehicle Services","professional-services":"Professional & Business Services","construction-interior":"Construction & Interior","events-weddings":"Event & Wedding Services","portfolio-agency":"Portfolio & Creative Agency","news-media":"News & Media","nonprofit-organization":"Nonprofit & Organization","logistics-delivery":"Logistics & Delivery","legal-accounting":"Legal & Accounting"};
 const value=String(slug||"other");
 return labels[value]||value.split(/[-_]/).map(x=>x?x[0].toUpperCase()+x.slice(1):"").join(" ");
}
function chosenSites(){
 const rows=state.data?.websites||[];
 if(state.store==="all")return rows;
 if(state.store.startsWith("category:")){const category=state.store.slice(9);return rows.filter(x=>(x.category_slug||"other")===category);}
 return rows.filter(x=>x.id===state.store);
}
function scoped(rows){
 if(state.store==="all")return rows||[];
 const ids=new Set(chosenSites().map(x=>x.id));
 return (rows||[]).filter(x=>!x.website_id||ids.has(x.website_id));
}
function siteSelect(name="website_id",selected=""){
 const rows=state.data?.websites||[];
 return '<select class="oc-select" name="'+name+'" required>'+rows.map(w=>'<option value="'+w.id+'" '+(w.id===selected?"selected":"")+'>'+esc(w.brand?.name||w.name)+' · '+esc(w.template_key)+'</option>').join("")+'</select>';
}
function badge(value){
 const s=String(value||"").toLowerCase(),kind=["paid","delivered","received","active","published","approved","refunded"].includes(s)?"good":["pending","ordered","partially_received","requested","processing","unpaid","draft"].includes(s)?"warn":["cancelled","rejected","blocked","failed","inactive"].includes(s)?"bad":"info";
 return '<span class="oc-badge '+kind+'">'+esc(String(value||"—").replaceAll("_"," "))+'</span>';
}
function btn(label,action,id,kind=""){
 return '<button type="button" class="oc-mini '+kind+'" data-action="'+action+'" data-id="'+esc(id)+'">'+label+'</button>';
}
function pageHead(kicker,title,desc,actions=""){
 return '<div class="oc-page-head"><div><span class="oc-kicker">'+kicker+'</span><h2>'+title+'</h2><p>'+desc+'</p></div>'+actions+'</div>';
}
function panel(title,body,sub=""){
 return '<section class="oc-panel"><div class="oc-panel-head"><div><h3>'+title+'</h3>'+(sub?'<p>'+sub+'</p>':"")+'</div></div>'+body+'</section>';
}
function stats(items){
 return '<div class="oc-stats">'+items.map(x=>'<div class="oc-stat"><small>'+x[0]+'</small><strong class="'+(x[3]||"")+'">'+x[1]+'</strong><span>'+x[2]+'</span></div>').join("")+'</div>';
}
function table(headers,rows,min=700){
 if(!rows.length)return '<div class="oc-empty">No records found in this view.</div>';
 return '<div class="oc-table-wrap"><table class="oc-table" style="min-width:'+min+'px"><thead><tr>'+headers.map(h=>'<th>'+h+'</th>').join("")+'</tr></thead><tbody>'+rows.join("")+'</tbody></table></div>';
}
function lowStockProducts(){
 return scoped(state.data.products).filter(p=>p.is_active&&Number(p.stock)<=Number(p.attributes?.low_stock_threshold||10)).sort((a,b)=>Number(a.stock)-Number(b.stock));
}
function collectedForOrder(orderId){
 return (state.data.payments||[]).filter(p=>p.order_id===orderId&&p.transaction_type==="collection"&&p.status==="confirmed").reduce((n,p)=>n+Number(p.amount||0),0);
}
function supplierPaid(poId){
 return (state.data.supplierPayments||[]).filter(p=>p.purchase_order_id===poId).reduce((n,p)=>n+Number(p.amount||0),0);
}
function orderItems(orderId){return (state.data.orderItems||[]).filter(i=>i.order_id===orderId);}
function productsForSite(siteId){return (state.data.products||[]).filter(p=>p.website_id===siteId);}
function categoriesForSite(siteId){return (state.data.categories||[]).filter(c=>c.website_id===siteId&&c.is_active);}
function suppliersForSite(siteId){return (state.data.suppliers||[]).filter(s=>s.is_active&&(!s.website_id||s.website_id===siteId));}
function selectedCategorySlug(){
 if(state.store==="all")return null;
 const rows=chosenSites();
 if(state.store.startsWith("category:"))return state.store.slice(9);
 if(rows.length&&rows.every(w=>(w.category_slug||"other")===(rows[0].category_slug||"other")))return rows[0].category_slug||"other";
 return null;
}
function render(){
 const category=selectedCategorySlug(),isGrocery=category==="ecommerce-grocery";
 const nav=$("#ocNav");
 $$("#ocNav button").forEach(b=>{
  const visible=b.dataset.common==="true"||(b.dataset.business==="commerce"&&isGrocery)||(b.dataset.category==="true"&&!!category&&!isGrocery);
  b.hidden=!visible;
  b.classList.toggle("is-active",b.dataset.tab===state.tab);
 });
 if(!isGrocery&&!["overview","websites","category-workspace"].includes(state.tab))state.tab="overview";
 const filter=$("#ocStoreFilter");if(filter&&filter.value!==state.store)filter.value=state.store;
 const pages={overview:overviewPage,websites:websitesPage,"category-workspace":categoryWorkspacePage,products:productsPage,orders:ordersPage,customers:customersPage,suppliers:suppliersPage,purchasing:purchasingPage,delivery:deliveryPage,finance:financePage,returns:returnsPage,wholesale:wholesalePage,quotes:quotesPage,reports:reportsPage};
 $("#ocMain").innerHTML=(pages[state.tab]||overviewPage)();
 bindPage();
}
function businessWebsiteCard(w){
 const cat=categoryLabel(w.category_slug),template=esc(w.template_key||"Template not assigned"),name=esc(w.brand?.name||w.name),slug=esc(w.slug||"—");
 const selected=state.store===w.id;
 return '<article class="oc-business-card"><div class="oc-business-card-top"><div class="oc-business-mark">'+esc((w.brand?.name||w.name||"B").trim().slice(0,1).toUpperCase())+'</div><div class="oc-business-identity"><strong>'+name+'</strong><span>'+esc(cat)+'</span></div><div class="oc-business-status">'+badge(w.status)+'</div></div><div class="oc-business-meta"><span><small>WEBSITE SLUG</small><strong>'+slug+'</strong></span><span><small>ACTIVE TEMPLATE</small><strong>'+template+'</strong></span></div><div class="oc-business-actions"><button class="oc-btn secondary" type="button" data-action="select-business" data-id="'+esc(w.id)+'">'+(selected?"Selected":"Open business scope")+'</button></div></article>';
}
function websitesPage(){
 const all=state.data.websites||[],sites=chosenSites(),groups={};
 sites.forEach(w=>{const key=w.category_slug||"other";(groups[key]||(groups[key]=[])).push(w);});
 const sections=Object.entries(groups).sort((a,b)=>categoryLabel(a[0]).localeCompare(categoryLabel(b[0]))).map(([slug,rows])=>panel(categoryLabel(slug)+' <span class="oc-count">'+rows.length+'</span>','<div class="oc-business-grid">'+rows.map(businessWebsiteCard).join("")+'</div>')).join("");
 return pageHead("WEBSITE PORTFOLIO","Connected websites","Every website registered to this owner account is managed from this portfolio. Select a business to open its operational workspace.",'<a class="oc-btn primary" href="./wordpress-templates.html">Explore templates ↗</a>')+
 stats([["Websites in scope",String(sites.length),"Registered in the central platform"],["Business categories",String(new Set(sites.map(w=>w.category_slug||"other")).size),"Across the selected scope"],["Published websites",String(sites.filter(w=>w.status==="published").length),"Live publishing status"],["Draft / attention",String(sites.filter(w=>w.status!=="published").length),"Review configuration and publishing",sites.some(w=>w.status!=="published")?"warning":""]])+
 (sections||'<div class="oc-empty">No websites are connected to this scope yet. Create a website from the template library and it will appear here after registration.</div>');
}
function categoryWorkspacePage(){
 const category=selectedCategorySlug(),sites=chosenSites(),label=categoryLabel(category);
 const modules=category==="restaurant-food"?[["Menu & catalogue","Menu items, modifiers and availability"],["Reservations","Table bookings, seating and service slots"],["Orders & fulfilment","Dine-in, pickup and delivery workflows"]]:
 category==="hotel-accommodation"?[["Rooms & availability","Room inventory, rates and occupancy"],["Reservations","Guest bookings, check-in and check-out"],["Guest operations","Guest profiles and service requests"]]:
 category==="real-estate-property"?[["Property portfolio","Listings, pricing and availability"],["Enquiries & leads","Buyer, renter and seller enquiries"],["Viewing schedule","Appointments and agent assignments"]]:
 category==="hospital-healthcare"||category==="medicine-pharmacy"?[["Service catalogue","Services, departments or pharmacy catalogue"],["Appointments & requests","Patient-facing requests and scheduling"],["Compliance controls","Role-based access and audit records"]]:
 [["Business catalogue","Category-specific services, products or content"],["Customer relationships","Leads, enquiries and customer records"],["Business analytics","Category-specific performance and reports"]];
 return pageHead("CATEGORY WORKSPACE",label+" workspace","A dedicated operating area for the selected business category. Shared website controls are available now; category-specific workflows can be activated as this business type is implemented.")+
 '<div class="oc-category-intro"><span class="oc-category-orbit">◈</span><div><strong>'+esc(label)+'</strong><p>'+sites.length+' connected website'+(sites.length===1?"":"s")+' in this category. This workspace is designed to keep this business type separate from unrelated store operations.</p></div></div>'+
 '<div class="oc-module-grid">'+modules.map((m,i)=>'<article class="oc-module-card"><span class="oc-module-index">0'+(i+1)+'</span><h3>'+esc(m[0])+'</h3><p>'+esc(m[1])+'</p><span class="oc-module-state">CATEGORY WORKFLOW · NOT YET CONFIGURED</span></article>').join("")+'</div>'+
 panel("Connected websites",'<div class="oc-business-grid">'+sites.map(businessWebsiteCard).join("")+'</div>')+
 '<p class="oc-help">No live category-specific records or actions are claimed here until the corresponding Neon data model and workflows are connected and verified.</p>';
}
function overviewPage(){
 const allSites=state.data.websites||[],sites=chosenSites(),allCategories=[...new Set(allSites.map(w=>w.category_slug||"other"))];
 const published=sites.filter(w=>w.status==="published").length,attention=sites.length-published;
 const categoryCounts={};sites.forEach(w=>{const key=w.category_slug||"other";categoryCounts[key]=(categoryCounts[key]||0)+1;});
 const categoryCards=Object.entries(categoryCounts).sort((a,b)=>categoryLabel(a[0]).localeCompare(categoryLabel(b[0]))).map(([slug,count])=>'<button class="oc-category-card" type="button" data-action="select-scope" data-id="category:'+esc(slug)+'"><span class="oc-category-icon">◈</span><span><strong>'+esc(categoryLabel(slug))+'</strong><small>'+count+' connected website'+(count===1?"":"s")+'</small></span><span class="oc-category-arrow">→</span></button>').join("");
 const websiteCards=sites.slice(0,8).map(businessWebsiteCard).join("");
 const category=selectedCategorySlug(),isGrocery=category==="ecommerce-grocery";
 let operationalSummary="";
 if(isGrocery){
  const orders=scoped(state.data.orders),products=scoped(state.data.products),finance=scoped(state.data.finance),activeOrders=orders.filter(o=>o.status!=="cancelled");
  const collected=scoped(state.data.payments).filter(p=>p.transaction_type==="collection"&&p.status==="confirmed").reduce((n,p)=>n+Number(p.amount||0),0),openQuotes=scoped(state.data.quoteRequests||[]).filter(q=>["requested","reviewing"].includes(q.status)).length;
  const expenses=finance.filter(f=>f.entry_type==="expense").reduce((n,f)=>n+Number(f.amount||0),0),low=lowStockProducts();
  const recent=orders.slice(0,6).map(o=>'<tr><td><strong>'+esc(o.order_number)+'</strong><small>'+date(o.created_at)+'</small></td><td>'+esc(siteName(o.website_id))+'</td><td>'+esc(o.customer?.name||"Customer")+'</td><td class="oc-num">'+money(o.total)+'</td><td>'+badge(o.status)+'</td></tr>');
  operationalSummary=stats([["Order value",money(activeOrders.reduce((n,o)=>n+Number(o.total||0),0)),activeOrders.length+" active orders"],["Payments collected",money(collected),"Confirmed collections"],["Operating expenses",money(expenses),"Recorded expenses"],["Low-stock products",String(low.length),"Configured stock alerts",low.length?"warning":""],["Open quote requests",String(openQuotes),"Wholesale enquiries awaiting action",openQuotes?"warning":""]])+'<div class="oc-grid-2"><div>'+panel("Recent orders",table(["Order","Website","Customer","Total","Status"],recent))+'</div><div>'+panel("Grocery operations",'<div class="oc-quick-actions">'+btn("Products & inventory","tab","products")+btn("Orders & fulfilment","tab","orders")+btn("Finance & payments","tab","finance")+btn("Quote requests","tab","quotes")+btn("Reports","tab","reports")+'</div><p class="oc-help">These modules are shown only when the selected business scope is E-commerce & Grocery.</p>')+'</div></div>';
 }
 return pageHead("CENTRAL COMMAND","Business network","A single control layer for all your websites. The selected scope changes the portfolio and exposes only the operating tools relevant to that business category.",'<a class="oc-btn primary" href="./wordpress-templates.html">Create / add website ↗</a>')+
 stats([["Websites in scope",String(sites.length),"Connected to the central control center"],["Categories in scope",String(new Set(sites.map(w=>w.category_slug||"other")).size),"Business types represented"],["Published",String(published),"Websites with published status"],["Needs attention",String(attention),"Draft, setup or review required",attention?"warning":""]])+
 '<div class="oc-command-grid"><div>'+panel("Business categories","<div class=\"oc-category-list\">"+(categoryCards||'<div class="oc-empty">No categories registered yet.</div>')+"</div>")+'</div><div>'+panel("Platform coverage",'<div class="oc-coverage"><div><strong>'+allSites.length+'</strong><span>Total connected websites</span></div><div><strong>'+allCategories.length+'</strong><span>Registered business categories</span></div><div><strong>'+allSites.filter(w=>w.status==="published").length+'</strong><span>Published websites</span></div></div><p class="oc-help">The portfolio is populated from the central Neon websites registry. New category websites appear here when they are registered.</p>')+'</div></div>'+
 panel("Website portfolio",'<div class="oc-business-grid">'+(websiteCards||'<div class="oc-empty">No websites are connected yet.</div>')+'</div>',sites.length>8?"Showing the first 8 websites. Open Website portfolio to view all.":"All websites in the selected scope.")+
 (isGrocery?operationalSummary:category&&!isGrocery?panel("Category workspace",'<p class="oc-help">This scope is '+esc(categoryLabel(category))+'. Open its dedicated workspace for category-specific modules; Grocery operations are intentionally hidden.</p>'+btn("Open business workspace","tab","category-workspace")):"");
}
function productsPage(){
 const rows=scoped(state.data.products).filter(p=>!state.search||[p.name,p.sku,p.attributes?.barcode,p.attributes?.brand,siteName(p.website_id)].join(" ").toLowerCase().includes(state.search.toLowerCase()));
 const editing=state.editingProduct?state.data.products.find(p=>p.id===state.editingProduct):null;
 const selected=editing?site(editing.website_id):(state.store!=="all"?site(state.store):state.data.websites[0]);
 const cats=selected?categoriesForSite(selected.id):[];
 const form='<form id="ocProductForm" class="oc-form-grid">'+
 '<label class="oc-field wide">Store '+siteSelect("website_id",selected?.id||"")+'</label>'+
 '<label class="oc-field wide">Product name<input class="oc-input" name="name" required maxlength="160" value="'+esc(editing?.name||"")+'"></label>'+
 '<label class="oc-field">Category<select class="oc-select" name="category_id"><option value="">Uncategorized</option>'+cats.map(c=>'<option value="'+c.id+'" '+(editing?.category_id===c.id?"selected":"")+'>'+esc(c.name)+'</option>').join("")+'</select></label>'+
 '<label class="oc-field">SKU / code<input class="oc-input" name="sku" maxlength="80" value="'+esc(editing?.sku||"")+'"></label>'+
 '<label class="oc-field">Price (৳)<input class="oc-input" name="price" type="number" min=".01" step=".01" required value="'+(editing?.price??"")+'"></label>'+
 '<label class="oc-field">Compare-at price<input class="oc-input" name="compare_at_price" type="number" min="0" step=".01" value="'+(editing?.compare_at_price??"")+'"></label>'+
 '<label class="oc-field">Unit<input class="oc-input" name="unit" maxlength="30" value="'+esc(editing?.unit||"piece")+'"></label>'+
 '<label class="oc-field">Brand<input class="oc-input" name="brand" maxlength="100" value="'+esc(editing?.attributes?.brand||"")+'"></label>'+
 '<label class="oc-field">Barcode / GTIN<input class="oc-input" name="barcode" maxlength="80" value="'+esc(editing?.attributes?.barcode||"")+'"></label>'+
 '<label class="oc-field">Pack size<input class="oc-input" name="pack_size" maxlength="100" value="'+esc(editing?.attributes?.pack_size||"")+'"></label>'+
 '<label class="oc-field">Origin / source<input class="oc-input" name="origin" maxlength="120" value="'+esc(editing?.attributes?.origin||"")+'"></label>'+
 '<label class="oc-field">Grade<input class="oc-input" name="grade" maxlength="80" value="'+esc(editing?.attributes?.grade||"")+'"></label>'+
 '<label class="oc-field">Expiry date<input class="oc-input" name="expiry_date" type="date" value="'+esc(editing?.attributes?.expiry_date||"")+'"></label>'+
 '<label class="oc-field">Farm / producer<input class="oc-input" name="farm_name" maxlength="120" value="'+esc(editing?.attributes?.farm_name||"")+'"></label>'+
 '<label class="oc-field wide">Product image HTTPS URL<input class="oc-input" name="image_url" type="url" value="'+esc(editing?.image_url||"")+'"></label>'+
 '<label class="oc-field wide">Product description<textarea class="oc-textarea" name="description" maxlength="5000">'+esc(editing?.description||"")+'</textarea></label>'+
 '<label class="oc-field check wide"><input name="is_active" type="checkbox" '+(editing?editing.is_active?"checked":"": "checked")+'> Visible on storefront</label>'+
 '<label class="oc-field check wide"><input name="real_inventory_verified" type="checkbox" '+(editing?.attributes?.inventory_verified===true&&editing?.attributes?.demo!==true?"checked":"")+'> I confirm these details represent real sale inventory</label>'+
 '<div class="oc-form-actions wide"><button class="oc-btn primary" type="submit">'+(editing?"Save product changes":"Add product")+'</button>'+(editing?'<button class="oc-btn secondary" type="button" data-action="cancel-product">Cancel</button>':"")+'</div>'+
 '<p class="oc-help wide">New products start as demo/unverified unless you explicitly confirm the real inventory. Existing stock is changed only through an audited stock movement, not by editing the product form.</p></form>';
 const tableRows=rows.map(p=>{
 const threshold=Number(p.attributes?.low_stock_threshold||10),stock=Number(p.stock),quality=p.attributes?.demo===true?badge("Demo"):p.attributes?.inventory_verified===true?badge("Verified") : badge("Unverified");
 return '<tr><td><strong>'+esc(p.name)+'</strong><small>'+esc(p.sku||"No SKU")+' · '+esc(p.unit||"piece")+'</small></td><td>'+esc(siteName(p.website_id))+'</td><td class="oc-num">'+money(p.price)+'</td><td class="oc-num">'+stock.toLocaleString("en-BD")+'<small>Alert at '+threshold+'</small></td><td>'+quality+'</td><td>'+badge(p.is_active?"active":"archived")+'</td><td>'+btn("Edit","edit-product",p.id)+' '+btn("Adjust stock","select-stock",p.id)+'</td></tr>';
 });
 const stockOptions=state.data.products.filter(p=>p.is_active&&(!state.store||state.store==="all"||p.website_id===state.store)).map(p=>'<option value="'+p.id+'">'+esc(siteName(p.website_id))+' · '+esc(p.name)+' ('+Number(p.stock)+')</option>').join("");
 const categoryRows=cats.map(c=>'<tr><td><strong>'+esc(c.name)+'</strong><small>/'+esc(c.slug)+'</small></td><td class="oc-num">'+Number(c.sort_order||0)+'</td><td>'+badge(c.is_active?"active":"inactive")+'</td></tr>');
 const categoryForm=selected?'<form id="ocCategoryForm" class="oc-form-grid"><input type="hidden" name="website_id" value="'+selected.id+'"><label class="oc-field">Category name<input class="oc-input" name="name" required maxlength="100"></label><label class="oc-field">URL slug<input class="oc-input" name="slug" maxlength="70"></label><label class="oc-field">Sort order<input class="oc-input" name="sort_order" type="number" min="0" value="0"></label><div class="oc-form-actions"><button class="oc-btn primary" type="submit">Save category</button></div></form>':'<div class="oc-alert">Select a storefront to add categories.</div>';
 const movementRows=scoped(state.data.inventoryMovements).slice(0,20).map(m=>'<tr><td>'+date(m.created_at)+'</td><td>'+esc(state.data.products.find(p=>p.id===m.product_id)?.name||"Product")+'</td><td>'+badge(m.movement_type)+'</td><td class="oc-num">'+(Number(m.quantity_delta)>0?"+":"")+Number(m.quantity_delta)+'</td><td class="oc-num">'+Number(m.new_stock)+'</td><td>'+esc(m.reason||"—")+'</td></tr>');

 return pageHead("CATALOGUE OPERATIONS","Products & inventory","Manage products across all stores from one place. All stock changes create an inventory movement record.",'<button class="oc-btn secondary" data-action="export-products" type="button">Export CSV</button> <button class="oc-btn primary" data-action="new-product" type="button">+ Add product</button>')+
 '<div class="oc-grid-2"><div>'+panel(editing?"Edit product":"Add a product",form)+'</div><div>'+panel("Audited stock adjustment",'<form id="ocStockForm" class="oc-form-grid"><label class="oc-field wide">Product<select class="oc-select" name="product_id" required>'+stockOptions+'</select></label><label class="oc-field">Quantity change (+ / −)<input class="oc-input" name="delta" type="number" step=".001" required placeholder="e.g. 12 or -3"></label><label class="oc-field">Movement type<select class="oc-select" name="movement_type"><option value="adjustment">Stock correction</option><option value="damage">Damaged / lost</option><option value="return">Customer return</option></select></label><label class="oc-field wide">Reason<input class="oc-input" name="reason" required minlength="3" placeholder="e.g. Physical stock count"></label><div class="oc-form-actions wide"><button class="oc-btn primary" type="submit">Save stock movement</button></div></form>')+'</div></div>'+
 panel("Bulk catalogue import",'<form id="ocProductImportForm" class="oc-form-grid"><label class="oc-field wide">Target storefront '+siteSelect("website_id",selected?.id||"")+'</label><label class="oc-field wide">CSV file<input class="oc-input" type="file" name="csv_file" accept=".csv,text/csv" required></label><div class="oc-help wide">Up to 200 new products per import. Existing SKUs are skipped. Opening stock is written through the audited inventory ledger. Mark inventory_verified=true only after checking the real stock, price and product details.</div><div class="oc-form-actions wide"><button class="oc-btn primary" type="submit">Import products from CSV</button><button class="oc-btn secondary" id="ocDownloadProductTemplate" type="button">Download CSV template</button></div></form>')+
 panel("Product library",'<div class="oc-filters"><input id="ocProductSearch" class="oc-input oc-search" type="search" placeholder="Search by name, SKU, barcode or store…" value="'+esc(state.search)+'"><span class="oc-help">'+rows.length+' products in this scope</span></div>'+table(["Product","Store","Price","Stock","Verification","Visibility","Actions"],tableRows,920))+
 '<div class="oc-grid-2" style="margin-top:13px"><div>'+panel("Category management",categoryForm+table(["Category","Sort","State"],categoryRows,430))+'</div><div>'+panel("Recent stock movements",table(["Date","Product","Movement","Change","New stock","Reason"],movementRows,650))+'</div></div>';
}
function ordersPage(){
 const rows=scoped(state.data.orders).filter(o=>!state.search||[o.order_number,o.customer?.name,o.customer?.phone,siteName(o.website_id)].join(" ").toLowerCase().includes(state.search.toLowerCase()));
 const itemRows=state.selectedOrder?orderItems(state.selectedOrder):[];
 const focus=state.data.orders.find(o=>o.id===state.selectedOrder);
 const tableRows=rows.map(o=>{
  const due=Math.max(0,Number(o.total)-collectedForOrder(o.id));
  return '<tr><td><strong>'+esc(o.order_number)+'</strong><small>'+date(o.created_at)+'</small></td><td>'+esc(siteName(o.website_id))+'</td><td><strong>'+esc(o.customer?.name||"Customer")+'</strong><small>'+esc(o.customer?.phone||"")+'</small></td><td class="oc-num">'+money(o.total)+'</td><td>'+badge(o.status)+'</td><td>'+badge(o.payment_status)+'<small>Due: '+money(due)+'</small></td><td>'+btn("View","view-order",o.id)+'</td></tr>';
 });
 const statusForm=focus?'<form id="ocOrderStatusForm" class="oc-form-grid"><input type="hidden" name="order_id" value="'+focus.id+'"><label class="oc-field">New fulfilment status<select class="oc-select" name="status"><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></label><div class="oc-form-actions"><button class="oc-btn primary" type="submit">Update order</button></div></form>': '<p class="oc-help">Select an order to view line items and update its fulfilment state.</p>';
 const paymentForm=focus?'<form id="ocOrderPaymentForm" class="oc-form-grid"><input type="hidden" name="order_id" value="'+focus.id+'"><label class="oc-field">Collect amount (৳)<input class="oc-input" name="amount" type="number" min=".01" step=".01" required max="'+Math.max(0,Number(focus.total)-collectedForOrder(focus.id))+'" value="'+Math.max(0,Number(focus.total)-collectedForOrder(focus.id))+'"></label><label class="oc-field">Method<select class="oc-select" name="method"><option value="cod">Cash on delivery</option><option value="cash">Cash at store</option><option value="bank">Bank transfer verified</option><option value="mobile_wallet">Mobile wallet verified</option><option value="manual">Manual</option></select></label><label class="oc-field">Reference<input class="oc-input" name="reference" maxlength="120"></label><label class="oc-field">Notes<input class="oc-input" name="notes" maxlength="500"></label><div class="oc-form-actions wide"><button class="oc-btn primary" type="submit" '+(collectedForOrder(focus.id)>=Number(focus.total)?"disabled":"")+'>Record collection</button></div></form>':'<p class="oc-help">Payment collection is recorded separately from order status. No online gateway is connected.</p>';
 const lineTable=itemRows.map(i=>'<tr><td>'+esc(i.product_snapshot?.name||"Product")+'<small>'+esc(i.product_snapshot?.sku||"")+'</small></td><td class="oc-num">'+i.quantity+'</td><td class="oc-num">'+money(i.unit_price)+'</td><td class="oc-num">'+money(i.line_total)+'</td></tr>');
 return pageHead("ORDER DESK","Orders & fulfilment","Review every order from every storefront. Fulfilment status, payment collection and return requests are handled centrally.")+
 panel("All customer orders",'<div class="oc-filters"><input id="ocOrderSearch" class="oc-input oc-search" type="search" value="'+esc(state.search)+'" placeholder="Search order number, customer or phone"><span class="oc-help">'+rows.length+' orders</span></div>'+table(["Order","Store","Customer","Total","Fulfilment","Payment & due",""],tableRows,950))+
 (focus?'<div class="oc-grid-equal" style="margin-top:13px"><div>'+panel("Order "+esc(focus.order_number),'<div class="oc-row-actions">'+badge(focus.status)+' '+badge(focus.payment_status)+'</div><p class="oc-help">Deliver to: '+esc(focus.shipping_address?.address||"")+', '+esc(focus.shipping_address?.area||"")+'</p>'+table(["Item","Qty","Unit price","Line total"],lineTable,540)+ '<p><strong>Order total: '+money(focus.total)+'</strong></p>')+panel("Fulfilment status",statusForm)+'</div><div>'+panel("Payment collection",paymentForm)+panel("Payment history",table(["Date","Method","Amount","Reference"],scoped(state.data.payments).filter(p=>p.order_id===focus.id).map(p=>'<tr><td>'+date(p.paid_at)+'</td><td>'+esc(p.payment_method)+'</td><td class="oc-num">'+money(p.amount)+'</td><td>'+esc(p.reference||"—")+'</td></tr>'),540))+'</div></div>':"");
}
function customersPage(){
 const rows=(state.data.customers||[]).filter(c=>!state.search||[c.name,c.phone_normalized,c.email].join(" ").toLowerCase().includes(state.search.toLowerCase()));
 const links=state.data.customerLinks||[];
 const tableRows=rows.map(c=>{
  const count=links.filter(x=>x.customer_id===c.id).reduce((n,x)=>n+Number(x.total_orders||0),0);
  const value=links.filter(x=>x.customer_id===c.id).reduce((n,x)=>n+Number(x.total_order_value||0),0);
  return '<tr><td><strong>'+esc(c.name)+'</strong><small>'+esc(c.phone_normalized)+'</small></td><td class="oc-num">'+count+'</td><td class="oc-num">'+money(value)+'</td><td><select class="oc-select" data-customer-tier="'+c.id+'">'+["standard","silver","gold","platinum"].map(x=>'<option value="'+x+'" '+(c.vip_tier===x?"selected":"")+'>'+x+'</option>').join("")+'</select></td><td>'+badge(c.blocked?"blocked":"active")+'</td><td><div class="oc-row-actions"><label class="oc-help"><input type="checkbox" data-customer-block="'+c.id+'" '+(c.blocked?"checked":"")+'> Block</label>'+btn("Save","save-customer",c.id)+'</div></td></tr>';
 });
 return pageHead("CUSTOMER RELATIONSHIPS","Customers","One customer profile across all four stores. Order history, VIP tiers, notes and restrictions are centrally managed.")+
 panel("Customer directory",'<div class="oc-filters"><input id="ocCustomerSearch" class="oc-input oc-search" value="'+esc(state.search)+'" placeholder="Search customer name or phone"><span class="oc-help">'+rows.length+' customer profiles</span></div>'+table(["Customer","Orders","Order value","VIP tier","Access","Management"],tableRows,900))+
 panel("Customer data policy",'<p class="oc-help">Customer profiles are created automatically from verified order phone numbers. Blocking a customer prevents future checkout through the database order function. VIP tier and notes do not alter order prices unless a supported promotion or pricing rule is configured.</p>');
}
function suppliersPage(){
 const rows=(state.data.suppliers||[]).filter(s=>!s.website_id||state.store==="all"||s.website_id===state.store);
 const tableRows=rows.map(s=>'<tr><td><strong>'+esc(s.name)+'</strong><small>'+esc(s.company_name||"")+'</small></td><td>'+esc(s.website_id?siteName(s.website_id):"Shared supplier")+'</td><td>'+esc(s.phone||"—")+'</td><td>'+esc(s.email||"—")+'</td><td>'+badge(s.is_active?"active":"inactive")+'</td><td>'+btn("Edit","edit-supplier",s.id)+'</td></tr>');
 const editing=state.editSupplier?(state.data.suppliers||[]).find(s=>s.id===state.editSupplier):null;
 const form='<form id="ocSupplierForm" class="oc-form-grid"><input type="hidden" name="id" value="'+esc(editing?.id||"")+'"><label class="oc-field">Supplier name<input class="oc-input" name="name" required value="'+esc(editing?.name||"")+'"></label><label class="oc-field">Company<input class="oc-input" name="company_name" value="'+esc(editing?.company_name||"")+'"></label><label class="oc-field">Applies to store<select class="oc-select" name="website_id"><option value="">Shared across all stores</option>'+(state.data.websites||[]).map(w=>'<option value="'+w.id+'" '+(editing?.website_id===w.id?"selected":"")+'>'+esc(siteName(w.id))+'</option>').join("")+'</select></label><label class="oc-field">Phone<input class="oc-input" name="phone" value="'+esc(editing?.phone||"")+'"></label><label class="oc-field">Email<input class="oc-input" name="email" type="email" value="'+esc(editing?.email||"")+'"></label><label class="oc-field">Tax / registration ID<input class="oc-input" name="tax_id" value="'+esc(editing?.tax_id||"")+'"></label><label class="oc-field wide">Address<input class="oc-input" name="address" value="'+esc(editing?.address||"")+'"></label><label class="oc-field wide">Notes<textarea class="oc-textarea" name="notes">'+esc(editing?.notes||"")+'</textarea></label><label class="oc-field check"><input name="is_active" type="checkbox" '+(editing?editing.is_active?"checked":"":"checked")+'> Active supplier</label><div class="oc-form-actions wide"><button class="oc-btn primary" type="submit">Save supplier</button>'+(editing?'<button class="oc-btn secondary" type="button" data-action="cancel-supplier">Cancel</button>':"")+'</div></form>';
 return pageHead("SUPPLY NETWORK","Suppliers","Maintain one supplier directory and assign suppliers to an individual storefront or share them across all stores.")+
 '<div class="oc-grid-2"><div>'+panel(editing?"Edit supplier":"Add supplier",form)+'</div><div>'+panel("Supplier performance",'<div class="oc-stats">'+[['Active suppliers',String(rows.filter(s=>s.is_active).length),'In current scope'],['Open purchase orders',String(scoped(state.data.purchaseOrders).filter(p=>!["received","cancelled"].includes(p.status)).length),'Pending receipt'],['Supplier balances',money(scoped(state.data.purchaseOrders).reduce((n,p)=>n+Math.max(0,Number(p.subtotal)-supplierPaid(p.id)),0)),'Against purchase orders']].map(x=>'<div class="oc-stat"><small>'+x[0]+'</small><strong>'+x[1]+'</strong><span>'+x[2]+'</span></div>').join("")+'</div>')+'</div></div>'+
 panel("Supplier directory",table(["Supplier","Store scope","Phone","Email","Status",""],tableRows,800));
}
function purchasingPage(){
 if(state.store==="all")return pageHead("PROCUREMENT","Purchasing & receiving","Choose one storefront from the Store scope selector before creating or receiving purchase orders.")+panel("Select a storefront",'<div class="oc-alert">Purchase orders and receiving are store-specific. Choose one store in the top selector, then return here.</div>');
 const sites=chosenSites().length?chosenSites():state.data.websites||[],selected=site(state.store!=="all"?state.store:(sites[0]?.id||""));
 const target=selected||state.data.websites[0],products=target?productsForSite(target.id).filter(p=>p.is_active):[];
 const suppliers=target?suppliersForSite(target.id):[];
 const form='<form id="ocPOForm" class="oc-form-grid"><input type="hidden" name="website_id" value="'+(target?.id||"")+'"><div class="oc-help wide">Store: <strong>'+esc(target?.brand?.name||target?.name||"")+'</strong></div><label class="oc-field wide">Supplier<select class="oc-select" name="supplier_id" required><option value="">Choose supplier</option>'+suppliers.map(s=>'<option value="'+s.id+'">'+esc(s.name)+'</option>').join("")+'</select></label><label class="oc-field wide">Product<select class="oc-select" name="product_id" required><option value="">Choose product</option>'+products.map(p=>'<option value="'+p.id+'">'+esc(p.name)+' · '+esc(p.sku||"no SKU")+'</option>').join("")+'</select></label><label class="oc-field">Quantity<input class="oc-input" name="quantity" type="number" min=".001" step=".001" required></label><label class="oc-field">Unit cost (৳)<input class="oc-input" name="unit_cost" type="number" min="0" step=".01" required></label><label class="oc-field">Expected date<input class="oc-input" name="expected_at" type="date"></label><label class="oc-field">Notes<input class="oc-input" name="notes" maxlength="500"></label><div class="oc-form-actions wide"><button class="oc-btn primary" type="submit">Create purchase order</button></div></form>';
 const rows=scoped(state.data.purchaseOrders).map(po=>{
  const supplier=(state.data.suppliers||[]).find(s=>s.id===po.supplier_id),paid=supplierPaid(po.id),due=Math.max(0,Number(po.subtotal)-paid);
  return '<tr><td><strong>'+esc(po.po_number)+'</strong><small>'+date(po.created_at)+'</small></td><td>'+esc(siteName(po.website_id))+'</td><td>'+esc(supplier?.name||"Supplier")+'</td><td>'+badge(po.status)+'</td><td class="oc-num">'+money(po.subtotal)+'</td><td class="oc-num">'+money(due)+'</td><td><div class="oc-row-actions">'+btn("Receive","receive-po",po.id)+' '+btn("Pay supplier","pay-supplier",po.id)+'</div></td></tr>';
 });
 const receiving=state.selectedPO?state.data.purchaseOrders.find(p=>p.id===state.selectedPO):null;
 const lines=receiving?(state.data.purchaseItems||[]).filter(i=>i.purchase_order_id===receiving.id):[];
 const receiveBox=receiving?panel("Receive "+esc(receiving.po_number),'<form id="ocReceiveForm"><input type="hidden" name="po_id" value="'+receiving.id+'">'+table(["Product","Ordered","Received","Remaining","Receive now"],lines.map(i=>'<tr><td>'+esc(i.product_snapshot?.name||"Product")+'</td><td class="oc-num">'+i.quantity+'</td><td class="oc-num">'+i.received_quantity+'</td><td class="oc-num">'+(Number(i.quantity)-Number(i.received_quantity))+'</td><td><input class="oc-input" style="width:100px" name="receive_'+i.id+'" type="number" min="0" max="'+(Number(i.quantity)-Number(i.received_quantity))+'" step=".001" value="'+(Number(i.quantity)-Number(i.received_quantity))+'"></td></tr>'),650)+'<div class="oc-form-actions"><button class="oc-btn primary" type="submit">Confirm received quantities</button><button class="oc-btn secondary" type="button" data-action="close-po">Close</button></div></form>'):"";
 const payBox=state.selectedPO?panel("Supplier payment for "+esc(state.data.purchaseOrders.find(p=>p.id===state.selectedPO)?.po_number||""),'<form id="ocSupplierPayForm" class="oc-form-grid"><input type="hidden" name="po_id" value="'+state.selectedPO+'"><label class="oc-field">Amount (৳)<input class="oc-input" name="amount" type="number" min=".01" step=".01" required></label><label class="oc-field">Method<select class="oc-select" name="method"><option value="cash">Cash</option><option value="bank">Bank transfer</option><option value="mobile_wallet">Mobile wallet</option><option value="manual">Manual</option></select></label><label class="oc-field">Reference<input class="oc-input" name="reference"></label><div class="oc-form-actions"><button class="oc-btn primary" type="submit">Record supplier payment</button></div></form>'):"";
 return pageHead("PROCUREMENT","Purchasing & receiving","Create purchase orders, receive goods into inventory and keep supplier balances and payments reconciled.")+
 '<div class="oc-grid-2"><div>'+panel("Create purchase order",form)+'</div><div>'+panel("Purchasing controls",'<div class="oc-alert">Purchase orders increase on-hand inventory only when goods are received. Receiving is atomic: stock and inventory movement logs update together.</div><p class="oc-help">Products must belong to the selected storefront. Use a verified supplier and the actual unit cost from the supplier invoice.</p>')+'</div></div>'+
 panel("Purchase orders",table(["PO number","Store","Supplier","Status","Subtotal","Balance due","Actions"],rows,950))+receiveBox+payBox;
}
function deliveryPage(){
 if(state.store==="all")return pageHead("DELIVERY","Delivery & store settings","Choose one storefront from the Store scope selector before editing delivery areas and contact details.")+panel("Select a storefront",'<div class="oc-alert">Delivery coverage is configured separately for each storefront. Choose a store in the top selector, then return here.</div>');
 const targets=chosenSites(),w=targets[0]||state.data.websites[0];
 if(!w)return pageHead("DELIVERY","Delivery & stores","No stores found.")+'<div class="oc-empty">No stores configured.</div>';
 const zones=(state.data.deliveryZones||[]).filter(z=>z.website_id===w.id);
 const contact=w.brand||{},settings=w.settings||{},delivery=settings.delivery||{},c=settings.contact||{};
 const zoneRows=zones.map(z=>'<tr><td><strong>'+esc(z.name)+'</strong></td><td class="oc-num">'+money(z.delivery_fee)+'</td><td class="oc-num">'+money(z.minimum_order)+'</td><td>'+esc(z.eta_label||"—")+'</td><td>'+badge(z.is_active?"active":"inactive")+'</td><td>'+btn(z.is_active?"Disable":"Enable","toggle-zone",z.id)+'</td></tr>');
 const contactForm='<form id="ocStoreProfileForm" class="oc-form-grid"><input type="hidden" name="website_id" value="'+w.id+'"><div class="oc-help wide">Store: <strong>'+esc(siteName(w.id))+'</strong></div><label class="oc-field">Support phone<input class="oc-input" name="phone" value="'+esc(contact.phone||c.phone||"")+'"></label><label class="oc-field">Support email<input class="oc-input" name="email" type="email" value="'+esc(contact.email||c.email||"")+'"></label><label class="oc-field wide">Business address<input class="oc-input" name="address" value="'+esc(contact.address||c.address||"")+'"></label><label class="oc-field">Service hours<input class="oc-input" name="hours" value="'+esc(c.hours||settings.business_hours||"")+'"></label><label class="oc-field">Default / fallback fee<input class="oc-input" name="default_fee" type="number" min="0" step=".01" value="'+Number(delivery.default_fee||0)+'"></label><label class="oc-field wide">Delivery note<input class="oc-input" name="note" maxlength="500" value="'+esc(delivery.note||"")+'"></label><div class="oc-form-actions wide"><button class="oc-btn primary" type="submit">Save store information</button></div></form>';
 const zoneForm='<form id="ocZoneForm" class="oc-form-grid"><input type="hidden" name="website_id" value="'+w.id+'"><label class="oc-field">Delivery area name<input class="oc-input" name="name" required></label><label class="oc-field">Delivery fee (৳)<input class="oc-input" name="delivery_fee" type="number" min="0" step=".01" required></label><label class="oc-field">Minimum order (৳)<input class="oc-input" name="minimum_order" type="number" min="0" step=".01" value="0"></label><label class="oc-field">Estimated time<input class="oc-input" name="eta_label" placeholder="e.g. 1–2 days"></label><div class="oc-form-actions wide"><button class="oc-btn primary" type="submit">Add delivery zone</button></div></form>';
 const legacy=Array.isArray(delivery.areas)?delivery.areas:[];
 return pageHead("STORE CONFIGURATION","Delivery & store settings","Manage each store's real customer support details and delivery coverage. Each delivery zone can have its own fee and minimum order.")+

 '<div class="oc-grid-2"><div>'+panel("Store information",contactForm)+'</div><div>'+panel("Add a delivery zone",zoneForm)+panel("Current coverage",table(["Area","Fee","Minimum","ETA","State",""],zoneRows,700)+(legacy.length&&!zones.length?'<div class="oc-alert" style="margin-top:9px">Legacy areas found: '+esc(legacy.join(", "))+'. Add them as delivery zones below, with their real area-specific fees.</div>':""))+'</div></div>';
}
function financePage(){
 const rows=scoped(state.data.finance).map(f=>'<tr><td>'+date(f.occurred_at)+'</td><td>'+esc(siteName(f.website_id))+'</td><td>'+badge(f.entry_type)+'</td><td>'+esc(f.category)+'</td><td>'+esc(f.description||"—")+'</td><td class="oc-num">'+money(f.amount)+'</td></tr>');
 const entries=scoped(state.data.finance),income=entries.filter(x=>x.entry_type==="income").reduce((n,x)=>n+Number(x.amount||0),0),expense=entries.filter(x=>x.entry_type==="expense").reduce((n,x)=>n+Number(x.amount||0),0);
 const form='<form id="ocFinanceForm" class="oc-form-grid"><label class="oc-field">Store '+siteSelect("website_id",state.store!=="all"?state.store:state.data.websites[0]?.id)+'</label><label class="oc-field">Entry type<select class="oc-select" name="entry_type"><option value="expense">Expense</option><option value="income">Other income</option></select></label><label class="oc-field">Category<input class="oc-input" name="category" required placeholder="e.g. Packaging, rent, fuel"></label><label class="oc-field">Amount (৳)<input class="oc-input" name="amount" type="number" min=".01" step=".01" required></label><label class="oc-field wide">Description<input class="oc-input" name="description" maxlength="500"></label><label class="oc-field">Date<input class="oc-input" name="occurred_at" type="datetime-local"></label><div class="oc-form-actions wide"><button class="oc-btn primary" type="submit">Record entry</button></div></form>';
 return pageHead("FINANCE DESK","Finance & payments","Track money actually collected, supplier payments and operating costs. COD orders are not treated as collected cash until recorded.")+
 stats([["Recorded income",money(income),"Confirmed collections and other income"],["Expenses",money(expense),"Supplier and operating expenses"],["Net recorded",money(income-expense),"Income less recorded expense"],["Pending order value",money(scoped(state.data.orders).filter(o=>o.status!=="cancelled").reduce((n,o)=>n+Math.max(0,Number(o.total)-collectedForOrder(o.id)),0)),"Not yet collected"]])+
 '<div class="oc-grid-2"><div>'+panel("Record income or expense",form)+'</div><div>'+panel("Payment controls",'<p class="oc-help">Use the Orders tab to record COD collection and the Purchasing tab to record supplier payments. Both actions create a payment transaction and finance entry automatically.</p>')+'</div></div>'+
 panel("Finance ledger",table(["Date","Store","Type","Category","Description","Amount"],rows,850));
}
function returnsPage(){
 const orders=scoped(state.data.orders),rows=scoped(state.data.returns).map(r=>'<tr><td><strong>'+esc(orders.find(o=>o.id===r.order_id)?.order_number||r.order_id.slice(0,8))+'</strong><small>'+date(r.created_at)+'</small></td><td>'+esc(siteName(r.website_id))+'</td><td>'+esc(r.customer_name||"Customer")+'<small>'+esc(r.customer_phone||"")+'</small></td><td>'+esc(r.reason)+'</td><td>'+badge(r.status)+'</td><td>'+btn("Approve","return-status",r.id)+' '+btn("Reject","return-reject",r.id)+'</td></tr>');
 const form='<form id="ocReturnForm" class="oc-form-grid"><label class="oc-field wide">Order<select class="oc-select" name="order_id" required><option value="">Choose order</option>'+orders.map(o=>'<option value="'+o.id+'">'+esc(o.order_number)+' · '+esc(siteName(o.website_id))+' · '+esc(o.customer?.name||"")+'</option>').join("")+'</select></label><label class="oc-field wide">Reason<textarea class="oc-textarea" name="reason" required></textarea></label><label class="oc-field wide">Internal notes<input class="oc-input" name="notes"></label><div class="oc-form-actions wide"><button class="oc-btn primary" type="submit">Create return request</button></div></form>';
 return pageHead("AFTER-SALES","Returns & customer claims","Create, review and resolve return requests. Approved refunds must be recorded as payment refunds after the returned goods have been inspected.")+
 '<div class="oc-grid-2"><div>'+panel("Create a return request",form)+'</div><div>'+panel("Return policy controls",'<div class="oc-alert">Approving a return does not automatically issue money or restock an item. Inspect the goods, record any approved refund and add a stock return movement separately.</div>')+'</div></div>'+
 panel("Return register",table(["Order","Store","Customer","Reason","Status","Actions"],rows,900));
}
function quotesPage(){
 const rows=scoped(state.data.quoteRequests||[]).slice().sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
 const requested=rows.filter(q=>q.status==="requested").length,reviewing=rows.filter(q=>q.status==="reviewing").length,quoted=rows.filter(q=>q.status==="quoted").length;
 const cards=rows.map(q=>{
  const items=Array.isArray(q.requested_items)?q.requested_items:[];
  const itemHtml=items.length?'<ul class="oc-quote-items">'+items.map(item=>'<li>'+esc(item.description||item.name||item.product_name||"Requested item")+(item.quantity?' · Qty '+esc(item.quantity):"")+'</li>').join("")+'</ul>':'<p class="oc-help">No line items were supplied.</p>';
  const options=["requested","reviewing","quoted","approved","rejected","closed"].map(x=>'<option value="'+x+'" '+(q.status===x?"selected":"")+'>'+x.replaceAll("_"," ")+'</option>').join("");
  return '<article class="oc-quote-card"><header class="oc-quote-card-head"><div><span class="oc-kicker">'+esc(q.quote_number)+'</span><h3>'+esc(q.business_name)+'</h3><p>'+esc(q.contact_name)+' · '+esc(q.business_type||"Business customer")+'</p></div><div>'+badge(q.status)+'<small>'+date(q.created_at)+'</small></div></header><div class="oc-quote-contact"><span><small>PHONE</small><strong>'+esc(q.phone)+'</strong></span><span><small>EMAIL</small><strong>'+esc(q.email||"Not supplied")+'</strong></span><span><small>BUSINESS ID</small><strong>'+esc(q.tax_id||"—")+'</strong></span><span><small>STORE</small><strong>'+esc(siteName(q.website_id))+'</strong></span></div><div class="oc-quote-items-wrap"><strong>Requested products / pack sizes</strong>'+itemHtml+(q.notes?'<p class="oc-quote-note">'+esc(q.notes)+'</p>':"")+'</div><form class="oc-quote-response" data-quote-update data-quote-id="'+esc(q.id)+'"><label class="oc-field">Status<select class="oc-select" name="status">'+options+'</select></label><label class="oc-field">Quoted total (৳)<input class="oc-input" name="quoted_amount" type="number" min="0" step=".01" value="'+Number(q.quoted_amount||0)+'"></label><label class="oc-field">Valid until<input class="oc-input" name="valid_until" type="date" value="'+esc(q.valid_until||"")+'"></label><label class="oc-field wide">Response notes<textarea class="oc-input" name="response_notes" rows="2" maxlength="2000" placeholder="Add price breakdown, availability, lead time or terms">'+esc(q.response_notes||"")+'</textarea></label><div class="oc-form-actions wide"><button class="oc-btn primary" type="submit">Save quotation response</button>'+(q.converted_order_id?'<span class="oc-help">Converted to order '+esc(q.converted_order_id)+'</span>':"")+'</div></form></article>';
 }).join("");
 return pageHead("B2B SALES DESK","Quote requests","Review incoming wholesale enquiries, set a quotation amount and validity date, and send a clear response for the business customer.")+stats([["New requests",String(requested),"Awaiting first review"],["In review",String(reviewing),"Being checked"],["Quoted",String(quoted),"Price response prepared"],["All requests",String(rows.length),"In selected store scope"]])+(cards?'<div class="oc-quote-list">'+cards+'</div>':panel("No quotation requests yet",'<div class="oc-empty">New wholesale requests submitted from the storefront will appear here. The customer-facing form is available on the Wholesale & Bulk template.</div>'));
}
function wholesalePage(){
 if(state.store==="all")return pageHead("B2B PROCUREMENT","Wholesale price tiers","Choose the Wholesale & Bulk storefront from the Store scope selector to configure its quantity pricing.")+panel("Select a storefront",'<div class="oc-alert">Wholesale price tiers must belong to one storefront. Choose the relevant store in the top selector.</div>');
 const siteRows=state.data.websites||[],w=site(state.store!=="all"?state.store:siteRows.find(s=>s.template_key==="wholesale-bulk")?.id||siteRows[0]?.id),products=w?productsForSite(w.id):[];
 const form='<form id="ocTierForm" class="oc-form-grid"><input type="hidden" name="website_id" value="'+(w?.id||"")+'"><div class="oc-help wide">Store: <strong>'+esc(w?.brand?.name||w?.name||"")+'</strong></div><label class="oc-field wide">Product<select class="oc-select" name="product_id" required><option value="">Choose a product</option>'+products.map(p=>'<option value="'+p.id+'">'+esc(p.name)+'</option>').join("")+'</select></label><label class="oc-field">Minimum quantity<input class="oc-input" name="minimum_quantity" type="number" min=".001" step=".001" required></label><label class="oc-field">Tier unit price (৳)<input class="oc-input" name="unit_price" type="number" min=".01" step=".01" required></label><label class="oc-field wide">Tier label<input class="oc-input" name="label" placeholder="e.g. Restaurant 20+"></label><div class="oc-form-actions wide"><button class="oc-btn primary" type="submit">Save wholesale tier</button></div></form>';
 const rows=scoped(state.data.priceTiers).map(t=>'<tr><td>'+esc(siteName(t.website_id))+'</td><td>'+esc(state.data.products.find(p=>p.id===t.product_id)?.name||"Product")+'</td><td class="oc-num">'+t.minimum_quantity+'</td><td class="oc-num">'+money(t.unit_price)+'</td><td>'+esc(t.label||"—")+'</td><td>'+badge(t.is_active?"active":"inactive")+'</td></tr>');
 return pageHead("B2B PROCUREMENT","Wholesale price tiers","Define quantity-based prices for wholesale customers. Tiers are stored centrally and can be used by the wholesale storefront after the checkout pricing rule is enabled.")+
 '<div class="oc-grid-2"><div>'+panel("Add price tier",form)+'</div><div>'+panel("Wholesale system readiness",'<ul class="oc-help"><li>MOQ and pack size product fields are supported.</li><li>Quantity-tier prices are stored per product and store.</li><li>Buyer verification, negotiated credit terms and RFQ workflow remain separate future controls.</li></ul>')+'</div></div>'+
 panel("Configured price tiers",table(["Store","Product","Minimum qty","Unit price","Tier","State"],rows,750));
}
function reportsPage(){
 const orders=scoped(state.data.orders).filter(o=>o.status!=="cancelled"),entries=scoped(state.data.finance),prod=scoped(state.data.products);
 const monthly={};for(const o of orders){const key=(o.created_at||"").slice(0,7)||"Unknown";monthly[key]=(monthly[key]||0)+Number(o.total||0);}
 const months=Object.entries(monthly).sort((a,b)=>a[0].localeCompare(b[0])).slice(-8),max=Math.max(1,...months.map(x=>x[1]));
 const bars=months.map(x=>'<div class="oc-report-row"><strong>'+esc(x[0])+'</strong><div class="oc-progress"><span style="width:'+(x[1]/max*100)+'%"></span></div><span class="oc-num">'+money(x[1])+'</span></div>').join("");
 const productTotals={};for(const line of state.data.orderItems){const o=orders.find(x=>x.id===line.order_id);if(!o)continue;const key=line.product_snapshot?.name||"Product";productTotals[key]=(productTotals[key]||0)+Number(line.quantity||0);}
 const top=Object.entries(productTotals).sort((a,b)=>b[1]-a[1]).slice(0,8).map(x=>'<tr><td>'+esc(x[0])+'</td><td class="oc-num">'+x[1]+'</td></tr>');
 const exportRows=orders.map(o=>[o.order_number,siteName(o.website_id),o.customer?.name,o.customer?.phone,o.subtotal,o.delivery_fee,o.total,o.payment_status,o.status,o.created_at]);
 return pageHead("BUSINESS INTELLIGENCE","Reports & performance","Operational summaries from order, payment, inventory and finance records. Export raw order data for external accounting or review.",'<button class="oc-btn primary" data-action="export-orders" type="button">Export orders CSV</button>')+
 '<div class="oc-grid-2"><div>'+panel("Order value by month",'<div class="oc-report-bars">'+(bars||'<div class="oc-empty">No order data yet.</div>')+'</div>')+'</div><div>'+panel("Quick performance",'<div class="oc-stats"><div class="oc-stat"><small>Orders</small><strong>'+orders.length+'</strong><span>Non-cancelled</span></div><div class="oc-stat"><small>Products</small><strong>'+prod.length+'</strong><span>Across store scope</span></div><div class="oc-stat"><small>Income</small><strong>'+money(entries.filter(e=>e.entry_type==="income").reduce((n,e)=>n+Number(e.amount),0))+'</strong><span>Recorded</span></div><div class="oc-stat"><small>Expenses</small><strong>'+money(entries.filter(e=>e.entry_type==="expense").reduce((n,e)=>n+Number(e.amount),0))+'</strong><span>Recorded</span></div></div>')+'</div></div>'+
 panel("Top products by ordered quantity",table(["Product","Units ordered"],top,540));
}
function bindPage(){
 $("#ocNav").querySelectorAll("button").forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;state.search="";state.editingProduct=null;render();});
 const search=$("#ocProductSearch")||$("#ocOrderSearch")||$("#ocCustomerSearch");if(search)search.addEventListener("input",e=>{state.search=e.target.value;const p=$("#ocPageBody");if(p){const at=p.selectionStart;}const current=state.tab;const cursor=e.target.selectionStart;const value=e.target.value;render();const n=$("#ocProductSearch")||$("#ocOrderSearch")||$("#ocCustomerSearch");if(n){n.focus();n.setSelectionRange(cursor,cursor);n.value=value;}});
 const quoteForms=$("[data-quote-update]");quoteForms.forEach(form=>form.addEventListener("submit",async e=>{e.preventDefault();const x=formObj(form);try{busy(true);await api().updateCentralQuote(form.dataset.quoteId,x.status,x.quoted_amount,x.valid_until||null,x.response_notes||"");await refresh();notice("Wholesale quotation response saved.","success");}catch(err){notice(err.message||"Quotation update failed.","error");}finally{busy(false);}}));
 const categoryForm=$("#ocCategoryForm");if(categoryForm)categoryForm.addEventListener("submit",async e=>{e.preventDefault();const x=formObj(e.currentTarget),w=site(x.website_id);try{busy(true);await api().saveWebsiteCategory(w,x);await refresh();notice("Category saved to the selected storefront.","success");}catch(err){notice(err.message||"Category save failed.","error");}finally{busy(false);}});
 const productForm=$("#ocProductForm");if(productForm){const sf=productForm.elements.namedItem("website_id");sf?.addEventListener("change",()=>{const cf=productForm.elements.namedItem("category_id"),list=categoriesForSite(sf.value);cf.innerHTML='<option value="">Uncategorized</option>'+list.map(c=>'<option value="'+c.id+'">'+esc(c.name)+'</option>').join("");});}if(productForm)productForm.addEventListener("submit",async e=>{
  e.preventDefault();const f=e.currentTarget,x=formObj(f),w=site(x.website_id);if(!w)throw new Error("Select a store.");
  try{busy(true);await api().saveWebsiteProduct(w,{id:state.editingProduct||"",name:x.name,category_id:x.category_id,sku:x.sku,price:x.price,compare_at_price:x.compare_at_price,unit:x.unit,stock:state.editingProduct?state.data.products.find(p=>p.id===state.editingProduct)?.stock||0:0,brand:x.brand,barcode:x.barcode,pack_size:x.pack_size,origin:x.origin,grade:x.grade,expiry_date:x.expiry_date,farm_name:x.farm_name,image_url:x.image_url,description:x.description,is_active:f.elements.is_active.checked,real_inventory_verified:f.elements.real_inventory_verified.checked});state.editingProduct=null;await refresh();notice("Product saved to the selected store's central catalogue.","success");}catch(err){notice(err.message||"Product save failed.","error");}finally{busy(false);}
 });
 const templateButton=$("#ocDownloadProductTemplate");if(templateButton)templateButton.addEventListener("click",()=>downloadCSVFile("grocery-product-import-template.csv","name,sku,price,stock,unit,category,description,image_url,brand,barcode,pack_size,origin,grade,expiry_date,farm_name,compare_at_price,inventory_verified,is_active\n"));
 const importForm=$("#ocProductImportForm");if(importForm)importForm.addEventListener("submit",async e=>{
  e.preventDefault();const form=e.currentTarget,x=formObj(form),w=site(x.website_id),file=form.elements.csv_file.files?.[0];
  if(!w){notice("Choose a target storefront before importing.","error");return;}
  if(!file){notice("Choose a CSV file to import.","error");return;}
  try{
   busy(true);
   const rows=parseCSV(await file.text());
   if(!rows.length)throw new Error("The CSV file has no product rows.");
   if(rows.length>200)throw new Error("Import is limited to 200 product rows at a time.");
   const required=["name","sku","price","stock","description"];
   const missing=required.filter(k=>!Object.prototype.hasOwnProperty.call(rows[0],k));
   if(missing.length)throw new Error("Missing CSV columns: "+missing.join(", "));
   let created=0,stocked=0;const errors=[];
   const cats=categoriesForSite(w.id);
   for(let i=0;i<rows.length;i++){
    const r=rows[i],rowNo=i+2;
    try{
     const name=String(r.name||"").trim(),sku=String(r.sku||"").trim(),price=Number(r.price),stock=Number(r.stock);
     if(name.length<2||!sku)throw new Error("Product name and SKU are required.");
     if(!Number.isFinite(price)||price<=0||!Number.isFinite(stock)||stock<0)throw new Error("Price must be positive and stock cannot be negative.");
     if(state.data.products.some(p=>p.website_id===w.id&&String(p.sku||"").toLowerCase()===sku.toLowerCase()))throw new Error("SKU already exists in this storefront.");
     let categoryId=null;
     if(r.category){
      const wanted=String(r.category).trim().toLowerCase();
      const category=cats.find(c=>String(c.name||"").trim().toLowerCase()===wanted||String(c.slug||"").trim().toLowerCase()===wanted);
      if(!category)throw new Error("Category not found: "+r.category+". Create the category first.");
      categoryId=category.id;
     }
     const verified=["true","1","yes","verified"].includes(String(r.inventory_verified||"").trim().toLowerCase());
     const active=!["false","0","no","inactive"].includes(String(r.is_active||"").trim().toLowerCase());
     const product=await api().saveWebsiteProduct(w,{id:"",name,category_id:categoryId,sku,price,compare_at_price:r.compare_at_price||"",unit:r.unit||"piece",stock:0,brand:r.brand||"",barcode:r.barcode||"",pack_size:r.pack_size||"",origin:r.origin||"",grade:r.grade||"",expiry_date:r.expiry_date||"",farm_name:r.farm_name||"",image_url:r.image_url||"",description:r.description||"",is_active:active,real_inventory_verified:verified});
     created++;
     if(stock>0){try{await api().centralAdjustInventory(w,product.id,stock,"Opening stock imported from CSV","adjustment");stocked++;}catch(stockError){errors.push("Row "+rowNo+": product created, but opening stock was not recorded — "+stockError.message);}}
    }catch(rowError){errors.push("Row "+rowNo+": "+(rowError.message||"Import failed"));}
   }
   await refresh();
   const summary="Imported "+created+" products; "+stocked+" opening-stock entries recorded"+(errors.length?"; "+errors.length+" row issue(s).":" .");
   notice(summary+(errors.length?" First issue: "+errors[0]:""),errors.length?"error":"success");
  }catch(err){notice(err.message||"CSV import failed.","error");}
  finally{busy(false);}
 });
 const stockForm=$("#ocStockForm");if(stockForm)stockForm.addEventListener("submit",async e=>{e.preventDefault();const x=formObj(e.currentTarget),p=state.data.products.find(p=>p.id===x.product_id),w=site(p?.website_id);try{busy(true);await api().centralAdjustInventory(w,x.product_id,x.delta,x.reason,x.movement_type);await refresh();notice("Stock and inventory movement log updated together.","success");}catch(err){notice(err.message||"Stock adjustment failed.","error");}finally{busy(false);}});
 const orderStatus=$("#ocOrderStatusForm");if(orderStatus)orderStatus.addEventListener("submit",async e=>{e.preventDefault();const x=formObj(e.currentTarget),o=state.data.orders.find(o=>o.id===x.order_id),w=site(o?.website_id);try{busy(true);await api().updateOrderStatus(w,o.id,x.status);state.selectedOrder=null;await refresh();notice("Order fulfilment status updated.","success");}catch(err){notice(err.message||"Order status update failed.","error");}finally{busy(false);}});
 const orderPayment=$("#ocOrderPaymentForm");if(orderPayment)orderPayment.addEventListener("submit",async e=>{e.preventDefault();const x=formObj(e.currentTarget);try{busy(true);await api().centralRecordOrderPayment(x.order_id,x.amount,x.method,x.reference,x.notes);await refresh();state.selectedOrder=x.order_id;render();notice("Payment collection saved to the order and finance ledger.","success");}catch(err){notice(err.message||"Payment could not be recorded.","error");}finally{busy(false);}});
 const supplierForm=$("#ocSupplierForm");if(supplierForm)supplierForm.addEventListener("submit",async e=>{e.preventDefault();const x=formObj(e.currentTarget);x.is_active=e.currentTarget.elements.is_active.checked;try{busy(true);await api().saveCentralSupplier(x);state.editSupplier=null;await refresh();notice("Supplier saved.","success");}catch(err){notice(err.message||"Supplier save failed.","error");}finally{busy(false);}});
 const poForm=$("#ocPOForm");if(poForm)poForm.addEventListener("submit",async e=>{e.preventDefault();const x=formObj(e.currentTarget),w=site(x.website_id);try{busy(true);const result=await api().centralCreatePurchaseOrder(w,x.supplier_id,[{product_id:x.product_id,quantity:x.quantity,unit_cost:x.unit_cost}],x.expected_at||null,x.notes||"");state.selectedPO=result.id;await refresh();notice("Purchase order "+result.po_number+" created. Receive goods to update stock.","success");}catch(err){notice(err.message||"Purchase order creation failed.","error");}finally{busy(false);}});
 const receiveForm=$("#ocReceiveForm");if(receiveForm)receiveForm.addEventListener("submit",async e=>{e.preventDefault();const x=formObj(e.currentTarget),poId=x.po_id,items=[];for(const [k,v] of Object.entries(x))if(k.startsWith("receive_")&&Number(v)>0)items.push({item_id:k.slice(8),quantity:Number(v)});if(!items.length){notice("Enter at least one quantity to receive.","error");return;}try{busy(true);await api().centralReceivePurchaseOrder(poId,items);await refresh();state.selectedPO=poId;render();notice("Received quantities added to stock with movement records.","success");}catch(err){notice(err.message||"Goods receiving failed.","error");}finally{busy(false);}});
 const supPay=$("#ocSupplierPayForm");if(supPay)supPay.addEventListener("submit",async e=>{e.preventDefault();const x=formObj(e.currentTarget);try{busy(true);await api().centralRecordSupplierPayment(x.po_id,x.amount,x.method,x.reference,x.notes);await refresh();state.selectedPO=x.po_id;render();notice("Supplier payment saved to the finance ledger.","success");}catch(err){notice(err.message||"Supplier payment failed.","error");}finally{busy(false);}});
 const zone=$("#ocZoneForm");if(zone)zone.addEventListener("submit",async e=>{e.preventDefault();const x=formObj(e.currentTarget),w=site(x.website_id);try{busy(true);await api().saveCentralDeliveryZone(w,x);await refresh();notice("Delivery zone saved and synchronized to the storefront checkout.","success");}catch(err){notice(err.message||"Delivery zone save failed.","error");}finally{busy(false);}});
 const profile=$("#ocStoreProfileForm");if(profile)profile.addEventListener("submit",async e=>{e.preventDefault();const x=formObj(e.currentTarget),w=site(x.website_id),zoneNames=(state.data.deliveryZones||[]).filter(z=>z.website_id===w.id&&z.is_active).map(z=>z.name);try{busy(true);await api().saveCentralStoreProfile(w,{...x,areas:zoneNames.length?zoneNames.join("\n"):(w.settings?.delivery?.areas||[]).join("\n")});await refresh();notice("Store contact and delivery policy settings saved.","success");}catch(err){notice(err.message||"Store settings could not be saved.","error");}finally{busy(false);}});
 const finance=$("#ocFinanceForm");if(finance)finance.addEventListener("submit",async e=>{e.preventDefault();const x=formObj(e.currentTarget);try{busy(true);await api().createCentralFinanceEntry(x);await refresh();notice("Finance entry added.","success");}catch(err){notice(err.message||"Finance entry failed.","error");}finally{busy(false);}});
 const ret=$("#ocReturnForm");if(ret)ret.addEventListener("submit",async e=>{e.preventDefault();const x=formObj(e.currentTarget);try{busy(true);await api().createCentralReturn(x);await refresh();notice("Return request created.","success");}catch(err){notice(err.message||"Return request failed.","error");}finally{busy(false);}});
 const tier=$("#ocTierForm");if(tier)tier.addEventListener("submit",async e=>{e.preventDefault();const x=formObj(e.currentTarget),w=site(x.website_id);try{busy(true);await api().centralSavePriceTier(w,x);await refresh();notice("Wholesale price tier saved.","success");}catch(err){notice(err.message||"Tier save failed.","error");}finally{busy(false);}});
 $$("[data-customer-tier]").forEach(el=>el.addEventListener("change",()=>{const id=el.dataset.customerTier;state.pendingCustomerTiers=state.pendingCustomerTiers||{};state.pendingCustomerTiers[id]=el.value;}));
}
function busy(on){$$("button[type=submit]").forEach(b=>{if(on){b.dataset.wasDisabled=b.disabled?"1":"0";b.disabled=true;}else if(b.dataset.wasDisabled!==undefined){b.disabled=b.dataset.wasDisabled==="1";delete b.dataset.wasDisabled;}});}
async function refresh(){
 try{status("Syncing business operations…");state.data=await api().loadCentralCommerce();const websites=state.data.websites||[];status("Neon connected · "+websites.length+" business websites");const sel=$("#ocStoreFilter");if(sel){const value=state.store,categories=[...new Set(websites.map(w=>w.category_slug||"other"))];const categoryOptions=categories.map(category=>{const count=websites.filter(w=>(w.category_slug||"other")===category).length;return '<option value="category:'+esc(category)+'">All '+esc(categoryLabel(category))+' businesses ('+count+')</option>';}).join("");const siteOptions=websites.map(w=>'<option value="'+esc(w.id)+'">'+esc(w.brand?.name||w.name)+' · '+esc(categoryLabel(w.category_slug))+'</option>').join("");sel.innerHTML='<option value="all">All businesses ('+websites.length+')</option>'+categoryOptions+(siteOptions?'<optgroup label="Individual websites">'+siteOptions+'</optgroup>':"");const validCategory=value.startsWith("category:")&&categories.includes(value.slice(9));sel.value=websites.some(w=>w.id===value)||validCategory||value==="all"?value:"all";state.store=sel.value;}render();}
 catch(e){status("Secure data connection failed");notice(e.message||"Central commerce data could not be loaded.","error");$("#ocMain").innerHTML='<div class="oc-empty">The central workspace could not connect to Neon. Check the owner session, then refresh the page.</div>';}
}
function downloadCsv(filename,headers,rows){
 const csv=[headers,...rows].map(row=>row.map(csvCell).join(",")).join("\r\n"),blob=new Blob(["\ufeff",csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);
}
function globalAction(action,id){
 if(action==="tab"){state.tab=id;state.search="";render();return;}
 if(action==="select-business"){state.store=id;state.tab="overview";const filter=$("#ocStoreFilter");if(filter)filter.value=id;render();return;}
 if(action==="select-scope"){state.store=id;state.tab="overview";const filter=$("#ocStoreFilter");if(filter)filter.value=id;render();return;}
 if(action==="new-product"){state.editingProduct=null;state.tab="products";render();return;}
 if(action==="cancel-product"){state.editingProduct=null;render();return;}
 if(action==="edit-product"){state.editingProduct=id;state.tab="products";render();return;}
 if(action==="select-stock"){state.tab="products";render();const el=$("#ocStockForm select[name=product_id]");if(el)el.value=id;return;}
 if(action==="view-order"){state.selectedOrder=id;state.tab="orders";render();return;}
 if(action==="edit-supplier"){state.editSupplier=id;state.tab="suppliers";render();return;}
 if(action==="cancel-supplier"){state.editSupplier=null;render();return;}
 if(action==="receive-po"||action==="pay-supplier"){state.selectedPO=id;state.tab="purchasing";render();return;}
 if(action==="close-po"){state.selectedPO=null;render();return;}
 if(action==="toggle-zone"){const zone=state.data.deliveryZones.find(z=>z.id===id),w=site(zone?.website_id);if(w)api().setCentralZoneActive(w,id,!zone.is_active).then(refresh).then(()=>notice("Delivery zone state updated.","success")).catch(e=>notice(e.message,"error"));return;}
 if(action==="save-customer"){const row=state.data.customers.find(c=>c.id===id),tier=$('[data-customer-tier="'+id+'"]')?.value||state.pendingCustomerTiers?.[id]||row.vip_tier||"standard",blocked=$('[data-customer-block="'+id+'"]')?.checked||false;api().saveCentralCustomer({...row,vip_tier:tier,blocked}).then(refresh).then(()=>notice("Customer profile saved.","success")).catch(e=>notice(e.message,"error"));return;}
 if(action==="return-status"||action==="return-reject"){const status=action==="return-status"?"approved":"rejected";api().updateCentralReturn(id,status).then(refresh).then(()=>notice("Return request updated.","success")).catch(e=>notice(e.message,"error"));return;}
 if(action==="export-products"){const rows=scoped(state.data.products).map(p=>[siteName(p.website_id),p.name,p.sku,p.price,p.stock,p.unit,p.is_active,p.attributes?.demo===true?"demo":p.attributes?.inventory_verified?"verified":"unverified",p.attributes?.barcode,p.attributes?.pack_size]);downloadCsv("central-products.csv",["store","name","sku","price","stock","unit","active","inventory_status","barcode","pack_size"],rows);return;}
 if(action==="export-orders"){const rows=scoped(state.data.orders).map(o=>[o.order_number,siteName(o.website_id),o.customer?.name,o.customer?.phone,o.subtotal,o.delivery_fee,o.total,o.payment_method,o.payment_status,o.status,o.created_at]);downloadCsv("central-orders.csv",["order_number","store","customer","phone","subtotal","delivery_fee","total","payment_method","payment_status","status","created_at"],rows);return;}
}
function init(){
 const ready=window.WPAuthReady;if(!ready||typeof ready.then!=="function"){notice("Authentication service is unavailable.","error");return;}
 ready.then(async session=>{if(!session?.user?.id){notice("Sign in with the authorized owner account.","error");return;}await refresh();}).catch(e=>notice(e.message||"Secure sign-in failed.","error"));
 $("#ocNav").addEventListener("click",e=>{const b=e.target.closest("button[data-tab]");if(b){state.tab=b.dataset.tab;state.search="";state.editingProduct=null;render();}});
 $("#ocRefresh").addEventListener("click",()=>refresh());
 $("#ocStoreFilter").addEventListener("change",e=>{state.store=e.target.value;state.search="";state.selectedOrder=null;state.selectedPO=null;state.tab="overview";render();});
 $("#ocMain").addEventListener("click",e=>{const b=e.target.closest("[data-action]");if(b)globalAction(b.dataset.action,b.dataset.id||"");});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();