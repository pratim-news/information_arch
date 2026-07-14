/**
 * Value chain data: compile, load, persist, in-page editor.
 * Used by fss-consumer-data-model-interactive.html (GitHub Pages friendly).
 */
(function (global) {
  'use strict';

  const DATA_URL = 'data/value-chain.json';
  const STORAGE_PREFIX = 'fss-vc-draft:';

  function storageKey() {
    return STORAGE_PREFIX + (location.pathname.replace(/\/$/, '') || '/');
  }

  function deepClone(o) {
    return JSON.parse(JSON.stringify(o));
  }

  function slugify(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'row';
  }

  function blockToRuntime(b) {
    const c = { cap: b.cap || '', obj: b.obj || '' };
    c.e = b.entity == null || b.entity === '' ? null : b.entity;
    return c;
  }

  function stageRange(stages, from, to) {
    const ids = stages.map((s) => s.id);
    const a = ids.indexOf(from);
    const b = ids.indexOf(to);
    if (a < 0 || b < 0) return [];
    return ids.slice(Math.min(a, b), Math.max(a, b) + 1);
  }

  function normalizeSpans(rowOrTpl) {
    if (!rowOrTpl) return [];
    if (Array.isArray(rowOrTpl.spans)) return rowOrTpl.spans;
    if (rowOrTpl.span) return [rowOrTpl.span];
    return [];
  }

  function templateToStages(tpl) {
    const stages = {};
    const cells = tpl && tpl.cells ? tpl.cells : tpl;
    Object.keys(cells || {}).forEach((k) => {
      if (k === 'cells' || k === 'span' || k === 'spans') return;
      const block = cells[k];
      if (block && (block.cap != null || block.obj != null)) {
        stages[k] = blockToRuntime(block);
      }
    });
    return stages;
  }

  function compileSpans(STAGES, spansSrc) {
    return normalizeSpans({ spans: spansSrc }).map((sp) => {
      const b = (sp.blocks && sp.blocks[0]) || {};
      return {
        spanStages: stageRange(STAGES, sp.from, sp.to),
        cell: blockToRuntime(b),
        from: sp.from,
        to: sp.to,
      };
    }).filter((s) => s.spanStages.length);
  }

  function compileCells(cells) {
    const stages = {};
    Object.keys(cells || {}).forEach((stageId) => {
      const blocks = cells[stageId];
      if (!blocks || !blocks.length) return;
      stages[stageId] = blocks.length === 1 ? blockToRuntime(blocks[0]) : { multi: blocks.map(blockToRuntime) };
    });
    return stages;
  }

  function compileShopfrontRow(base, tpl, STAGES) {
    return {
      ...base,
      stages: templateToStages(tpl),
      spans: compileSpans(STAGES, normalizeSpans(tpl)),
    };
  }

  function compile(data) {
    const STAGES = (data.stages || []).map((s) => ({
      id: s.id,
      label: s.label,
      valueChain: s.valueChain || s.journey || '',
    }));

    const tpl = data.shopfrontTemplate || {};
    const SHOPFRONT_STAGES = templateToStages(tpl);

    const VC_ROWS = (data.rows || []).map((row) => {
      const base = { id: row.id, label: row.label, sub: row.sub || '' };
      if (row.useShopfrontTemplate) return compileShopfrontRow(base, tpl, STAGES);
      return {
        ...base,
        stages: compileCells(row.cells),
        spans: compileSpans(STAGES, normalizeSpans(row)),
      };
    });

    return { STAGES, SHOPFRONT_STAGES, VC_ROWS };
  }

  function readEmbedded() {
    const el = document.getElementById('vc-published-data');
    if (!el || !el.textContent.trim()) return null;
    try {
      return JSON.parse(el.textContent);
    } catch (e) {
      console.warn('Invalid embedded value chain JSON', e);
      return null;
    }
  }

  async function loadPublished() {
    try {
      const res = await fetch(DATA_URL, { cache: 'no-cache' });
      if (res.ok) {
        const data = await res.json();
        return { source: 'published', label: 'Published (data/value-chain.json)', data };
      }
    } catch (e) { /* file:// */ }
    const embedded = readEmbedded();
    if (embedded) return { source: 'bundled', label: 'Bundled copy in page', data: embedded };
    throw new Error('Could not load value chain data. Ensure data/value-chain.json is deployed.');
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(storageKey());
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.data) return null;
      return { source: 'draft', label: 'Local draft (this browser)', savedAt: parsed.savedAt || null, data: parsed.data };
    } catch (e) {
      return null;
    }
  }

  function saveDraft(data) {
    const payload = { savedAt: new Date().toISOString(), data: deepClone(data) };
    localStorage.setItem(storageKey(), JSON.stringify(payload));
    return payload.savedAt;
  }

  function clearDraft() {
    localStorage.removeItem(storageKey());
  }

  function downloadJson(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2) + '\n'], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename || 'value-chain.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function importJsonFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try { resolve(JSON.parse(reader.result)); }
        catch (e) { reject(new Error('Invalid JSON file')); }
      };
      reader.onerror = () => reject(new Error('Could not read file'));
      reader.readAsText(file);
    });
  }

  function validate(data) {
    const errors = [];
    if (!data.stages || !data.stages.length) errors.push('At least one stage is required.');
    if (!data.rows || !data.rows.length) errors.push('At least one platform row is required.');
    const ids = new Set();
    (data.rows || []).forEach((r) => {
      if (!r.id) errors.push('Row missing id.');
      else if (ids.has(r.id)) errors.push('Duplicate row id: ' + r.id);
      else ids.add(r.id);
    });
    return errors;
  }

  async function resolveInitialData() {
    const published = await loadPublished();
    const draft = loadDraft();
    if (draft && location.search.includes('draft=1')) return draft;
    return published;
  }

  function esc(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** Usable visual editor: pick row, edit as stage strip + band list. */
  function mountEditor(container, callbacks) {
    let selectedRowIdx = 0;
    let editorOpen = false;
    let activeStage = null;

    function getData() { return callbacks.getData(); }
    function setData(d) { callbacks.setData(d); render(); }

    function render() {
      const data = getData();
      const rows = data.rows || [];
      if (selectedRowIdx >= rows.length) selectedRowIdx = Math.max(0, rows.length - 1);
      const row = rows[selectedRowIdx];
      const stages = data.stages || [];

      let body = '';
      if (row) {
        if (row.useShopfrontTemplate) {
          body = renderShopfrontEditor(data, stages);
        } else {
          body = renderRowEditor(row, stages);
        }
      }

      container.innerHTML = `
        <div class="vc-editor ${editorOpen ? 'open' : ''}">
          <button type="button" class="vc-ed-toggle" id="vc-ed-toggle" aria-expanded="${editorOpen ? 'true' : 'false'}">${editorOpen ? 'Hide value chain editor' : 'Edit value chain'}</button>
          <div class="vc-ed-panel" id="vc-ed-panel" ${editorOpen ? '' : 'hidden'}>
            <div class="vc-ed-toolbar">
              <span class="vc-ed-status" id="vc-ed-status"></span>
              <button type="button" class="vc-ed-primary" id="vc-apply">Apply to grid</button>
              <button type="button" id="vc-save-draft">Save draft</button>
              <button type="button" id="vc-export">Export JSON</button>
              <button type="button" id="vc-import-btn">Import JSON</button>
              <input type="file" id="vc-import-file" accept=".json,application/json" hidden />
              <button type="button" id="vc-reload-pub">Reload published</button>
              <button type="button" class="vc-ed-danger" id="vc-clear-draft">Discard draft</button>
            </div>
            <div class="vc-ed-steps">
              <span><b>1.</b> Pick a Function row on the left</span>
              <span><b>2.</b> Edit Journey stages (blue) or bands (green)</span>
              <span><b>3.</b> Set Capability + Business Object, then Apply</span>
            </div>
            <div class="vc-ed-body">
              <div class="vc-ed-layout">
                <div class="vc-ed-side">
                  <div class="vc-ed-side-head">Functions</div>
                  <div class="vc-ed-rowlist">
                    ${rows.map((r, i) => `
                      <button type="button" class="vc-ed-rowbtn ${i === selectedRowIdx ? 'on' : ''}" data-row-idx="${i}">
                        <strong>${esc(r.label)}</strong>
                        <span>${esc(r.sub || r.id)}</span>
                      </button>`).join('')}
                  </div>
                  <div class="vc-ed-side-actions">
                    <button type="button" id="vc-add-row">+ Add</button>
                    <button type="button" id="vc-del-row">Delete</button>
                  </div>
                </div>
                <div class="vc-ed-main">
                  ${row ? `
                    <div class="vc-ed-rowmeta">
                    <label>Id<input id="vc-row-id" value="${esc(row.id)}" /></label>
                    <label>Function<input id="vc-row-label" value="${esc(row.label)}" /></label>
                    <label>Platform / product<input id="vc-row-sub" value="${esc(row.sub || '')}" /></label>
                      <label>Layout<select id="vc-row-layout">
                        <option value="cells" ${!row.useShopfrontTemplate ? 'selected' : ''}>Custom cells / bands</option>
                        <option value="shopfront" ${row.useShopfrontTemplate ? 'selected' : ''}>Shopfront shared template</option>
                      </select></label>
                    </div>
                    ${body}
                  ` : '<p class="vc-ed-hint">No rows.</p>'}
                </div>
              </div>
              <p class="vc-ed-hint" style="margin-top:12px">Publish for GitHub Pages: Export JSON, replace <code>data/value-chain.json</code>, commit, then run <code>node scripts/embed-value-chain.mjs</code>.</p>
            </div>
          </div>
        </div>`;

      bindEvents();
      if (callbacks.onStatus) callbacks.onStatus();
    }

    function stageOptions(stages, selected) {
      return stages.map((s) => `<option value="${esc(s.id)}" ${s.id === selected ? 'selected' : ''}>${esc(s.label)}</option>`).join('');
    }

    function renderShopfrontEditor(data, stages) {
      const tpl = data.shopfrontTemplate || {};
      if (!tpl.cells) tpl.cells = {};
      const spans = normalizeSpans(tpl);
      if (!spans.length) {
        spans.push({ from: 'bill', to: 'retain', blocks: [{ cap: '', obj: '', entity: null }] });
      }
      const cellRows = ['attract', 'acquire', 'subscribe'].map((k) => {
        const c = tpl.cells[k] || {};
        return `<tr>
          <td><code>${esc(k)}</code></td>
          <td><input data-sf-cell="${esc(k)}" data-f="cap" value="${esc(c.cap || '')}" /></td>
          <td><input data-sf-cell="${esc(k)}" data-f="obj" value="${esc(c.obj || '')}" /></td>
          <td><input data-sf-cell="${esc(k)}" data-f="entity" value="${esc(c.entity || '')}" placeholder="entity id" /></td>
        </tr>`;
      }).join('');
      const sp = spans[0];
      const b = (sp.blocks && sp.blocks[0]) || {};
      return `
        <p class="vc-ed-hint">Shared by Shopfront, Self Care, and Assisted Care Functions.</p>
        <h4 class="vc-ed-h4">Single Journey stage cells</h4>
        <table class="vc-ed-table"><thead><tr><th>Journey</th><th>Capability</th><th>Business Object</th><th>Entity</th></tr></thead>
        <tbody>${cellRows}</tbody></table>
        <h4 class="vc-ed-h4">Band (Billing Management on slide)</h4>
        <div class="vc-ed-band">
          <label>From<select data-sf-span="from">${stageOptions(stages, sp.from)}</select></label>
          <label>To<select data-sf-span="to">${stageOptions(stages, sp.to)}</select></label>
          <label>Capability<input data-sf-span="cap" value="${esc(b.cap || '')}" /></label>
          <label>Business Object<input data-sf-span="obj" value="${esc(b.obj || '')}" /></label>
          <label>Entity<input data-sf-span="entity" value="${esc(b.entity || '')}" /></label>
        </div>`;
    }

    function renderRowEditor(row, stages) {
      const spans = normalizeSpans(row);
      const cells = row.cells || {};
      const stageStrip = stages.map((s) => {
        const inSpan = spans.some((sp) => {
          const ids = stageRange(stages, sp.from, sp.to);
          return ids.includes(s.id);
        });
        const hasCell = !!(cells[s.id] && cells[s.id].length);
        let cls = 'vc-ed-chip';
        if (inSpan) cls += ' span';
        else if (hasCell) cls += ' filled';
        if (activeStage === s.id) cls += ' on';
        const label = inSpan ? 'band' : hasCell ? (cells[s.id][0].obj || cells[s.id][0].cap || 'cell') : 'empty';
        return `<button type="button" class="${cls}" data-pick-stage="${esc(s.id)}"><em>${esc(s.label)}</em><span>${esc(label)}</span></button>`;
      }).join('');

      let stageEdit = '';
      if (activeStage) {
        const blocks = (cells[activeStage] || []).slice();
        if (!blocks.length) blocks.push({ cap: '', obj: '', entity: null });
        stageEdit = `
          <div class="vc-ed-card">
            <div class="vc-ed-card-head">Edit stage: <strong>${esc(activeStage)}</strong>
              <button type="button" id="vc-clear-stage">Clear stage</button>
            </div>
            ${blocks.map((b, i) => `
              <div class="vc-ed-block">
                <label>Capability<input data-cell-stage="${esc(activeStage)}" data-cell-idx="${i}" data-f="cap" value="${esc(b.cap || '')}" /></label>
                <label>Business Object<input data-cell-stage="${esc(activeStage)}" data-cell-idx="${i}" data-f="obj" value="${esc(b.obj || '')}" /></label>
                <label>Entity id<input data-cell-stage="${esc(activeStage)}" data-cell-idx="${i}" data-f="entity" value="${esc(b.entity || '')}" /></label>
                <button type="button" data-del-block="${esc(activeStage)}" data-del-idx="${i}">Remove block</button>
              </div>`).join('')}
            <button type="button" id="vc-add-block">+ Add block in this stage</button>
          </div>`;
      }

      const spanCards = spans.map((sp, si) => {
        const b = (sp.blocks && sp.blocks[0]) || {};
        return `<div class="vc-ed-card">
          <div class="vc-ed-card-head">Band ${si + 1}
            <button type="button" data-del-span="${si}">Remove band</button>
          </div>
          <div class="vc-ed-band">
            <label>From<select data-span-idx="${si}" data-span-f="from">${stageOptions(stages, sp.from)}</select></label>
            <label>To<select data-span-idx="${si}" data-span-f="to">${stageOptions(stages, sp.to)}</select></label>
            <label>Capability<input data-span-idx="${si}" data-span-f="cap" value="${esc(b.cap || '')}" /></label>
            <label>Business Object<input data-span-idx="${si}" data-span-f="obj" value="${esc(b.obj || '')}" /></label>
            <label>Entity<input data-span-idx="${si}" data-span-f="entity" value="${esc(b.entity || '')}" /></label>
          </div>
        </div>`;
      }).join('');

      return `
        <h4 class="vc-ed-h4">Journey strip (click a Journey stage to edit the cell)</h4>
        <p class="vc-ed-legend">
          <span><i style="background:#e8f0f8;border-color:#9bb8d4"></i> Single-stage Capability</span>
          <span><i style="background:#e8f6ef;border-color:#8fc5a8"></i> Covered by a band</span>
          <span><i style="background:#f0f2f5"></i> Empty</span>
        </p>
        <div class="vc-ed-strip">${stageStrip}</div>
        ${stageEdit}
        <h4 class="vc-ed-h4">Bands (Capability spanning multiple Journey stages)</h4>
        ${spanCards || '<p class="vc-ed-hint">No bands yet. Use bands for Capabilities that stretch across Journey columns (e.g. Campaign Management).</p>'}
        <div class="vc-ed-actions-row">
          <button type="button" id="vc-add-span">+ Add band</button>
        </div>`;
    }

    function syncFromDom() {
      const data = getData();
      const row = data.rows[selectedRowIdx];
      if (!row) return data;

      const idEl = container.querySelector('#vc-row-id');
      const labelEl = container.querySelector('#vc-row-label');
      const subEl = container.querySelector('#vc-row-sub');
      if (idEl) row.id = idEl.value.trim() || row.id;
      if (labelEl) row.label = labelEl.value;
      if (subEl) row.sub = subEl.value;

      const layoutEl = container.querySelector('#vc-row-layout');
      // Layout structural changes are handled by the layout select listener only.
      if (row.useShopfrontTemplate) {
        if (!data.shopfrontTemplate) data.shopfrontTemplate = { cells: {}, spans: [] };
        if (!data.shopfrontTemplate.cells) data.shopfrontTemplate.cells = {};
        container.querySelectorAll('[data-sf-cell]').forEach((inp) => {
          const st = inp.dataset.sfCell;
          const f = inp.dataset.f;
          if (!data.shopfrontTemplate.cells[st]) data.shopfrontTemplate.cells[st] = { cap: '', obj: '', entity: null };
          data.shopfrontTemplate.cells[st][f === 'entity' ? 'entity' : f] =
            f === 'entity' ? inp.value.trim() || null : inp.value;
        });
        if (container.querySelector('[data-sf-span="from"]')) {
          data.shopfrontTemplate.spans = [{
            from: container.querySelector('[data-sf-span="from"]')?.value || 'bill',
            to: container.querySelector('[data-sf-span="to"]')?.value || 'retain',
            blocks: [{
              cap: container.querySelector('[data-sf-span="cap"]')?.value || '',
              obj: container.querySelector('[data-sf-span="obj"]')?.value || '',
              entity: container.querySelector('[data-sf-span="entity"]')?.value.trim() || null,
            }],
          }];
        }
        delete data.shopfrontTemplate.span;
      } else if (!layoutEl || layoutEl.value === 'cells') {
        if (!row.cells) row.cells = {};
        container.querySelectorAll('[data-cell-stage]').forEach((inp) => {
          const stage = inp.dataset.cellStage;
          const idx = Number(inp.dataset.cellIdx);
          const f = inp.dataset.f;
          if (!row.cells[stage]) row.cells[stage] = [];
          if (!row.cells[stage][idx]) row.cells[stage][idx] = { cap: '', obj: '', entity: null };
          row.cells[stage][idx][f === 'entity' ? 'entity' : f] =
            f === 'entity' ? inp.value.trim() || null : inp.value;
        });
        if (!row.spans) row.spans = normalizeSpans(row);
        container.querySelectorAll('[data-span-idx]').forEach((inp) => {
          const i = Number(inp.dataset.spanIdx);
          const f = inp.dataset.spanF;
          if (!row.spans[i]) row.spans[i] = { from: 'attract', to: 'leave', blocks: [{ cap: '', obj: '', entity: null }] };
          if (!row.spans[i].blocks) row.spans[i].blocks = [{}];
          if (f === 'from' || f === 'to') row.spans[i][f] = inp.value;
          else row.spans[i].blocks[0][f === 'entity' ? 'entity' : f] =
            f === 'entity' ? inp.value.trim() || null : inp.value;
        });
        delete row.span;
      }
      return data;
    }

    function bindEvents() {
      container.querySelector('#vc-ed-toggle')?.addEventListener('click', () => {
        editorOpen = !editorOpen;
        render();
      });
      container.querySelector('#vc-apply')?.addEventListener('click', () => {
        const data = syncFromDom();
        const errs = validate(data);
        if (errs.length) return alert(errs.join('\n'));
        setData(data);
        callbacks.onApply(data);
      });
      container.querySelector('#vc-save-draft')?.addEventListener('click', () => {
        const t = saveDraft(syncFromDom());
        alert('Draft saved at ' + t);
        if (callbacks.onStatus) callbacks.onStatus();
      });
      container.querySelector('#vc-export')?.addEventListener('click', () => {
        const d = syncFromDom();
        d.updated = new Date().toISOString().slice(0, 10);
        downloadJson(d, 'value-chain.json');
      });
      container.querySelector('#vc-import-btn')?.addEventListener('click', () => container.querySelector('#vc-import-file')?.click());
      container.querySelector('#vc-import-file')?.addEventListener('change', async (ev) => {
        const file = ev.target.files?.[0];
        if (!file) return;
        try {
          setData(await importJsonFile(file));
          alert('Imported. Click Apply and render.');
        } catch (e) { alert(e.message); }
        ev.target.value = '';
      });
      container.querySelector('#vc-reload-pub')?.addEventListener('click', async () => {
        if (!confirm('Reload published JSON?')) return;
        const pub = await loadPublished();
        setData(pub.data);
        callbacks.onApply(pub.data);
      });
      container.querySelector('#vc-clear-draft')?.addEventListener('click', () => {
        if (!confirm('Discard browser draft?')) return;
        clearDraft();
        if (callbacks.onStatus) callbacks.onStatus();
      });

      container.querySelectorAll('[data-row-idx]').forEach((btn) => {
        btn.addEventListener('click', () => {
          syncFromDom();
          selectedRowIdx = Number(btn.dataset.rowIdx);
          activeStage = null;
          render();
        });
      });
      container.querySelector('#vc-add-row')?.addEventListener('click', () => {
        const data = syncFromDom();
        data.rows.push({ id: 'row-' + data.rows.length, label: 'New function', sub: '', cells: {}, spans: [] });
        selectedRowIdx = data.rows.length - 1;
        setData(data);
      });
      container.querySelector('#vc-del-row')?.addEventListener('click', () => {
        const data = syncFromDom();
        if (data.rows.length <= 1) return alert('Need at least one row.');
        if (!confirm('Delete ' + data.rows[selectedRowIdx].label + '?')) return;
        data.rows.splice(selectedRowIdx, 1);
        selectedRowIdx = Math.max(0, selectedRowIdx - 1);
        setData(data);
      });
      container.querySelector('#vc-row-layout')?.addEventListener('change', (ev) => {
        const layout = ev.target.value;
        // Persist current field values first while layout flag still matches DOM form
        const data = syncFromDom();
        const row = data.rows[selectedRowIdx];
        if (!row) return;
        if (layout === 'shopfront') {
          row.useShopfrontTemplate = true;
          delete row.cells;
          delete row.spans;
          delete row.span;
        } else {
          const wasShopfront = !!row.useShopfrontTemplate;
          delete row.useShopfrontTemplate;
          if (wasShopfront) {
            const tpl = data.shopfrontTemplate || { cells: {}, spans: [] };
            row.cells = {};
            Object.keys(tpl.cells || {}).forEach((k) => {
              row.cells[k] = [deepClone(tpl.cells[k])];
            });
            row.spans = deepClone(normalizeSpans(tpl));
          } else {
            row.cells = row.cells || {};
            row.spans = row.spans || [];
          }
        }
        activeStage = null;
        setData(data);
      });
      container.querySelectorAll('[data-pick-stage]').forEach((btn) => {
        btn.addEventListener('click', () => {
          syncFromDom();
          activeStage = btn.dataset.pickStage;
          const data = getData();
          const row = data.rows[selectedRowIdx];
          if (row && !row.cells) row.cells = {};
          if (row && !row.cells[activeStage]) row.cells[activeStage] = [{ cap: '', obj: '', entity: null }];
          setData(data);
        });
      });
      container.querySelector('#vc-add-block')?.addEventListener('click', () => {
        const data = syncFromDom();
        const row = data.rows[selectedRowIdx];
        if (!row.cells[activeStage]) row.cells[activeStage] = [];
        row.cells[activeStage].push({ cap: '', obj: '', entity: null });
        setData(data);
      });
      container.querySelector('#vc-clear-stage')?.addEventListener('click', () => {
        const data = syncFromDom();
        if (data.rows[selectedRowIdx].cells) delete data.rows[selectedRowIdx].cells[activeStage];
        activeStage = null;
        setData(data);
      });
      container.querySelectorAll('[data-del-block]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const data = syncFromDom();
          const stage = btn.dataset.delBlock;
          const idx = Number(btn.dataset.delIdx);
          data.rows[selectedRowIdx].cells[stage].splice(idx, 1);
          if (!data.rows[selectedRowIdx].cells[stage].length) delete data.rows[selectedRowIdx].cells[stage];
          setData(data);
        });
      });
      container.querySelector('#vc-add-span')?.addEventListener('click', () => {
        const data = syncFromDom();
        const row = data.rows[selectedRowIdx];
        if (!row.spans) row.spans = [];
        row.spans.push({ from: 'attract', to: 'acquire', blocks: [{ cap: '', obj: '', entity: null }] });
        setData(data);
      });
      container.querySelectorAll('[data-del-span]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const data = syncFromDom();
          data.rows[selectedRowIdx].spans.splice(Number(btn.dataset.delSpan), 1);
          setData(data);
        });
      });
      container.querySelectorAll('input, select').forEach((el) => {
        if (el.id === 'vc-import-file') return;
        el.addEventListener('change', () => syncFromDom());
      });
    }

    render();
    return { refresh: render };
  }

  global.FSS_VC = {
    DATA_URL,
    compile,
    loadPublished,
    loadDraft,
    saveDraft,
    clearDraft,
    downloadJson,
    importJsonFile,
    validate,
    resolveInitialData,
    mountEditor,
    deepClone,
    normalizeSpans,
  };
})(window);
