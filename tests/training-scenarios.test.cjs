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
assert.equal(run('CASE_BANK.length'),70);
assert.equal(run('new Set(CASE_BANK.map(c=>c.id)).size'),70);
assert.equal(run('new Set(CASE_BANK.map(c=>c.category)).size'),7);
for(const category of run('SCENARIO_CATEGORIES'))assert.equal(run('CASE_BANK.filter(c=>c.category==='+JSON.stringify(category)+').length'),10);
assert.equal(run('CASE_BANK.filter(c=>c.ageGroup==="pediatric").length'),32);
assert.equal(run('CASE_BANK.filter(c=>c.ageGroup==="adult").length'),38);
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

for(let i=8;i<70;i++){
 run('startTrainingScenario(CASE_BANK['+i+']);action("start");action("treat")');
 assert.equal(run('chooseDecision(s.decisionOptions.indexOf(currentCase.decision.answer))'),false,'findings required before the training decision check');
 assert.equal(run('medicate("albuterol",2.5,"neb","mg")'),false,'decision case cannot administer a medication');
 run('action("back");Object.keys(findings).forEach(assess);action("treat")');
 assert.equal(run('chooseDecision(-1)'),false,'invalid decision blocked');
 assert.equal(run('chooseDecision(s.decisionOptions.findIndex(a=>a!==currentCase.decision.answer))'),false,'wrong decision flagged');
 assert.equal(run('chooseDecision(s.decisionOptions.indexOf(currentCase.decision.answer))'),true,'source-linked decision verified');
 assert.equal(run('s.med'),false,'decision never logs a medication');
 assert.equal(run('canComplete()'),false,'reassessment required');
 run('action("reassess");action("check")');
 assert.equal(run('canComplete()'),false,'document response');
 run('s.response=currentCase.response;s.responseNote="Repeated the case findings; ongoing care and monitoring needed."');
 assert.equal(run('canComplete()'),true,'decision case can complete');
 assert.equal(run('criteria().find(x=>x[0]==="Protocol decision")[1]'),true);
 assert.equal(run('patient().status===currentCase.responseStatus'),true);
 run('action("restart")');assert.equal(run('s.decisionVerified'),false);
 assert.equal(run('s.decisionAttempts.length'),0);
}
const filtered=load();
for(const category of filtered('SCENARIO_CATEGORIES')){
 for(const population of ['all','adult','pediatric']){
  filtered('TrainingApp.getState().caseCategory='+JSON.stringify(category)+';TrainingApp.getState().casePopulation='+JSON.stringify(population)+';TrainingApp.navigate("scenarios");TrainingApp.launchCase()');
  assert.equal(filtered('currentCase.category'),category);
  if(population!=='all')assert.equal(filtered('currentCase.ageGroup'),population);
 }
}

for(const mode of ['normal','blocked','corrupt']){
 const r=load(mode);r('TrainingApp.navigate("scenarios");TrainingApp.launchCase()');
 const ids=[r('currentCase.id')];
 for(let i=1;i<210;i++){r('s.stage=4;action("next")');ids.push(r('currentCase.id'));assert.equal(r('s.stage'),0);assert.equal(r('currentCase.id===TrainingApp.getState().caseId'),true);assert.equal(r('s.med'),false)}
 for(let i=0;i<210;i+=70)assert.equal(new Set(ids.slice(i,i+70)).size,70,mode+' all cases before repeat');
 for(let i=1;i<ids.length;i++)assert.notEqual(ids[i],ids[i-1],mode+' no immediate repeats');
}
console.log('OK — 70 scenarios, seven categories, mixed populations, eight medication paths, 62 decision paths, filtering, reassessment, replay and 70-case rotation/storage fallback.');
