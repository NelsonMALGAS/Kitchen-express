import {
  html,
  createOrderHtml,
  moveToColumn,
  updateDraggingHtml,
  updateDashboard,
  renderOrders,
  applyOrderFilters,
} from "./view.js";

import {
  createOrderData,
  state,
  updateDragging,
  loadOrders,
  saveOrders,
} from "./data.js";

const showOverlay = (overlay) => {
  if (overlay) overlay.style.display = "block";
};

const hideOverlay = (overlay) => {
  if (overlay) overlay.style.display = "none";
  html.other.add?.focus();
};

const handleAddToggle = (event) => {
  event?.preventDefault();

  const isVisible = html.add.overlay.style.display === "block";

  if (isVisible) {
    hideOverlay(html.add.overlay);
  } else {
    showOverlay(html.add.overlay);
    html.add.title?.focus();
  }
};

const handleHelpToggle = (event) => {
  event?.preventDefault();

  const isVisible = html.help.overlay.style.display === "block";

  if (isVisible) {
    hideOverlay(html.help.overlay);
  } else {
    showOverlay(html.help.overlay);
  }
};

const handleAddSubmit = (event) => {
  event.preventDefault();

  const title = html.add.title.value.trim();
  const table = html.add.table.value;

  if (!title || !table) return;

  const order = createOrderData({
    title,
    table,
    column: "ordered",
  });

  state.orders[order.id] = order;

  html.columns.ordered.appendChild(createOrderHtml(order));

  saveOrders();
  updateDashboard();

  html.add.form.reset();
  html.add.table.value = "1";

  hideOverlay(html.add.overlay);
};

const handleEditToggle = (event) => {
  event.preventDefault();

  const orderElement = event.target.closest(".order[data-id]");

  if (html.edit.overlay.style.display === "block") {
    hideOverlay(html.edit.overlay);
    return;
  }

  if (!orderElement) return;

  const order = state.orders[orderElement.dataset.id];

  if (!order) return;

  html.edit.title.value = order.title;
  html.edit.table.value = order.table;
  html.edit.id.value = order.id;
  html.edit.column.value = order.column;

  showOverlay(html.edit.overlay);
  html.edit.title.focus();
};

const handleEditSubmit = (event) => {
  event.preventDefault();

  const id = html.edit.id.value;
  const order = state.orders[id];

  if (!order) return;

  const title = html.edit.title.value.trim();
  const table = html.edit.table.value;
  const column = html.edit.column.value;

  if (!title || !table || !state.orders[id] || !html.columns[column]) return;

  order.title = title;
  order.table = table;
  order.column = column;
  order.updated = new Date();

  moveToColumn(id, column);

  saveOrders();
  updateDashboard();

  hideOverlay(html.edit.overlay);
};

const handleDelete = (event) => {
  event.preventDefault();

  const id = html.edit.id.value;

  if (!state.orders[id]) return;

  delete state.orders[id];

  document.querySelector(`.order[data-id="${CSS.escape(id)}"]`)?.remove();

  saveOrders();
  updateDashboard();

  hideOverlay(html.edit.overlay);
};

const handleDragStart = (event) => {
  const orderElement = event.target.closest(".order[data-id]");

  if (!orderElement) return;

  updateDragging({
    source: orderElement.dataset.id,
    over: null,
  });

  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", orderElement.dataset.id);

  orderElement.classList.add("dragging");
};

const handleDragOver = (event) => {
  event.preventDefault();

  const area = event.target.closest("[data-area]");

  if (!area) return;

  const column = area.dataset.area;

  if (!column || !html.columns[column]) return;

  updateDragging({ over: column });
  updateDraggingHtml({ over: column });

  event.dataTransfer.dropEffect = "move";
};

const handleDrop = (event) => {
  event.preventDefault();

  const area = event.target.closest("[data-area]");
  const column = area?.dataset.area;

  const id = event.dataTransfer.getData("text/plain") || state.dragging.source;

  if (id && column && state.orders[id]) {
    moveToColumn(id, column);
    saveOrders();
  }

  updateDragging({ source: null, over: null });
  updateDraggingHtml({ over: null });
};

const handleDragEnd = (event) => {
  event.target.closest(".order[data-id]")?.classList.remove("dragging");

  updateDragging({ source: null, over: null });
  updateDraggingHtml({ over: null });
};

const handleSearch = () => {
  applyOrderFilters();
};

// Existing controls
html.add.cancel?.addEventListener("click", handleAddToggle);
html.other.add?.addEventListener("click", handleAddToggle);
html.add.form?.addEventListener("submit", handleAddSubmit);

html.other.grid?.addEventListener("click", handleEditToggle);
html.edit.cancel?.addEventListener("click", handleEditToggle);
html.edit.form?.addEventListener("submit", handleEditSubmit);
html.edit.delete?.addEventListener("click", handleDelete);

html.help.cancel?.addEventListener("click", handleHelpToggle);
html.other.help?.addEventListener("click", handleHelpToggle);

// Drag-and-drop: use event delegation so newly created cards work too.
html.other.grid?.addEventListener("dragstart", handleDragStart);
html.other.grid?.addEventListener("dragover", handleDragOver);
html.other.grid?.addEventListener("drop", handleDrop);
html.other.grid?.addEventListener("dragend", handleDragEnd);

// Optional search and table filters.
html.search?.addEventListener("input", handleSearch);
html.tableFilter?.addEventListener("change", handleSearch);

// Restore saved orders when the app starts.
loadOrders();
renderOrders();

html.other.add?.focus();
