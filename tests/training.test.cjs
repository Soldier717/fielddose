// Integration guards for supplied training content, not independent clinical validation.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.join(__dirname,'..'),dir=path.join(root,'public/training');
const ctx=vm.createContext({});
for(const name of ['training-data.js','question-bank.js','scenarios.js'])vm.runInContext(fs.readFileSync(path.join(dir,name),'utf8'),ctx);
const {questions,drugs,cases,topics}=vm.runInContext('({questions:QUESTION_BANK,drugs:DRUG_BANK,cases:CASE_BANK,topics:TRAINING_TOPICS})',ctx);
assert.equal(questions.length,200);assert.equal(new Set(questions.map(q=>q.id)).size,200);
assert.equal(questions.filter(q=>q.banks.includes('protocol')).length,114);
assert.equal(questions.filter(q=>q.banks.includes('drug')).length,160);
assert.equal(Object.keys(topics).length,20);assert.equal(drugs.length,36);
assert.equal(drugs.filter(d=>d.setup?.length).length,14);assert.equal(cases.length,8);
for(const q of questions){assert.equal(q.options.length,4,q.id);assert.equal(new Set(q.options).size,4,q.id);assert(q.options.includes(q.answer),q.id);assert.equal(q.blank.split('___').length,2,q.id);assert(Number.isInteger(q.page)&&q.page>0,q.id);assert(q.explanation,q.id);}
const hashes=JSON.parse(fs.readFileSync(path.join(root,'docs/training-source-hashes.json')));
for(const name of ['training-data.js','question-bank.js','references/swfl-2026-guidelines.pdf'])assert.equal(crypto.createHash('sha256').update(name.endsWith('.js') ? fs.readFileSync(path.join(dir,name),'utf8').replace(/\r\n/g,'\n') : fs.readFileSync(path.join(dir,name))).digest('hex'),hashes[name],name+' clinical source changed; requires explicit review');
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
let last=-1;for(const name of ['training-data.js','question-bank.js','scenarios.js','app.js','training.js']){const i=html.indexOf('src="/training/'+name+'"');assert(i>last);last=i;}
for(const m of html.matchAll(/(?:src|href)="([/][^"#]+)(?:#[^"]*)?"/g)){if(m[1]==='/'||m[1]==='/training')continue;assert(fs.existsSync(path.join(root,'public',m[1])),m[1]);}
const routes=JSON.parse(fs.readFileSync(path.join(root,'vercel.json'))).rewrites;
for(const route of ['/training','/training/'])assert(routes.some(r=>r.source===route&&r.destination==='/public/training/index.html'));
console.log('OK — training source integrity, 200 questions, 36 medications, 14 drills, 8 scenarios, assets and routes.');
