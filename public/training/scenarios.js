'use strict';
// Authored fictional observations; clinical anchors use the bundled SWFL Revised 8/2026 PDF.
// All exercises cover one initial medication, not an entire treatment protocol.
const SCENARIO_ROUTES={neb:'Nebulized',iv:'IV',im:'IM',po:'PO (chewable / gel)',odt:'PO (ODT)'};
const SCENARIO_DRUGS={albuterol:'Albuterol',aspirin:'Aspirin',oralGlucose:'Oral glucose gel',ondansetron:'Ondansetron',nitroglycerin:'Nitroglycerin',naloxone:'Naloxone'};
const respiratoryFindings=c=>({
 primary:['Primary survey','Alert; patent airway. Short phrases, accessory muscle use, strong radial pulse. No trauma.'],
 lungs:['Chest examination','Bilateral expiratory wheeze with reduced air movement. No crackles, stridor, hives or edema.'],
 history:['Focused history',c.name+' reports asthma after '+c.trigger+'. Rescue inhaler is empty; last albuterol was yesterday. No chest pain, fever, choking, swelling or prior intubation.'],
 allergies:['Allergies & prior reactions',c.name+' reports no medication allergies and previous albuterol without a reaction.'],
 capno:['Capnography','EtCO₂ 32 mmHg with an obstructive waveform; spontaneously breathing.'],
 ecg:['Cardiac monitor / 12-lead','Sinus tachycardia; no acute ischemic changes in this scripted report.'],
 glucose:['Blood glucose','BGL 108 mg/dL.']
});
function configureRespiratory(c,response='improved'){
 Object.assign(c,{topic:'Respiratory',dispatch:'Difficulty breathing',complaint:'I cannot catch my breath.',response,
 treatment:{drug:'albuterol',dose:2.5,unit:'mg',route:'neb',label:'Albuterol 2.5 mg nebulized'},
 prerequisites:['primary','lungs','history'],oxygenIndicated:true,
 baselineStatus:'Alert, anxious, short phrases and increased work of breathing.',
 responseStatus:response==='improved'?'Longer phrases and less accessory muscle use; wheeze persists.':response==='unchanged'?'No meaningful change: short phrases, persistent wheeze and accessory muscle use.':'Increasing fatigue, fewer words and poorer air movement. Escalation and further care are needed.',
 delayedStatus:'Increasing work of breathing with poorer air movement; still alert.',
 references:[[60,'Reactive Airway Disease'],[100,'Albuterol'],[222,'Nebulizer therapy'],[97,'Medication safety']],
 clinical:'SWFL PDF p. 60: initial albuterol 2.5 mg AT; nebulized route per p. 100. Repeat PRN is in the guideline; repeats and additional respiratory treatments are outside this exercise.',
 focus:'Assess breathing, oxygenation and ventilation; practice one initial inhaled bronchodilator and reassessment.',
 responseLesson:response==='improved'?'Improvement is partial. Persistent wheeze still needs ongoing assessment and care.':response==='unchanged'?'Recognize lack of improvement; revisit assessment and escalate treatment per the full guideline.':'Recognize deterioration and escalate promptly. This simulator does not deliver advanced airway or additional drug therapy.',
 findings:respiratoryFindings(c)});
 c.after=response==='improved'?{...c.improved}:response==='unchanged'?{...c.baseline}:{...c.worse};
}
CASE_BANK.forEach(c=>configureRespiratory(c));
for(const c of [
 {id:'workshop',name:'Marcus',age:39,sex:'male',location:'a woodworking shop',arrival:'Marcus leans on a workbench.',scene:'He cannot finish a sentence comfortably. A coworker brings his empty inhaler.',trigger:'sanding wood',title:'Wheeze that persists.',response:'unchanged',baseline:{hr:116,bp:'144/86',rr:30,spo:90},worse:{hr:126,bp:'140/84',rr:34,spo:87}},
 {id:'overnight',name:'Rosa',age:52,sex:'female',location:'an apartment',arrival:'Rosa sits upright on the edge of the bed.',scene:'Her family says the wheezing worsened overnight. She looks tired but follows commands.',trigger:'overnight wheezing',title:'Watch the response.',response:'worse',baseline:{hr:120,bp:'148/90',rr:30,spo:90},worse:{hr:130,bp:'136/82',rr:34,spo:86}}
]){configureRespiratory(c,c.response);CASE_BANK.push(c);}
const common=(name)=>({allergies:['Allergies & prior reactions',name+' reports no known medication allergies.'],lungs:['Chest examination','Clear breath sounds bilaterally; no wheeze or crackles.']});
CASE_BANK.push(
 {id:'chest-pressure',name:'James',age:62,sex:'male',topic:'Chest pain',dispatch:'Chest pressure',complaint:'There is a heavy pressure in my chest.',location:'a grocery store',arrival:'James is seated near the checkout.',scene:'He is pale and sweaty. Pressure started 20 minutes ago while walking.',title:'Pressure in the aisle.',baseline:{hr:92,bp:'154/92',rr:20,spo:97},after:{hr:92,bp:'154/92',rr:20,spo:97},worse:{hr:106,bp:'142/86',rr:24,spo:96},response:'unchanged',oxygenIndicated:false,
 baselineStatus:'Alert and diaphoretic; persistent central chest pressure.',responseStatus:'Chest pressure remains 7/10. No new wheeze, bleeding or other reported adverse effect.',delayedStatus:'Chest pressure persists; patient remains alert.',
 treatment:{drug:'aspirin',dose:324,unit:'mg',route:'po',label:'Aspirin 324 mg PO, chewed'},prerequisites:['primary','history','ecg'],
 findings:{...common('James'),primary:['Primary survey','Alert, patent airway, normal speech, strong radial pulse. Can safely chew and swallow.'],history:['Focused history & medication safety','Central pressure radiates to left arm. No aspirin taken today. No aspirin anaphylaxis, active bleeding, GI bleeding or vomiting reported.'],ecg:['12-lead / cardiac monitor','Sinus rhythm in this scripted report; no ST elevation reported. This does not exclude ACS. Serial ECGs and ongoing evaluation remain indicated.'],glucose:['Blood glucose','BGL 124 mg/dL.']},
 references:[[69,'Chest Pain / ACS / STEMI'],[102,'Aspirin'],[97,'Medication safety']],clinical:'SWFL PDF p. 69: aspirin 324 mg PO (chewable). Page 102 lists known anaphylaxis and active uncontrolled bleeding as contraindications; consider GI bleeding. This exercise covers aspirin only, not the full ACS bundle.',focus:'Assess suspected ACS, review bleeding/allergy history and obtain a 12-lead. Practice aspirin and ongoing reassessment.',responseLesson:'Aspirin is not a test of immediate pain relief. Persistent pain requires ongoing ACS care; do not repeat aspirin just because pain is unchanged.'},
 {id:'missed-meal',name:'Nina',age:47,sex:'female',topic:'Hypoglycemia',dispatch:'Weakness and sweating',complaint:'I feel shaky and weak.',location:'an office break room',arrival:'Nina is sitting at a table with a coworker.',scene:'She took insulin but missed lunch. She is awake, oriented and answers clearly.',title:'A missed meal.',baseline:{hr:104,bp:'138/82',rr:18,spo:98,bgl:48},after:{hr:92,bp:'132/80',rr:18,spo:98,bgl:82},worse:{hr:112,bp:'134/80',rr:20,spo:98,bgl:44},response:'improved',oxygenIndicated:false,
 baselineStatus:'Alert and oriented, shaky and sweaty; protects airway.',responseStatus:'Less shaky, clearer concentration and less sweating. Repeat BGL 82 mg/dL.',delayedStatus:'Shakiness and sweating persist. Recheck mental status and glucose.',
 treatment:{drug:'oralGlucose',dose:30,unit:'g',route:'po',label:'Oral glucose gel 30 g PO'},prerequisites:['primary','history','glucose','swallow'],
 findings:{...common('Nina'),primary:['Primary survey','Alert, oriented, patent airway; no respiratory distress.'],history:['Focused history','Insulin-treated diabetes. Usual insulin taken but lunch missed. No glucose treatment yet; no oral hypoglycemic medicines reported.'],glucose:['Blood glucose','BGL 48 mg/dL.'],swallow:['Check safe oral administration','Protects airway, intact gag, follows commands and swallows safely. No vomiting.'],ecg:['Cardiac monitor','Sinus tachycardia in this scripted report.']},
 references:[[56,'Diabetic Emergencies'],[137,'Oral glucose'],[97,'Medication safety']],clinical:'SWFL PDF p. 56: for adult blood glucose below 60 mg/dL, oral glucose 30 g PO. Page 137: only if airway protected and swallowing safe; not for an unresponsive patient or active vomiting. Consider complex carbohydrates after correction and normal mentation.',focus:'Measure glucose and confirm airway protection and safe swallowing before practicing oral glucose administration.',responseLesson:'Reassess mental status and repeat BGL. Continue monitoring for recurrent hypoglycemia; this one-dose exercise does not decide release or refusal.',responseTiming:'Simulated follow-up values are not a promised one-minute glucose response.'},
 {id:'nausea-home',name:'Lena',age:36,sex:'female',topic:'Nausea',dispatch:'Nausea and vomiting',complaint:'I cannot shake this nausea.',location:'a home',arrival:'Lena is sitting upright beside an emesis basin.',scene:'She reports two vomiting episodes. She is not actively vomiting now and can manage oral secretions.',title:'An unsettled morning.',baseline:{hr:96,bp:'126/78',rr:16,spo:98},after:{hr:90,bp:'124/76',rr:16,spo:98},worse:{hr:104,bp:'120/74',rr:18,spo:98},response:'improved',oxygenIndicated:false,
 baselineStatus:'Alert, nausea rated 8/10; no respiratory distress.',responseStatus:'Nausea reduced to 4/10; no further emesis or reported adverse effect during reassessment.',delayedStatus:'Nausea persists; reassess for dehydration and other causes.',
 treatment:{drug:'ondansetron',dose:4,unit:'mg',route:'odt',label:'Ondansetron 4 mg PO (ODT)'},prerequisites:['primary','history'],
 findings:{...common('Lena'),primary:['Primary survey','Alert, patent airway, normal speech. No active vomiting; can manage oral medication.'],history:['Focused history & medication safety','Nausea began this morning. No chest pain, severe headache, focal neurologic change, trauma, severe abdominal pain or GI bleeding reported. No antiemetic taken today. No reported pregnancy, breastfeeding, long-QT history or serotonergic medicines.'],abdomen:['Abdominal examination','Mild diffuse discomfort without guarding or rigidity in this scripted examination.'],glucose:['Blood glucose','BGL 104 mg/dL.'],ecg:['Cardiac monitor','Sinus rhythm; no prolonged QT reported in this scripted tracing summary.']},
 references:[[49,'Nausea & Vomiting'],[136,'Ondansetron'],[97,'Medication safety']],clinical:'SWFL PDF p. 49: adult ondansetron 4 mg ODT. Page 136: monitor blood pressure; review pregnancy, breastfeeding and serotonin-reuptake-inhibitor precautions and potential ECG/QT effects. This exercise uses ODT, not injectable or intranasal dosing.',focus:'Evaluate causes and medication history before practicing a single oral-disintegrating antiemetic dose.',responseLesson:'Symptom improvement does not establish the cause. Continue assessment and monitor hydration, blood pressure and adverse effects.'}
);
for(const c of CASE_BANK){c.findings.vitals=['Baseline vital signs','HR '+c.baseline.hr+' bpm · BP '+c.baseline.bp+' mmHg · RR '+c.baseline.rr+'/min · SpO₂ '+c.baseline.spo+'% on room air.'];}

// Expanded authored cases: decisions reuse source-linked bank facts; they do not simulate drug administration.
const SCENARIO_CATEGORIES=["Airway / Respiratory","Cardiac","Neuro","AMS","Toxicology / Pharmacology","Trauma","Medical"];
for(const c of CASE_BANK) {
 c.ageGroup='adult'; c.exercise='medication';
 c.category=c.topic==='Respiratory'?SCENARIO_CATEGORIES[0]:c.topic==='Chest pain'?SCENARIO_CATEGORIES[1]:c.topic==='Hypoglycemia'?SCENARIO_CATEGORIES[3]:SCENARIO_CATEGORIES[6];
 c.dispatchNote='Caller reports the patient is awake.';
}
const DECISION_CASES=[
 [
  0,
  "peds-wheeze",
  "alb-ped",
  8,
  "Leo",
  "a school nurse's office",
  "Wheezing after recess",
  "Leo has asthma and wheezing after outdoor play. His inhaler is unavailable.",
  "Alert; airway patent; short phrases and bilateral expiratory wheeze.",
  [
   118,
   "108/68",
   28,
   92
  ],
  "Pediatric nebulized bronchodilator"
 ],
 [
  0,
  "croup-rebound",
  "race-rebound",
  3,
  "Ava",
  "a family home",
  "Noisy breathing after croup treatment",
  "Ava received nebulized epinephrine before your arrival. Her parent says the noise briefly improved and has returned.",
  "Awake; barking cough and stridor at rest; continuing airway assessment is needed.",
  [
   132,
   "94/58",
   32,
   93
  ],
  "Croup reassessment"
 ],
 [
  0,
  "peds-steroid",
  "dex-pedmax",
  12,
  "Noah",
  "an urgent-care parking lot",
  "Persistent wheezing",
  "Noah's wheeze persists after an initial nebulizer. The crew is reviewing the pediatric steroid reference, not a new administration order.",
  "Alert; bilateral wheeze; adequate perfusion; no rash or swelling.",
  [
   110,
   "112/70",
   26,
   94
  ],
  "Pediatric steroid limit"
 ],
 [
  0,
  "resp-mag-caution",
  "mag-contra",
  54,
  "Andre",
  "an apartment",
  "Severe wheezing with low blood pressure",
  "Andre remains wheezy after inhaled treatment. Before considering magnesium, you find hypotension.",
  "Awake, distressed; bilateral wheeze; cool skin and weak peripheral pulse.",
  [
   128,
   "82/50",
   30,
   90
  ],
  "Refractory wheeze with hypoperfusion"
 ],
 [
  0,
  "neb-no-mist",
  "neb-mist",
  6,
  "Mia",
  "a playground",
  "Wheezing and nebulizer setup",
  "Mia is wheezing. A new nebulizer is connected but there is no visible aerosol. Verify preparation rather than recording a delivered dose.",
  "Alert; airway patent; wheeze; strong radial pulse.",
  [
   120,
   "102/64",
   28,
   93
  ],
  "Nebulizer delivery check"
 ],
 [
  1,
  "svt-stable",
  "tach-adenosine",
  32,
  "Owen",
  "a fitness center",
  "Sudden racing heartbeat",
  "The monitor shows a regular narrow-complex tachycardia. Owen is alert and perfusing; the stable adult SVT reference is being reviewed.",
  "Alert; patent airway; regular rapid pulse; BP maintained.",
  [
   184,
   "124/78",
   20,
   98
  ],
  "Stable adult SVT"
 ],
 [
  1,
  "vt-infusion",
  "tach-amio-time",
  67,
  "Helen",
  "a living room",
  "Palpitations with a wide-complex rhythm",
  "The scripted monitor report identifies stable monomorphic VT with a pulse. The crew checks the infusion duration before preparation.",
  "Alert; pulse present; skin warm; no loss of consciousness.",
  [
   158,
   "118/72",
   22,
   96
  ],
  "Stable VT preparation"
 ],
 [
  1,
  "brady-first-dose",
  "brady-atropine",
  74,
  "Walter",
  "a retirement residence",
  "Dizziness and a slow pulse",
  "Walter has dizziness, pallor and a sinus bradycardia report. The crew reviews the initial adult atropine dose while preparing further care.",
  "Alert but weak; pulse slow; airway patent; BP reduced.",
  [
   38,
   "88/54",
   20,
   96
  ],
  "Symptomatic adult bradycardia"
 ],
 [
  1,
  "brady-no-response",
  "brady-no-repeat",
  69,
  "Irene",
  "a kitchen",
  "Bradycardia after an ineffective dose",
  "The initial atropine dose produced no meaningful response. Verify Irene's identity and the actual prior treatment in the crew's medication record.",
  "Irene is awake with persistent weakness, slow pulse and hypotension.",
  [
   36,
   "84/50",
   22,
   95
  ],
  "Ineffective atropine reassessment"
 ],
 [
  1,
  "pulmonary-edema",
  "chf-cpap",
  61,
  "Graham",
  "a bedroom",
  "Severe orthopnea",
  "Graham cannot lie flat. Bilateral crackles and adequate blood pressure accompany pulmonary edema in this scripted assessment. Verify CPAP settings and suitability.",
  "Alert and cooperative; patent airway; crackles and increased breathing effort.",
  [
   116,
   "174/98",
   32,
   88
  ],
  "Pulmonary edema support"
 ],
 [
  1,
  "peds-rosc-ecg",
  "post-ecg",
  15,
  "Jules",
  "a sports field",
  "Pulse restored after collapse",
  "Jules has regained a pulse after resuscitation. The focused exercise is the post-arrest ECG action, not pediatric hemodynamic targets.",
  "Pulse present; assisted ventilation continues; repeated airway and circulation assessment needed.",
  [
   112,
   "108/66",
   14,
   95
  ],
  "Pediatric post-arrest handoff"
 ],
 [
  1,
  "peds-arrest-naloxone",
  "arrest-naloxone",
  16,
  "Sam",
  "a friend's home",
  "Pulseless collapse with possible exposure",
  "Sam is pulseless. A bystander suspects opioid exposure. CPR and pad placement are underway; decide whether naloxone replaces arrest priorities.",
  "Unresponsive; no palpable pulse; no normal breathing; ongoing CPR.",
  [
   0,
   "not obtainable",
   0,
   0
  ],
  "Pediatric arrest priorities"
 ],
 [
  1,
  "chest-pain-serial-ecg",
  "acs-ecg",
  43,
  "Nate",
  "an office",
  "Persistent chest pressure",
  "Nate has persistent pressure despite an initial ECG without reported ST elevation. A single tracing does not end ACS assessment.",
  "Alert; patent airway; chest pressure continues; skin moist.",
  [
   96,
   "148/86",
   22,
   97
  ],
  "Serial ECG reassessment"
 ],
 [
  1,
  "peds-diltiazem-caution",
  "dilt-wide",
  17,
  "Tess",
  "a gymnasium",
  "Palpitations with a wide-complex rhythm",
  "Tess is alert with a pulse and a wide-complex rhythm. A teammate suggests a familiar narrow-complex medication; check the drug's safety exclusion.",
  "Alert; patent airway; fast regular pulse; QRS is wide in the scripted ECG report.",
  [
   166,
   "110/70",
   24,
   97
  ],
  "Wide-complex medication safety"
 ],
 [
  2,
  "seizure-iv",
  "seiz-iv",
  40,
  "Ben",
  "a bus stop",
  "Ongoing generalized seizure",
  "Ben continues convulsing. IV access is available. The crew supports airway and ventilation while checking the adult IV/IO seizure dose.",
  "Convulsing; airway and breathing need active support; pulse present.",
  [
   124,
   "146/88",
   22,
   92
  ],
  "Adult seizure with IV access"
 ],
 [
  2,
  "seizure-no-iv",
  "seiz-im",
  29,
  "Dara",
  "a warehouse",
  "Seizure without vascular access",
  "Dara remains convulsing and vascular access is not yet available. Review the route-specific adult IM/IN reference.",
  "Generalized seizure; pulse present; airway support in progress.",
  [
   126,
   "140/84",
   24,
   92
  ],
  "Adult seizure without IV access"
 ],
 [
  2,
  "seizure-repeat",
  "seiz-repeat",
  55,
  "Ravi",
  "a train platform",
  "Continued seizure after initial treatment",
  "A medication record confirms an initial adult midazolam dose. Convulsions continue; verify timing before considering a repeat.",
  "Continued seizure; pulse present; assisted airway support continues.",
  [
   122,
   "136/82",
   22,
   94
  ],
  "Seizure medication timing"
 ],
 [
  2,
  "adult-refractory-seizure",
  "seiz-keppra",
  46,
  "Lara",
  "a home",
  "Prolonged seizure despite initial therapy",
  "Lara has prolonged convulsions despite first-line treatment. Review the guideline's second-line adult infusion reference.",
  "Active seizure; airway support and monitoring continue.",
  [
   128,
   "138/84",
   24,
   93
  ],
  "Refractory adult seizure"
 ],
 [
  2,
  "peds-refractory-seizure",
  "seiz-pedcontrol",
  7,
  "Eli",
  "a school",
  "Refractory pediatric seizure",
  "Eli continues seizing after documented first-line treatment. The crew is considering levetiracetam and must check its authorization requirement.",
  "Active seizure; pulse present; ventilation supported; parent provides history.",
  [
   136,
   "100/62",
   26,
   93
  ],
  "Pediatric seizure escalation"
 ],
 [
  2,
  "peds-stroke-mimic",
  "stroke-glucose",
  14,
  "Mara",
  "a school cafeteria",
  "Sudden weakness and confusion",
  "Mara has slurred speech and unilateral weakness. Glucose is 42 mg/dL, so the low-glucose pathway must be considered while assessing the presentation.",
  "Confused; airway patent; weakness present; pulse strong.",
  [
   108,
   "112/68",
   20,
   98
  ],
  "Low-glucose neurologic presentation"
 ],
 [
  2,
  "adult-stroke-checklist",
  "stroke-checklist",
  71,
  "Felix",
  "a restaurant",
  "New facial droop",
  "Felix's companion describes a sudden facial droop and arm weakness. Glucose is 112 mg/dL. Review the named local stroke checklist.",
  "Awake; slurred speech; arm drift; airway patent.",
  [
   94,
   "168/92",
   20,
   97
  ],
  "Adult stroke assessment"
 ],
 [
  2,
  "peds-benzodiazepine-monitor",
  "diaz-resp",
  11,
  "Ivy",
  "a home",
  "Post-seizure medication monitoring",
  "Ivy's convulsions have stopped after documented benzodiazepine treatment. Breathing is now shallow; identify the serious respiratory adverse effect that needs monitoring.",
  "Drowsy; spontaneous breaths shallow; pulse present; airway support ready.",
  [
   108,
   "102/64",
   10,
   92
  ],
  "Pediatric post-seizure respiratory monitoring"
 ],
 [
  2,
  "peds-keppra-route",
  "keppra-route",
  9,
  "Finn",
  "an ambulance staging area",
  "Refractory seizure infusion preparation",
  "Medical control has ordered levetiracetam for Finn's refractory seizure. Verify the supported administration routes before preparation; this exercise does not supply a dose.",
  "Convulsions intermittent; pulse present; airway and ventilation supported.",
  [
   128,
   "104/66",
   24,
   94
  ],
  "Authorized pediatric anticonvulsant setup"
 ],
 [
  2,
  "peds-sedation-reassessment",
  "sedation-rass",
  13,
  "Zoe",
  "an emergency transport rendezvous",
  "Reassessment after procedural sedation",
  "Zoe has received documented sedation for a painful procedure under the full guideline. The procedure is complete; verify the reassessment scale used to document response.",
  "Drowsy; airway currently patent; pulse present; monitoring continues.",
  [
   98,
   "110/70",
   16,
   97
  ],
  "Pediatric sedation reassessment"
 ],
 [
  3,
  "ams-diabetes-threshold",
  "diab-threshold",
  63,
  "Evan",
  "a grocery checkout",
  "Confusion and sweating",
  "Evan has diabetes and cannot explain where he is. Glucose reads 48 mg/dL. Identify the guideline threshold rather than attributing confusion to behavior.",
  "Confused; airway patent; skin sweaty; pulse present.",
  [
   110,
   "138/80",
   20,
   98
  ],
  "Adult hypoglycemia recognition"
 ],
 [
  3,
  "peds-recurrent-hypoglycemia",
  "diab-recur",
  4,
  "Luca",
  "a grandparent's home",
  "Recurrent low glucose",
  "Luca's glucose falls again within ten minutes of correction. A caregiver finds an open bottle of diabetes tablets nearby.",
  "Drowsy; pulse present; airway and glucose require repeated assessment.",
  [
   124,
   "96/60",
   24,
   97
  ],
  "Recurrent pediatric hypoglycemia"
 ],
 [
  3,
  "ams-dextrose-concentration",
  "diab-d10",
  52,
  "Grace",
  "an office",
  "Altered mental status and low glucose",
  "Grace is confused and cannot safely take oral treatment. BGL is 38 mg/dL. The crew reviews the guideline's primary IV concentration.",
  "Drowsy; pulse present; oral swallowing is unsafe.",
  [
   112,
   "128/76",
   20,
   97
  ],
  "Adult IV glucose preparation"
 ],
 [
  3,
  "peds-glucose-endpoint",
  "diab-endpoint",
  10,
  "Amir",
  "a school clinic",
  "Low glucose with confusion",
  "Amir has documented hypoglycemia and ongoing treatment under the guideline. Identify the clinical endpoint used for titration; no pediatric dose is inferred here.",
  "Confused; spontaneous breathing; pulse present; continued monitoring.",
  [
   116,
   "104/64",
   22,
   98
  ],
  "Pediatric glucose-treatment endpoint"
 ],
 [
  3,
  "peds-unsafe-swallow",
  "oral-airway",
  5,
  "Esme",
  "a home",
  "Drowsiness and suspected low glucose",
  "Esme is drowsy and does not reliably swallow. A caregiver proposes glucose gel. Check the route-safety requirement before oral administration.",
  "Drowsy; airway needs close support; cannot reliably follow swallowing commands.",
  [
   120,
   "98/62",
   22,
   97
  ],
  "Pediatric oral-route safety"
 ],
 [
  3,
  "ams-opioid-breathing",
  "nalox-ventilate",
  38,
  "Mason",
  "a public restroom",
  "Unresponsive with slow breathing",
  "Mason has a pulse and very slow breathing after a suspected opioid exposure. Rescuers have removed the immediate scene hazards.",
  "Unresponsive; pulse present; slow shallow respirations; ventilation support needed.",
  [
   68,
   "108/64",
   6,
   85
  ],
  "AMS with respiratory depression"
 ],
 [
  3,
  "peds-heat-ams",
  "temp-cooling",
  15,
  "Ari",
  "an outdoor practice field",
  "Confusion after heat exposure",
  "Ari becomes confused during intense activity in extreme heat. Skin is hot; scene history supports environmental hyperthermia rather than an isolated fever.",
  "Confused; airway patent; hot skin; pulse fast.",
  [
   142,
   "106/64",
   28,
   96
  ],
  "Pediatric environmental heat illness"
 ],
 [
  3,
  "adult-cold-ams",
  "temp-gentle",
  76,
  "Ruth",
  "an unheated home",
  "Confusion after cold exposure",
  "Ruth is confused after prolonged cold exposure in wet clothing. The crew plans handling and transport.",
  "Drowsy; breathing slow; pulse present; skin cold.",
  [
   54,
   "96/58",
   12,
   95
  ],
  "Cold exposure with AMS"
 ],
 [
  3,
  "peds-sepsis-screen",
  "sepsis-alert",
  6,
  "Sage",
  "a family home",
  "Lethargy with suspected infection",
  "Sage is lethargic with fever, an infection history and concerning perfusion findings. Apply the complete sepsis assessment rather than diagnosing from one vital sign.",
  "Lethargic; airway patent; warm trunk, cool extremities; pulse fast.",
  [
   148,
   "86/50",
   32,
   94
  ],
  "Pediatric sepsis recognition"
 ],
 [
  4,
  "adult-opioid-goal",
  "tox-naloxone-goal",
  31,
  "Cole",
  "an apartment stairwell",
  "Suspected opioid overdose",
  "Cole has a pulse and depressed breathing. Ventilation support is underway while the crew reviews the therapeutic goal for naloxone.",
  "Unresponsive; pulse present; shallow breaths.",
  [
   66,
   "104/62",
   6,
   86
  ],
  "Opioid reversal goal"
 ],
 [
  4,
  "adult-cholinergic",
  "tox-atropine",
  44,
  "Ada",
  "a farm workshop",
  "Wet airway after pesticide exposure",
  "Scene hazards are controlled before contact. Ada has excessive secretions, pinpoint pupils and respiratory difficulty after pesticide exposure.",
  "Awake but distressed; copious secretions; pulse present; decontamination considered.",
  [
   58,
   "104/66",
   26,
   90
  ],
  "Cholinergic exposure"
 ],
 [
  4,
  "adult-tca-wide-qrs",
  "tox-bicarb",
  27,
  "Kit",
  "a home",
  "Suspected tricyclic overdose",
  "An empty tricyclic-antidepressant bottle is found. The scripted monitor shows HR 132 and QRS 140 ms. Review the referenced toxicology treatment row.",
  "Drowsy; pulse present; airway supported; wide QRS documented.",
  [
   132,
   "94/58",
   18,
   95
  ],
  "TCA overdose criteria"
 ],
 [
  4,
  "adult-dystonia",
  "tox-dystonia",
  35,
  "Nora",
  "a clinic lobby",
  "Neck and jaw spasm after medication",
  "Nora has painful neck deviation and jaw spasm after a new medication. Assessment shows no airway obstruction, but the crew continues airway monitoring.",
  "Alert; speech difficult from spasm; breathing adequate; pulse strong.",
  [
   98,
   "130/78",
   20,
   98
  ],
  "Medication-associated dystonia"
 ],
 [
  4,
  "peds-opioid-recurrence",
  "nalox-duration",
  14,
  "Remy",
  "a friend's home",
  "Drowsiness returns after opioid reversal",
  "Remy initially breathed better after documented naloxone, then becomes drowsy again. Identify why continued monitoring is necessary.",
  "Drowsy; breaths slowing again; pulse present; ventilation reassessment needed.",
  [
   72,
   "106/66",
   8,
   91
  ],
  "Pediatric opioid recurrence"
 ],
 [
  4,
  "peds-benzodiazepine-opioid",
  "midaz-opioids",
  16,
  "Skye",
  "a house party",
  "Mixed sedative exposure",
  "Bystanders report opioid and benzodiazepine exposure. Skye has a pulse but shallow breathing; assess the interaction risk.",
  "Very drowsy; airway support needed; pulse present.",
  [
   74,
   "108/66",
   8,
   89
  ],
  "Mixed depressant exposure"
 ],
 [
  4,
  "peds-apap-alcohol",
  "apap-overdose",
  17,
  "Jay",
  "a home",
  "Possible medication and alcohol ingestion",
  "Jay reports taking acetaminophen with alcohol. The amount and time are uncertain; obtain packaging and consult the appropriate poisoning resources.",
  "Alert; mild nausea; pulse present; no current respiratory distress.",
  [
   92,
   "114/70",
   18,
   98
  ],
  "Acetaminophen co-ingestion risk"
 ],
 [
  4,
  "peds-local-anesthetic",
  "lido-toxicity",
  12,
  "Robin",
  "a dental-office lobby",
  "New symptoms after local anesthetic",
  "Robin develops unusual agitation and muscle twitching after local anesthetic exposure. Verify which organ-system toxicity should be watched for.",
  "Awake but agitated; pulse present; breathing currently adequate.",
  [
   118,
   "110/68",
   22,
   97
  ],
  "Local-anesthetic toxicity recognition"
 ],
 [
  4,
  "adult-naloxone-withdrawal",
  "nalox-withdrawal",
  42,
  "Max",
  "an ambulance",
  "Agitation after opioid reversal",
  "After documented naloxone, Max's ventilation improves but marked agitation and vomiting develop. Review the known adverse effect and continue reassessment.",
  "Awake and agitated; pulse present; airway monitored because of emesis.",
  [
   118,
   "146/88",
   24,
   96
  ],
  "Post-reversal adverse effects"
 ],
 [
  4,
  "peds-epinephrine-confusion",
  "epi-strength",
  11,
  "Parker",
  "a school",
  "Severe respiratory distress and formulation check",
  "Parker has respiratory distress requiring urgent care. The crew is reviewing the IM respiratory epinephrine formulation; this safety exercise is not a pediatric dose order.",
  "Awake with severe wheeze; airway patent; ventilation and circulation monitored.",
  [
   136,
   "104/64",
   32,
   90
  ],
  "Pediatric formulation safety"
 ],
 [
  5,
  "adult-hemorrhage-txa",
  "trauma-txa-dose",
  39,
  "Casey",
  "a roadside collision",
  "Traumatic hemorrhage",
  "Casey has major traumatic bleeding and shock findings. Hemorrhage control and resuscitative measures are underway while the crew verifies the adult TXA regimen and eligibility.",
  "Awake but weak; pulse rapid; bleeding control underway; cool skin.",
  [
   132,
   "82/48",
   28,
   94
  ],
  "Adult hemorrhage medication check"
 ],
 [
  5,
  "peds-open-fracture",
  "trauma-cefazolin-ped",
  9,
  "Alex",
  "a bicycle trail",
  "Open lower-leg fracture",
  "Alex has an open lower-leg fracture with exposed bone. Bleeding is controlled; the crew checks the pediatric antibiotic reference and allergies.",
  "Alert; airway patent; distal neurovascular findings documented; pulse present.",
  [
   118,
   "106/66",
   24,
   98
  ],
  "Pediatric open-fracture prophylaxis"
 ],
 [
  5,
  "adult-open-fracture",
  "trauma-cefazolin",
  48,
  "Drew",
  "a construction site",
  "Open forearm fracture",
  "Drew has an open forearm fracture after a machinery incident. Bleeding control, stabilization and neurovascular assessment are in progress.",
  "Alert; airway patent; localized bleeding controlled; circulation assessed.",
  [
   104,
   "132/80",
   22,
   98
  ],
  "Adult open-fracture preparation"
 ],
 [
  5,
  "peds-trauma-warming",
  "trauma-thermal",
  7,
  "Quinn",
  "a roadside crash",
  "Trauma alert with wet clothing",
  "Quinn is exposed during trauma assessment after a crash in rain. Identify the guideline's named thermal-preservation approach.",
  "Alert but frightened; pulse present; wet clothing and exposure create heat-loss risk.",
  [
   126,
   "100/62",
   26,
   97
  ],
  "Pediatric trauma thermal preservation"
 ],
 [
  5,
  "adult-before-moving",
  "trauma-move",
  57,
  "Reese",
  "a workshop",
  "Critical injury before transfer",
  "Reese has uncontrolled external bleeding and reduced perfusion. The ambulance is close, but the crew must address immediate threats before moving.",
  "Confused; airway patent; weak pulse; major bleeding visible.",
  [
   136,
   "78/46",
   30,
   93
  ],
  "Stabilization before movement"
 ],
 [
  5,
  "peds-burn-jewelry",
  "burn-jewelry",
  13,
  "Taylor",
  "a home kitchen",
  "Hand burn with rings",
  "Taylor has a burn to the hand and wrist. Rings and a tight bracelet are present; swelling is beginning.",
  "Alert; airway patent; localized hand burn; pulse present.",
  [
   106,
   "110/68",
   20,
   98
  ],
  "Pediatric burn constriction risk"
 ],
 [
  5,
  "adult-critical-burn",
  "burn-thermal",
  33,
  "Blair",
  "a fire staging area",
  "Large burns with environmental exposure",
  "Blair has extensive burns and is exposed during assessment on a cool evening. Verify the temperature risk highlighted in the guideline.",
  "Alert; pulse present; burn care and airway assessment ongoing.",
  [
   124,
   "112/70",
   26,
   95
  ],
  "Critical-burn temperature protection"
 ],
 [
  5,
  "adult-delayed-txa",
  "txa-window",
  62,
  "Morgan",
  "a rural roadside",
  "Delayed presentation after injury",
  "Morgan's major injury occurred four hours earlier. Review the TXA time window before proposing treatment under the guideline.",
  "Awake; weak pulse; ongoing hemorrhage assessment; timing obtained from witnesses.",
  [
   118,
   "92/56",
   24,
   96
  ],
  "Hemorrhage treatment-window check"
 ],
 [
  5,
  "peds-antibiotic-allergy",
  "cef-allergy",
  11,
  "Kendall",
  "a skate park",
  "Open fracture and allergy history",
  "Kendall has an open fracture and reports a prior severe antibiotic reaction. Check the allergy class relevant to cefazolin before administration.",
  "Alert; airway patent; bleeding controlled; neurovascular assessment ongoing.",
  [
   114,
   "108/66",
   22,
   98
  ],
  "Pediatric antibiotic safety"
 ],
 [
  5,
  "peds-trauma-analgesia-monitor",
  "fent-monitor",
  16,
  "Rowan",
  "an ambulance",
  "Monitoring after trauma analgesia",
  "Rowan has a stabilized painful extremity injury and documented opioid analgesia. Review the monitoring parameter called out in the drug reference.",
  "Drowsy but responsive; airway patent; pulse present; continued ventilation monitoring needed.",
  [
   96,
   "112/70",
   14,
   97
  ],
  "Pediatric analgesia reassessment"
 ],
 [
  6,
  "peds-nausea-odt",
  "nausea-ped-odt",
  8,
  "Emery",
  "a home",
  "Nausea without active vomiting",
  "Emery is nauseated but can manage oral secretions and swallow. The crew reviews the pediatric ODT option after focused assessment.",
  "Alert; airway patent; no active emesis; pulse present.",
  [
   108,
   "102/64",
   20,
   98
  ],
  "Pediatric nausea medication check"
 ],
 [
  6,
  "peds-fever-oral",
  "temp-apap-dose",
  5,
  "Harper",
  "a home",
  "Fever with oral medication suitability",
  "Harper has fever without environmental heat exposure, can swallow safely, and has no prior full acetaminophen dose in the look-back period.",
  "Alert; airway patent; skin warm; pulse present; oral route suitable.",
  [
   122,
   "100/62",
   24,
   98
  ],
  "Pediatric fever treatment reference"
 ],
 [
  6,
  "peds-fever-prior-dose",
  "temp-apap-interval",
  4,
  "Riley",
  "a family home",
  "Fever after a recent home dose",
  "Riley received a full Tylenol dose two hours ago. The crew checks the look-back rule before suggesting another dose.",
  "Alert; airway patent; warm skin; pulse present; parent has medication packaging.",
  [
   120,
   "96/60",
   24,
   98
  ],
  "Pediatric duplicate-dose prevention"
 ],
 [
  6,
  "adult-sepsis-fluid",
  "sepsis-fluid",
  68,
  "Dakota",
  "a retirement home",
  "Suspected infection and hypotension",
  "Dakota has fever, an infection history and hypotension with a positive completed sepsis screen. Verify the guideline's fluid regimen while reassessing suitability.",
  "Drowsy but arousable; airway patent; weak pulse; lungs assessed for fluid tolerance.",
  [
   124,
   "88/52",
   26,
   94
  ],
  "Adult sepsis fluid planning"
 ],
 [
  6,
  "peds-perfusion-fluid",
  "hypoperfusion-fluid",
  10,
  "Jordan",
  "a sports camp",
  "Dehydration with poor perfusion",
  "Jordan has prolonged vomiting, reduced intake and concerning perfusion findings. Review the pediatric hypoperfusion fluid row and continue reassessment.",
  "Lethargic; airway patent; pulse fast; delayed refill; lungs clear.",
  [
   132,
   "90/54",
   26,
   96
  ],
  "Pediatric hypoperfusion planning"
 ],
 [
  6,
  "adult-dive-oxygen",
  "dive-oxygen",
  37,
  "River",
  "a marina",
  "Symptoms after a dive",
  "River reports joint pain and unusual tingling after a dive. SpO₂ is normal; the dive guideline's oxygen instruction still matters.",
  "Alert; airway patent; pulse present; neurologic symptoms need documentation.",
  [
   98,
   "132/80",
   20,
   99
  ],
  "Dive emergency oxygen"
 ],
 [
  6,
  "adult-dive-computer",
  "dive-computer",
  45,
  "Lee",
  "a boat ramp",
  "Dive-history handoff",
  "Lee has symptoms after diving and wears a dive computer. The crew is arranging transport and gathering exposure history.",
  "Alert; airway patent; pulse present; oxygen and repeated assessment ongoing.",
  [
   102,
   "128/78",
   22,
   98
  ],
  "Dive emergency handoff"
 ],
 [
  6,
  "peds-snakebite",
  "bite-avoid",
  12,
  "Jamie",
  "a hiking trail",
  "Possible snakebite",
  "Jamie has two puncture marks and local swelling after a trail encounter. A bystander proposes ice and a tourniquet; check prohibited bite-site measures.",
  "Alert; airway patent; pulse present; swelling documented; exposure history obtained.",
  [
   112,
   "108/66",
   22,
   98
  ],
  "Pediatric bite-site safety"
 ],
 [
  6,
  "adult-postpartum",
  "ob-postpartum",
  30,
  "Sloane",
  "a home",
  "Headache after pregnancy",
  "Sloane delivered four weeks ago and now has headache with elevated blood pressure. Review the postpartum risk window rather than dismissing the pregnancy history.",
  "Alert; airway patent; pulse present; severe headache; repeat BP assessment needed.",
  [
   96,
   "168/108",
   20,
   97
  ],
  "Postpartum hypertension recognition"
 ]
];
for(const [categoryIndex,id,questionId,age,name,location,dispatch,scene,primary,values,title] of DECISION_CASES) {
 const q=QUESTION_BANK.find(q=>q.id===questionId);
 if(!q)throw new Error('Missing scenario source: '+questionId);
 const baseline={hr:values[0],bp:values[1],rr:values[2],spo:values[3]};
 const caseFindings={
  primary:['Primary survey',primary],
  vitals:['Baseline vital signs','HR '+baseline.hr+' bpm · BP '+baseline.bp+' mmHg · RR '+baseline.rr+'/min · SpO₂ '+baseline.spo+'%. Scripted observation; verify reliability in practice.'],
  history:['Focused history & scene findings',scene],
  focused:['Focused examination',primary+' '+scene],
  allergies:['Allergies & medication history','Review allergy history, medication packaging, prior treatments, exposure timing and contraindications with the patient, caregiver or crew. The vignette does not authorize a dose.']
 };
 CASE_BANK.push({
  id,name,age,sex:'patient',ageGroup:age<18?'pediatric':'adult',category:SCENARIO_CATEGORIES[categoryIndex],
  topic:SCENARIO_CATEGORIES[categoryIndex],exercise:'decision',location,dispatch,dispatchNote:scene,
  complaint:dispatch,arrival:name+' is at '+location+'.',scene,title,
  baseline,after:{...baseline},worse:{...baseline},response:'unchanged',oxygenIndicated:false,
  baselineStatus:primary,responseStatus:'Repeat assessment: '+primary+' No change is simulated by answering a protocol question.',
  delayedStatus:primary,
  prerequisites:['primary','history','focused'],findings:caseFindings,treatment:null,
  decision:{question:q.question,answer:q.answer,options:[...q.options],explanation:q.explanation,questionId:q.id},
  references:[[q.page,'Protocol / medication reference'],[97,'Medication safety']],
  clinical:'SWFL Revised 8/2026, PDF page '+q.page+': '+q.explanation+' This focused case practices one protocol decision; a correct answer does not administer treatment or complete resuscitation.',
  focus:'Assess the vignette, check the indicated protocol decision and explain reassessment and transport priorities.',
  responseLesson:'The decision check itself does not change the patient. Record the unchanged scripted findings and identify ongoing care needs. Use the full guideline for interventions; clinical review pending.'
 });
}
if(CASE_BANK.length!==70||SCENARIO_CATEGORIES.some(cat=>CASE_BANK.filter(c=>c.category===cat).length!==10))throw new Error('Scenario category counts must be 10 each.');
