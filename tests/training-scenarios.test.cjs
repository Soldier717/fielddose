const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function load(storageMode='normal'){
 const nodes=new Map(),stored=new Map();
 function node(){return {value:'guided',hidden:false,innerHTML:'',textContent:'',disabled:false,onclick:null,querySelectorAll:()=>[],querySelector:()=>null,focus(){},showModal(){},close(){}}}
 const get=id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)};
 const storage={getItem:k=>{if(storageMode==='blocked')throw Error('blocked');return storageMode==='corrupt'?'broken-json':stored.get(k)||null},setItem:(k,v)=>{if(storageMode==='blocked')throw Error('blocked');stored.set(k,v)}};
 const ctx=vm.createContext({document:{getElementById:get,querySelector:id=>["#medForm","#handoffForm"].includes(id)?null:get(id)},window:{scrollTo(){}},localStorage:storage,console});
 for(const p of ['training-data.js','question-bank.js','scenarios.js','app.js','training.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../public/training',p),'utf8'),ctx);
 return code=>vm.runInContext(code,ctx);
}
const run=load();
assert.equal(run('CASE_BANK.length'),8);
assert.equal(run('new Set(CASE_BANK.map(c=>c.id)).size'),8);
assert.equal(run('new Set(CASE_BANK.map(c=>c.topic)).size'),4);
for(let i=0;i<8;i++){
 run('startTrainingScenario(CASE_BANK['+i+']);action("start");action("treat")');
 assert.equal(run('medicate(currentCase.treatment.drug,currentCase.treatment.dose,currentCase.treatment.route,currentCase.treatment.unit)'),false,'allergy/right gates');
 run('action("back");Object.keys(findings).forEach(assess);action("treat");s.rights=rightsList.map(r=>r[0]);s.draft={...currentCase.treatment,med:currentCase.treatment.drug}');
 assert.equal(run('medicate(currentCase.treatment.drug,currentCase.treatment.dose,currentCase.treatment.route,currentCase.treatment.unit)'),false,'partner required');
 run('action("partner")');assert.equal(run('s.partnerChecked'),true);
 assert.equal(run('medicate(currentCase.treatment.drug,currentCase.treatment.dose,currentCase.treatment.route,currentCase.treatment.unit==="g"?"mg":"g")'),false,'wrong unit blocked');
 assert.equal(run('medicate(currentCase.treatment.drug,currentCase.treatment.dose,currentCase.treatment.route,currentCase.treatment.unit)'),true,'correct case-specific medication');
 assert.equal(run('canComplete()'),false);
 run('action("reassess");action("check")');assert.equal(run('canComplete()'),false,'response required');
 run('s.response=currentCase.response;s.responseNote="Observed and recorded case findings"');assert.equal(run('canComplete()'),true);
 assert.equal(run('criteria().find(x=>x[0]==="Response interpretation")[1]'),true);
 assert.equal(run('patient().status===currentCase.responseStatus'),true);
 run('action("restart")');assert.equal(run('s.stage'),0);assert.equal(run('s.med'),false);assert.equal(run('s.rights.length'),0);assert.equal(run('s.logs.length'),0);
}
// Case-specific prerequisites must hold even if rights and allergy were checked.
run('startTrainingScenario(CASE_BANK.find(c=>c.id==="missed-meal"));action("start");assess("allergies");action("treat");s.rights=rightsList.map(r=>r[0]);s.draft={med:"oralGlucose",dose:30,unit:"g",route:"po"};action("partner")');
assert.equal(run('s.partnerChecked'),false,'safe swallow/BGL prerequisite enforced');
for(const mode of ['normal','blocked','corrupt']){
 const r=load(mode);r('TrainingApp.navigate("scenarios");TrainingApp.launchCase()');
 const ids=[r('currentCase.id')];
 for(let i=1;i<24;i++){r('s.stage=4;action("next")');ids.push(r('currentCase.id'));assert.equal(r('s.stage'),0);assert.equal(r('currentCase.id===TrainingApp.getState().caseId'),true);assert.equal(r('s.med'),false)}
 for(let i=0;i<24;i+=8)assert.equal(new Set(ids.slice(i,i+8)).size,8,mode+' all cases before repeat');
 for(let i=1;i<ids.length;i++)assert.notEqual(ids[i],ids[i-1],mode+' no immediate repeats');
}
console.log('OK — 8 case-specific medication paths, units, prerequisites, reassessment, replay, next-case rotation and storage fallback.');
