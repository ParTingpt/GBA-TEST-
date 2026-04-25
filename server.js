const express=require('express');
const fs=require('fs');
const path=require('path');
const app=express();
const PORT=process.env.PORT||3000;
const dir=path.join(__dirname,'data');
const file=path.join(dir,'assessments.jsonl');
fs.mkdirSync(dir,{recursive:true});
app.use(express.json({limit:'10mb'}));
app.use(express.static(__dirname));
function all(){
 if(!fs.existsSync(file))return [];
 return fs.readFileSync(file,'utf8').split('\n').filter(Boolean).map(x=>JSON.parse(x));
}
app.post('/api/assessments',(req,res)=>{
 const b=req.body||{};
 if(!b.info||!b.results||!Array.isArray(b.trials))return res.status(400).json({error:'Invalid payload'});
 const r={id:'GBA-'+Date.now(),saved_at:new Date().toISOString(),info:b.info,results:b.results,trials:b.trials};
 fs.appendFileSync(file,JSON.stringify(r)+'\n','utf8');
 res.json({ok:true,id:r.id});
});
app.get('/api/assessments',(req,res)=>{
 res.json(all().map(x=>({id:x.id,saved_at:x.saved_at,name:x.info?.name,gender:x.info?.gender,age:x.info?.age,grade:x.info?.grade,overall:x.results?.overall,forest_risk:x.results?.forest?.risk,space_risk:x.results?.space?.risk,trial_count:x.trials?.length||0})).reverse());
});
app.get('/api/assessments/:id',(req,res)=>{
 const r=all().find(x=>x.id===req.params.id);
 if(!r)return res.status(404).json({error:'Not found'});
 res.json(r);
});
app.listen(PORT,()=>console.log('GBA backend http://localhost:'+PORT));
