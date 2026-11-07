/* Halal Food multi-page storefront API.
 * GitHub owns renderer code. Neon owns catalog, pages, tenant content and orders.
 * Admin writes use the current independent Neon Auth session; public reads are restricted by
 * Neon RLS to published websites. No database credentials are shipped to browsers.
 */
(() => {
  "use strict";
  const API_BASE="https://ep-wild-lab-a1jqqu0p.apirest.ap-southeast-1.aws.neon.tech/halal_food_db/rest/v1";
  const ALLOWED_TEMPLATES=new Set(["general-supermarket","fresh-produce","express-grocery","wholesale-bulk"]);
  const $=v=>encodeURIComponent(String(v??""));
  async function getClient(){
    if(!window.HFNeonClientReady)throw new Error("The independent Neon client did not load.");
    return await window.HFNeonClientReady;
  }
  async function authContext(){
    const client=await getClient();
    const {data,error}=await client.auth.getSession();
    if(error)throw new Error("Neon sign-in could not be verified: "+String(error.message||"Authentication error"));
    const session=data?.session,user=session?.user;
    if(!user?.id)throw new Error("Sign in to the independent WordPress workspace before managing this website.");
    return {client,session,user};
  }
  function applyFilters(builder,params){
    for(const [key,raw] of params.entries()){
      if(["select","order","limit","on_conflict"].includes(key))continue;
      const dot=raw.indexOf(".");
      if(dot<1)continue;
      const op=raw.slice(0,dot),value=raw.slice(dot+1);
      if(op==="eq")builder=builder.eq(key,value);
      else if(op==="neq")builder=builder.neq(key,value);
      else if(op==="gt")builder=builder.gt(key,value);
      else if(op==="gte")builder=builder.gte(key,value);
      else if(op==="lt")builder=builder.lt(key,value);
      else if(op==="lte")builder=builder.lte(key,value);
      else if(op==="is")builder=builder.is(key,value==="null"?null:value);
      else if(op==="like")builder=builder.like(key,value);
      else if(op==="ilike")builder=builder.ilike(key,value);
      else if(op==="in")builder=builder.in(key,value.replace(/^\\(|\\)$/g,"").split(",").map(v=>v.replace(/^"|"$/g,"")));
    }
    const order=params.get("order");
    if(order)for(const part of order.split(",")){const [column,direction]=part.split(".");if(column)builder=builder.order(column,{ascending:direction!=="desc"});}
    const limit=params.get("limit");
    if(limit&&Number.isFinite(Number(limit)))builder=builder.limit(Number(limit));
    return builder;
  }
  async function request(table,query="",options={}){
    const client=await getClient(),method=options.method||"GET",params=new URLSearchParams(query);
    let builder;
    if(table.startsWith("rpc/"))builder=client.rpc(table.slice(4),options.body||{});
    else if(method==="GET")builder=client.from(table).select(params.get("select")||"*");
    else if(method==="POST"){
      const conflict=params.get("on_conflict");
      builder=conflict?client.from(table).upsert(options.body,{onConflict:conflict}):client.from(table).insert(options.body);
      if(params.get("select"))builder=builder.select(params.get("select"));
    }else if(method==="PATCH"){
      builder=client.from(table).update(options.body||{});
      if(params.get("select"))builder=builder.select(params.get("select"));
    }else throw new Error("Unsupported Neon Data API method: "+method);
    if(!table.startsWith("rpc/"))builder=applyFilters(builder,params);
    const {data,error}=await builder;
    if(error)throw new Error("Neon "+table+" request failed: "+String(error.message||error.details||"Unknown database error").slice(0,260));
    return data;
  }
  const defaultContent={
    home:{heading:"A better way to shop, every day",description:"Discover carefully selected favourites, fresh picks and everyday essentials.",cta:"Shop now"},
    shop:{heading:"Shop the collection",description:"Browse our complete selection and find something good.",cta:""},
    category:{heading:"Explore this collection",description:"Thoughtfully selected products for every day.",cta:""},
    product:{heading:"Product details",description:"Quality you can trust, with all the details before you buy.",cta:"Add to cart"},
    search:{heading:"Find what you need",description:"Search the store and discover your next favourite.",cta:""},
    cart:{heading:"Your basket",description:"Review your selections before checkout.",cta:"Continue to checkout"},
    checkout:{heading:"Secure checkout",description:"A few details and your order will be on its way.",cta:"Place order"},
    "order-confirmation":{heading:"Thank you for your order",description:"Your order has been received.",cta:"Continue shopping"},
    "order-tracking":{heading:"Track your order",description:"Enter your order number and phone number to see the latest status.",cta:"Track order"},
    content:{heading:"A little more about us",description:"We believe good products and thoughtful service make everyday life better.",cta:""},
    contact:{heading:"We would love to hear from you",description:"Questions, feedback or a special request? Get in touch.",cta:"Send message"},
    faq:{heading:"How can we help?",description:"Answers to the questions we hear most often.",cta:""},
    legal:{heading:"Information and policies",description:"Please read the information below.",cta:""},
    account:{heading:"Your account",description:"Look up an order or get help with your shopping.",cta:""},
    wishlist:{heading:"Your saved favourites",description:"Keep the products you love in one place.",cta:""}
  };
  function defaultPageDocument(page,templateKey){
    const type=page.page_type||"content",content=defaultContent[type]||defaultContent.content;
    const title=page.title||"New page";
    const slug=page.slug||page.page_key;
    const color={"general-supermarket":"#b94f35","fresh-produce":"#657c4a","express-grocery":"#df6b35","wholesale-bulk":"#344b70"}[templateKey]||"#b94f35";
    const bg={"general-supermarket":"#fbf8f1","fresh-produce":"#f7f7ef","express-grocery":"#f7f8fb","wholesale-bulk":"#f5f7fa"}[templateKey]||"#fbf8f1";
    return {
      schemaVersion:1,site:{templateKey},page:{id:page.page_key||slug,title,pageType:type,slug,seoTitle:title,seoDescription:content.description},
      content:{heading:content.heading,description:content.description,cta:content.cta,sections:page.page_spec?.sections||[]},
      theme:{colors:{primary:color,paper:bg}},
      tree:[{id:"page-"+slug+"-hero",type:"section",label:"Page introduction",props:{background:bg,padding:44,width:"100%",align:"left"},children:[
        {id:"page-"+slug+"-title",type:"heading",label:"Page heading",text:content.heading,props:{color:"#263247",fontSize:38,align:"left",width:"100%"},children:[]},
        {id:"page-"+slug+"-description",type:"paragraph",label:"Page introduction",text:content.description,props:{color:"#68758a",fontSize:16,align:"left",width:"100%"},children:[]}
      ]}]
    };
  }
  async function loadTemplateCatalog(){
    const [catalog,designs]=await Promise.all([
      request("template_catalog","?select=template_key,category_slug,name,tagline,description,business_types,feature_flags,sort_order,is_builtin&is_builtin=eq.true&order=sort_order.asc",{public:true}),
      request("template_designs","?select=template_key,design_version,design_spec,preview_settings,source_commit,is_active&is_active=eq.true&order=design_version.desc",{public:true})
    ]);
    const latest=new Map();(designs||[]).forEach(row=>{if(!latest.has(row.template_key))latest.set(row.template_key,row);});
    const rows=(catalog||[]).filter(row=>ALLOWED_TEMPLATES.has(row.template_key)).map(row=>({...row,design:latest.get(row.template_key)||null}));
    if(rows.length!==4||rows.some(row=>!row.design))throw new Error("Neon catalog is missing one or more active grocery template design records.");
    return rows;
  }
  async function loadTemplatePages(templateKey,options={public:true}){
    if(!ALLOWED_TEMPLATES.has(templateKey))throw new Error("Unsupported grocery template.");
    const rows=await request("template_pages","?select=template_key,page_key,page_type,title,slug,sort_order,page_spec,is_required,is_active&template_key=eq."+$(templateKey)+"&is_active=eq.true&order=sort_order.asc",options);
    if((rows||[]).length<25)throw new Error("Neon page catalog is incomplete for "+templateKey+" (expected 25 designed pages).");
    return rows;
  }
  async function ensureWebsite(templateKey,name){
    if(!ALLOWED_TEMPLATES.has(templateKey))throw new Error("Unsupported grocery template.");
    const {user}=await authContext();
    const query="?select=id,owner_id,name,slug,category_slug,template_key,status,brand,settings&owner_id=eq."+$(user.id)+"&template_key=eq."+$(templateKey)+"&limit=1";
    const found=await request("websites",query);
    if(found?.[0])return found[0];
    const slug="store-"+String(user.id).replace(/-/g,"").slice(0,10)+"-"+templateKey;
    const created=await request("websites","?select=id,owner_id,name,slug,category_slug,template_key,status,brand,settings",{method:"POST",prefer:"return=representation",body:{owner_id:user.id,name:String(name||templateKey).slice(0,120),slug,category_slug:"ecommerce-grocery",template_key:templateKey,status:"draft",brand:{},settings:{builder_version:2,isolated_sandbox:true}}});
    if(!created?.[0])throw new Error("Neon did not return the newly created website record.");
    return created[0];
  }
  async function loadWebsiteDocuments(websiteId){
    return await request("website_documents","?select=id,website_id,owner_id,page_key,schema_version,document,updated_at&website_id=eq."+$(websiteId)+"&order=updated_at.desc");
  }
  async function seedWebsitePages(website,templateKey){
    const [pages,docs]=await Promise.all([loadTemplatePages(templateKey),loadWebsiteDocuments(website.id)]);
    const existing=new Set((docs||[]).map(row=>row.page_key));
    const missing=pages.filter(page=>!existing.has(page.page_key));
    if(missing.length){
      const {user}=await authContext();
      if(website.owner_id!==user.id)throw new Error("Website ownership check failed while preparing page documents.");
      const records=missing.map(page=>({website_id:website.id,owner_id:user.id,page_key:page.page_key,schema_version:1,document:defaultPageDocument(page,templateKey)}));
      const saved=await request("website_documents","?on_conflict=website_id,page_key&select=id,page_key",{method:"POST",prefer:"resolution=merge-duplicates,return=representation",body:records});
      if(!Array.isArray(saved)||saved.length!==missing.length)throw new Error("Neon did not confirm all 25 page drafts.");
    }
    return {pages,documents:await loadWebsiteDocuments(website.id)};
  }
  async function loadPageDocument(templateKey,name,pageKey="home"){
    const website=await ensureWebsite(templateKey,name);
    await seedWebsitePages(website,templateKey);
    const rows=await request("website_documents","?select=id,website_id,owner_id,page_key,schema_version,document,updated_at&website_id=eq."+$(website.id)+"&page_key=eq."+$(pageKey)+"&limit=1");
    return {website,record:rows?.[0]||null,document:rows?.[0]?.document||null};
  }
  async function savePageDocument(website,pageKey,document){
    if(!website?.id||!website?.owner_id)throw new Error("Neon website context is missing.");
    const {user}=await authContext();
    if(website.owner_id!==user.id)throw new Error("Website ownership check failed.");
    if(!/^[a-z0-9][a-z0-9-]{0,79}$/.test(pageKey))throw new Error("Invalid page key.");
    if(!document||document.schemaVersion!==1||!document.page||typeof document.page.title!=="string"||!Array.isArray(document.tree)||document.tree.length>100)throw new Error("The page document did not pass schema validation.");
    const rows=await request("website_documents","?on_conflict=website_id,page_key&select=id,updated_at",{method:"POST",prefer:"resolution=merge-duplicates,return=representation",body:{website_id:website.id,owner_id:user.id,page_key,schema_version:1,document,updated_at:new Date().toISOString()}});
    if(!rows?.[0]?.id)throw new Error("Neon did not confirm that the page was saved.");
    return rows[0];
  }
  async function loadStorefrontData(siteSlug,{token=null,preview=false}={}){
    const opts={public:!preview};
    const websites=await request("websites","?select=id,name,slug,template_key,status,brand,settings&slug=eq."+$(siteSlug)+"&limit=1",opts);
    const website=websites?.[0];
    if(!website||(!preview&&website.status!=="published")){
      const templateKey=String(siteSlug||"").replace(/^hf-/,"");
      if(!ALLOWED_TEMPLATES.has(templateKey))throw new Error("This storefront address is not linked to a supported template.");
      const pages=await loadTemplatePages(templateKey,{public:true});
      return {
        website:{id:null,owner_id:null,name:"Template preview",slug:siteSlug,template_key:templateKey,status:"preview",brand:{},settings:{template_preview:true}},
        pages,documents:[],categories:[],products:[],deliveryZones:[],priceTiers:[],previewOnly:true
      };
    }
    if(preview){
      const client=await getClient();
      const {data,error}=await client.auth.getSession();
      if(error||!data?.session?.user?.id)throw new Error("Sign in to the independent WordPress workspace to preview this draft.");
    }
    const [pages,documents,categories,products,deliveryZones,priceTiers]=await Promise.all([
      loadTemplatePages(website.template_key,opts),
      request("website_documents","?select=page_key,schema_version,document,updated_at&website_id=eq."+$(website.id),opts),
      request("categories","?select=id,name,slug,parent_id,sort_order,is_active&website_id=eq."+$(website.id)+"&is_active=eq.true&order=sort_order.asc",opts),
      request("products","?select=id,category_id,name,description,sku,price,compare_at_price,unit,stock,image_url,gallery,attributes,sort_order&website_id=eq."+$(website.id)+"&is_active=eq.true&order=sort_order.asc",opts),
      request("delivery_zones","?select=id,name,normalized_name,delivery_fee,minimum_order,eta_label&website_id=eq."+$(website.id)+"&is_active=eq.true&order=name.asc",opts),
      request("product_price_tiers","?select=id,product_id,minimum_quantity,unit_price,label&website_id=eq."+$(website.id)+"&is_active=eq.true&order=minimum_quantity.asc",opts)
    ]);
    return {website,pages,documents:documents||[],categories:categories||[],products:products||[],deliveryZones:deliveryZones||[],priceTiers:priceTiers||[],previewOnly:false};
  }
  async function placeOrder(siteSlug,items,customer,shippingAddress,notes="",idempotencyKey=""){
    if(!/^[a-f0-9]{32}$/.test(String(idempotencyKey)))throw new Error("A secure checkout retry key is required. Please refresh checkout and try again.");
    return await request("rpc/place_storefront_order_idempotent","",{method:"POST",public:true,body:{p_website_slug:siteSlug,p_items:items,p_customer:customer,p_shipping_address:shippingAddress,p_notes:notes,p_idempotency_key:idempotencyKey}});
  }
  async function submitReturnRequest(siteSlug,orderNumber,phone,reason,notes=""){
    return await request("rpc/submit_storefront_return_request","",{method:"POST",public:true,body:{p_website_slug:siteSlug,p_order_number:orderNumber,p_phone:phone,p_reason:reason,p_notes:notes}});
  }
  async function submitQuoteRequest(siteSlug,business,items,notes=""){
    return await request("rpc/submit_storefront_quote_request","",{method:"POST",public:true,body:{p_website_slug:siteSlug,p_business:business,p_items:items,p_notes:notes}});
  }
  async function trackOrder(siteSlug,orderNumber,phone){
    return await request("rpc/track_storefront_order","",{method:"POST",public:true,body:{p_website_slug:siteSlug,p_order_number:orderNumber,p_phone:phone}});
  }
  async function getWebsiteStats(website){
    if(!website?.id)throw new Error("Website context is missing.");
    const [products,categories,docs]=await Promise.all([
      request("products","?select=id&website_id=eq."+$(website.id)+"&is_active=eq.true&limit=500"),
      request("categories","?select=id&website_id=eq."+$(website.id)+"&is_active=eq.true&limit=500"),
      loadWebsiteDocuments(website.id)
    ]);
    return {products:(products||[]).length,categories:(categories||[]).length,pages:(docs||[]).length};
  }
  async function loadWebsiteOrders(website){
    if(!website?.id||!website?.owner_id)throw new Error("Website context is missing.");
    const {user}=await authContext();
    if(website.owner_id!==user.id)throw new Error("Website ownership check failed.");
    return await request("orders","?select=id,order_number,customer,shipping_address,subtotal,delivery_fee,discount,total,payment_method,payment_status,status,notes,created_at,order_items(id,product_snapshot,quantity,unit_price,line_total)&website_id=eq."+$(website.id)+"&owner_id=eq."+$(user.id)+"&order=created_at.desc&limit=250");
  }
  async function updateOrderStatus(website,orderId,status){
    const allowed=new Set(["pending","processing","shipped","delivered","cancelled"]);
    if(!allowed.has(status))throw new Error("Unsupported order status.");
    const {user}=await authContext();
    if(!website?.id||website.owner_id!==user.id)throw new Error("Website ownership check failed.");
    const result=await request("rpc/update_storefront_order_status","",{method:"POST",body:{p_website_id:website.id,p_order_id:orderId,p_status:status}});
    if(!result?.id||result.id!==orderId)throw new Error("Neon did not confirm the order status update.");
    return result;
  }
  async function createCustomPage(website,templateKey,title){
    const clean=String(title||"").trim().slice(0,80);
    if(clean.length<2)throw new Error("Page title must contain at least two characters.");
    const slug=clean.toLowerCase().normalize("NFKD").replace(/[\\u0300-\\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,60);
    if(!slug)throw new Error("Please choose a page title using letters or numbers.");
    const pageKey="custom-"+slug;
    const docs=await loadWebsiteDocuments(website.id);
    if((docs||[]).some(row=>row.page_key===pageKey))throw new Error("A page with this address already exists.");
    const page={page_key:pageKey,page_type:"content",title:clean,slug,page_spec:{sections:["page-hero","rich-content","footer"]}};
    const document=defaultPageDocument(page,templateKey);
    await savePageDocument(website,pageKey,document);
    return page;
  }
  async function getPublishPreflight(website,brandOverride=null,settingsOverride=null){
    const {user}=await authContext();
    if(!website?.id||website.owner_id!==user.id)throw new Error("Website ownership check failed.");
    const brand={...(website.brand||{}),...(brandOverride||{})},inputSettings=settingsOverride||{};
    const settings={...(website.settings||{}),...inputSettings,contact:{...(website.settings?.contact||{}),...(inputSettings.contact||{})},delivery:{...(website.settings?.delivery||{}),...(inputSettings.delivery||{})}};
    const [products,categories,zones,pages,documents]=await Promise.all([
      request("products","?select=id,name,sku,description,image_url,price,stock,attributes&website_id=eq."+$(website.id)+"&is_active=eq.true&limit=1000"),
      request("categories","?select=id&website_id=eq."+$(website.id)+"&is_active=eq.true&limit=1000"),
      request("delivery_zones","?select=id,name,delivery_fee,minimum_order&website_id=eq."+$(website.id)+"&is_active=eq.true&limit=500").catch(()=>[]),
      loadTemplatePages(website.template_key,{public:false}),
      loadWebsiteDocuments(website.id)
    ]);
    const rows=products||[],zoneRows=zones||[],docRows=documents||[],contact=settings.contact||{};
    const areas=Array.isArray(settings.delivery?.areas)?settings.delivery.areas:[];
    const payment=settings.payment||settings.payments||{},methods=Array.isArray(payment.methods)?payment.methods:[];
    const codEnabled=payment.cod_enabled===true||settings.payment_methods?.includes?.("cod")===true||methods.some(m=>(typeof m==="string"?m:m?.code)==="cod"&&(typeof m==="string"||m?.enabled===true));
    const docMap=new Map(docRows.map(d=>[d.page_key,d.document||{}]));
    const hasLegalPage=key=>{const d=docMap.get(key),c=d?.content||{};return !!d&&(String(c.description||"").trim().length>=30||(Array.isArray(c.blocks)&&c.blocks.length>0)||(Array.isArray(c.sections)&&c.sections.length>0));};
    const invalidProducts=rows.filter(p=>!p.sku||!String(p.image_url||"").startsWith("https://")||String(p.description||"").trim().length<20||!Number.isFinite(Number(p.price))||Number(p.price)<=0||!Number.isFinite(Number(p.stock))||Number(p.stock)<0);
    const unverified=rows.filter(p=>p.attributes?.demo===true||p.attributes?.inventory_verified!==true);
    const invalidZones=zoneRows.filter(z=>!String(z.name||"").trim()||!Number.isFinite(Number(z.delivery_fee))||Number(z.delivery_fee)<0||!Number.isFinite(Number(z.minimum_order))||Number(z.minimum_order)<0);
    const phone=String(brand.phone||contact.phone||"").trim(),email=String(brand.email||contact.email||"").trim(),address=String(brand.address||contact.address||"").trim();
    const missingPages=pages.filter(p=>p.is_required&&!docMap.has(p.page_key));
    const checks=[
      {key:"demo_catalog",label:"Demo catalogue is disabled",passed:settings.demo_catalog===false,detail:"Set demo catalogue mode to false only after replacing all sample data."},
      {key:"real_products",label:"Real products only",passed:rows.length>0&&rows.every(p=>p.attributes?.demo!==true),detail:"Add at least one active real product and archive every demo product."},
      {key:"inventory_verified",label:"Inventory is verified",passed:rows.length>0&&unverified.length===0,detail:"Verify stock for every active product (attributes.inventory_verified = true)."},
      {key:"price_stock",label:"Prices, descriptions and images are valid",passed:rows.length>0&&invalidProducts.length===0,detail:"Every product needs a SKU, HTTPS image, useful description, positive price and non-negative stock."},
      {key:"categories",label:"At least one active category",passed:(categories||[]).length>0,detail:"Create at least one active product category."},
      {key:"delivery",label:"Delivery coverage is configured",passed:zoneRows.length>0||areas.length>0,detail:"Create active delivery zones or configure actual delivery areas."},
      {key:"delivery_values",label:"Delivery fees and minimums are valid",passed:zoneRows.length===0||invalidZones.length===0,detail:"Complete every active delivery zone name, fee and minimum order."},
      {key:"cod",label:"Cash on delivery is explicitly enabled",passed:codEnabled,detail:"Enable COD in payment settings. Online gateways remain unavailable until separately integrated and tested."},
      {key:"store_profile",label:"Store profile and contact details are complete",passed:!!String(brand.name||website.name||"").trim()&&!!address&&!!(phone||email),detail:"Add a store name, full address and at least one customer contact method."},
      {key:"privacy",label:"Privacy policy is prepared",passed:hasLegalPage("privacy"),detail:"Complete the Privacy Policy page with the store's actual data-handling practices."},
      {key:"terms",label:"Terms and conditions are prepared",passed:hasLegalPage("terms"),detail:"Complete Terms & Conditions with the actual purchase and service terms."},
      {key:"required_pages",label:"Required template pages are present",passed:missingPages.length===0,detail:"Create or restore all required page documents for this template."}
    ];
    return {website_id:website.id,template_key:website.template_key,ready:checks.every(c=>c.passed),checks,blockers:checks.filter(c=>!c.passed),counts:{products:rows.length,categories:(categories||[]).length,delivery_zones:zoneRows.length,documents:docRows.length}};
  }
  async function publishWebsite(website,brand,settings){
    const {user}=await authContext();
    if(!website?.id||website.owner_id!==user.id)throw new Error("Website ownership check failed.");
    const preflight=await getPublishPreflight(website,brand,settings);
    if(!preflight.ready){
      const details=preflight.blockers.map(item=>"• "+item.label+": "+item.detail).join("\n");
      const error=new Error("Website is not ready to publish. Complete these checks first:\n"+details);
      error.preflight=preflight;
      throw error;
    }
    const mergedBrand={...(website.brand||{}),...(brand||{})},inputSettings=settings||{};
    const mergedSettings={...(website.settings||{}),...inputSettings,contact:{...(website.settings?.contact||{}),...(inputSettings.contact||{})},delivery:{...(website.settings?.delivery||{}),...(inputSettings.delivery||{})}};
    const result=await request("websites","?id=eq."+$(website.id)+"&owner_id=eq."+$(user.id)+"&select=id,status,updated_at",{method:"PATCH",prefer:"return=representation",body:{status:"published",brand:mergedBrand,settings:mergedSettings,updated_at:new Date().toISOString()}});
    if(!result?.[0])throw new Error("Neon did not confirm the publish status.");
    return {...result[0],preflight};
  }
  window.HFNeonBuilderApi=Object.freeze({apiBase:API_BASE,loadTemplateCatalog,loadTemplatePages,ensureWebsite,loadWebsiteDocuments,seedWebsitePages,loadPageDocument,savePageDocument,loadDocument:loadPageDocument,saveDocument:(website,document,pageKey="home")=>savePageDocument(website,pageKey,document),loadStorefrontData,placeOrder,trackOrder,submitReturnRequest,submitQuoteRequest,getWebsiteStats,loadWebsiteOrders,updateOrderStatus,createCustomPage,getPublishPreflight,publishWebsite,defaultPageDocument});
})();
