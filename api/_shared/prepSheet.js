/**
 * ODIPA Volunteer Prep Sheet
 *
 * A call sheet the founder can read from during a 20 to 30 minute intro call.
 * Layout: sticky section menu, a plan, who the applicant is and what they
 * actually asked for, questions they may ask with spoken answers, questions
 * to ask them, a fit map against ODIPA's real volunteer roles, watch notes,
 * and a close, plus a fixed work authorization reference.
 *
 * Fixed org passages (vision line, credibility core, honest picture, close,
 * common questions, authorization gate, do and do not) are static text in
 * this file and are never model-generated. The model generates only the
 * applicant-specific parts, and every claim it makes must come from the
 * applicant's own message.
 *
 * Design rules that fix earlier problems.
 * 1. Lead with what the applicant asked for. Anything beyond that is the
 *    founder's suggestion and is labeled as one.
 * 2. Options and the fit map draw from ODIPA's real role list
 *    (volunteerRoles.js), not a narrow list of design needs. GRC, audit,
 *    security and legal applicants are matched to the assessor, researcher
 *    and trainer roles instead of being steered to visuals.
 * 3. No em or en dashes anywhere, generated text is sanitized on the way in.
 */

const { rolesForPrompt, ROLE_TITLES, GRC_RULE } = require('./volunteerRoles')

const ORG_CONTEXT = `ODIPA is a small California 501(c)(3) digital privacy nonprofit. It is founder-led and early stage. Most operations are currently the founder, Jasper. Volunteer work ships and is visible, there is no committee or design team. All volunteer roles are unpaid and remote.

Volunteer roles that really exist (the only roles you may name):
${rolesForPrompt()}

Things a volunteer could start on, each small and shippable by one person:
- A short research brief or a piece for the research releases section or the monthly digest
- Expert feedback on the published certification criteria (version 1.0, still a draft pending counsel review, not in force for any assessment)
- Shadowing or helping shape the Assessor Qualification, ODIPA's own training and competency check, for people with a recognized credential
- Outlines or a session for free public workshops, webinars and courses
- Educational one-pagers, infographics, newsletter and social visuals
- A visitor's-eye UX review of odipa.org, or user research on how people understand privacy and consent language
- Community outreach and educational content writing

Certification facts. It is an organization level conformity assessment against ODIPA's published criteria. It is not an audit and not a legal compliance determination. The program is at the founding cohort stage. Never claim any business has been certified.

First projects must be small, self-contained, shippable in weeks by one person, and produce something public the volunteer can point to. Portfolio value is often the volunteer's real compensation.`

const PROMPT_SYSTEM = `You write the applicant-specific parts of an intro-call sheet for Jasper, the founder of ODIPA. He reads from it during a call with a volunteer applicant. Fixed org passages are appended separately and are not your job.

Reply ONLY with JSON, no fences, in exactly this shape:
{
  "icebreaker": "2 or 3 spoken sentences opening the call, warm, referencing something specific and true from their message",
  "asked": "1 or 2 plain sentences stating exactly what the applicant asked for in their own message, nothing added",
  "bridge": "1 spoken sentence completing the thought 'what I do not have is', naming what this applicant brings that a technical founder lacks, grounded in what they stated",
  "background": ["2 to 5 short facts about the applicant, each taken from their message or from details they gave in it"],
  "listen_for": ["3 to 5 short notes on what to listen for from this applicant"],
  "qa": [{"q": "a question this applicant is likely to ask", "a": "a spoken first person answer using only the org context", "watch": "optional one sentence caution, or empty string"}],
  "fit": [{"lane": "a role title copied exactly from the role list", "evidence": "one sentence tying the lane to something they stated", "level": "strong or possible or unknown"}],
  "options": [{"name": "2 to 4 word project name", "script": "2 or 3 spoken sentences offering this concrete starting project and what they would get out of it"}],
  "questions": [{"label": "2 to 4 word theme", "text": "the question exactly as it should be spoken", "listen": "what a useful answer tells the founder"}]
}

Hard rules.
- Lead with what they asked for. If you suggest something beyond their request, the script must frame it as an idea to test, never as what they asked.
- ${GRC_RULE}
- Ground every claim in what the applicant actually wrote. One stated skill is one stated skill, never inflate it. If they point to a website or profile, say in "background" that the founder should check it, and do not invent its contents.
- Lanes in "fit" must be role titles from the role list. Use 2 to 4 lanes. Mark "strong" only when their message supports it.
- Options come from the org context, 2 or 3 of them, each small, self-contained, shippable in weeks by one person. Put the project that matches their stated request first. Never invent programs, teams, team leads, review structures, clients, or roles.
- "qa" has 2 or 3 entries. Answers never promise titles, pay, dates, or outcomes.
- "questions" has 2 or 3 entries.
- Everything except background, listen_for, fit evidence and watch must be speakable, first person, in a warm plain founder voice.
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

const LEVELS = { strong: 'Strong fit', possible: 'Possible fit', unknown: 'Ask them' }

/** Validate + trim the model's JSON into a safe shape, or throw. */
function normalizeGenerated(g) {
  if (!g || !g.icebreaker || !g.bridge || !g.asked ||
      !Array.isArray(g.listen_for) || !Array.isArray(g.options) ||
      !Array.isArray(g.questions) || !Array.isArray(g.fit))
    throw new Error('Generated JSON missing required sections')

  const titles = new Map(ROLE_TITLES.map(t => [t.toLowerCase(), t]))
  const fit = g.fit.slice(0, 4).map(f => {
    const lane = titles.get(String((f && f.lane) || '').trim().toLowerCase())
    const level = LEVELS[String((f && f.level) || '').toLowerCase()] ? String(f.level).toLowerCase() : 'unknown'
    return lane ? { lane: esc(lane), evidence: clean(f.evidence, 240), level } : null
  }).filter(Boolean)

  const icebreaker = clean(g.icebreaker, 600)
  const asked = clean(g.asked, 300)
  const bridge = clean(g.bridge, 300)
  const background = (Array.isArray(g.background) ? g.background : []).slice(0, 5).map(x => clean(x, 220)).filter(Boolean)
  const listenFor = g.listen_for.slice(0, 5).map(x => clean(x, 200)).filter(Boolean)
  const qa = (Array.isArray(g.qa) ? g.qa : []).slice(0, 3).map(x => ({
    q: clean(x && x.q, 200), a: clean(x && x.a, 500), watch: clean(x && x.watch, 240),
  })).filter(x => x.q && x.a)
  const options = g.options.slice(0, 3).map(o => ({
    name: clean(o && o.name, 60), script: clean(o && o.script, 600),
  })).filter(o => o.name && o.script)
  const questions = g.questions.slice(0, 3).map(q => ({
    label: clean(q && q.label, 40), text: clean(q && q.text, 400), listen: clean(q && q.listen, 240),
  })).filter(q => q.text)

  if (!icebreaker || !asked || !bridge || !listenFor.length || !fit.length || options.length < 2 || !questions.length)
    throw new Error('Generated JSON sections empty after validation')
  return { icebreaker, asked, bridge, background, listenFor, qa, fit, options, questions }
}

function say(label, text) {
  return `<div class="say"><span class="lbl">${label}</span>\n${text}</div>`
}

function qaCard(q, a, watch) {
  return `<div class="card"><p class="q"><span class="lbl">They ask</span> ${q}</p><p class="a"><span class="lbl">You say</span> ${a}</p>${watch ? `<div class="watch"><b>Watch.</b> ${watch}</div>` : ''}</div>`
}

function askCard(q, listen) {
  return `<div class="card ask"><p class="q"><span class="lbl">You ask</span> ${q}</p>${listen ? `<p class="a"><span class="lbl">Listen for</span> ${listen}</p>` : ''}</div>`
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
<title>${name} · ODIPA Volunteer Intro Call Sheet</title>
<style>
  :root { --bg:#F7F8FA; --card:#FFFFFF; --ink:#1F3050; --muted:#5B6675; --line:#D5DAE3; --accent:#1F3864; --gold:#C9A227; --soft:#EAF1FC; --warn:#FFF5E0; --warnline:#E8C26A; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; scroll-padding-top: 118px; }
  body { font-family: Arial, Helvetica, sans-serif; color: var(--ink); background: var(--bg); font-size: 14px; line-height: 1.5; }
  .top { position: sticky; top: 0; z-index: 20; background: var(--card); border-bottom: 1px solid var(--line); }
  .timerbar { background: var(--accent); color: #FFF; padding: 7px 14px; display: flex; align-items: center; gap: 14px; }
  .timerbar button { background: var(--gold); color: var(--accent); border: none; border-radius: 6px; padding: 5px 14px; font-size: 12px; font-weight: bold; cursor: pointer; }
  #clock { font-family: 'Courier New', monospace; font-size: 16px; font-weight: bold; letter-spacing: 1px; }
  #phase { font-size: 12px; color: #C6D4EA; }
  nav { display: flex; gap: 4px; overflow-x: auto; padding: 6px 10px; }
  nav a { white-space: nowrap; text-decoration: none; color: var(--ink); font-size: 13px; padding: 5px 11px; border-radius: 999px; }
  nav a:hover { background: var(--soft); color: var(--accent); }
  main { max-width: 900px; margin: 0 auto; padding: 18px 16px 70px; }
  h1 { font-size: 22px; color: var(--accent); border-bottom: 3px solid var(--gold); padding-bottom: 6px; margin-bottom: 4px; }
  .sub { color: var(--muted); font-size: 12px; margin-bottom: 12px; }
  h2 { font-size: 16px; color: var(--accent); margin: 26px 0 10px; border-left: 4px solid var(--gold); padding-left: 8px; }
  h2 .dur { float: right; font-size: 11px; color: #8896AC; font-weight: normal; }
  p { margin-bottom: 8px; }
  .card { background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 12px 14px; margin: 10px 0; }
  .card .q { font-weight: bold; color: var(--accent); margin-bottom: 6px; }
  .lbl { display: inline-block; font-size: 10px; font-weight: bold; color: var(--gold); text-transform: uppercase; letter-spacing: 0.5px; margin-right: 6px; }
  .say { background: #F4F6FA; border-left: 3px solid var(--accent); padding: 8px 12px; margin: 8px 0; border-radius: 0 6px 6px 0; }
  .say .lbl { display: block; margin-bottom: 3px; }
  .watch { background: var(--warn); border: 1px solid var(--warnline); border-radius: 8px; padding: 8px 12px; margin: 8px 0 0; font-size: 13px; }
  .warn { background: #FDF3F3; border-left: 3px solid #B14D4D; padding: 8px 12px; margin: 8px 0; border-radius: 0 6px 6px 0; }
  .good { background: #F2F8F2; border-left: 3px solid #4D8B4D; padding: 8px 12px; margin: 8px 0; border-radius: 0 6px 6px 0; }
  ul, ol { margin: 6px 0 10px 22px; }
  li { margin-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; background: var(--card); border: 1px solid var(--line); font-size: 13px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--line); vertical-align: top; }
  th { background: var(--soft); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--muted); }
  .tag { display: inline-block; font-size: 11px; padding: 2px 8px; border-radius: 999px; background: var(--soft); color: var(--accent); font-weight: bold; white-space: nowrap; }
  .cols { display: flex; gap: 18px; }
  .col { flex: 1; }
  .notes div[contenteditable] { min-height: 56px; border: 1px dashed var(--line); border-radius: 8px; padding: 8px 10px; background: #FFF; }
  .notes label { font-size: 12px; color: var(--muted); display: block; margin: 10px 0 4px; }
  .block { border-left: 4px solid transparent; padding-left: 8px; margin-left: -12px; border-radius: 4px; }
  .block.active { border-left-color: var(--gold); background: #FDF8EC; }
  .footer { margin-top: 24px; padding-top: 10px; border-top: 1px solid var(--line); color: #667; font-size: 11px; }
  @media (prefers-color-scheme: dark) {
    :root { --bg:#12161C; --card:#1A2029; --ink:#E8ECF2; --muted:#9AA6B6; --line:#2B3441; --accent:#7DB0FF; --soft:#222C3A; --warn:#2C2616; --warnline:#6B5624; }
    .say { background: #222C3A; } .block.active { background: #2A2618; } .notes div[contenteditable] { background: #12161C; }
    .timerbar { background: #243553; } .timerbar button { color: #1A2029; }
    .warn { background: #2A1B1B; } .good { background: #1B2A1B; }
  }
  @media print { .top { position: static; } nav { display: none; } body { background: #FFF; font-size: 12px; } .cols { display: block; } }
</style>
</head>
<body>

<div class="top">
  <div class="timerbar">
    <button id="startBtn">Start call</button>
    <span id="clock">00:00</span>
    <span id="phase">Press start when the call begins</span>
  </div>
  <nav>
    <a href="#plan">Plan</a>
    <a href="#who">Who they are</a>
    <a href="#theirs">Their questions</a>
    <a href="#yours">Your questions</a>
    <a href="#fit">Fit map</a>
    <a href="#options">Where to start</a>
    <a href="#watch">Watch notes</a>
    <a href="#close">Close</a>
    <a href="#notes">Notes</a>
  </nav>
</div>

<main>
<h1>${name} Intro Call</h1>
<p class="sub">Applied ${received} via contact form · ${clean(inq.email, 160)}${org ? ` · ${org}` : ''} · Volunteering inquiry · Read the boxes, glance at the rest</p>

<h2 id="plan">The plan</h2>
<div class="card">
  <p><strong>Goal.</strong> Learn what they came for, match it to a real ODIPA role, and agree on one small first project and a date to talk again. Start with what they asked for. Anything beyond it is your idea, so offer it as one.</p>
  <ol>
    <li><strong>Open (0 to 4 min).</strong> Thank them, say what ODIPA is, ask what drew them in.</li>
    <li><strong>Their side (4 to 14 min).</strong> Let them talk. Check off what you hear.</li>
    <li><strong>The honest picture (14 to 17 min).</strong> Where ODIPA really is today.</li>
    <li><strong>Where they could start (17 to 25 min).</strong> Their stated ask first, then your ideas.</li>
    <li><strong>Close (25 to 30 min).</strong> One project, one date, paperwork.</li>
  </ol>
</div>

<h2 id="who">Who they are and what they asked for</h2>
<div class="card">
  <p><span class="lbl">They asked for</span> ${gen.asked}</p>
  ${gen.background.length ? `<p><strong>From their message</strong></p>\n<ul>\n${gen.background.map(b => `  <li>${b}</li>`).join('\n')}\n</ul>` : ''}
  <div class="watch"><b>Watch.</b> This is only what they wrote to us. If they linked a website or profile, read it before the call and correct anything here that it contradicts.</div>
</div>

<section class="block" data-start="0" data-end="4" id="b1">
<h2>Open <span class="dur">0:00 to 4:00</span></h2>
${say('Ice breaker', gen.icebreaker)}
${say('Your vision line', 'The vision is deliberately ambitious. Privacy fails when you only educate one side, so ODIPA takes a holistic approach and works both sides of the problem. Consumers who need to understand and protect their data, and organizations that need to handle it responsibly. That is why there are eight programs instead of one, education, outreach, and tools on the consumer side, certification and assessment on the business side.')}
${say('Your credibility line', `I come at privacy from the technical side. Years in banking technology and security, a fraud detection patent, and I built everything you saw on the site myself. What I do not have is ${gen.bridge}`)}
</section>

<section class="block" data-start="4" data-end="14" id="b2">
<h2>Their floor, listen and check off <span class="dur">4:00 to 14:00</span></h2>
${say('Turn it around', `That is enough from me. I asked for this call mostly to listen, so let me turn it around. What made you pick ODIPA out of all the places you could volunteer, ${first}?`)}
<p><strong>Listen for, from their message.</strong></p>
<ul>
${gen.listenFor.map(b => `  <li>${b}</li>`).join('\n')}
</ul>
${say('The honest move, if they raise something you have not worked with', 'I have not worked with that yet. Give me the two minute version.')}
</section>

<section class="block" data-start="14" data-end="17" id="b3">
<h2>The honest picture <span class="dur">14:00 to 17:00</span></h2>
${say('Say it plainly', `Let me give you the honest picture of where ODIPA actually is today, no website gloss. It's early, I'm the founder and right now most of the operation is me, which means two things for you. Your work would ship and be visible, not sit in a queue behind a committee. And you'd be helping build the thing, not slotting into it. Some people find that exciting, some want more structure, both are legitimate, so tell me which you are.`)}
</section>

<h2 id="theirs">Questions they may ask</h2>
${gen.qa.map(x => qaCard(x.q, x.a, x.watch)).join('\n')}
${qaCard('Is this paid?', 'No. All ODIPA volunteer roles are unpaid and fully remote. What you get is real, public work with your name on it, and an odipa.org email address.', 'Do not suggest this leads to paid work. If they ask about the future, say the focus right now is building the volunteer base and credibility.')}
${qaCard('How can I progress here?', 'We start with one small project that ships. If it goes well there is room to take on more, but I would rather build it step by step than promise a path today.', 'Answer this directly when they ask it. Do not attach titles or dates.')}
${qaCard('Who else is involved?', 'I am the founder and Executive Director and the only director on the board today. There is a small group of volunteers, and a few more people are in conversation with us.', 'Be plain that the board is just you. Do not hint at a board seat. Do not name other volunteers or applicants, describe roles only.')}
${qaCard('How does the certification program work?', 'It is an organization level conformity assessment against ODIPA’s published criteria. It is not an audit and it is not a legal compliance determination. The program is at the founding cohort stage.', 'The criteria are version 1.0, still a draft pending counsel review, and not in force for any assessment. Never claim a business has been certified.')}

<h2 id="yours">Questions you ask</h2>
${gen.questions.map(q => askCard(q.text, q.listen)).join('\n')}
${askCard('How many hours a month can you realistically give?', 'A clear number, even a small one.')}
${askCard('How do you prefer to work, async over email and docs, or short calls?', 'Whether a first project should be a document they write alone or something with check-ins.')}

<h2 id="fit">Fit map</h2>
<table>
  <tr><th>ODIPA role</th><th>Why it might fit</th><th>Fit</th></tr>
${gen.fit.map(f => `  <tr><td>${f.lane}</td><td>${f.evidence}</td><td><span class="tag">${LEVELS[f.level]}</span></td></tr>`).join('\n')}
</table>
<p class="sub" style="margin-top:8px">Roles are from ODIPA’s published volunteer list. Mark a lane strong only when they have told you something that supports it.</p>

<section class="block" data-start="17" data-end="25" id="b4">
<h2 id="options">Where they could start, let them pick <span class="dur">17:00 to 25:00</span></h2>
${say('Lead-in', 'Let me throw out a few concrete places you could plug in. Pick the one that sounds fun, not the one that sounds dutiful. You are volunteering, it should give you energy.')}
${gen.options.map(o => say(o.name, o.script)).join('\n')}
</section>

<h2 id="watch">Watch notes</h2>
<div class="card">
  <ul>
    <li><strong>Start with their ask.</strong> Offer your own ideas as ideas, never as what they requested.</li>
    <li><strong>A background in governance, risk, compliance, audit or security is a strength here.</strong> Never steer them away from it or toward unrelated work.</li>
    <li><strong>Do not oversell certification.</strong> Draft criteria, pending counsel review, founding cohort stage.</li>
    <li><strong>Do not promise titles, pay, dates, or a board role.</strong></li>
    <li><strong>Corporate training is fee-based on the site.</strong> If they ask whether a volunteer would teach it, decide your answer before the call.</li>
    <li><strong>Keep ODIPA and Avallis separate</strong> unless they raise it.</li>
    <li><strong>Let them talk.</strong> The first several minutes of their floor should mostly be them.</li>
  </ul>
</div>

<section class="block" data-start="25" data-end="30" id="b5">
<h2 id="close">Close with concrete next steps <span class="dur">25:00 to 30:00</span></h2>
${say('The close', 'I want to respect your time, so let me make sure we land this properly. Here is what I will do this week, and tell me if the pace works for you. I will send a short volunteer agreement and a conflict of interest form, routine paperwork. I will write up the project we just picked with a first milestone, and you tell me if the scope feels right. And one routine thing I ask everyone, is there anything about your work authorization I should know for volunteer compliance? For anyone on OPT there is a specific process we follow to protect your status.')}
${say('Last question', 'What is the one thing you would want to be able to point to after your first project?')}
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

<h2 id="notes">Notes during the call</h2>
<div class="card notes">
  <label>Why they applied</label><div contenteditable="true"></div>
  <label>Role or project chosen</label><div contenteditable="true"></div>
  <label>Hours per month</label><div contenteditable="true"></div>
  <label>First task, owner and date</label><div contenteditable="true"></div>
  <label>Other notes</label><div contenteditable="true"></div>
</div>

<div class="footer">ODIPA · Volunteer intro call sheet, generated ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · Applicant-specific parts are AI-generated from their message and need your review, org passages are fixed</div>
</main>

<script>
(function(){
  var startBtn = document.getElementById('startBtn');
  var clock = document.getElementById('clock');
  var phase = document.getElementById('phase');
  var blocks = Array.prototype.slice.call(document.querySelectorAll('.block'));
  var names = {b1:'Open', b2:'Their floor', b3:'The honest picture', b4:'Where they start', b5:'Close'};
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
    if(current){ phase.textContent = 'Now · ' + names[current.id]; }
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
