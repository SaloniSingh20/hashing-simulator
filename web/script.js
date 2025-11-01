// script.js - Hashing visualizer

// Utility: safe function builder from user expression (key, tableSize) => number
function makeHashFunc(expr) {
  try {
    // Replace shortcuts k and n with key and tableSize
    const processedExpr = expr.replace(/\bk\b/g, 'key').replace(/\bn\b/g, 'tableSize');
    // Create a function taking key and tableSize
    // NOTE: This uses the Function constructor and executes local JS. It's fine for local visualization.
    const fn = new Function('key', 'tableSize', 'return (' + processedExpr + ')');
    // Quick test
    const v = fn(1, 11);
    if (typeof v !== 'number' || !isFinite(v)) throw new Error('Not a number');
    return fn;
  } catch (e) {
    return null;
  }
}

class HashVisualizer {
  constructor() {
    this.tableSize = 10;
    this.chainTable = [];
    this.linearTable = [];
    this.quadTable = [];
    this.doubleTable = [];

    this.queuedKeys = [];
    this.queues = {
      chain: [], linear: [], quad: [], dbl: []
    };

    this.interval = null;
    // Fixed animation speed
    this.speed = 500;

  // compiled hash functions (key, tableSize) => number
  this.hash1 = (k,m) => k % m;
  this.hash2 = (k,m) => 1 + (k % Math.max(1, m-1));

  // steps list element will be bound in bindUI
  this.steps = [];

    // bind DOM
    this.bindUI();
  }

  bindUI() {
    this.el = {
      tableSize: document.getElementById('tableSize'),
      hashPrimary: document.getElementById('hashPrimary'),
      hashSecondary: document.getElementById('hashSecondary'),
      bulkKeys: document.getElementById('bulkKeys'),
      modeSelect: document.getElementById('modeSelect'),
      singleKey: document.getElementById('singleKey'),
      insertKeyBtn: document.getElementById('insertKeyBtn'),
      searchKeyBtn: document.getElementById('searchKeyBtn'),
      deleteKeyBtn: document.getElementById('deleteKeyBtn'),
      initBtn: document.getElementById('initBtn'),
      enqueueBtn: document.getElementById('enqueueBtn'),
      runBtn: document.getElementById('runBtn'),
      stepBtn: document.getElementById('stepBtn'),
      pauseBtn: document.getElementById('pauseBtn'),
      resetBtn: document.getElementById('resetBtn'),
      stepsList: document.getElementById('stepsList'),

      singleTitle: document.getElementById('singleTitle'),
      singleTable: document.getElementById('singleTable')
    };

  this.el.initBtn.addEventListener('click', () => this.initFromUI());
  this.el.enqueueBtn.addEventListener('click', () => this.prepareInsertions());
    // single-key operations
  this.el.insertKeyBtn.addEventListener('click', () => this.insertSingleKey());
  this.el.searchKeyBtn.addEventListener('click', () => this.searchSingleKey());
  this.el.deleteKeyBtn.addEventListener('click', () => this.deleteSingleKey());
  if (this.el.runBtn) this.el.runBtn.addEventListener('click', () => this.play());
  if (this.el.stepBtn) this.el.stepBtn.addEventListener('click', () => this.step());
  if (this.el.pauseBtn) this.el.pauseBtn.addEventListener('click', () => this.pause());
  if (this.el.resetBtn) this.el.resetBtn.addEventListener('click', () => this.reset());
    this.el.modeSelect.addEventListener('change', () => { this.renderAll(); this.toggleSecondary(); this.updateNotice(); });

    // speed input (optional) - update internal speed scaling
    const speedEl = document.getElementById('speed');
    if (speedEl) {
      speedEl.addEventListener('input', (e) => { this.speed = 1000 - (e.target.value * 80); if (this.interval) { this.pause(); this.play(); } });
    }

  // steps list reference
  this.el.stepsList && (this.el.stepsList.innerHTML = '');

    // initial render
    this.initFromUI();
    // ensure secondary visibility set correctly
    this.toggleSecondary();
  }

  initFromUI() {
    const tSize = parseInt(this.el.tableSize.value, 10);
    this.tableSize = Math.max(3, tSize || 10);

    // reset tables
    this.chainTable = Array.from({length:this.tableSize}, () => []);
    this.linearTable = Array.from({length:this.tableSize}, () => ({key:null,occupied:false}));
    this.quadTable = Array.from({length:this.tableSize}, () => ({key:null,occupied:false}));
    this.doubleTable = Array.from({length:this.tableSize}, () => ({key:null,occupied:false}));

    this.clearQueues();
    this.clearSteps();
    // compile hash functions from inputs
    const hp = (this.el.hashPrimary && this.el.hashPrimary.value) || 'key % tableSize';
    const hs = (this.el.hashSecondary && this.el.hashSecondary.value) || '1 + (key % (tableSize - 1))';
    const f1 = makeHashFunc(hp);
    const f2 = makeHashFunc(hs);
    this.hash1 = f1 ? f1 : ((k,m) => k % m);
    this.hash2 = f2 ? f2 : ((k,m) => 1 + (k % Math.max(1, m-1)));
    this.renderAll();
    this.updateNotice();
  }

  updateNotice(){
    const nb = document.getElementById('noticeBar');
    if (!nb) return;
    const mode = (this.el.modeSelect && this.el.modeSelect.value) || 'chain';
    nb.textContent = `Created hash table with size ${this.tableSize} and mode ${mode}`;
  }

  toggleSecondary(){
    if (!this.el || !this.el.modeSelect) return;
    const m = this.el.modeSelect.value;
    const label = document.getElementById('hashSecondaryLabel');
    if (!label) return;
    if (m === 'dbl') label.style.display = 'inline-flex';
    else label.style.display = 'none';
  }

  clearQueues() {
    this.queuedKeys = [];
    this.queues = {chain: [], linear: [], quad: [], dbl: []};
  }

  clearSteps(){
    this.steps = [];
    if (this.el && this.el.stepsList) this.el.stepsList.innerHTML = '';
  }

  addStep(txt){
    const time = new Date().toLocaleTimeString();
    this.steps.push(txt);
    if (this.el && this.el.stepsList){
      const li = document.createElement('li');
      li.textContent = txt;
      this.el.stepsList.appendChild(li);
      // keep latest visible
      this.el.stepsList.parentElement.scrollTop = this.el.stepsList.parentElement.scrollHeight;
    }
  }

  parseKeys() {
    // If a bulkKeys input exists and has content, use it; otherwise prompt the user.
    let raw = '';
    if (this.el && this.el.bulkKeys && (this.el.bulkKeys.value || '').trim()) raw = this.el.bulkKeys.value.trim();
    else raw = prompt('Enter keys to insert (comma or space separated):') || '';
    if (!raw) return [];
    const parts = raw.split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
    const keys = parts.map(s => parseInt(s,10)).filter(n => !isNaN(n));
    return keys;
  }

  prepareInsertions() {
    const keys = this.parseKeys();
    if (!keys.length) { alert('No keys provided in bulk input'); return; }
    this.clearQueues();
    this.clearSteps();
    this.queuedKeys = keys.slice();
    const mode = (this.el.modeSelect && this.el.modeSelect.value) || 'chain';
    keys.forEach(key => {
      if (mode === 'chain') this._queueInsert_chain(key);
      if (mode === 'linear') this._queueInsert_linear(key);
      if (mode === 'quad') this._queueInsert_quad(key);
      if (mode === 'dbl') this._queueInsert_dbl(key);
    });

    this.renderAll();
    this.addStep(`Prepared ${keys.length} insertions (mode=${mode})`);
    this.updateNotice();
  }

  // Single-key operations (insert/search/delete) that operate on current table state and selected mode
  insertSingleKey(){
    const v = parseInt((this.el.singleKey && this.el.singleKey.value) || '', 10);
    if (isNaN(v)) { alert('Enter a valid integer key'); return; }
    const mode = (this.el.modeSelect && this.el.modeSelect.value) || 'chain';
    this.clearQueues();
    this.clearSteps();
    if (mode === 'chain') this._queueInsert_chain(v);
    if (mode === 'linear') this._queueInsert_linear(v);
    if (mode === 'quad') this._queueInsert_quad(v);
    if (mode === 'dbl') this._queueInsert_dbl(v);
    this.play();
  }

  searchSingleKey(){
    const v = parseInt((this.el.singleKey && this.el.singleKey.value) || '', 10);
    if (isNaN(v)) { alert('Enter a valid integer key'); return; }
    const mode = (this.el.modeSelect && this.el.modeSelect.value) || 'chain';
    this.clearQueues();
    if (mode === 'chain') this._queueSearch_chain(v);
    if (mode === 'linear') this._queueSearch_linear(v);
    if (mode === 'quad') this._queueSearch_quad(v);
    if (mode === 'dbl') this._queueSearch_dbl(v);
    this.play();
  }

  deleteSingleKey(){
    const v = parseInt((this.el.singleKey && this.el.singleKey.value) || '', 10);
    if (isNaN(v)) { alert('Enter a valid integer key'); return; }
    const mode = (this.el.modeSelect && this.el.modeSelect.value) || 'chain';
    this.clearQueues();
    if (mode === 'chain') this._queueDelete_chain(v);
    if (mode === 'linear') this._queueDelete_linear(v);
    if (mode === 'quad') this._queueDelete_quad(v);
    if (mode === 'dbl') this._queueDelete_dbl(v);
    this.play();
  }

  // insert helpers per algorithm (use current table state)
  _queueInsert_chain(key){
    // Separate chaining uses primary hash
    const raw = this.hash1(key, this.tableSize);
    const h = this.mod(raw, this.tableSize);
    this.queues.chain.push({type:'probe', idx:h, key, hraw:raw});
    this.queues.chain.push({type:'place', idx:h, key, hraw:raw});
  }

  _queueInsert_linear(key){
    // Linear probing: h(k,i) = (h(k) + i) % m
    let placed=false;
    const hraw = this.hash1(key, this.tableSize);
    const h = this.mod(hraw, this.tableSize);
    for (let i=0; i<this.tableSize; i++){
      const idx = (h + i) % this.tableSize;
      this.queues.linear.push({type:'probe', idx, key, i, h, hraw});
      if (!this.linearTable[idx].occupied) { 
        this.queues.linear.push({type:'place', idx, key, i, h, hraw}); 
        placed=true; 
        break; 
      }
    }
    if (!placed) this.queues.linear.push({type:'fail', key, h, hraw});
  }

  _queueInsert_quad(key){
    // Quadratic probing: h(k,i) = (h(k) + i^2) % m  (we show i^2 in messages)
    let placed=false;
    const hraw = this.hash1(key, this.tableSize);
    const h = this.mod(hraw, this.tableSize);
    for (let i=0; i<this.tableSize; i++){
      const idx = (h + (i * i)) % this.tableSize;
      this.queues.quad.push({type:'probe', idx, key, i, h, hraw});
      if (!this.quadTable[idx].occupied) { 
        this.queues.quad.push({type:'place', idx, key, i, h, hraw}); 
        placed=true; 
        break; 
      }
    }
    if (!placed) this.queues.quad.push({type:'fail', key, h, hraw});
  }

  _queueInsert_dbl(key){
    // Double hashing: h(k,i) = (h1(k) + i*h2(k)) % m
    let placed=false;
    const h1raw = this.hash1(key, this.tableSize);
    const h2raw = this.hash2(key, this.tableSize);
    const h1 = this.mod(h1raw, this.tableSize);
    // ensure non-zero integer step
    let h2 = Number(h2raw) || 1;
    if (h2 === 0) h2 = 1;
    for (let i=0; i<this.tableSize; i++){
      const idx = (h1 + i * h2) % this.tableSize;
      this.queues.dbl.push({type:'probe', idx, key, i, h1, h2, h1raw, h2raw});
      if (!this.doubleTable[idx].occupied) { 
        this.queues.dbl.push({type:'place', idx, key, i, h1, h2, h1raw, h2raw}); 
        placed=true; 
        break; 
      }
    }
    if (!placed) this.queues.dbl.push({type:'fail', key, h1, h2, h1raw, h2raw});
  }

  // search helpers
  _queueSearch_chain(key){
    const h = this.mod(this.hash1(key,this.tableSize), this.tableSize);
    // probe through chain until found
    const arr = this.chainTable[h] || [];
    // show single probe then either found or not
    this.queues.chain.push({type:'probe', idx:h, key});
    if (arr.indexOf(key) !== -1) this.queues.chain.push({type:'search_found', idx:h, key});
    else this.queues.chain.push({type:'search_notfound', idx:h, key});
  }

  _queueSearch_linear(key){
    for (let i=0;i<this.tableSize;i++){
      const idx = this.mod(this.hash1(key,this.tableSize) + i, this.tableSize);
      this.queues.linear.push({type:'probe', idx, key});
      if (this.linearTable[idx].occupied && this.linearTable[idx].key === key) { this.queues.linear.push({type:'search_found', idx, key}); return; }
    }
    this.queues.linear.push({type:'search_notfound', key});
  }

  _queueSearch_quad(key){
    for (let i=0;i<this.tableSize;i++){
      const idx = this.mod(this.hash1(key,this.tableSize) + i*i, this.tableSize);
      this.queues.quad.push({type:'probe', idx, key});
      if (this.quadTable[idx].occupied && this.quadTable[idx].key === key) { this.queues.quad.push({type:'search_found', idx, key}); return; }
    }
    this.queues.quad.push({type:'search_notfound', key});
  }

  _queueSearch_dbl(key){
    const stepRaw = this.hash2(key,this.tableSize);
    let step = Number(stepRaw) || 1; if (step === 0) step = 1;
    for (let i=0;i<this.tableSize;i++){
      const idx = this.mod(this.hash1(key,this.tableSize) + i*step, this.tableSize);
      this.queues.dbl.push({type:'probe', idx, key});
      if (this.doubleTable[idx].occupied && this.doubleTable[idx].key === key) { this.queues.dbl.push({type:'search_found', idx, key}); return; }
    }
    this.queues.dbl.push({type:'search_notfound', key});
  }

  // delete helpers
  _queueDelete_chain(key){
    const h = this.mod(this.hash1(key,this.tableSize), this.tableSize);
    this.queues.chain.push({type:'probe', idx:h, key});
    const arr = this.chainTable[h] || [];
    if (arr.indexOf(key) !== -1) this.queues.chain.push({type:'delete_place', idx:h, key});
    else this.queues.chain.push({type:'delete_fail', key});
  }

  _queueDelete_linear(key){
    for (let i=0;i<this.tableSize;i++){
      const idx = this.mod(this.hash1(key,this.tableSize) + i, this.tableSize);
      this.queues.linear.push({type:'probe', idx, key});
      if (this.linearTable[idx].occupied && this.linearTable[idx].key === key) { this.queues.linear.push({type:'delete_place', idx, key}); return; }
    }
    this.queues.linear.push({type:'delete_fail', key});
  }

  _queueDelete_quad(key){
    for (let i=0;i<this.tableSize;i++){
      const idx = this.mod(this.hash1(key,this.tableSize) + i*i, this.tableSize);
      this.queues.quad.push({type:'probe', idx, key});
      if (this.quadTable[idx].occupied && this.quadTable[idx].key === key) { this.queues.quad.push({type:'delete_place', idx, key}); return; }
    }
    this.queues.quad.push({type:'delete_fail', key});
  }

  _queueDelete_dbl(key){
    const stepRaw = this.hash2(key,this.tableSize);
    let step = Number(stepRaw) || 1; if (step === 0) step = 1;
    for (let i=0;i<this.tableSize;i++){
      const idx = this.mod(this.hash1(key,this.tableSize) + i*step, this.tableSize);
      this.queues.dbl.push({type:'probe', idx, key});
      if (this.doubleTable[idx].occupied && this.doubleTable[idx].key === key) { this.queues.dbl.push({type:'delete_place', idx, key}); return; }
    }
    this.queues.dbl.push({type:'delete_fail', key});
  }

  mod(n,m){
    // ensure integer index 0..m-1
    let r = Number(n) | 0;
    r = ((r % m) + m) % m;
    return r;
  }

  play(){
    if (this.interval) return; // already running
    this.interval = setInterval(()=> this.step(), this.speed);
  }

  pause(){
    if (this.interval){ clearInterval(this.interval); this.interval=null; }
  }

  reset(){
    this.pause();
    this.initFromUI();
  }

  step(){
    // Process one action from the queue of the selected mode
    const mode = (this.el.modeSelect && this.el.modeSelect.value) || 'chain';
    let action = null;
    if (mode === 'chain') action = this.queues.chain.shift();
    if (mode === 'linear') action = this.queues.linear.shift();
    if (mode === 'quad') action = this.queues.quad.shift();
    if (mode === 'dbl') action = this.queues.dbl.shift();

    if (!action) {
      // nothing left => stop
      this.pause();
      setTimeout(()=> this.renderAll(), 300);
      return;
    }

    // handle the action for the selected mode
    this._processAction(mode, action);
  }

  _processAction(kind, act){
    if (!act) return;
    if (kind === 'chain'){
      if (act.type === 'probe') {
        this.visualHighlight('chain', act.idx);
        this.addStep(`Probe chain bucket ${act.idx} for key ${act.key} (h=${act.hraw} -> idx ${act.idx})`);
      }
      else if (act.type === 'place') {
        this.chainTable[act.idx].push(act.key);
        this.visualPlace('chain', act.idx, act.key);
        this.addStep(`Placed key ${act.key} into chain bucket ${act.idx}`);
      }
      else if (act.type === 'search_found') { this.visualHighlight('chain', act.idx); this.addStep(`Search: found key ${act.key} in chain bucket ${act.idx}`); setTimeout(()=> alert('Found in chain at bucket ' + act.idx), 100); }
      else if (act.type === 'search_notfound') { this.visualHighlight('chain', act.idx); this.addStep(`Search: key ${act.key} not found in chain bucket ${act.idx}`); setTimeout(()=> alert('Not found in chain at bucket ' + act.idx), 100); }
      else if (act.type === 'delete_place') { const arr = this.chainTable[act.idx]; const pos = arr.indexOf(act.key); if (pos!==-1) arr.splice(pos,1); this.visualPlace('chain', act.idx, null); this.addStep(`Deleted key ${act.key} from chain bucket ${act.idx}`); }
      else if (act.type === 'delete_fail') { this.addStep(`Delete: key ${act.key} not found in chain`); setTimeout(()=> alert('Delete: not found in chain'), 80); }
    }

    if (kind === 'linear'){
      if (act.type === 'probe') {
        this.visualHighlight('linear', act.idx);
        const occ = this.linearTable[act.idx] && this.linearTable[act.idx].occupied;
        if (occ) this.addStep(`Probe idx ${act.idx} for key ${act.key}: occupied by ${this.linearTable[act.idx].key} -> collision. Will try (h + ${act.i}) mod ${this.tableSize}.`);
        else this.addStep(`Probe idx ${act.idx} for key ${act.key}: empty`);
      }
      else if (act.type === 'place') { this.linearTable[act.idx] = {key:act.key,occupied:true}; this.visualPlace('linear', act.idx, act.key); this.addStep(`Placed key ${act.key} at index ${act.idx}`); }
      else if (act.type === 'fail'){ this.addStep(`Linear Probing: insertion failed for key ${act.key}`); alert('Linear Probing: insertion failed for key ' + act.key); }
      else if (act.type === 'search_found'){ this.visualHighlight('linear', act.idx); this.addStep(`Search: found key ${act.key} at index ${act.idx}`); setTimeout(()=> alert('Found at index ' + act.idx), 100);} 
      else if (act.type === 'search_notfound'){ this.addStep(`Search: key ${act.key} not found (linear)`); setTimeout(()=> alert('Not found (linear)'), 80);} 
      else if (act.type === 'delete_place'){ this.linearTable[act.idx] = {key:null,occupied:false}; this.visualPlace('linear', act.idx, null); this.addStep(`Deleted key ${act.key} from index ${act.idx}`);} 
      else if (act.type === 'delete_fail'){ this.addStep(`Delete: key ${act.key} not found (linear)`); setTimeout(()=> alert('Delete: not found (linear)'), 80);} 
    }

    if (kind === 'quad'){
      if (act.type === 'probe') {
        this.visualHighlight('quad', act.idx);
        const occ = this.quadTable[act.idx] && this.quadTable[act.idx].occupied;
        if (occ) this.addStep(`Probe idx ${act.idx} for key ${act.key}: occupied by ${this.quadTable[act.idx].key} -> collision. Will try (h + ${act.i}^2) mod ${this.tableSize}.`);
        else this.addStep(`Probe idx ${act.idx} for key ${act.key}: empty`);
      }
      else if (act.type === 'place') { this.quadTable[act.idx] = {key:act.key,occupied:true}; this.visualPlace('quad', act.idx, act.key); this.addStep(`Placed key ${act.key} at index ${act.idx}`); }
      else if (act.type === 'fail'){ this.addStep(`Quadratic Probing: insertion failed for key ${act.key}`); alert('Quadratic Probing: insertion failed for key ' + act.key); }
      else if (act.type === 'search_found'){ this.visualHighlight('quad', act.idx); this.addStep(`Search: found key ${act.key} at index ${act.idx}`); setTimeout(()=> alert('Found at index ' + act.idx), 100);} 
      else if (act.type === 'search_notfound'){ this.addStep(`Search: key ${act.key} not found (quadratic)`); setTimeout(()=> alert('Not found (quadratic)'), 80);} 
      else if (act.type === 'delete_place'){ this.quadTable[act.idx] = {key:null,occupied:false}; this.visualPlace('quad', act.idx, null); this.addStep(`Deleted key ${act.key} from index ${act.idx}`);} 
      else if (act.type === 'delete_fail'){ this.addStep(`Delete: key ${act.key} not found (quadratic)`); setTimeout(()=> alert('Delete: not found (quadratic)'), 80);} 
    }

    if (kind === 'dbl'){
      if (act.type === 'probe') {
        this.visualHighlight('dbl', act.idx);
        const occ = this.doubleTable[act.idx] && this.doubleTable[act.idx].occupied;
        if (occ) this.addStep(`Probe idx ${act.idx} for key ${act.key}: occupied by ${this.doubleTable[act.idx].key} -> collision. Using secondary hash step ${act.h2} to compute (h1 + i*h2) mod ${this.tableSize}.`);
        else this.addStep(`Probe idx ${act.idx} for key ${act.key}: empty (h1=${act.h1}, h2=${act.h2})`);
      }
      else if (act.type === 'place') { this.doubleTable[act.idx] = {key:act.key,occupied:true}; this.visualPlace('dbl', act.idx, act.key); this.addStep(`Placed key ${act.key} at index ${act.idx} (double hashing)`); }
      else if (act.type === 'fail'){ this.addStep(`Double Hashing: insertion failed for key ${act.key}`); alert('Double Hashing: insertion failed for key ' + act.key); }
      else if (act.type === 'search_found'){ this.visualHighlight('dbl', act.idx); this.addStep(`Search: found key ${act.key} at index ${act.idx}`); setTimeout(()=> alert('Found at index ' + act.idx), 100);} 
      else if (act.type === 'search_notfound'){ this.addStep(`Search: key ${act.key} not found (double)`); setTimeout(()=> alert('Not found (double)'), 80);} 
      else if (act.type === 'delete_place'){ this.doubleTable[act.idx] = {key:null,occupied:false}; this.visualPlace('dbl', act.idx, null); this.addStep(`Deleted key ${act.key} from index ${act.idx}`);} 
      else if (act.type === 'delete_fail'){ this.addStep(`Delete: key ${act.key} not found (double)`); setTimeout(()=> alert('Delete: not found (double)'), 80);} 
    }
  }

  // Visual helpers
  renderAll(){
    const mode = (this.el.modeSelect && this.el.modeSelect.value) || 'chain';
    if (mode === 'chain'){
      this.el.singleTitle.textContent = 'Separate Chaining';
      this.renderTable('chain', this.chainTable, this.el.singleTable, true);
    } else if (mode === 'linear'){
      this.el.singleTitle.textContent = 'Linear Probing';
      this.renderTable('linear', this.linearTable, this.el.singleTable, false);
    } else if (mode === 'quad'){
      this.el.singleTitle.textContent = 'Quadratic Probing';
      this.renderTable('quad', this.quadTable, this.el.singleTable, false);
    } else if (mode === 'dbl'){
      this.el.singleTitle.textContent = 'Double Hashing';
      this.renderTable('dbl', this.doubleTable, this.el.singleTable, false);
    }
  }

  renderTable(kind, data, container, isChain){
    container.innerHTML = '';
    for (let i=0;i<this.tableSize;i++){
      const slot = document.createElement('div'); slot.className='slot'; slot.dataset.idx=i;
      const idx = document.createElement('div'); idx.className='index'; idx.textContent = i;
      slot.appendChild(idx);

      if (isChain){
        const list = document.createElement('div'); list.className='chain-list';
        const arr = data[i] || [];
        if (!arr.length) {
          const empty = document.createElement('div'); empty.className='chain-item'; empty.textContent='NULL'; empty.style.opacity='0.5'; list.appendChild(empty);
        } else {
          arr.forEach(v => { const it = document.createElement('div'); it.className='chain-item'; it.textContent = v; list.appendChild(it); });
        }
        slot.appendChild(list);
      } else {
        const val = document.createElement('div'); val.className='value';
        const cell = data[i];
        if (cell && cell.occupied) { val.textContent = cell.key; val.classList.add('placed'); }
        else val.textContent = 'NULL';
        slot.appendChild(val);
      }

      container.appendChild(slot);
    }
  }

  visualHighlight(kind, idx){
    // highlight slot in the single table view
    const container = this.el.singleTable;
    if (!container) return;
    container.querySelectorAll('.slot').forEach(s => s.classList.remove('highlight'));
    const slot = container.querySelector('.slot[data-idx="'+idx+'"]');
    if (slot) slot.classList.add('highlight');
  }

  visualPlace(kind, idx, key){
    // place promptly and render the active table
    this.renderAll();
    const container = this.el.singleTable;
    if (!container) return;
    const slot = container.querySelector('.slot[data-idx="'+idx+'"]');
    if (slot) {
      slot.classList.add('highlight');
      setTimeout(()=> { slot.classList.remove('highlight'); }, this.speed);
    }
  }
}

// create visualizer
const V = new HashVisualizer();

// Expose small helpers for debugging in console
window.HV = V;
