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
 if(!b.info||!b.results)return res.status(400).json({error:'Invalid payload'});
 const r={id:'GBA-'+Date.now(),type:b.type||'gba',saved_at:new Date().toISOString(),info:b.info,results:b.results,scores:b.scores||{},trials:b.trials||[],self_report_items:b.self_report_items||[],follow_status:'待查看'};
 fs.appendFileSync(file,JSON.stringify(r)+'\n','utf8');
 res.json({ok:true,id:r.id});
});
app.get('/api/assessments',(req,res)=>{
 res.json(all().map(x=>({id:x.id,type:x.type,saved_at:x.saved_at,name:x.info?.nickname||x.info?.name,gender:x.info?.gender,age:x.info?.age,grade:x.info?.grade,overall:x.results?.overall_risk||x.results?.overall,follow_status:x.follow_status||'待查看',trial_count:x.trials?.length||0,self_count:x.self_report_items?.length||0})).reverse());
});
app.get('/api/assessments/:id',(req,res)=>{
 const r=all().find(x=>x.id===req.params.id);
 if(!r)return res.status(404).json({error:'Not found'});
 res.json(r);
});
app.listen(PORT,()=>console.log('GBA backend http://localhost:'+PORT));
