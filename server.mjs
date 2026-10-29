import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import {fileURLToPath} from "node:url";

const ROOT=path.dirname(fileURLToPath(import.meta.url));
const MEDIA=path.join(ROOT,"media");
const BASE="https://api.alura.io/v1";
function loadEnv(s){for(const line of s.split(/\r?\n/)){const m=line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);if(m&&!process.env[m[1]])process.env[m[1]]=m[2].replace(/^["']|["']$/g,"")}}
try{loadEnv(await fs.readFile(path.join(ROOT,".env"),"utf8"))}catch{}
const PORT=Number(process.env.PORT||4173),HOST=process.env.HOST||"127.0.0.1",PUBLIC=(process.env.PUBLIC_BASE_URL||"").replace(/\/+$/,"");
const SECRET=process.env.APP_SESSION_SECRET||crypto.randomBytes(32).toString("hex");
function equal(a,b){const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&crypto.timingSafeEqual(x,y)}
function sign(v){return crypto.createHmac("sha256",SECRET).update(v).digest("hex")}
function send(res,status,obj,headers={}){res.writeHead(status,{"content-type":"application/json; charset=utf-8","cache-control":"no-store",...headers});res.end(JSON.stringify(obj))}
function cookie(req,name){return (req.headers.cookie||"").split(";").map(x=>x.trim()).find(x=>x.startsWith(name+"="))?.slice(name.length+1)||""}
function sessionOK(req){if(!process.env.APP_PASSWORD)return true;const [exp,sig]=cookie(req,"poster_session").split(".");return Number(exp)>Date.now()/1000&&equal(sig,sign("session:"+exp))}
function mediaOK(req,name){const u=new URL(req.url,"http://local"),exp=u.searchParams.get("exp")||"",sig=u.searchParams.get("sig")||"";return Number(exp)>Date.now()/1000&&equal(sig,sign("media:"+name+":"+exp))}
async function jsonBody(req,limit=60*1024*1024){let size=0,parts=[];for await(const p of req){size+=p.length;if(size>limit)throw Error("Upload is too large.");parts.push(p)}return JSON.parse(Buffer.concat(parts).toString("utf8")||"{}")}
async function alura(route,options={}){if(!process.env.ALURA_API_KEY)throw Object.assign(Error("The app server has no Alura API key set."),{status:503});const headers={Authorization:"Bearer "+process.env.ALURA_API_KEY,Accept:"application/json"};if(options.body)headers["Content-Type"]="application/json";const r=await fetch(BASE+route,{...options,headers:{...headers,...options.headers}});const t=await r.text();let d;try{d=JSON.parse(t)}catch{d={message:t}}if(!r.ok)throw Object.assign(Error(d.message||d.error||("Alura responded "+r.status)),{status:r.status,details:d});return {data:d,credits:r.headers.get("Alura-Credits-Remaining")}}
function listingId(o){return String(o?.id||o?.listing_id||o?.listing?.id||o?.data?.id||o?.data?.listing_id||"")}
async function handle(req,res){
 const u=new URL(req.url,"http://localhost");
 if(req.method==="POST"&&u.pathname==="/api/login"){try{const b=await jsonBody(req,4096);if(!process.env.APP_PASSWORD)return send(res,200,{ok:true});if(!equal(b.password,process.env.APP_PASSWORD))return send(res,401,{error:"Incorrect password"});const exp=String(Math.floor(Date.now()/1000)+1209600),secure=(req.headers["x-forwarded-proto"]==="https"||!!req.socket.encrypted)?"; Secure":"";return send(res,200,{ok:true},{"set-cookie":"poster_session="+exp+"."+sign("session:"+exp)+"; HttpOnly; SameSite=Strict; Path=/; Max-Age=1209600"+secure})}catch(e){return send(res,400,{error:e.message})}}
 if(u.pathname.startsWith("/media/")){const name=path.basename(u.pathname.slice(7));if(!mediaOK(req,name))return send(res,403,{error:"Photo link has expired or is invalid"});try{const f=await fs.readFile(path.join(MEDIA,name));res.writeHead(200,{"content-type":name.endsWith(".png")?"image/png":"image/jpeg","cache-control":"public, max-age=3600"});return res.end(f)}catch{return send(res,404,{error:"Photo not found"})}}
 if(u.pathname.startsWith("/api/")&&!sessionOK(req))return send(res,401,{login_required:true,error:"App password required"});
 try{
  if(req.method==="GET"&&u.pathname==="/api/status"){if(!process.env.ALURA_API_KEY)return send(res,200,{configured:false,connected:false,publicImages:PUBLIC.startsWith("https://")});const [me,shops]=await Promise.all([alura("/me"),alura("/workspace/shops")]);return send(res,200,{configured:true,connected:true,user:me.data,shops:shops.data.data||shops.data,publicImages:PUBLIC.startsWith("https://"),credits:me.credits||shops.credits})}
  if(req.method==="GET"&&u.pathname==="/api/listings"){const shop=u.searchParams.get("shopId");if(!shop)return send(res,400,{error:"Choose a shop first."});const r=await alura("/workspace/listings?shop_id="+encodeURIComponent(shop));return send(res,200,r.data)}
  if(req.method==="POST"&&u.pathname==="/api/keywords"){const b=await jsonBody(req,10000),q=String(b.q||"").trim();if(!q)return send(res,400,{error:"Enter a search phrase."});const r=await alura("/research/keywords?q="+encodeURIComponent(q));return send(res,200,r.data,{"x-alura-credits-remaining":r.credits||""})}
  if(req.method==="POST"&&u.pathname==="/api/media"){if(!PUBLIC.startsWith("https://"))return send(res,503,{error:"Mockup upload needs a public HTTPS server address. Set PUBLIC_BASE_URL after hosting the app."});const b=await jsonBody(req,30*1024*1024),m=String(b.data||"").match(/^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=]+)$/);if(!m)return send(res,400,{error:"Unsupported image file."});await fs.mkdir(MEDIA,{recursive:true});const ext=m[1]==="jpeg"?"jpg":m[1],name=crypto.randomUUID()+"."+ext;await fs.writeFile(path.join(MEDIA,name),Buffer.from(m[2],"base64"),{flag:"wx"});const exp=String(Math.floor(Date.now()/1000)+1209600),sig=sign("media:"+name+":"+exp);return send(res,201,{url:PUBLIC+"/media/"+name+"?exp="+exp+"&sig="+sig})}
  if(req.method==="POST"&&u.pathname==="/api/create-draft"){const b=await jsonBody(req,250000);if(!b.shopId||!b.sourceListingId)return send(res,400,{error:"Select a shop and source listing."});if(!Array.isArray(b.tags)||b.tags.length>13||b.tags.some(x=>String(x).length>20))return send(res,400,{error:"Etsy accepts up to 13 tags, each up to 20 characters."});if(!Array.isArray(b.imageUrls)||!b.imageUrls.length||b.imageUrls.length>20)return send(res,400,{error:"Add between 1 and 20 mockup photos."});if(!PUBLIC.startsWith("https://")||b.imageUrls.some(x=>!String(x).startsWith(PUBLIC+"/media/")))return send(res,400,{error:"Use mockup photos uploaded by this app."});
   const copy=await alura("/workspace/listings/"+encodeURIComponent(b.sourceListingId)+"/duplicate",{method:"POST",body:JSON.stringify({shop_id:String(b.shopId),state:"draft"})});const id=listingId(copy.data);if(!id)throw Object.assign(Error("Alura did not return the duplicated draft ID."),{status:502,details:copy.data});
   const updated=await alura("/workspace/listings/"+encodeURIComponent(id),{method:"PATCH",body:JSON.stringify({shop_id:String(b.shopId),title:String(b.title||"").slice(0,140),description:String(b.description||""),tags:b.tags,state:"draft"})});
   const photos=[];for(const url of b.imageUrls){const photo=await alura("/workspace/listings/"+encodeURIComponent(id)+"/images",{method:"POST",body:JSON.stringify({url})});photos.push(photo.data)}
   return send(res,201,{id,state:"draft",listing:updated.data,photos})
  }
  if(req.method==="GET"){const pathname=decodeURIComponent(u.pathname==="/"?"/index.html":u.pathname);const file=path.resolve(ROOT,"."+pathname);if(!file.startsWith(ROOT+path.sep)&&file!==ROOT)return send(res,403,{error:"Forbidden"});if(path.basename(file)===".env")return send(res,404,{error:"Not found"});try{const data=await fs.readFile(file),ext=path.extname(file);res.writeHead(200,{"content-type":({".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg"}[ext]||"application/octet-stream"),"cache-control":"no-cache"});return res.end(data)}catch{return send(res,404,{error:"Not found"})}}
  return send(res,404,{error:"Not found"});
 }catch(e){return send(res,e.status||500,{error:e.message,details:e.details})}
}
http.createServer((req,res)=>handle(req,res)).listen(PORT,HOST,()=>console.log("Poster Studio is at http://"+HOST+":"+PORT));
