import {
  TABLES,
  COLUMNS,
  MENU_CATEGORIES,
  state,
  formatCurrency,
  calculateOrderTotal,
} from "./data.js";

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character],
  );

const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

export const html = {
  columns: {},
  area: {},

  add: {
    overlay: document.querySelector("[data-add-overlay]"),
    form: document.querySelector("[data-add-form]"),
    cancel: document.querySelector("[data-add-cancel]"),
    table: document.querySelector("[data-add-table]"),
    menu: document.querySelector("[data-add-menu]"),
    quantity: document.querySelector("[data-add-quantity]"),
    instructions: document.querySelector("[data-add-instructions]"),
    addItem: document.querySelector("[data-add-item]"),
    items: document.querySelector("[data-add-items]"),
  },

  edit: {
    overlay: document.querySelector("[data-edit-overlay]"),
    form: document.querySelector("[data-edit-form]"),
    cancel: document.querySelector("[data-edit-cancel]"),
    table: document.querySelector("[data-edit-table]"),
    menu: document.querySelector("[data-edit-menu]"),
    quantity: document.querySelector("[data-edit-quantity]"),
    instructions: document.querySelector("[data-edit-instructions]"),
    addItem: document.querySelector("[data-edit-item]"),
    items: document.querySelector("[data-edit-items]"),
    id: document.querySelector("[data-edit-id]"),
    column: document.querySelector("[data-edit-column]"),
    delete: document.querySelector("[data-edit-delete]"),
  },

  menu: {
    overlay: document.querySelector("[data-menu-overlay]"),
    open: document.querySelector("[data-menu]"),
    close: document.querySelector("[data-menu-cancel]"),
    form: document.querySelector("[data-menu-form]"),
    id: document.querySelector("[data-menu-id]"),
    name: document.querySelector("[data-menu-name]"),
    category: document.querySelector("[data-menu-category]"),
    price: document.querySelector("[data-menu-price]"),
    list: document.querySelector("[data-menu-list]"),
  },

  help: {
    overlay: document.querySelector("[data-help-overlay]"),
    cancel: document.querySelector("[data-help-cancel]"),
  },

  other: {
    grid: document.querySelector("[data-grid]"),
    help: document.querySelector("[data-help]"),
    add: document.querySelector("[data-add]"),
  },

  dashboard: {
    total: document.querySelector("#total-orders"),
    active: document.querySelector("#active-orders"),
    completed: document.querySelector("#completed-orders"),
    revenue: document.querySelector("#total-revenue"),
    date: document.querySelector("#current-date"),
  },
};

for (const column of COLUMNS) {
  html.columns[column] = document.querySelector(`[data-column="${column}"]`);

  html.area[column] = document.querySelector(`[data-area="${column}"]`);
}

const createOptions = (items, selectedValue = "") =>
  items
    .map(
      (item) => `
    <option
      value="${escapeHtml(item.value)}"
      ${String(item.value) === String(selectedValue) ? "selected" : ""}
    >
      ${escapeHtml(item.label)}
    </option>
  `,
    )
    .join("");

export const populateSelects = () => {
  const tableOptions = TABLES.map((table) => ({
    value: table,
    label: `Table ${table}`,
  }));

  const menuOptions = state.menu.map((item) => ({
    value: item.id,
    label: `${item.name} — ${formatCurrency(item.price)}`,
  }));

  const categoryOptions = MENU_CATEGORIES.map((category) => ({
    value: category,
    label: category,
  }));

  [html.add.table, html.edit.table].forEach((select) => {
    if (select) {
      select.innerHTML = createOptions(tableOptions);
    }
  });

  [html.add.menu, html.edit.menu].forEach((select) => {
    if (select) {
      select.innerHTML = createOptions(menuOptions);
    }
  });

  if (html.menu.category) {
    html.menu.category.innerHTML = createOptions(categoryOptions);
  }
};

export const createOrderHtml = (order) => {
  const element = document.createElement("article");
  element.className = "order";
  element.draggable = true;
  element.dataset.id = order.id;

  const itemMarkup = order.items
    .map(
      (item) => `
    <div class="order__item">
      <div class="order__item-main">
        <span>${escapeHtml(item.quantity)} × ${escapeHtml(item.name)}</span>
        <strong>
          ${formatCurrency(item.price * item.quantity)}
        </strong>
      </div>
      ${
        item.instructions
          ? `<small>${escapeHtml(item.instructions)}</small>`
          : ""
      }
    </div>
  `,
    )
    .join("");

  element.innerHTML = `
    <div class="order__header">
      <div class="order__title">Table ${escapeHtml(order.table)}</div>
      <span class="order__time">${formatTime(order.created)}</span>
    </div>

    <div class="order__items">
      ${itemMarkup}
    </div>

    <div class="order__footer">
      <span>${order.items.length} item type(s)</span>
      <strong>${formatCurrency(order.total)}</strong>
    </div>
  `;

  return element;
};

export const renderOrderItems = (container, items, removeAttribute) => {
  if (!container) return;

  if (!items.length) {
    container.innerHTML = `<p class="empty-items">No items added yet.</p>`;
    return;
  }

  container.innerHTML = items
    .map(
      (item, index) => `
    <div class="order-builder__item">
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        <small>
          ${item.quantity} × ${formatCurrency(item.price)}
          = ${formatCurrency(item.quantity * item.price)}
        </small>
        ${
          item.instructions
            ? `<small>Note: ${escapeHtml(item.instructions)}</small>`
            : ""
        }
      </div>

      <button
        type="button"
        class="remove-item"
        ${removeAttribute}="${index}"
        aria-label="Remove ${escapeHtml(item.name)}"
      >
        Remove
      </button>
    </div>
  `,
    )
    .join("");

  const total = calculateOrderTotal(items);

  const totalElement = container.parentElement?.querySelector(
    "[data-builder-total]",
  );

  if (totalElement) {
    totalElement.textContent = formatCurrency(total);
  }
};

export const renderMenu = () => {
  if (!html.menu.list) return;

  html.menu.list.innerHTML = state.menu
    .map(
      (item) => `
    <div class="menu-management__item">
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        <small>${escapeHtml(item.category)}</small>
      </div>

      <strong>${formatCurrency(item.price)}</strong>

      <div class="menu-management__actions">
        <button type="button" data-menu-edit="${item.id}">Edit</button>
        <button type="button" data-menu-delete="${item.id}">Delete</button>
      </div>
    </div>
  `,
    )
    .join("");

  if (!state.menu.length) {
    html.menu.list.innerHTML = "<p>No menu items available.</p>";
  }
};

export const updateDashboard = () => {
  const orders = Object.values(state.orders);

  const total = orders.length;
  const completed = orders.filter((order) => order.column === "served").length;

  const active = total - completed;
  const revenue = orders.reduce(
    (sum, order) => sum + calculateOrderTotal(order.items),
    0,
  );

  if (html.dashboard.total) {
    html.dashboard.total.textContent = total;
  }

  if (html.dashboard.active) {
    html.dashboard.active.textContent = active;
  }

  if (html.dashboard.completed) {
    html.dashboard.completed.textContent = completed;
  }

  if (html.dashboard.revenue) {
    html.dashboard.revenue.textContent = formatCurrency(revenue);
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

    if (countElement) countElement.textContent = count;
  });
};

export const renderOrders = () => {
  COLUMNS.forEach((column) => {
    if (html.columns[column]) {
      html.columns[column].innerHTML = "";
    }
  });

  Object.values(state.orders).forEach((order) => {
    html.columns[order.column]?.appendChild(createOrderHtml(order));
  });

  updateDashboard();
};

export const moveToColumn = (id, newColumn) => {
  const order = state.orders[id];

  if (!order || !COLUMNS.includes(newColumn)) return;

  order.column = newColumn;
  order.updated = new Date();

  renderOrders();
};

export const updateDraggingHtml = ({ over = null } = {}) => {
  COLUMNS.forEach((column) => {
    if (html.area[column]) {
      html.area[column].style.backgroundColor =
        column === over ? "rgba(0, 160, 70, 0.15)" : "";
    }
  });
};
