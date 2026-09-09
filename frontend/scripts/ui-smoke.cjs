// Local UI regression checks. All API responses are fixtures; nothing is sent to a real account.
// Run with Playwright available in NODE_PATH and the frontend running on port 3000.
const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const base = process.env.UI_TEST_URL || "http://127.0.0.1:3000";
const out = path.resolve(__dirname, "../artifacts/ui-check");
const user = {id:"ui-user", name:"Alex Reader", email:"reader@example.test", language:"English", listening_goal:30, favorite_genres:["Adventure","Mystery","Fantasy"], is_premium:false};
const author = {id:"ui-author",name:"EchoTale Studio",bio:"Stories for curious minds and quiet moments.",avatar:"",followers_count:12};
const stories = ["The Moonlit Library","A Quiet Adventure","Letters from the Coast"].map((title,i)=>({id:"ui-story-"+i,title,slug:"demo-"+i,author:author.name,description:"A thoughtful journey through unfamiliar places, unexpected friendships, and the moments that make us feel at home.",category:i===2?"Podcast":"Adventure",tags:["Adventure"],cover_image:base+"/images/"+(i===1?"reading-corner":"listening-world")+".png",audio_url:"",audio_status:"generated",audio_parts:[{part_number:1,title:"Chapter one",audio_url:base+"/mock-audio.mp3",text_preview:"A new chapter begins.",duration_estimate:5}],duration:15+i*10,rating:4.5,total_reviews:0,total_listens:20,is_premium:false}));
const refs = stories.map((s,i)=>({id:"ref-"+i,story_id:s.id}));
async function setup(browser,width,loggedIn=true) {
 const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1,serviceWorkers:"block"});
 if(loggedIn) await context.addInitScript(u=>{localStorage.setItem("access_token","ui-fixture-not-a-token");localStorage.setItem("user",JSON.stringify(u));},user);
 let mode="normal";
 await context.route("**/*",async route=>{
  const url=new URL(route.request().url());
  if(url.pathname.includes("/api/")) {
   if(mode==="error" && url.pathname==="/api/stories/") return route.fulfill({status:503,contentType:"application/json",body:JSON.stringify({success:false,message:"Test outage"})});
   let data=[];
   const p=url.pathname;
   if(p.includes("/auth/")) data=user;
   else if(p.includes("insights")) data={summary:"A test summary for visual verification.",key_points:[],themes:[],characters:[],suggested_questions:[]};
   else if(p.includes("/authors/")) data=p.endsWith("/stories/")?stories:p==="/api/authors/"?[author]:author;
   else if(p.includes("/stories/")) data=/\/stories\/ui-story-\d\/$/.test(p)?stories.find(s=>p.includes(s.id)):mode==="empty"?[]:stories;
   else if(p.includes("recommendations")) data=mode==="empty"?[]:stories;
   else if(p.includes("bookmarks")||p.includes("history")||p.includes("library")) data=mode==="empty"?[]:refs;
   else if(p.includes("/subscriptions/plans")) data=[{id:"free",name:"Free",amount:0,currency:"INR"},{id:"monthly",name:"Monthly",amount:499,currency:"INR"},{id:"yearly",name:"Yearly",amount:4999,currency:"INR"}];
   else if(p.includes("/subscriptions/current")) data={id:"ui-sub",plan:"free",status:"active"};
   else if(p.includes("/books/search")) return route.fulfill({contentType:"application/json",body:JSON.stringify({books:[],suggestions:[]})});
   return route.fulfill({contentType:"application/json",body:JSON.stringify({success:true,data})});
  }
  if(url.origin!==base) return route.abort();
  return route.continue();
 });
 const page=await context.newPage();
 const errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 return {context,page,errors,setMode:value=>{mode=value;}};
}
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,channel:process.env.PLAYWRIGHT_CHANNEL || 'chrome'});
 const checks=[];
 try {
  for(const width of [1440,390]) {
   const {page,context,errors,setMode}=await setup(browser,width);
   const routes=["/dashboard","/explore","/stories","/audiobooks","/podcasts","/library","/bookmarks","/history","/settings","/profile","/premium","/stories/upload","/stories/ui-story-0","/authors","/authors/ui-author","/explore/adventure","/notifications","/player","/onboarding","/auth/login","/auth/signup","/auth/forgot-password","/auth/reset-password","/offline","/search"];
   for(const route of routes) {
    await page.goto(base+route);
    await page.waitForSelector("h1");
    await page.waitForTimeout(180);
    const metrics=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,h1:document.querySelectorAll("h1").length}));
    assert.ok(metrics.scroll<=metrics.width+1,`Horizontal overflow at ${route}, ${width}px: ${JSON.stringify(metrics)}`);
    assert.equal(metrics.h1,1,`Expected one page heading: ${route}`);
    if(["/dashboard","/auth/login","/explore","/settings","/profile","/stories/ui-story-0"].includes(route)) await page.screenshot({path:path.join(out,`${route.replaceAll("/","-")}-${width}.png`),fullPage:true});
    checks.push({route,width,overflow:false});
   }
   await page.goto(base+"/explore");
   await page.getByRole("textbox",{name:"Search books, authors or topics"}).fill("Moon");
   await page.getByRole("region",{name:"Book search results"}).waitFor();
   await page.keyboard.press("Escape");
   await page.getByRole("region",{name:"Book search results"}).waitFor({state:"hidden"});
   const filter=page.getByRole("searchbox",{name:"Filter this collection"});
   await filter.fill("Quiet");
   await page.waitForTimeout(120);
   assert.equal(await page.locator("article").count(),1,"Collection title filter");
   await filter.fill("nothing-matches");
   await page.getByText("No matching stories",{exact:true}).waitFor();
   setMode("error");await page.goto(base+"/explore");await page.getByRole("button",{name:"Try again"}).waitFor();
   setMode("normal");await page.getByRole("button",{name:"Try again"}).click();await page.locator("article").first().waitFor();
   setMode("empty");await page.goto(base+"/bookmarks");await page.getByText("A place for your next great find",{exact:true}).waitFor();
   assert.deepEqual(errors,[],`Browser errors at ${width}px`);
   await context.close();
  }
  const guest=await setup(browser,390,false);
  await guest.page.goto(base+"/dashboard");
  await guest.page.waitForURL("**/auth/login?next=**");
  await guest.context.close();
  fs.writeFileSync(path.join(out,"results.json"),JSON.stringify({checks,interactions:["inline search Escape","collection filter","no-match state","API failure and retry","empty bookmarks","guest login redirect"]},null,2));
  console.log(`PASS: ${checks.length} route/viewport checks, no horizontal overflow or uncaught browser errors. Search, filters, error recovery, empty state and guest redirect passed.`);
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
