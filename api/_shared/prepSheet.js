/**
 * ODIPA Volunteer Prep Sheet, read-off script edition
 *
 * Mirrors the house call-script format: five sequential sections of spoken
 * passages the founder reads or closely paraphrases on the call, followed
 * by a reference appendix that is not spoken (work-authorization gate,
 * do/don'ts).
 *
 * The org-constant passages (vision line, credibility core, turn-around,
 * honest picture, options lead-in, close) are static verbatim text in this
 * file and are never model-generated. The model generates only the
 * applicant-specific passages: the ice breaker, one credibility bridge
 * sentence, a listen-for checklist, spoken starting-option passages, and
 * spoken questions.
 *
 * House style rule: no em or en dashes anywhere, generated text is
 * sanitized on the way in.
 */

const ORG_CONTEXT = `ODIPA is a small California 501(c)(3) digital privacy nonprofit. It is founder-led and early stage. Most operations are currently the founder, Jasper. Volunteer work ships and is visible, there is no committee or design team.

Publicly listed volunteer roles: Community Advocate, Content Writer, Educator/Trainer.

Real current needs a volunteer could serve:
- Educational materials, translating privacy concepts into one-pagers, infographics, and visuals
- Newsletter and social media visuals, a consistent visual identity for outreach
- Site UX review of odipa.org from a visitor's perspective
- UX or user research on how real people understand privacy and consent language, which can feed ODIPA's research publication track
- Community outreach and educational content writing
- Certification program development support

First projects must be small, self-contained, shippable in weeks by one person, and produce something public the volunteer can point to. Portfolio value is often the volunteer's real compensation.`

const PROMPT_SYSTEM = `You write the applicant-specific spoken passages of an intro-call script for Jasper, the founder of ODIPA. He will read these aloud or closely paraphrase them on a call with a volunteer applicant. Fixed org passages (vision, credibility, honest picture, close) are appended separately and are not your job.

Reply ONLY with JSON, no fences, in exactly this shape:
{
  "icebreaker": "2 or 3 spoken sentences opening the call, warm, referencing something specific and true from their application",
  "bridge": "1 spoken sentence completing the thought 'what I do not have is', naming what this applicant brings that a technical founder lacks, grounded in what they stated",
  "listen_for": ["3 to 5 short notes on what to listen for from this applicant, drawn from their message"],
  "options": [{"name": "2 to 4 word project name", "script": "2 or 3 spoken sentences offering this concrete starting project and what they would get out of it"}],
  "questions": [{"label": "2 to 4 word theme", "text": "the question exactly as it should be spoken"}]
}

Hard rules:
- Everything except listen_for must be speakable, first person, in a warm plain founder voice. No bullet fragments in spoken fields.
- Ground every claim in what the applicant actually wrote. One stated skill is one stated skill, never inflate it into expertise.
- Options map only to needs in the provided org context, 2 or 3 of them, each small, self-contained, shippable in weeks by one person. Never invent programs, teams, team leads, review structures, or roles.
- 2 or 3 questions.
- Never speculate about the applicant's immigration status, visa, nationality, ethnicity, gender, or age. Work authorization is handled by a fixed section that is not yours.
- No marketing tone, no em dashes, no colons inside sentences.`

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function noDashes(s) {
  return String(s || '').replace(/\s*[\u2014\u2013]\s*/g, ', ')
}

function clean(s, max) {
  return esc(noDashes(s).trim().slice(0, max || 500))
}

/** Validate + trim the model's JSON into a safe shape, or throw. */
function normalizeGenerated(g) {
  if (!g || !g.icebreaker || !g.bridge || !Array.isArray(g.listen_for) || !Array.isArray(g.options) || !Array.isArray(g.questions))
    throw new Error('Generated JSON missing required sections')
  const icebreaker = clean(g.icebreaker, 600)
  const bridge = clean(g.bridge, 300)
  const listenFor = g.listen_for.slice(0, 5).map(x => clean(x, 200)).filter(Boolean)
  const options = g.options.slice(0, 3).map(o => ({
    name: clean(o && o.name, 60), script: clean(o && o.script, 600),
  })).filter(o => o.name && o.script)
  const questions = g.questions.slice(0, 3).map(q => ({
    label: clean(q && q.label, 40), text: clean(q && q.text, 400),
  })).filter(q => q.text)
  if (!icebreaker || !bridge || !listenFor.length || options.length < 2 || !questions.length)
    throw new Error('Generated JSON sections empty after validation')
  return { icebreaker, bridge, listenFor, options, questions }
}

function say(label, text) {
  return `<div class="say"><span class="lbl">${label}</span>\n${text}</div>`
}

function renderPrepSheet(inq, gen) {
  const received = inq.receivedAt
    ? new Date(Number(inq.receivedAt)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : ''
  const name = clean(inq.name, 120) || 'Applicant'
  const first = name.split(' ')[0]
  const org = clean(inq.organization, 160)

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${name} \u00b7 ODIPA Volunteer Intro Call Script</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #1F3050; background: #FFFFFF; font-size: 13px; line-height: 1.45; padding: 24px 28px; max-width: 980px; margin: 0 auto; }
  h1 { font-size: 21px; color: #1F3864; border-bottom: 3px solid #C9A227; padding-bottom: 6px; margin-bottom: 4px; }
  .sub { color: #44546A; font-size: 12px; margin-bottom: 16px; }
  h2 { font-size: 15px; color: #1F3864; margin: 18px 0 8px; border-left: 4px solid #C9A227; padding-left: 8px; }
  p { margin-bottom: 8px; }
  .say { background: #F4F6FA; border-left: 3px solid #1F3864; padding: 8px 12px; margin: 8px 0; border-radius: 0 6px 6px 0; }
  .say .lbl { display: block; font-size: 10px; font-weight: bold; color: #C9A227; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
  .warn { background: #FDF3F3; border-left: 3px solid #B14D4D; padding: 8px 12px; margin: 8px 0; border-radius: 0 6px 6px 0; }
  .good { background: #F2F8F2; border-left: 3px solid #4D8B4D; padding: 8px 12px; margin: 8px 0; border-radius: 0 6px 6px 0; }
  ul, ol { margin: 6px 0 10px 22px; }
  li { margin-bottom: 4px; }
  .cols { display: flex; gap: 18px; }
  .col { flex: 1; }
  .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #D5DAE3; color: #667; font-size: 11px; }
  .timerbar { position: sticky; top: 0; z-index: 10; background: #1F3864; color: #FFF; border-radius: 8px; padding: 8px 14px; margin: 0 0 16px; display: flex; align-items: center; gap: 14px; }
  .timerbar button { background: #C9A227; color: #1F3864; border: none; border-radius: 6px; padding: 5px 14px; font-size: 12px; font-weight: bold; cursor: pointer; }
  #clock { font-family: 'Courier New', monospace; font-size: 16px; font-weight: bold; letter-spacing: 1px; }
  #phase { font-size: 12px; color: #C6D4EA; }
  .block { border-left: 4px solid transparent; padding-left: 8px; margin-left: -12px; border-radius: 4px; }
  .block.active { border-left-color: #C9A227; background: #FDF8EC; }
  .block .dur { float: right; font-size: 11px; color: #8896AC; font-weight: normal; }
  @media print { body { padding: 10px; font-size: 11.5px; } .cols { display: block; } .timerbar { position: static; } }
</style>
</head>
<body>

<h1>${name} Intro Call, Thirty Minutes</h1>
<p class="sub">Applied ${received} via contact form \u00b7 ${clean(inq.email, 160)}${org ? ` \u00b7 ${org}` : ''} \u00b7 Volunteering inquiry \u00b7 Read the boxes, glance at the rest</p>

<div class="timerbar">
  <button id="startBtn">Start call</button>
  <span id="clock">00:00</span>
  <span id="phase">Press start when the call begins</span>
</div>

<section class="block" data-start="0" data-end="4" id="b1">
<h2>Open, your story in two minutes <span class="dur">0:00 to 4:00</span></h2>
${say('Ice breaker', gen.icebreaker)}
${say('Your vision line', 'The vision is deliberately ambitious. Privacy fails when you only educate one side, so ODIPA takes a holistic approach and works both sides of the problem. Consumers who need to understand and protect their data, and organizations that need to handle it responsibly. That is why there are eight programs instead of one, education, outreach, and tools on the consumer side, certification and assessment on the business side.')}
${say('Your credibility line', `I come at privacy from the technical side. Fifteen plus years in banking technology and security, a fraud detection patent, and I built everything you saw on the site myself. What I do not have is ${gen.bridge}`)}

</section>

<section class="block" data-start="4" data-end="14" id="b2">
<h2>Their floor, listen and check off <span class="dur">4:00 to 14:00</span></h2>
${say('Turn it around', `That is enough from me. I asked for this call mostly to listen, so let me turn it around. What made you pick ODIPA out of all the places you could volunteer, ${first}?`)}
<p><strong>Listen for, from their application.</strong></p>
<ul>
${gen.listenFor.map(b => `  <li>${b}</li>`).join('\n')}
</ul>
${gen.questions.map(q => say(q.label || 'Question', q.text)).join('\n')}
${say('The honest move, if they raise something you have not worked with', 'I have not worked with that yet. Give me the two minute version.')}

</section>

<section class="block" data-start="14" data-end="17" id="b3">
<h2>State of the union, the honest picture <span class="dur">14:00 to 17:00</span></h2>
${say('Say it plainly', `Let me give you the honest picture of where ODIPA actually is today, no website gloss. It's early, I'm the founder and right now most of the operation is me, which means two things for you. Your work would ship and be visible, not sit in a queue behind a committee. And you'd be helping build the thing, not slotting into it. Some people find that exciting, some want more structure, both are legitimate, so tell me which you are.`)}

</section>

<section class="block" data-start="17" data-end="25" id="b4">
<h2>Where they could start, let them pick <span class="dur">17:00 to 25:00</span></h2>
${say('Lead-in', 'Let me throw out a few concrete places you could plug in. Pick the one that sounds fun, not the one that sounds dutiful. You are volunteering, it should give you energy.')}
${gen.options.map(o => say(o.name, o.script)).join('\n')}

</section>

<section class="block" data-start="25" data-end="30" id="b5">
<h2>Close with concrete next steps <span class="dur">25:00 to 30:00</span></h2>
${say('The close', 'I want to respect your time, so let me make sure we land this properly. Here is what I will do this week, and tell me if the pace works for you. I will send a short volunteer agreement and a conflict of interest form, routine paperwork. I will write up the project we just picked with a first milestone, and you tell me if the scope feels right. And one routine thing I ask everyone, is there anything about your work authorization I should know for volunteer compliance? For anyone on OPT there is a specific process we follow to protect your status.')}
${say('Last question', 'How do you prefer to work, async over email and docs, or short calls?')}

</section>

<h2>Reference, not spoken. Work authorization gate, before any work starts</h2>
<div class="warn">
<p><strong>Asked identically of every applicant, never assumed from anything about them.</strong></p>
<ul>
  <li><strong>US citizen or permanent resident.</strong> No gate, standard volunteer paperwork only.</li>
  <li><strong>Regular OPT (F-1).</strong> Unpaid nonprofit volunteering is permissible when the work relates to their field of study, with the EAD verified and their DSO updating SEVIS before work begins. Use the ODIPA OPT Volunteer Agreement.</li>
  <li><strong>STEM OPT extension.</strong> Unpaid volunteering is prohibited, full stop. If they are on STEM OPT, the honest answer is that ODIPA cannot take them as a volunteer right now, and pretending otherwise puts their status at risk.</li>
</ul>
</div>

<h2>Reference, not spoken. Do and do not</h2>
<div class="cols">
<div class="col">
<div class="good">
<p><strong>Do</strong></p>
<ul>
  <li>Credit the quality of their application out loud where it's earned</li>
  <li>Let them choose the first project, energy beats duty</li>
  <li>Name what they get out of it explicitly, it is their compensation</li>
  <li>Agree a concrete next step with a date before hanging up</li>
</ul>
</div>
</div>
<div class="col">
<div class="warn">
<p><strong>Do not</strong></p>
<ul>
  <li>Claim a team, a team lead, or review structure that does not exist</li>
  <li>Promise repo or system access on day one, start with self-contained artifacts</li>
  <li>Commit to a role title or scope beyond the first project</li>
  <li>Let any work start before the authorization check clears</li>
  <li>Oversell, they applied, the job is fit-finding, not convincing</li>
</ul>
</div>
</div>
</div>

<h2>After the call, same day</h2>
<ul>
  <li>Short email, thank them, restate the agreed first project and date, attach the volunteer agreement, and if OPT applies, the OPT agreement and the EAD/SEVIS steps stated plainly</li>
  <li>Calendar hold for whatever next step was agreed</li>
</ul>

<div class="footer">ODIPA \u00b7 Volunteer intro call script, generated ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} \u00b7 Spoken passages in boxes, applicant-specific ones AI-generated and human-reviewed, org passages fixed</div>

<script>
(function(){
  var startBtn = document.getElementById('startBtn');
  var clock = document.getElementById('clock');
  var phase = document.getElementById('phase');
  var blocks = Array.prototype.slice.call(document.querySelectorAll('.block'));
  var names = {b1:'Open', b2:'Their floor', b3:'State of the union', b4:'Where they start', b5:'Close'};
  var t0 = null, iv = null;

  function pad(n){ return (n<10?'0':'')+n }
  function tick(){
    var s = Math.floor((Date.now()-t0)/1000);
    clock.textContent = pad(Math.floor(s/60)) + ':' + pad(s%60);
    var m = s/60, current = null;
    blocks.forEach(function(b){
      var a = +b.dataset.start, e = +b.dataset.end;
      var on = m >= a && m < e;
      b.classList.toggle('active', on);
      if(on) current = b;
    });
    if(current){ phase.textContent = 'Now \u00b7 ' + names[current.id]; }
    else if(m >= 30){ phase.textContent = 'Past 30 min, wrap up'; }
  }
  startBtn.addEventListener('click', function(){
    if(iv){ clearInterval(iv); iv=null; t0=null; clock.textContent='00:00';
      phase.textContent='Press start when the call begins';
      blocks.forEach(function(b){b.classList.remove('active')});
      startBtn.textContent='Start call'; return; }
    t0 = Date.now(); iv = setInterval(tick, 1000); tick();
    startBtn.textContent='Reset';
  });
})();
</script>
</body>
</html>`
}

module.exports = { ORG_CONTEXT, PROMPT_SYSTEM, normalizeGenerated, renderPrepSheet }
