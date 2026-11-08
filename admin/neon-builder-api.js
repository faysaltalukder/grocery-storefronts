/* Independent WordPress/Grocery API.
 * GitHub hosts renderer code. The dedicated Neon branch owns authentication,
 * templates, tenant content, catalogue and orders. Neon SDK manages guest and
 * signed-in sessions. No Halal Food credentials or backend services are used.
 */
(() => {
  "use strict";
  const API_BASE="https://ep-wild-lab-a1jqqu0p.apirest.ap-southeast-1.aws.neon.tech/halal_food_db/rest/v1";
  const ALLOWED_TEMPLATES=new Set(["general-supermarket","fresh-produce","express-grocery","wholesale-bulk","modern-fashion-brand","boutique-ethnic-wear","streetwear-sneaker-store","fashion-retailer","modern-pharmacy","carewell-health-store","clinic-medical-supplies","express-medicine-delivery","multispecialty-hospital","diagnostics-laboratory","specialist-clinic","telehealth-platform","estate-luxe","nestliving-rentals","urbanaxis-commercial","horizon-developments"]);
  const TEMPLATE_CATEGORIES={"general-supermarket":"ecommerce-grocery","fresh-produce":"ecommerce-grocery","express-grocery":"ecommerce-grocery","wholesale-bulk":"ecommerce-grocery","modern-fashion-brand":"clothing-fashion","boutique-ethnic-wear":"clothing-fashion","streetwear-sneaker-store":"clothing-fashion","fashion-retailer":"clothing-fashion","modern-pharmacy":"medicine-pharmacy","carewell-health-store":"medicine-pharmacy","clinic-medical-supplies":"medicine-pharmacy","express-medicine-delivery":"medicine-pharmacy","multispecialty-hospital":"hospital-healthcare","diagnostics-laboratory":"hospital-healthcare","specialist-clinic":"hospital-healthcare","telehealth-platform":"hospital-healthcare","estate-luxe":"real-estate-property","nestliving-rentals":"real-estate-property","urbanaxis-commercial":"real-estate-property","horizon-developments":"real-estate-property"};
  const $=v=>encodeURIComponent(String(v??""));
  async function getClient(){
    if(!window.WPNeonClientReady)throw new Error("The independent Neon authentication client did not load.");
    return await window.WPNeonClientReady;
  }
  async function authContext(){
    const client=await getClient();
    const {data,error}=await client.auth.getSession();
    const session=data?.session;
    const user=data?.user;
    if(error||!user?.id)throw new Error("Sign in to the WordPress workspace before managing this website.");
    return {client,session,user,token:null};
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
      else if(op==="in"){
        const list=value.replace(/^\(|\)$/g,"").split(",").map(v=>v.replace(/^"|"$/g,""));
        builder=builder.in(key,list);
      }
    }
    const order=params.get("order");
    if(order)for(const part of order.split(",")){
      const [column,direction]=part.split(".");
      if(column)builder=builder.order(column,{ascending:direction!=="desc"});
    }
    const limit=params.get("limit");
    if(limit&&Number.isFinite(Number(limit)))builder=builder.limit(Number(limit));
    return builder;
  }
  async function request(table,query="",options={}){
    const client=await getClient(),method=options.method||"GET",params=new URLSearchParams(query);
    let builder;
    if(table.startsWith("rpc/")){
      builder=client.rpc(table.slice(4),options.body||{});
    }else if(method==="GET"){
      builder=client.from(table).select(params.get("select")||"*");
    }else if(method==="POST"){
      const conflict=params.get("on_conflict");
      builder=conflict
        ?client.from(table).upsert(options.body,{onConflict:conflict})
        :client.from(table).insert(options.body);
      if(params.get("select"))builder=builder.select(params.get("select"));
    }else if(method==="PATCH"){
      builder=client.from(table).update(options.body||{});
      if(params.get("select"))builder=builder.select(params.get("select"));
    }else{
      throw new Error("Unsupported Neon Data API method: "+method);
    }
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
    const custom=page.page_spec?.content||{};
    const heading=custom.heading||content.heading;
    const description=custom.description||content.description;
    const blocks=Array.isArray(custom.blocks)?custom.blocks:[];
    const color={"general-supermarket":"#b94f35","fresh-produce":"#657c4a","express-grocery":"#df6b35","wholesale-bulk":"#344b70","modern-fashion-brand":"#9b7458","boutique-ethnic-wear":"#a05d48","streetwear-sneaker-store":"#d6ff3f","fashion-retailer":"#426b77","multispecialty-hospital":"#176b87","diagnostics-laboratory":"#376e9b","specialist-clinic":"#8a5a5b","telehealth-platform":"#4d5da6","modern-pharmacy":"#168b83","carewell-health-store":"#6b8f7a","clinic-medical-supplies":"#3e7189","express-medicine-delivery":"#1d8c98","estate-luxe":"#a98755","nestliving-rentals":"#b66d52","urbanaxis-commercial":"#3e7189","horizon-developments":"#a66b49"}[templateKey]||"#b94f35";
    const bg={"general-supermarket":"#fbf8f1","fresh-produce":"#f7f7ef","express-grocery":"#f7f8fb","wholesale-bulk":"#f5f7fa","modern-fashion-brand":"#f7f4ef","boutique-ethnic-wear":"#f8f2eb","streetwear-sneaker-store":"#f1f0ed","fashion-retailer":"#f6f7f8","multispecialty-hospital":"#f3f8fa","diagnostics-laboratory":"#f2f6fa","specialist-clinic":"#faf5f1","telehealth-platform":"#f4f5fc","modern-pharmacy":"#f3faf8","carewell-health-store":"#f4f7f3","clinic-medical-supplies":"#f1f5f7","express-medicine-delivery":"#f2f8f8","estate-luxe":"#f6f3ed","nestliving-rentals":"#f8f4ee","urbanaxis-commercial":"#f1f5f7","horizon-developments":"#f4f3ef"}[templateKey]||"#fbf8f1";
    return {
      schemaVersion:1,site:{templateKey},page:{id:page.page_key||slug,title,pageType:type,slug,seoTitle:page.page_spec?.seo?.title||title,seoDescription:page.page_spec?.seo?.description||description},
      content:{heading,description,cta:custom.cta||content.cta,blocks,faqs:Array.isArray(custom.faqs)?custom.faqs:[],resources:Array.isArray(custom.resources)?custom.resources:[],listings:Array.isArray(custom.listings)?custom.listings:[],featuredProperty:custom.featuredProperty||null,sections:page.page_spec?.sections||[]},
      theme:{colors:{primary:color,paper:bg}},
      tree:[{id:"page-"+slug+"-hero",type:"section",label:"Page introduction",props:{background:bg,padding:44,width:"100%",align:"left"},children:[
        {id:"page-"+slug+"-title",type:"heading",label:"Page heading",text:heading,props:{color:"#263247",fontSize:38,align:"left",width:"100%"},children:[]},
        {id:"page-"+slug+"-description",type:"paragraph",label:"Page introduction",text:description,props:{color:"#68758a",fontSize:16,align:"left",width:"100%"},children:[]}
      ]}]
    };
  }
  async function loadTemplateCatalog(categorySlug=null){
    const [catalog,designs]=await Promise.all([
      request("template_catalog","?select=template_key,category_slug,name,tagline,description,business_types,feature_flags,sort_order,is_builtin&is_builtin=eq.true&order=sort_order.asc",{public:true}),
      request("template_designs","?select=template_key,design_version,design_spec,preview_settings,source_commit,is_active&is_active=eq.true&order=design_version.desc",{public:true})
    ]);
    const latest=new Map();(designs||[]).forEach(row=>{if(!latest.has(row.template_key))latest.set(row.template_key,row);});
    const rows=(catalog||[]).filter(row=>ALLOWED_TEMPLATES.has(row.template_key)&&(!categorySlug||row.category_slug===categorySlug)).map(row=>({...row,design:latest.get(row.template_key)||null}));
    if(!rows.length||rows.some(row=>!row.design))throw new Error("Neon catalog is missing one or more active template design records"+(categorySlug?" for "+categorySlug:"")+".");
    if(categorySlug&&rows.length!==4)throw new Error("Neon catalog must return exactly four templates for "+categorySlug+"; received "+rows.length+".");
    return rows;
  }
  async function loadTemplatePages(templateKey){
    if(!ALLOWED_TEMPLATES.has(templateKey))throw new Error("Unsupported storefront template.");
    const rows=await request("template_pages","?select=template_key,page_key,page_type,title,slug,sort_order,page_spec,is_required,is_active&template_key=eq."+$(templateKey)+"&is_active=eq.true&order=sort_order.asc",{public:true});
    const pageCount=(rows||[]).length;const healthcareTemplates=["multispecialty-hospital","diagnostics-laboratory","specialist-clinic","telehealth-platform"];const realEstateTemplates=["estate-luxe","nestliving-rentals","urbanaxis-commercial","horizon-developments"];if(healthcareTemplates.includes(templateKey)&&pageCount!==40)throw new Error("Healthcare page catalog is incomplete for "+templateKey+" (expected exactly 40 designed pages; Neon returned "+pageCount+").");if(realEstateTemplates.includes(templateKey)&&pageCount!==40)throw new Error("Real Estate page catalog is incomplete for "+templateKey+" (expected exactly 40 designed pages; Neon returned "+pageCount+").");if(!healthcareTemplates.includes(templateKey)&&!realEstateTemplates.includes(templateKey)&&pageCount<25)throw new Error("Neon page catalog is incomplete for "+templateKey+" (expected at least 25 designed pages; Neon returned "+pageCount+").");if(realEstateTemplates.includes(templateKey)){const imageRows=(rows||[]).map(page=>({key:page.page_key,images:page.page_spec?.media?.images||[],count:page.page_spec?.media?.imageCount}));const invalid=imageRows.find(page=>page.key==="home"?page.images.length!==5||page.count!==5:page.images.length<2||page.images.length>4||page.count!==page.images.length);if(invalid)throw new Error("Real Estate image allocation failed for "+templateKey+" page "+invalid.key+".");const ids=imageRows.flatMap(page=>page.images.map(image=>String(image.id||"")));if(ids.length!==83||new Set(ids).size!==83)throw new Error("Real Estate template "+templateKey+" must contain exactly 83 unique image assets across its 40 pages.");if(imageRows.some(page=>page.images.some(image=>/^https?:\/\//i.test(String(image.src||"")))))throw new Error("Real Estate template "+templateKey+" contains an external image source; use first-party original art.");}
    return rows;
  }
  async function ensureWebsite(templateKey,name){
    if(!ALLOWED_TEMPLATES.has(templateKey))throw new Error("Unsupported grocery template.");
    const {user}=await authContext();
    const query="?select=id,owner_id,name,slug,category_slug,template_key,status,brand,settings&owner_id=eq."+$(user.id)+"&template_key=eq."+$(templateKey)+"&limit=1";
    const found=await request("websites",query);
    if(found?.[0])return found[0];
    const slug="store-"+String(user.id).replace(/-/g,"").slice(0,10)+"-"+templateKey;
    const created=await request("websites","?select=id,owner_id,name,slug,category_slug,template_key,status,brand,settings",{method:"POST",prefer:"return=representation",body:{owner_id:user.id,name:String(name||templateKey).slice(0,120),slug,category_slug:TEMPLATE_CATEGORIES[templateKey]||"ecommerce-grocery",template_key:templateKey,status:"draft",brand:{},settings:{builder_version:2,isolated_sandbox:true}}});
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
      if(!Array.isArray(saved)||saved.length!==missing.length)throw new Error("Neon did not confirm all "+missing.length+" page drafts.");
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
  async function loadOwnerWebsites(){
    const {user}=await authContext();
    return await request("websites","?select=id,owner_id,name,slug,category_slug,template_key,status,brand,settings,created_at,updated_at&owner_id=eq."+$(user.id)+"&order=updated_at.desc");
  }
  async function publishShowcaseWebsite(website){
    const {user}=await authContext();
    if(!website?.id||website.owner_id!==user.id)throw new Error("Website ownership check failed before showcase publish.");
    if(website.status==="published"&&website.settings?.demo_catalog!==true)return website;
    const [products,categories]=await Promise.all([
      request("products","?select=id&website_id=eq."+$(website.id)+"&is_active=eq.true&limit=1"),
      request("categories","?select=id&website_id=eq."+$(website.id)+"&is_active=eq.true&limit=1")
    ]);
    if((products||[]).length||(categories||[]).length)throw new Error("This website contains merchant catalogue data. Use the normal verified publishing workflow instead of showcase publishing.");
    const seeded=await seedWebsitePages(website,website.template_key);
    if(seeded.pages.length<25||seeded.documents.length!==seeded.pages.length)throw new Error("Showcase publish blocked: the website does not have a complete saved page set.");
    const settings={...(website.settings||{}),builder_version:2,isolated_sandbox:true,demo_catalog:true,showcase_mode:true,orders_enabled:false,checkout_enabled:false,appointments_enabled:false,enquiries_enabled:false,showcase_notice:"Template showcase only. All content is illustrative; no orders, appointments or enquiries are accepted."};
    const rows=await request("websites","?id=eq."+$(website.id)+"&owner_id=eq."+$(user.id)+"&select=id,owner_id,name,slug,category_slug,template_key,status,brand,settings,updated_at",{method:"PATCH",body:{status:"published",settings,updated_at:new Date().toISOString()}});
    if(!rows?.[0]||rows[0].status!=="published")throw new Error("Neon did not confirm the public showcase publish.");
    return rows[0];
  }
  async function loadStorefrontData(siteSlug,{token=null,preview=false}={}){
    let opts={public:true};
    let websites=await request("websites","?select=id,name,slug,template_key,status,brand,settings&slug=eq."+$(siteSlug)+"&limit=1",opts);
    let website=websites?.[0];
    const publicDemo=!!website&&website.status==="published"&&website.settings?.demo_catalog===true;
    if(preview&&!publicDemo){
      opts=token?{token}:{};
      websites=await request("websites","?select=id,owner_id,name,slug,template_key,status,brand,settings&slug=eq."+$(siteSlug)+"&limit=1",opts);
      website=websites?.[0];
      if(!website)throw new Error("Storefront not found or not available for preview.");
      const {user}=await authContext();
      if(!user?.id)throw new Error("Sign in to the independent WordPress workspace to preview this draft.");
      if(website.owner_id!==user.id)throw new Error("Storefront ownership verification failed.");
    }
    if(!website)throw new Error("Storefront not found or not published.");
    if(website.status!=="published"&&!preview)throw new Error("This storefront is not published yet.");
    let pages,documents;
    if(preview&&website.status!=="published"){
      // Draft previews must be self-contained: seed every missing page document
      // before the storefront renderer tries to resolve its requested page.
      const seeded=await seedWebsitePages(website,website.template_key);
      pages=seeded.pages;
      documents=seeded.documents||[];
    }else{
      [pages,documents]=await Promise.all([
        loadTemplatePages(website.template_key),
        request("website_documents","?select=page_key,schema_version,document,updated_at&website_id=eq."+$(website.id),opts)
      ]);
    }
    const [categories,products,deliveryZones,priceTiers]=await Promise.all([
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
  async function submitQuoteRequest(siteSlug,business,items,notes=""){
    return await request("rpc/submit_storefront_quote_request","",{method:"POST",public:true,body:{p_website_slug:siteSlug,p_business:business,p_items:items,p_notes:notes}});
  }
  async function submitReturnRequest(siteSlug,orderNumber,phone,reason,notes=""){
    return await request("rpc/submit_storefront_return_request","",{method:"POST",public:true,body:{p_website_slug:siteSlug,p_order_number:orderNumber,p_phone:phone,p_reason:reason,p_notes:notes}});
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
    const slug=clean.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,60);
    if(!slug)throw new Error("Please choose a page title using letters or numbers.");
    const pageKey="custom-"+slug;
    const docs=await loadWebsiteDocuments(website.id);
    if((docs||[]).some(row=>row.page_key===pageKey))throw new Error("A page with this address already exists.");
    const page={page_key:pageKey,page_type:"content",title:clean,slug,page_spec:{sections:["page-hero","rich-content","footer"]}};
    const document=defaultPageDocument(page,templateKey);
    await savePageDocument(website,pageKey,document);
    return page;
  }
  async function saveWebsiteProfile(website,input){
    const user=await verifyWebsiteOwner(website);
    const current=await request("websites","?select=brand,settings&id=eq."+$(website.id)+"&owner_id=eq."+$(user.id)+"&limit=1");
    if(!current?.[0])throw new Error("Website settings could not be loaded.");
    const oldBrand=current[0].brand||website.brand||{},oldSettings=current[0].settings||website.settings||{};
    const phone=String(input?.phone||"").trim().slice(0,40),email=String(input?.email||"").trim().slice(0,160),address=String(input?.address||"").trim().slice(0,240),hours=String(input?.hours||"").trim().slice(0,160);
    if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error("Enter a valid support email address.");
    const areas=[...new Set(String(input?.areas||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean))].slice(0,100);
    const fee=Number(input?.default_fee);if(!Number.isFinite(fee)||fee<0)throw new Error("Delivery fee must be zero or greater.");
    const note=String(input?.note||"").trim().slice(0,500);
    const brand={...oldBrand,phone,email,address};
    const settings={...oldSettings,contact:{...(oldSettings.contact||{}),phone,email,address,hours},delivery:{...(oldSettings.delivery||{}),areas,default_fee:fee,note}};
    const rows=await request("websites","?id=eq."+$(website.id)+"&owner_id=eq."+$(user.id)+"&select=id,brand,settings,updated_at",{method:"PATCH",body:{brand,settings,updated_at:new Date().toISOString()}});
    if(!rows?.[0])throw new Error("Store operations update was not confirmed.");return rows[0];
  }
  async function verifyWebsiteCatalog(website){
    const user=await verifyWebsiteOwner(website);
    const products=await request("products","?select=id,attributes&website_id=eq."+$(website.id)+"&owner_id=eq."+$(user.id)+"&is_active=eq.true&limit=500");
    if(!products?.length)throw new Error("Add real products before verifying the catalogue.");
    const unverified=products.filter(p=>p.attributes?.demo===true||p.attributes?.inventory_verified!==true);
    if(unverified.length)throw new Error(unverified.length+" active products are still marked as sample/demo or have not been verified. Verify or archive them first.");
    const current=await request("websites","?select=settings&id=eq."+$(website.id)+"&owner_id=eq."+$(user.id)+"&limit=1");
    const settings={...(current?.[0]?.settings||website.settings||{}),demo_catalog:false};
    const rows=await request("websites","?id=eq."+$(website.id)+"&owner_id=eq."+$(user.id)+"&select=id,settings,updated_at",{method:"PATCH",body:{settings,updated_at:new Date().toISOString()}});
    if(!rows?.[0])throw new Error("Catalogue verification was not confirmed.");return rows[0];
  }
  async function publishWebsite(website,brand,settings){
    const {user}=await authContext();
    if(!website?.id||website.owner_id!==user.id)throw new Error("Website ownership check failed.");
    const [products,categories,current,documents,deliveryZones]=await Promise.all([
      request("products","?select=id,name,sku,price,stock,description,image_url,attributes&website_id=eq."+$(website.id)+"&owner_id=eq."+$(user.id)+"&is_active=eq.true&limit=500"),
      request("categories","?select=id&website_id=eq."+$(website.id)+"&owner_id=eq."+$(user.id)+"&is_active=eq.true&limit=200"),
      request("websites","?select=brand,settings&id=eq."+$(website.id)+"&owner_id=eq."+$(user.id)+"&limit=1"),
      request("website_documents","?select=page_key&website_id=eq."+$(website.id)+"&owner_id=eq."+$(user.id)+"&limit=100"),
      request("delivery_zones","?select=id,name,delivery_fee,minimum_order,is_active&website_id=eq."+$(website.id)+"&owner_id=eq."+$(user.id)+"&is_active=eq.true&limit=200")
    ]);
    const currentBrand=current?.[0]?.brand||website.brand||{},currentSettings=current?.[0]?.settings||website.settings||{};
    const siteBrand={...currentBrand,...(brand||{})},inputSettings=settings||{};
    const siteSettings={...currentSettings,...inputSettings,contact:{...(currentSettings.contact||{}),...(inputSettings.contact||{})},delivery:{...(currentSettings.delivery||{}),...(inputSettings.delivery||{})}};
    const blockers=[];
    if(!products?.length)blockers.push("Add at least one active real product.");
    if(!categories?.length)blockers.push("Add at least one active product category.");
    const unverified=(products||[]).filter(p=>p.attributes?.demo===true||p.attributes?.inventory_verified!==true);
    if(unverified.length)blockers.push(unverified.length+" active product(s) are sample/demo or inventory-unverified. Verify stock and product authenticity or archive them.");
    if(siteSettings.demo_catalog!==false)blockers.push("Turn off demo catalogue mode only after the real product catalogue has been verified.");
    const incomplete=(products||[]).filter(p=>!p.sku||!String(p.image_url||"").startsWith("https://")||String(p.description||"").trim().length<20||!Number.isFinite(Number(p.price))||Number(p.price)<=0||!Number.isFinite(Number(p.stock))||Number(p.stock)<0);
    if(incomplete.length)blockers.push(incomplete.length+" active product(s) need a SKU, HTTPS image, useful description and valid price/stock.");
    const delivery=siteSettings.delivery||{},zones=(deliveryZones||[]).filter(z=>z.is_active);
    const defaultFee=Number(delivery.default_fee??0),defaultMinimum=Number(delivery.minimum_order??0);
    if(!Number.isFinite(defaultFee)||defaultFee<0||!Number.isFinite(defaultMinimum)||defaultMinimum<0)blockers.push("Set a valid store-wide default delivery fee and minimum order (zero is allowed).");
    const invalidZones=zones.filter(z=>!String(z.name||"").trim()||!Number.isFinite(Number(z.delivery_fee))||Number(z.delivery_fee)<0||!Number.isFinite(Number(z.minimum_order))||Number(z.minimum_order)<0);
    if(invalidZones.length)blockers.push(invalidZones.length+" active delivery zone(s) have incomplete or invalid fees/minimum order values.");
    
    const contact=siteSettings.contact||{},supportPhone=String(siteBrand.phone||contact.phone||"").trim(),supportEmail=String(siteBrand.email||contact.email||"").trim(),phoneDigits=supportPhone.replace(/[^0-9]/g,"").length;
    if(!supportPhone&&!supportEmail)blockers.push("Add a real customer-support phone number or email address.");
    if(supportPhone&&(phoneDigits<7||phoneDigits>20))blockers.push("Correct the customer-support phone number.");
    if(supportEmail&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail))blockers.push("Correct the customer-support email address.");
    if(!(siteBrand.address||contact.address))blockers.push("Add the real business/store address.");
    const requiredPages=["contact","delivery","returns","privacy","terms"],present=new Set((documents||[]).map(d=>d.page_key)),missing=requiredPages.filter(k=>!present.has(k));
    if(missing.length)blockers.push("Create the required customer-information pages: "+missing.join(", ")+".");
    if(blockers.length)throw new Error("Publishing blocked. Resolve all of these items first:\n• "+blockers.join("\n• "));
    const result=await request("websites","?id=eq."+$(website.id)+"&owner_id=eq."+$(user.id)+"&select=id,status,updated_at",{method:"PATCH",prefer:"return=representation",body:{status:"published",brand:siteBrand,settings:siteSettings,updated_at:new Date().toISOString()}});
    if(!result?.[0])throw new Error("Neon did not confirm the publish status.");
    return result[0];
  }

  async function verifyWebsiteOwner(website){
    const {user}=await authContext();
    if(!website?.id||website.owner_id!==user.id)throw new Error("Website ownership check failed.");
    return user;
  }
  async function loadWebsiteCatalog(website){
    const user=await verifyWebsiteOwner(website);
    const [categories,products]=await Promise.all([
      request("categories","?select=id,website_id,owner_id,name,slug,parent_id,sort_order,is_active,created_at&website_id=eq."+$(website.id)+"&owner_id=eq."+$(user.id)+"&order=sort_order.asc"),
      request("products","?select=id,website_id,owner_id,category_id,name,description,sku,price,compare_at_price,unit,stock,image_url,gallery,attributes,is_active,sort_order,created_at,updated_at&website_id=eq."+$(website.id)+"&owner_id=eq."+$(user.id)+"&order=sort_order.asc")
    ]);
    return {categories:categories||[],products:products||[]};
  }
  function catalogSlug(value){
    return String(value||"").trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,70);
  }
  async function saveWebsiteCategory(website,input){
    const user=await verifyWebsiteOwner(website),name=String(input?.name||"").trim().slice(0,100),slug=catalogSlug(input?.slug||name);
    if(name.length<2||!slug)throw new Error("Enter a category name with at least two characters.");
    const payload={website_id:website.id,owner_id:user.id,name,slug,sort_order:Math.max(0,Number(input.sort_order)||0),is_active:input.is_active!==false};
    if(input.id){
      const rows=await request("categories","?id=eq."+$(input.id)+"&website_id=eq."+$(website.id)+"&owner_id=eq."+$(user.id)+"&select=id,name,slug,sort_order,is_active",{method:"PATCH",body:payload});
      if(!rows?.[0])throw new Error("Category update was not confirmed.");
      return rows[0];
    }
    const rows=await request("categories","?select=id,name,slug,sort_order,is_active",{method:"POST",body:payload});
    if(!rows?.[0])throw new Error("Category creation was not confirmed.");
    return rows[0];
  }
  async function saveWebsiteProduct(website,input){
    const user=await verifyWebsiteOwner(website);
    const name=String(input?.name||"").trim().slice(0,160),description=String(input?.description||"").trim().slice(0,5000);
    const price=Number(input?.price),requestedStock=input?.stock===""||input?.stock==null?null:Number(input.stock),compare=input?.compare_at_price===""||input?.compare_at_price==null?null:Number(input.compare_at_price);
    if(name.length<2)throw new Error("Product name must contain at least two characters.");
    if(!Number.isFinite(price)||price<=0)throw new Error("Enter a product price greater than zero.");
    if(requestedStock!==null&&(!Number.isFinite(requestedStock)||requestedStock<0))throw new Error("Stock must be zero or greater.");
    if(compare!==null&&(!Number.isFinite(compare)||compare<0))throw new Error("Compare-at price must be zero or greater.");
    const categoryId=String(input?.category_id||"").trim()||null;
    if(categoryId){const matches=await request("categories","?select=id&website_id=eq."+$(website.id)+"&owner_id=eq."+$(user.id)+"&id=eq."+$(categoryId)+"&is_active=eq.true&limit=1");if(!matches?.length)throw new Error("Choose an active category from this website.");}
    const imageUrl=String(input?.image_url||"").trim();
    if(imageUrl&&!(imageUrl.startsWith("https://")||imageUrl.startsWith("http://")))throw new Error("Product image must use a valid https:// or http:// URL.");
    const minQty=Math.max(1,Number(input?.minimum_order_quantity)||1),productId=String(input?.id||"").trim();
    let existing=null;
    if(productId){const found=await request("products","?select=id,attributes,gallery,stock&website_id=eq."+$(website.id)+"&owner_id=eq."+$(user.id)+"&id=eq."+$(productId)+"&limit=1");if(!found?.[0])throw new Error("The product to edit could not be found.");existing=found[0];if(requestedStock!==null&&requestedStock!==Number(existing.stock))throw new Error("Product details cannot change stock. Use the audited stock-adjustment control so every stock change is logged.");}
    const stock=productId?Number(existing.stock):requestedStock;
    if(!Number.isFinite(stock)||stock<0)throw new Error("New products need a valid opening stock quantity.");
    const verified=input?.real_inventory_verified===true||input?.real_inventory_verified==="true"||input?.real_inventory_verified==="on";
    const sku=String(input?.sku||"").trim().slice(0,80)||null;
    if(verified&&(!sku||description.length<20||!imageUrl.startsWith("https://")))throw new Error("To verify real inventory, add a unique SKU, a useful description (at least 20 characters), and an HTTPS product image.");
    const attributes={...(existing?.attributes||{}),minimum_order_quantity:minQty,brand:String(input?.brand||"").trim().slice(0,100),barcode:String(input?.barcode||"").trim().slice(0,80),pack_size:String(input?.pack_size||"").trim().slice(0,100),origin:String(input?.origin||"").trim().slice(0,120),grade:String(input?.grade||"").trim().slice(0,80),expiry_date:String(input?.expiry_date||"").trim().slice(0,20),farm_name:String(input?.farm_name||"").trim().slice(0,120)};
    if(verified){attributes.demo=false;attributes.inventory_verified=true;attributes.verified_at=new Date().toISOString();}
    else if(!productId){attributes.demo=true;attributes.inventory_verified=false;}
    const payload={website_id:website.id,owner_id:user.id,category_id:categoryId,name,description,sku,price,compare_at_price:compare,unit:String(input?.unit||"piece").trim().slice(0,30)||"piece",stock,image_url:imageUrl||null,gallery:existing?.gallery||[],attributes,is_active:input?.is_active!==false,sort_order:Math.max(0,Number(input?.sort_order)||0),updated_at:new Date().toISOString()};
    if(productId){const rows=await request("products","?id=eq."+$(productId)+"&website_id=eq."+$(website.id)+"&owner_id=eq."+$(user.id)+"&select=id,name,sku,price,stock,is_active,attributes,updated_at",{method:"PATCH",body:payload});if(!rows?.[0])throw new Error("Product update was not confirmed.");return rows[0];}
    const rows=await request("products","?select=id,name,sku,price,stock,is_active,attributes,created_at",{method:"POST",body:payload});if(!rows?.[0])throw new Error("Product creation was not confirmed.");return rows[0];
  }
  async function setWebsiteProductActive(website,productId,isActive){
    const user=await verifyWebsiteOwner(website);
    const rows=await request("products","?id=eq."+$(productId)+"&website_id=eq."+$(website.id)+"&owner_id=eq."+$(user.id)+"&select=id,is_active",{method:"PATCH",body:{is_active:Boolean(isActive),updated_at:new Date().toISOString()}});
    if(!rows?.[0])throw new Error("Product status update was not confirmed.");
    return rows[0];
  }
  async function setWebsiteCategoryActive(website,categoryId,isActive){
    const user=await verifyWebsiteOwner(website);
    if(!isActive){
      const products=await request("products","?select=id&website_id=eq."+$(website.id)+"&category_id=eq."+$(categoryId)+"&is_active=eq.true&limit=1");
      if(products?.length)throw new Error("Move or archive the active products in this category before archiving it.");
    }
    const rows=await request("categories","?id=eq."+$(categoryId)+"&website_id=eq."+$(website.id)+"&owner_id=eq."+$(user.id)+"&select=id,is_active",{method:"PATCH",body:{is_active:Boolean(isActive)}});
    if(!rows?.[0])throw new Error("Category status update was not confirmed.");
    return rows[0];
  }

  async function loadCentralCommerce(){
    const {user}=await authContext();
    const [websites,products,categories,orders,orderItems,suppliers,purchaseOrders,purchaseItems,inventoryMovements,deliveryZones,payments,supplierPayments,customers,customerLinks,returns,finance,priceTiers,quoteRequests]=await Promise.all([
      request("websites","?select=id,owner_id,name,slug,template_key,category_slug,status,brand,settings,created_at,updated_at&owner_id=eq."+$(user.id)+"&order=created_at.asc"),
      request("products","?select=id,website_id,owner_id,category_id,name,description,sku,price,compare_at_price,unit,stock,image_url,gallery,attributes,is_active,sort_order,created_at,updated_at&order=updated_at.desc&limit=3000"),
      request("categories","?select=id,website_id,owner_id,name,slug,parent_id,sort_order,is_active&order=sort_order.asc&limit=2000"),
      request("orders","?select=id,website_id,owner_id,order_number,customer,customer_id,shipping_address,subtotal,delivery_fee,discount,total,payment_method,payment_status,status,notes,created_at&owner_id=eq."+$(user.id)+"&order=created_at.desc&limit=2000"),
      request("order_items","?select=id,order_id,product_id,product_snapshot,quantity,unit_price,line_total&limit=5000"),
      request("suppliers","?select=*&order=created_at.desc&limit=1000"),
      request("purchase_orders","?select=*&order=created_at.desc&limit=1000"),
      request("purchase_order_items","?select=*&limit=5000"),
      request("inventory_movements","?select=*&order=created_at.desc&limit=1500"),
      request("delivery_zones","?select=*&order=created_at.desc&limit=1000"),
      request("payment_transactions","?select=*&order=paid_at.desc&limit=2000"),
      request("supplier_payments","?select=*&order=paid_at.desc&limit=2000"),
      request("customer_profiles","?select=*&order=last_order_at.desc&limit=3000"),
      request("customer_site_links","?select=*&limit=5000"),
      request("return_requests","?select=*&order=created_at.desc&limit=1000"),
      request("finance_entries","?select=*&order=occurred_at.desc&limit=3000"),
      request("product_price_tiers","?select=*&order=minimum_quantity.asc&limit=3000"),
      request("quote_requests","?select=*&owner_id=eq."+$(user.id)+"&order=created_at.desc&limit=1000")
    ]);
    const ids=new Set((websites||[]).map(w=>w.id)),orderIds=new Set((orders||[]).map(o=>o.id)),keep=rows=>(rows||[]).filter(r=>!r.website_id||ids.has(r.website_id));
    return {user:{id:user.id,email:user.email},websites:websites||[],products:keep(products),categories:keep(categories),orders:keep(orders),orderItems:(orderItems||[]).filter(item=>orderIds.has(item.order_id)),suppliers:suppliers||[],purchaseOrders:keep(purchaseOrders),purchaseItems:purchaseItems||[],inventoryMovements:keep(inventoryMovements),deliveryZones:keep(deliveryZones),payments:keep(payments),supplierPayments:keep(supplierPayments),customers:customers||[],customerLinks:customerLinks||[],returns:keep(returns),finance:keep(finance),priceTiers:keep(priceTiers),quoteRequests:quoteRequests||[]};
  }
  async function saveCentralSupplier(input){
    const {user}=await authContext(),id=String(input?.id||"").trim(),siteId=String(input?.website_id||"").trim()||null;
    if(siteId){const siteRows=await request("websites","?select=id&owner_id=eq."+$(user.id)+"&id=eq."+$(siteId)+"&limit=1");if(!siteRows?.length)throw new Error("Store ownership check failed.");}
    const name=String(input?.name||"").trim().slice(0,140);if(name.length<2)throw new Error("Supplier name is required.");
    const payload={owner_id:user.id,website_id:siteId,name,company_name:String(input?.company_name||"").trim().slice(0,160),phone:String(input?.phone||"").trim().slice(0,50),email:String(input?.email||"").trim().slice(0,160),address:String(input?.address||"").trim().slice(0,400),tax_id:String(input?.tax_id||"").trim().slice(0,80),notes:String(input?.notes||"").trim().slice(0,2000),is_active:input?.is_active!==false,updated_at:new Date().toISOString()};
    const rows=id?await request("suppliers","?id=eq."+$(id)+"&owner_id=eq."+$(user.id)+"&select=*",{method:"PATCH",body:payload}):await request("suppliers","?select=*",{method:"POST",body:payload});
    if(!rows?.[0])throw new Error("Supplier save was not confirmed.");return rows[0];
  }
  async function saveCentralCustomer(input){
    const {user}=await authContext(),id=String(input?.id||"").trim();if(!id)throw new Error("Customer record is missing.");
    const tier=String(input?.vip_tier||"standard");if(!["standard","silver","gold","platinum"].includes(tier))throw new Error("Invalid VIP tier.");
    const rows=await request("customer_profiles","?id=eq."+$(id)+"&owner_id=eq."+$(user.id)+"&select=id,name,phone_normalized,blocked,vip_tier,notes",{method:"PATCH",body:{blocked:input?.blocked===true,vip_tier:tier,notes:String(input?.notes||"").trim().slice(0,2000),updated_at:new Date().toISOString()}});
    if(!rows?.[0])throw new Error("Customer update was not confirmed.");return rows[0];
  }
  async function saveCentralDeliveryZone(website,input){
    const user=await verifyWebsiteOwner(website),id=String(input?.id||"").trim(),name=String(input?.name||"").trim().slice(0,120);
    if(name.length<2)throw new Error("Enter a delivery-area name.");
    const fee=Number(input?.delivery_fee),minimum=Number(input?.minimum_order||0);
    if(!Number.isFinite(fee)||fee<0||!Number.isFinite(minimum)||minimum<0)throw new Error("Delivery fee and minimum order must be valid non-negative amounts.");
    const normalized=name.toLowerCase().replace(/\s+/g," ").trim();
    const payload={owner_id:user.id,website_id:website.id,name,normalized_name:normalized,delivery_fee:fee,minimum_order:minimum,eta_label:String(input?.eta_label||"").trim().slice(0,100),is_active:input?.is_active!==false,updated_at:new Date().toISOString()};
    const rows=id?await request("delivery_zones","?id=eq."+$(id)+"&website_id=eq."+$(website.id)+"&owner_id=eq."+$(user.id)+"&select=*",{method:"PATCH",body:payload}):await request("delivery_zones","?select=*",{method:"POST",body:payload});
    if(!rows?.[0])throw new Error("Delivery area save was not confirmed.");
    const zones=await request("delivery_zones","?select=name,delivery_fee,minimum_order,eta_label&website_id=eq."+$(website.id)+"&owner_id=eq."+$(user.id)+"&is_active=eq.true&order=name.asc");
    const current=await request("websites","?select=settings&id=eq."+$(website.id)+"&owner_id=eq."+$(user.id)+"&limit=1"),old=current?.[0]?.settings||website.settings||{};
    const average=(zones||[]).length?zones.reduce((n,z)=>n+Number(z.delivery_fee||0),0)/zones.length:Number(old.delivery?.default_fee||0);
    const settings={...old,delivery:{...(old.delivery||{}),areas:(zones||[]).map(z=>z.name),default_fee:Number(average.toFixed(2)),zones:(zones||[]).map(z=>({name:z.name,delivery_fee:Number(z.delivery_fee),minimum_order:Number(z.minimum_order),eta_label:z.eta_label}))}};
    await request("websites","?id=eq."+$(website.id)+"&owner_id=eq."+$(user.id),{method:"PATCH",body:{settings,updated_at:new Date().toISOString()}});
    return rows[0];
  }
  async function setCentralZoneActive(website,zoneId,active){
    const user=await verifyWebsiteOwner(website);
    const rows=await request("delivery_zones","?id=eq."+$(zoneId)+"&website_id=eq."+$(website.id)+"&owner_id=eq."+$(user.id)+"&select=*",{method:"PATCH",body:{is_active:Boolean(active),updated_at:new Date().toISOString()}});
    if(!rows?.[0])throw new Error("Delivery zone update was not confirmed.");
    const zones=await request("delivery_zones","?select=name,delivery_fee,minimum_order,eta_label&website_id=eq."+$(website.id)+"&owner_id=eq."+$(user.id)+"&is_active=eq.true&order=name.asc");
    const current=await request("websites","?select=settings&id=eq."+$(website.id)+"&owner_id=eq."+$(user.id)+"&limit=1"),old=current?.[0]?.settings||website.settings||{};
    const settings={...old,delivery:{...(old.delivery||{}),areas:(zones||[]).map(z=>z.name),zones:(zones||[]).map(z=>({name:z.name,delivery_fee:Number(z.delivery_fee),minimum_order:Number(z.minimum_order),eta_label:z.eta_label}))}};
    await request("websites","?id=eq."+$(website.id)+"&owner_id=eq."+$(user.id),{method:"PATCH",body:{settings,updated_at:new Date().toISOString()}});
    return rows[0];
  }
  async function saveCentralStoreProfile(website,input){
    return await saveWebsiteProfile(website,input);
  }
  async function createCentralFinanceEntry(input){
    const {user}=await authContext(),siteId=String(input?.website_id||"").trim(),amount=Number(input?.amount),type=String(input?.entry_type||"expense");
    const siteRows=await request("websites","?select=id&owner_id=eq."+$(user.id)+"&id=eq."+$(siteId)+"&limit=1");
    if(!siteRows?.length)throw new Error("Choose a valid store.");
    if(!["income","expense"].includes(type)||!Number.isFinite(amount)||amount<=0)throw new Error("Select income/expense and enter a positive amount.");
    const rows=await request("finance_entries","?select=*",{method:"POST",body:{owner_id:user.id,website_id:siteId,entry_type:type,category:String(input?.category||"Other").trim().slice(0,80),amount,description:String(input?.description||"").trim().slice(0,500),occurred_at:input?.occurred_at||new Date().toISOString()}});
    if(!rows?.[0])throw new Error("Finance entry was not confirmed.");return rows[0];
  }
  async function createCentralReturn(input){
    const {user}=await authContext(),orderId=String(input?.order_id||"").trim();
    const order=await request("orders","?select=id,website_id,owner_id,customer&owner_id=eq."+$(user.id)+"&id=eq."+$(orderId)+"&limit=1");
    if(!order?.[0])throw new Error("Order not found.");
    const rows=await request("return_requests","?select=*",{method:"POST",body:{owner_id:user.id,website_id:order[0].website_id,order_id:orderId,order_item_id:input?.order_item_id||null,customer_name:String(order[0].customer?.name||""),customer_phone:String(order[0].customer?.phone||""),reason:String(input?.reason||"").trim().slice(0,1000),notes:String(input?.notes||"").trim().slice(0,2000)}});
    if(!rows?.[0])throw new Error("Return request was not created.");return rows[0];
  }
  async function updateCentralReturn(returnId,status,notes=""){
    const {user}=await authContext();
    const allowed={
      requested:["approved","rejected"],
      approved:["received","rejected"],
      received:["closed"],
      refunded:["closed"],
      rejected:["closed"],
      closed:[]
    };
    const current=await request("return_requests","?select=id,status,refund_amount,owner_id&id=eq."+$(returnId)+"&owner_id=eq."+$(user.id)+"&limit=1");
    if(!current?.[0])throw new Error("Return request not found.");
    if(!(allowed[current[0].status]||[]).includes(status))throw new Error("This return cannot move from "+current[0].status+" to "+status+".");
    const rows=await request("return_requests","?id=eq."+$(returnId)+"&owner_id=eq."+$(user.id)+"&select=*",{method:"PATCH",body:{status,notes:String(notes||"").slice(0,2000),updated_at:new Date().toISOString()}});
    if(!rows?.[0])throw new Error("Return status update was not confirmed.");return rows[0];
  }
  async function centralProcessReturnRefund(returnId,amount,method="manual",reference="",notes=""){
    const {user}=await authContext(),value=Number(amount);
    if(!Number.isFinite(value)||value<=0)throw new Error("Enter a valid refund amount greater than zero.");
    const result=await request("rpc/central_process_return_refund","",{method:"POST",body:{
      p_return_id:returnId,p_amount:value,p_method:method||"manual",
      p_reference:String(reference||"").slice(0,120),p_notes:String(notes||"").slice(0,500)
    }});
    if(!result?.payment_id||result.return_status!=="refunded")throw new Error("Neon did not confirm the refund transaction.");
    if(result.return_id!==returnId)throw new Error("Refund ownership could not be confirmed.");
    return result;
  }
  async function updateCentralQuote(quoteId,status,quotedAmount=0,validUntil=null,responseNotes=""){
    const {user}=await authContext();
    if(!["requested","reviewing","quoted","approved","rejected","closed"].includes(status))throw new Error("Invalid quotation status.");
    const amount=Number(quotedAmount||0);
    if(!Number.isFinite(amount)||amount<0)throw new Error("Enter a valid quotation amount.");
    if(status==="quoted"&&amount<=0)throw new Error("A positive quotation amount is required before marking a request as quoted.");
    if(validUntil&&!/^\d{4}-\d{2}-\d{2}$/.test(String(validUntil)))throw new Error("Enter a valid quotation expiry date.");
    const rows=await request("rpc/respond_to_storefront_quote_request","",{method:"POST",body:{p_quote_id:quoteId,p_status:status,p_quoted_amount:amount,p_valid_until:validUntil||null,p_response_notes:String(responseNotes||"").slice(0,2000)}});
    if(!Array.isArray(rows)||!rows[0]?.id)throw new Error("Quotation update was not confirmed.");
    if(rows[0].owner_id!==user.id)throw new Error("Quotation response ownership could not be confirmed.");
    return rows[0];
  }
  async function centralAdjustInventory(website,productId,delta,reason,type="adjustment"){
    await verifyWebsiteOwner(website);
    const result=await request("rpc/central_adjust_inventory","",{method:"POST",body:{p_website_id:website.id,p_product_id:productId,p_delta:Number(delta),p_reason:String(reason||""),p_movement_type:type}});
    if(!result?.product_id)throw new Error("Stock adjustment was not confirmed.");return result;
  }
  async function centralCreatePurchaseOrder(website,supplierId,items,expectedAt=null,notes=""){
    await verifyWebsiteOwner(website);
    const result=await request("rpc/central_create_purchase_order","",{method:"POST",body:{p_website_id:website.id,p_supplier_id:supplierId,p_items:items,p_expected_at:expectedAt||null,p_notes:String(notes||"")}});
    if(!result?.id)throw new Error("Purchase order was not created.");return result;
  }
  async function centralReceivePurchaseOrder(purchaseOrderId,items){
    const result=await request("rpc/central_receive_purchase_order","",{method:"POST",body:{p_purchase_order_id:purchaseOrderId,p_items:items}});
    if(!result?.purchase_order_id)throw new Error("Purchase receive was not confirmed.");return result;
  }
  async function centralRecordOrderPayment(orderId,amount,method,reference="",notes=""){
    const result=await request("rpc/central_record_order_payment","",{method:"POST",body:{p_order_id:orderId,p_amount:Number(amount),p_method:method||"cod",p_reference:String(reference||""),p_notes:String(notes||"")}});
    if(!result?.payment_id)throw new Error("Order payment was not confirmed.");return result;
  }
  async function centralRecordSupplierPayment(poId,amount,method,reference="",notes=""){
    const result=await request("rpc/central_record_supplier_payment","",{method:"POST",body:{p_purchase_order_id:poId,p_amount:Number(amount),p_method:method||"cash",p_reference:String(reference||""),p_notes:String(notes||"")}});
    if(!result?.payment_id)throw new Error("Supplier payment was not confirmed.");return result;
  }
  async function centralSavePriceTier(website,input){
    const user=await verifyWebsiteOwner(website),productId=String(input?.product_id||"").trim(),qty=Number(input?.minimum_quantity),price=Number(input?.unit_price),id=String(input?.id||"").trim();
    if(!productId||!Number.isFinite(qty)||qty<=0||!Number.isFinite(price)||price<=0)throw new Error("Choose a product and enter valid quantity and price.");
    const payload={owner_id:user.id,website_id:website.id,product_id:productId,minimum_quantity:qty,unit_price:price,label:String(input?.label||"").trim().slice(0,80),is_active:input?.is_active!==false,updated_at:new Date().toISOString()};
    const rows=id?await request("product_price_tiers","?id=eq."+$(id)+"&website_id=eq."+$(website.id)+"&owner_id=eq."+$(user.id)+"&select=*",{method:"PATCH",body:payload}):await request("product_price_tiers","?select=*",{method:"POST",body:payload});
    if(!rows?.[0])throw new Error("Wholesale price tier save was not confirmed.");return rows[0];
  }

  window.WPNeonBuilderApi=Object.freeze({apiBase:API_BASE,loadTemplateCatalog,loadTemplatePages,ensureWebsite,loadOwnerWebsites,publishShowcaseWebsite,loadWebsiteDocuments,seedWebsitePages,loadPageDocument,savePageDocument,loadDocument:loadPageDocument,saveDocument:(website,document,pageKey="home")=>savePageDocument(website,pageKey,document),loadStorefrontData,placeOrder,trackOrder,submitReturnRequest,submitQuoteRequest,getWebsiteStats,loadWebsiteOrders,updateOrderStatus,loadWebsiteCatalog,saveWebsiteCategory,saveWebsiteProduct,setWebsiteProductActive,setWebsiteCategoryActive,saveWebsiteProfile,verifyWebsiteCatalog,loadCentralCommerce,saveCentralSupplier,saveCentralCustomer,saveCentralDeliveryZone,setCentralZoneActive,saveCentralStoreProfile,createCentralFinanceEntry,createCentralReturn,updateCentralReturn,centralProcessReturnRefund,centralAdjustInventory,centralCreatePurchaseOrder,centralReceivePurchaseOrder,centralRecordOrderPayment,centralRecordSupplierPayment,centralSavePriceTier,updateCentralQuote,createCustomPage,publishWebsite,defaultPageDocument});
})();
