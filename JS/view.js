import { TABLES, COLUMNS, state } from "./data.js";

const formatTime = (date) => {
  const value = new Date(date);

  return value.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return entities[character];
  });

export const createOrderHtml = (order) => {
  const { id, title, table, created, column } = order;

  const element = document.createElement("article");
  element.className = "order";
  element.draggable = true;
  element.dataset.id = id;
  element.dataset.order = "";

  element.innerHTML = `
    <div class="order__title" data-order-title>
      ${escapeHtml(title)}
    </div>

    <dl class="order__details">
      <div class="order__row">
        <dt>Table:</dt>
        <dd class="order__value" data-order-table>
          ${escapeHtml(table)}
        </dd>
      </div>

      <div class="order__row">
        <dt>Ordered:</dt>
        <dd class="order__value">
          ${formatTime(created)}
        </dd>
      </div>

      <div class="order__row">
        <dt>Status:</dt>
        <dd class="order__value">
          ${escapeHtml(column)}
        </dd>
      </div>
    </dl>
  `;

  return element;
};

export const createTableOptionsHtml = () => {
  const fragment = document.createDocumentFragment();

  TABLES.forEach((table) => {
    const option = document.createElement("option");
    option.value = table;
    option.textContent = table;
    fragment.appendChild(option);
  });

  return fragment;
};

export const html = {
  columns: {},
  area: {},

  add: {
    overlay: document.querySelector("[data-add-overlay]"),
    form: document.querySelector("[data-add-form]"),
    cancel: document.querySelector("[data-add-cancel]"),
    title: document.querySelector("[data-add-title]"),
    table: document.querySelector("[data-add-table]"),
  },

  edit: {
    overlay: document.querySelector("[data-edit-overlay]"),
    form: document.querySelector("[data-edit-form]"),
    cancel: document.querySelector("[data-edit-cancel]"),
    title: document.querySelector("[data-edit-title]"),
    table: document.querySelector("[data-edit-table]"),
    id: document.querySelector("[data-edit-id]"),
    column: document.querySelector("[data-edit-column]"),
    delete: document.querySelector("[data-edit-delete]"),
  },

  help: {
    overlay: document.querySelector("[data-help-overlay]"),
    cancel: document.querySelector("[data-help-cancel]"),
  },

  other: {
    grid: document.querySelector("[data-grid]"),
    help: document.querySelector("[data-help]"),
    add: document.querySelector("[data-add]"),
    order: document.querySelector("[data-order]"),
  },

  dashboard: {
    total: document.querySelector("#total-orders"),
    active: document.querySelector("#active-orders"),
    completed: document.querySelector("#completed-orders"),
    revenue: document.querySelector("#total-revenue"),
    date: document.querySelector("#current-date"),
  },

  search: document.querySelector("[data-search]"),
  tableFilter: document.querySelector("[data-filter-table]"),
};

for (const columnName of COLUMNS) {
  html.columns[columnName] = document.querySelector(
    `[data-column="${columnName}"]`,
  );

  html.area[columnName] = document.querySelector(`[data-area="${columnName}"]`);
}

export const updateDashboard = () => {
  const orders = Object.values(state.orders);

  const total = orders.length;
  const completed = orders.filter((order) => order.column === "served").length;
  const active = total - completed;

  if (html.dashboard.total) {
    html.dashboard.total.textContent = total;
  }

  if (html.dashboard.active) {
    html.dashboard.active.textContent = active;
  }

  if (html.dashboard.completed) {
    html.dashboard.completed.textContent = completed;
  }

  if (html.dashboard.date) {
    html.dashboard.date.textContent = new Date().toLocaleDateString(undefined, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  COLUMNS.forEach((column) => {
    const count = orders.filter((order) => order.column === column).length;

    const countElement = document.querySelector(`[data-count="${column}"]`);

    if (countElement) {
      countElement.textContent = count;
    }
  });
};

export const updateDraggingHtml = ({ over = state.dragging.over } = {}) => {
  COLUMNS.forEach((columnName) => {
    const area = html.area[columnName];

    if (!area) return;

    area.style.backgroundColor =
      columnName === over ? "rgba(0, 160, 70, 0.15)" : "";
  });
};

export const moveToColumn = (id, newColumn) => {
  const order = state.orders[id];
  const destination = html.columns[newColumn];

  if (!order || !destination || !COLUMNS.includes(newColumn)) return;

  order.column = newColumn;
  order.updated = new Date();

  const existingElement = document.querySelector(
    `.order[data-id="${CSS.escape(id)}"]`,
  );

  if (existingElement) {
    existingElement.remove();
  }

  destination.appendChild(createOrderHtml(order));

  updateDashboard();
};

export const renderOrders = () => {
  COLUMNS.forEach((column) => {
    if (html.columns[column]) {
      html.columns[column].innerHTML = "";
    }
  });

  Object.values(state.orders).forEach((order) => {
    const destination = html.columns[order.column];

    if (destination) {
      destination.appendChild(createOrderHtml(order));
    }
  });

  updateDashboard();
  applyOrderFilters();
};

export const applyOrderFilters = () => {
  const searchTerm = html.search?.value.trim().toLowerCase() || "";
  const selectedTable = html.tableFilter?.value || "";

  document.querySelectorAll(".order[data-id]").forEach((element) => {
    const order = state.orders[element.dataset.id];

    if (!order) return;

    const matchesSearch =
      order.title.toLowerCase().includes(searchTerm) ||
      order.table.toLowerCase().includes(searchTerm);

    const matchesTable = !selectedTable || order.table === selectedTable;

    element.hidden = !(matchesSearch && matchesTable);
  });
};

if (html.add.table) {
  html.add.table.appendChild(createTableOptionsHtml());
}

if (html.edit.table) {
  html.edit.table.appendChild(createTableOptionsHtml());
}
