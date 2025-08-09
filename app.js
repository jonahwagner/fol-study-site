function qs(param){
  const url = new URL(window.location.href);
  return url.searchParams.get(param) || '';
}

const eventKey = qs('event') || 'fbla';
const topicKey = qs('topic') || 'organizational_leadership';
const dataPath = `data/${eventKey}/${topicKey}.json`;

const state = { idx:0, score:0, data:null, answered:false, selected:null };

const badge = document.getElementById('badge');
const topicLabel = document.getElementById('topicLabel');
const qTitle = document.getElementById('qTitle');
const choicesWrap = document.getElementById('choices');
const explain = document.getElementById('explain');
const progress = document.getElementById('progress');
const nextBtn = document.getElementById('nextBtn');
const restartBtn = document.getElementById('restartBtn');
const result = document.getElementById('result');

fetch(dataPath).then(r=>{
  if(!r.ok) throw new Error('Not found');
  return r.json();
}).then(json=>{
  state.data = json;
  badge.textContent = json.event.toUpperCase();
  topicLabel.textContent = json.title;
  state.idx = 0; state.score = 0;
  renderQuestion();
}).catch(err=>{
  qTitle.textContent = 'No questions yet for this event.';
  choicesWrap.innerHTML = `<div class="alert">Add questions at <code>${dataPath}</code>. Use the JSON template below.</div>
  <div class="small">
  <pre style="white-space:pre-wrap;word-break:break-word;background:#f8fafc;padding:12px;border-radius:10px;border:1px solid #e5e7eb;margin-top:10px">{\n  \"event\": \"${eventKey}\",\n  \"title\": \"${topicKey.replaceAll('_',' ')}\",\n  \"questions\": [\n    {\n      \"prompt\": \"Sample question?\",\n      \"choices\": [\"A\", \"B\", \"C\", \"D\"],\n      \"answer\": 0,\n      \"explanation\": \"Why this is correct.\"\n    }\n  ]\n}</pre></div>`;
});

function renderQuestion(){
  const q = state.data.questions[state.idx];
  qTitle.textContent = q.prompt;
  choicesWrap.innerHTML = '';
  explain.style.display = 'none';
  explain.textContent = '';
  state.answered = false;
  state.selected = null;
  nextBtn.disabled = true;
  progress.textContent = `${state.idx+1}/${state.data.questions.length}`;

  q.choices.forEach((text, i)=>{
    const div = document.createElement('div');
    div.className = 'choice';
    div.textContent = text;
    div.addEventListener('click', ()=> selectChoice(div, i, q));
    choicesWrap.appendChild(div);
  });
}

function selectChoice(div, i, q){
  if(state.answered) return;
  [...choicesWrap.children].forEach(c=>c.classList.remove('selected'));
  div.classList.add('selected');
  state.selected = i;
  nextBtn.disabled = false;
  // Immediate feedback
  state.answered = true;
  const correct = i === q.answer;
  if(correct) { state.score++; div.classList.add('correct'); }
  else {
    div.classList.add('wrong');
    choicesWrap.children[q.answer].classList.add('correct');
  }
  if(q.explanation){
    explain.style.display = 'block';
    explain.textContent = q.explanation;
  }
}

nextBtn.addEventListener('click', ()=>{
  if(state.idx < state.data.questions.length - 1){
    state.idx++;
    renderQuestion();
  } else {
    showResult();
  }
});

restartBtn.addEventListener('click', ()=>{
  state.idx = 0; state.score = 0;
  result.style.display = 'none';
  restartBtn.style.display = 'none';
  nextBtn.style.display = 'inline-block';
  renderQuestion();
});

function showResult(){
  const total = state.data.questions.length;
  const pct = Math.round((state.score/total)*100);
  result.style.display = 'block';
  result.innerHTML = `<strong>Score:</strong> ${state.score}/${total} (${pct}%)<br><span class="small">Refresh to shuffle questions or pick another event.</span>`;
  nextBtn.style.display = 'none';
  restartBtn.style.display = 'inline-block';
}
