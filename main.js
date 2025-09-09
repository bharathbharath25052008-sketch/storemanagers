/* ===========================================================
   Store Manager - main.js
   Features:
   - Add / Edit / Delete items
   - Search, Filter, Sort
   - Pagination
   - Bulk select & delete
   - CSV import/export
   - Drawer details view
   - Keyboard accessibility & basic validation
   =========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // ----- ELEMENTS -----
  const addBtn = document.getElementById('addBtn');
  const modal = document.getElementById('modal');
  const closeModal = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelBtn');
  const inventoryForm = document.getElementById('inventoryForm');
  const inventoryBody = document.getElementById('inventoryBody');
  const modalTitle = document.getElementById('modalTitle');
  const saveBtn = document.getElementById('saveBtn');

  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const sortSelect = document.getElementById('sortSelect');

  const csvFile = document.getElementById('csvFile');
  const exportCsvBtn = document.getElementById('exportCsvBtn');

  const selectAll = document.getElementById('selectAll');
  const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');

  const drawer = document.getElementById('drawer');
  const drawerTitle = document.getElementById('drawerTitle');
  const drawerBody = document.getElementById('drawerBody');
  const closeDrawer = document.getElementById('closeDrawer');

  const helpBtn = document.getElementById('helpBtn');
  const helpModal = document.getElementById('helpModal');
  const closeHelp = document.getElementById('closeHelp');

  const themeToggle = document.getElementById('themeToggle');

  const prevPage = document.getElementById('prevPage');
  const nextPage = document.getElementById('nextPage');
  const pageInfo = document.getElementById('pageInfo');
  const countInfo = document.getElementById('countInfo');

  const rowTemplate = document.getElementById('rowTemplate');

  // form inputs
  const itemName = document.getElementById('itemName');
  const itemCategory = document.getElementById('itemCategory');
  const itemStock = document.getElementById('itemStock');
  const itemPrice = document.getElementById('itemPrice');
  const itemSKU = document.getElementById('itemSKU');
  const itemImage = document.getElementById('itemImage');

  // paging
  const PAGE_SIZE = 8;
  let currentPage = 1;

  // ----- DATA -----
  // sample inventory with many items to make UI interesting
  let inventory = [
    { id: idGen(), name: "Rice Bag 5kg", category: "Grocery", stock: 20, price: 500, sku: "GRC-001", image: "rice 5kg.jpg" },
    { id: idGen(), name: "Milk 1L", category: "Dairy", stock: 50, price: 35, sku: "DRY-101", image: "milk 1L.jpg" },
    { id: idGen(), name: "Eggs 12pcs", category: "Dairy", stock: 40, price: 75, sku: "DRY-102", image: "egg 12 pcs.jpg" },
    { id: idGen(), name: "Tomato 1kg", category: "Vegetables", stock: 30, price: 45, sku: "VEG-001", image: "tomato 1kg.jpg" },
    { id: idGen(), name: "Sugar 2kg", category: "Grocery", stock: 15, price: 120, sku: "GRC-002", image: "sugar 2kg.jpg" },
    { id: idGen(), name: "Paneer 250g", category: "Dairy", stock: 25, price: 95, sku: "DRY-103", image: "panner 250g.webp" },
    { id: idGen(), name: "Oil 1L", category: "Grocery", stock: 18, price: 180, sku: "GRC-003", image: "oil 1l.jpg" },
    { id: idGen(), name: "Detergent 1kg", category: "Household", stock: 12, price: 210, sku: "HH-001", image: "deterdent 1kg.jpg" },
    { id: idGen(), name: "Wheat Flour 5kg", category: "Grocery", stock: 10, price: 420, sku: "GRC-004", image: "wheat 5kg.jpg" },
    { id: idGen(), name: "Banana Bunch", category: "Fruits", stock: 22, price: 60, sku: "FRT-001", image: "banana bunch.webp" },
    { id: idGen(), name: "Shampoo 200ml", category: "Personal Care", stock: 35, price: 150, sku: "PC-001", image: "shampoo 200ml.jpg" },
    { id: idGen(), name: "Toothpaste", category: "Personal Care", stock: 40, price: 80, sku: "PC-002", image: "Toothpaste.jpg" },
    { id: idGen(), name: "Tea 250g", category: "Grocery", stock: 33, price: 175, sku: "GRC-005", image: "tea 250g.jpg" },
    { id: idGen(), name: "Coffee 200g", category: "Grocery", stock: 27, price: 260, sku: "GRC-006", image: "coffee 200g.avif" },
    { id: idGen(), name: "Soap Bar", category: "Personal Care", stock: 120, price: 25, sku: "PC-003", image: "soap bar.jpg" },
    { id: idGen(), name: "Chocolates Pack", category: "Confectionery", stock: 65, price: 150, sku: "CNF-001", image: "chocolates.webp" },
    { id: idGen(), name: "Biscuits", category: "Confectionery", stock: 88, price: 45, sku: "CNF-002", image: "biscuits.jpg" },
    { id: idGen(), name: "Cold Drink 330ml", category: "Beverages", stock: 90, price: 60, sku: "BVG-001", image: "cold drink.jpg" },
    { id: idGen(), name: "Water Bottle 1L", category: "Beverages", stock: 200, price: 25, sku: "BVG-002", image: "water bottle 1l.avif" },
    { id: idGen(), name: "Maggie 2-min Noodles", category: "Grocery", stock: 140, price: 14, sku: "GRC-007", image: "noodles.jpg" },
  ];

  // keep a copy for unfiltered operations
  let working = [...inventory];

  // edit index (id)
  let editId = null;

  // ----- INITIAL SETUP -----
  populateCategoryFilter();
  render();

  // set year in footer
  document.getElementById('year').textContent = new Date().getFullYear();

  // ----- EVENT LISTENERS -----
  addBtn.addEventListener('click', openAddModal);
  closeModal.addEventListener('click', closeModalFn);
  cancelBtn.addEventListener('click', closeModalFn);

  inventoryForm.addEventListener('submit', onSaveItem);

  searchInput.addEventListener('input', onFilterChange);
  categoryFilter.addEventListener('change', onFilterChange);
  sortSelect.addEventListener('change', onFilterChange);
  csvFile.addEventListener('change', onCSVImport);
  exportCsvBtn.addEventListener('click', exportCSV);

  selectAll.addEventListener('change', onSelectAll);
  inventoryBody.addEventListener('click', onTableClick);
  bulkDeleteBtn.addEventListener('click', onBulkDelete);

  prevPage.addEventListener('click', () => { if (currentPage>1) { currentPage--; render(); }});
  nextPage.addEventListener('click', () => { currentPage++; render(); });

  closeDrawer.addEventListener('click', () => toggleDrawer(false));
  helpBtn.addEventListener('click', () => toggleHelp(true));
  closeHelp.addEventListener('click', () => toggleHelp(false));
  themeToggle.addEventListener('click', toggleTheme);

  // keyboard accessibility for modal: Escape close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modal.getAttribute('aria-hidden') === 'false') closeModalFn();
      if (helpModal.getAttribute('aria-hidden') === 'false') toggleHelp(false);
      if (drawer.getAttribute('aria-hidden') === 'false') toggleDrawer(false);
    }
  });

  // ---- FUNCTIONS -----

  // generate random-ish id
  function idGen(){
    return 'id_' + Math.random().toString(36).slice(2,9);
  }

  // populate category select based on items
  function populateCategoryFilter(){
    const cats = [...new Set(inventory.map(i => i.category || '').filter(Boolean))].sort();
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    const dataList = document.getElementById('categoryList');
    dataList.innerHTML = '';
    cats.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      categoryFilter.appendChild(opt);

      // datalist
      const dlOpt = document.createElement('option');
      dlOpt.value = c;
      dataList.appendChild(dlOpt);
    });
  }

  // open add modal
  function openAddModal(){
    editId = null;
    modalTitle.textContent = 'Add Item';
    inventoryForm.reset();
    modal.setAttribute('aria-hidden','false');
    modal.style.display = 'flex';
    setTimeout(() => itemName.focus(), 60);
  }

  // close modal
  function closeModalFn(){
    modal.setAttribute('aria-hidden','true');
    modal.style.display = 'none';
    editId = null;
  }

  // open edit modal
  function openEditModal(id){
    const item = inventory.find(i => i.id === id);
    if (!item) return alert('Item not found.');
    editId = id;
    modalTitle.textContent = 'Edit Item';
    itemName.value = item.name;
    itemCategory.value = item.category || '';
    itemStock.value = item.stock || 0;
    itemPrice.value = item.price || 0;
    itemSKU.value = item.sku || '';
    itemImage.value = item.image || '';
    modal.setAttribute('aria-hidden','false');
    modal.style.display = 'flex';
    setTimeout(() => itemName.focus(), 60);
  }

  // save item from form (add or edit)
  function onSaveItem(e){
    e.preventDefault();

    const name = itemName.value.trim();
    const category = itemCategory.value.trim() || 'Uncategorized';
    const stock = parseInt(itemStock.value, 10) || 0;
    const price = parseFloat(itemPrice.value) || 0;
    const sku = itemSKU.value.trim();
    const image = itemImage.value.trim();

    // validation
    if (!name) { alert('Please enter item name'); return; }
    if (stock < 0) { alert('Stock cannot be negative'); return; }
    if (price < 0) { alert('Price cannot be negative'); return; }

    if (editId){
      // update
      const idx = inventory.findIndex(i => i.id === editId);
      if (idx === -1) { alert('Unable to save. Item not found.'); return; }
      inventory[idx] = { ...inventory[idx], name, category, stock, price, sku, image };
    } else {
      // add new
      const newItem = { id: idGen(), name, category, stock, price, sku, image };
      inventory.unshift(newItem);
    }

    working = [...inventory];
    populateCategoryFilter();
    closeModalFn();
    // reset to first page after change
    currentPage = 1;
    render();
  }

  // render list with filters, sorts, pagination
  function render(){
    // apply search filter
    const q = searchInput.value.trim().toLowerCase();
    let list = inventory.filter(i => {
      const hay = `${i.name} ${i.category} ${i.sku}`.toLowerCase();
      return hay.includes(q);
    });

    // apply category filter
    const cat = categoryFilter.value;
    if (cat) list = list.filter(i => (i.category || '') === cat);

    // apply sort
    const s = sortSelect.value || 'name-asc';
    list.sort(sorter(s));

    // set working
    working = list;

    // pagination
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = list.slice(start, start + PAGE_SIZE);

    // clear
    inventoryBody.innerHTML = '';

    // render rows
    pageItems.forEach(item => {
      const tr = rowTemplate.content.firstElementChild.cloneNode(true);

      const checkbox = tr.querySelector('.row-check');
      checkbox.dataset.id = item.id;

      const img = tr.querySelector('.thumb');
      img.src = item.image || placeholderImage(item.name);
      img.alt = item.name;

      tr.querySelector('.cell-name').textContent = item.name;
      tr.querySelector('.cell-category').textContent = item.category;
      tr.querySelector('.cell-stock').textContent = item.stock;
      tr.querySelector('.cell-price').textContent = formatPrice(item.price);

      const actions = tr.querySelector('.cell-actions');
      actions.innerHTML = `
        <button class="action-btn btn-edit" title="Edit" data-id="${item.id}"><i class="fa fa-edit"></i></button>
        <button class="action-btn btn-view" title="View" data-id="${item.id}"><i class="fa fa-eye"></i></button>
        <button class="action-btn btn-delete" title="Delete" data-id="${item.id}"><i class="fa fa-trash"></i></button>
      `;

      inventoryBody.appendChild(tr);
    });

    // update footer info
    countInfo.textContent = `${total} item${total !== 1 ? 's' : ''}`;
    pageInfo.textContent = `${currentPage} / ${totalPages}`;

    // if working list is empty show placeholder row
    if (pageItems.length === 0){
      const trEmpty = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 7;
      td.style.textAlign = 'center';
      td.style.padding = '28px';
      td.innerHTML = `<div class="muted">No items found. Try adding new items or adjust search/filter.</div>`;
      trEmpty.appendChild(td);
      inventoryBody.appendChild(trEmpty);
    }

    // reset select all
    selectAll.checked = false;
  }

  // helper: sorting function factory
  function sorter(key){
    switch(key){
      case 'name-asc': return (a,b) => a.name.localeCompare(b.name);
      case 'name-desc': return (a,b) => b.name.localeCompare(a.name);
      case 'stock-asc': return (a,b) => a.stock - b.stock;
      case 'stock-desc': return (a,b) => b.stock - a.stock;
      case 'price-asc': return (a,b) => a.price - b.price;
      case 'price-desc': return (a,b) => b.price - a.price;
      default: return (a,b) => a.name.localeCompare(b.name);
    }
  }

  // format price
  function formatPrice(v){ return `₹${Number(v).toFixed(2)}`; }

  // placeholder image generator using initials (data URI)
  function placeholderImage(text){
    // create a simple svg placeholder with initials
    const initials = text.split(' ').slice(0,2).map(s => s[0]).join('').toUpperCase();
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><rect width='100%' height='100%' fill='#e6eef6'/><text x='50%' y='50%' text-anchor='middle' dominant-baseline='central' font-size='64' fill='#0ea5e9' font-family='sans-serif'>${initials}</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  // handle clicks inside table (delegation)
  function onTableClick(e){
    const target = e.target;
    const editBtn = target.closest('.btn-edit');
    const viewBtn = target.closest('.btn-view');
    const delBtn = target.closest('.btn-delete');

    if (editBtn){
      const id = editBtn.dataset.id;
      openEditModal(id);
      return;
    }
    if (viewBtn){
      const id = viewBtn.dataset.id;
      openDrawer(id);
      return;
    }
    if (delBtn){
      const id = delBtn.dataset.id;
      if (confirm('Delete this item?')) {
        inventory = inventory.filter(i => i.id !== id);
        populateCategoryFilter();
        render();
      }
      return;
    }
  }

  // open details drawer
  function openDrawer(id){
    const item = inventory.find(i => i.id === id);
    if (!item) return;
    drawerTitle.textContent = item.name;
    drawerBody.innerHTML = `
      <div style="display:flex;gap:14px;align-items:flex-start">
        <img src="${item.image || placeholderImage(item.name)}" alt="${item.name}" style="width:120px;height:120px;object-fit:cover;border-radius:8px;border:1px solid rgba(0,0,0,0.04)" />
        <div>
          <p class="muted">Category</p>
          <p class="bold">${item.category || '—'}</p>
          <p class="muted" style="margin-top:8px">SKU</p>
          <p>${item.sku || '—'}</p>
          <p class="muted" style="margin-top:8px">Stock</p>
          <p>${item.stock}</p>
          <p class="muted" style="margin-top:8px">Price</p>
          <p>${formatPrice(item.price)}</p>
        </div>
      </div>
      <hr style="margin:12px 0;border:none;border-top:1px solid rgba(0,0,0,0.04)">
      <div>
        <p class="muted">Notes</p>
        <p class="muted">No additional notes</p>
      </div>
      <div style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end">
        <button class="primary-btn" id="drawerEdit">Edit</button>
        <button class="secondary-btn" id="drawerDelete">Delete</button>
      </div>
    `;

    // attach drawer buttons
    setTimeout(() => {
      document.getElementById('drawerEdit').addEventListener('click', () => { openEditModal(item.id); toggleDrawer(false); });
      document.getElementById('drawerDelete').addEventListener('click', () => {
        if (confirm('Delete this item?')) {
          inventory = inventory.filter(i => i.id !== item.id);
          populateCategoryFilter();
          render();
          toggleDrawer(false);
        }
      });
    }, 10);

    toggleDrawer(true);
  }

  function toggleDrawer(open){
    if (open){
      drawer.setAttribute('aria-hidden','false');
      drawer.style.right = '0';
    } else {
      drawer.setAttribute('aria-hidden','true');
      drawer.style.right = '-480px';
    }
  }

  // handle search or other filter change
  function onFilterChange(){
    currentPage = 1;
    render();
  }

  // select all toggling
  function onSelectAll(e){
    const checked = e.target.checked;
    inventoryBody.querySelectorAll('.row-check').forEach(cb => cb.checked = checked);
  }

  // bulk delete selected
  function onBulkDelete(){
    const checked = Array.from(inventoryBody.querySelectorAll('.row-check:checked')).map(c => c.dataset.id);
    if (checked.length === 0) return alert('No items selected.');
    if (!confirm(`Delete ${checked.length} selected item(s)?`)) return;
    inventory = inventory.filter(i => !checked.includes(i.id));
    populateCategoryFilter();
    render();
  }

  // CSV export: simple implementation
  function exportCSV(){
    const header = ['name','category','stock','price','sku','image'];
    const rows = inventory.map(i => [escapeCsv(i.name), escapeCsv(i.category), i.stock, i.price, escapeCsv(i.sku), escapeCsv(i.image || '')]);
    const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function escapeCsv(val){
    if (val == null) return '';
    const v = String(val);
    if (v.includes(',') || v.includes('"') || v.includes('\n')) {
      return `"${v.replace(/"/g,'""')}"`;
    }
    return v;
  }

  // CSV import (very basic)
  function onCSVImport(e){
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target.result;
        const parsed = parseCSV(text);
        // expected: array of objects with name,category,stock,price,sku,image
        parsed.forEach(row => {
          // simple validation
          if (!row.name) return;
          inventory.unshift({
            id: idGen(),
            name: row.name,
            category: row.category || 'Uncategorized',
            stock: parseInt(row.stock || 0, 10),
            price: parseFloat(row.price || 0),
            sku: row.sku || '',
            image: row.image || ''
          });
        });
        populateCategoryFilter();
        render();
        alert('CSV imported — new items added.');
      } catch (err) {
        console.error(err);
        alert('Failed to parse CSV.');
      } finally {
        csvFile.value = ''; // reset input
      }
    };
    reader.readAsText(file, 'UTF-8');
  }

  // very small CSV parser (handles quoted commas)
  function parseCSV(str){
    const lines = str.split(/\r?\n/).filter(Boolean);
    if (lines.length === 0) return [];
    const headers = splitCsvLine(lines[0]).map(h => h.trim().toLowerCase());
    const rows = lines.slice(1).map(line => {
      const vals = splitCsvLine(line);
      const obj = {};
      headers.forEach((h, idx) => obj[h] = vals[idx] !== undefined ? vals[idx] : '');
      return obj;
    });
    return rows;
  }

  function splitCsvLine(line){
    const result = [];
    let cur = '';
    let quoted = false;
    for (let i = 0; i < line.length; i++){
      const ch = line[i];
      if (ch === '"' ) {
        if (quoted && line[i+1] === '"') { cur += '"'; i++; } else { quoted = !quoted; }
      } else if (ch === ',' && !quoted) {
        result.push(cur);
        cur = '';
      } else cur += ch;
    }
    result.push(cur);
    return result;
  }

  // CSV helper: trim and remove BOM if present
  function trimBOM(s){ return s.replace(/^\uFEFF/, ''); }

  // theme toggle
  function toggleTheme(){
    const cur = document.body.getAttribute('data-theme');
    if (cur === 'dark') {
      document.body.removeAttribute('data-theme');
      themeToggle.innerHTML = '<i class="fa fa-moon"></i>';
    } else {
      document.body.setAttribute('data-theme','dark');
      themeToggle.innerHTML = '<i class="fa fa-sun"></i>';
    }
  }

  // help overlay
  function toggleHelp(open){
    if (open){
      helpModal.setAttribute('aria-hidden','false');
      helpModal.style.display = 'flex';
    } else {
      helpModal.setAttribute('aria-hidden','true');
      helpModal.style.display = 'none';
    }
  }

  // simple util to update category select after changes
  function updateCategorySelect(){
    const cats = [...new Set(inventory.map(i=>i.category).filter(Boolean))].sort();
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    cats.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      categoryFilter.appendChild(opt);
    });
  }

  // quick utility: format large numbers with commas
  function numberWithCommas(x){
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // update category filter initial population
  function populateCategoryFilter(){
    updateCategorySelect();
  }

  // initial render call already done earlier
  // but we also should watch for storage or data persistence (future)
  // NOTE: persistence with localStorage could be added; left out intentionally.

  // expose some dev helpers for console (optional)
  window.storeManager = {
    inventory,
    render,
    exportCSV,
    importCSV: onCSVImport,
  };

}); // DOMContentLoaded end
