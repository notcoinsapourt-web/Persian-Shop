import { Pool } from "pg";
import { categories as fallbackCategories, products as fallbackProducts } from "../data/catalog";

export type StoreCategory={id:string;dbId?:number;name:string;en:string;emoji:string;description:string;count:number};
export type StoreProduct={id:number|string;slug:string;category:string;name:string;en:string;description:string;price:number;image:string;emoji:string;inputPrompt:string};
export type StoreSettings={shopName:string;currency:string;supportUsername:string;cardEnabled:boolean;cardNumber:string;cardHolder:string;cardText:string;cryptoEnabled:boolean;cryptoNetwork:string;cryptoAddress:string;cryptoText:string};
export type StoreData={categories:StoreCategory[];products:StoreProduct[];settings:StoreSettings};

const defaults:StoreSettings={shopName:"Persian Shop",currency:"تومان",supportUsername:"",cardEnabled:true,cardNumber:"",cardHolder:"",cardText:"",cryptoEnabled:true,cryptoNetwork:"BEP20",cryptoAddress:"",cryptoText:""};
const categoryEn:Record<string,string>={"خدمات تلگرام":"Telegram","خدمات اینستاگرام":"Instagram","خدمات تیک‌تاک":"TikTok","خدمات یوتیوب":"YouTube","اشتراک هوش مصنوعی":"AI Services","سایر محصولات دیجیتال":"Digital Premium","سایر شبکه‌های اجتماعی":"Other Social"};
const categorySlug:Record<string,string>={"خدمات تلگرام":"telegram","خدمات اینستاگرام":"instagram","خدمات تیک‌تاک":"tiktok","خدمات یوتیوب":"youtube","اشتراک هوش مصنوعی":"ai","سایر محصولات دیجیتال":"digital","سایر شبکه‌های اجتماعی":"social"};
const bool=(v:string|undefined)=>v==="true"||v==="1";
const imageSlug=(url:string|undefined|null)=>{if(!url)return "";return url.split("?",1)[0].split("/").pop()?.replace(/\.jpg$/i,"")||""};

function fallback():StoreData{
 const cats:StoreCategory[]=fallbackCategories.map(c=>({id:c.id,name:c.fa,en:c.en,emoji:c.emoji,description:c.desc,count:fallbackProducts.filter(p=>p.category===c.id).length}));
 const prods:StoreProduct[]=fallbackProducts.map((p,i)=>({id:i+1,slug:p.id,category:p.category,name:p.fa,en:p.en,description:"",price:p.price,image:p.image,emoji:"💎",inputPrompt:"اطلاعات لازم برای سفارش را وارد کنید."}));
 return {categories:cats,products:prods,settings:defaults};
}

export async function getStoreData():Promise<StoreData>{
 if(!process.env.DATABASE_URL)return fallback();
 const pool=new Pool({connectionString:process.env.DATABASE_URL,max:3});
 try{
  const [catalog,settingsResult]=await Promise.all([
   pool.query(`SELECT p.id,p.name,p.description,p.price,p.photo_file_id,p.emoji,p.input_prompt,p.sort_order,c.id AS category_id,c.name AS category_name,c.description AS category_description,c.emoji AS category_emoji,c.sort_order AS category_sort FROM products p JOIN categories c ON c.id=p.category_id WHERE p.is_active=true AND c.is_active=true ORDER BY c.sort_order,p.sort_order,p.id`),
   pool.query(`SELECT key,value FROM settings WHERE key IN ('shop_name','currency','support_username','wallet_card_enabled','wallet_card_number','wallet_card_holder','wallet_card_text','wallet_crypto_enabled','wallet_crypto_network','wallet_crypto_address','wallet_crypto_text')`)
  ]);
  const settingMap=Object.fromEntries(settingsResult.rows.map(r=>[String(r.key),String(r.value??"")]));
  const settings:StoreSettings={shopName:settingMap.shop_name||defaults.shopName,currency:settingMap.currency||defaults.currency,supportUsername:settingMap.support_username||"",cardEnabled:bool(settingMap.wallet_card_enabled),cardNumber:settingMap.wallet_card_number||"",cardHolder:settingMap.wallet_card_holder||"",cardText:settingMap.wallet_card_text||"",cryptoEnabled:bool(settingMap.wallet_crypto_enabled),cryptoNetwork:settingMap.wallet_crypto_network||"BEP20",cryptoAddress:settingMap.wallet_crypto_address||"",cryptoText:settingMap.wallet_crypto_text||""};
  const fallbackBySlug=new Map(fallbackProducts.map(p=>[p.id,p]));
  const products:StoreProduct[]=catalog.rows.map(r=>{const slug=imageSlug(r.photo_file_id)||`product-${r.id}`;const fp=fallbackBySlug.get(slug);return {id:Number(r.id),slug,category:categorySlug[String(r.category_name)]||`category-${r.category_id}`,name:String(r.name),en:fp?.en||String(r.name),description:String(r.description||""),price:Number(r.price||0),image:String(r.photo_file_id||fp?.image||""),emoji:String(r.emoji||"💎"),inputPrompt:String(r.input_prompt||"اطلاعات لازم برای سفارش را وارد کنید.")}});
  const categoryMap=new Map<string,StoreCategory>();
  for(const row of catalog.rows){const id=categorySlug[String(row.category_name)]||`category-${row.category_id}`;if(!categoryMap.has(id))categoryMap.set(id,{id,dbId:Number(row.category_id),name:String(row.category_name),en:categoryEn[String(row.category_name)]||String(row.category_name),emoji:String(row.category_emoji||"🛍️"),description:String(row.category_description||""),count:0});categoryMap.get(id)!.count++;}
  return {categories:[...categoryMap.values()],products,settings};
 }catch(error){console.error("store database unavailable",error);return fallback();}finally{await pool.end();}
}
