import {
  html,
  populateSelects,
  createOrderHtml,
  renderOrderItems,
  renderMenu,
  renderOrders,
  moveToColumn,
  updateDraggingHtml,
} from "./view.js";

import {
  state,
  createMenuItem,
  createOrderData,
  calculateOrderTotal,
  saveOrders,
  saveMenu,
  loadData,
  updateDragging,
} from "./data.js";

let addDraft = [];
let editDraft = [];

const show = (element) => {
  if (element) element.style.display = "block";
};

const hide = (element) => {
  if (element) element.style.display = "none";
  html.other.add?.focus();
};

const getMenuItem = (id) => state.menu.find((item) => item.id === id);

const addDraftItem = (draft, menuSelect, quantityInput, noteInput) => {
  const menuItem = getMenuItem(menuSelect?.value);
  const quantity = Number(quantityInput?.value);

  if (!menuItem) {
    alert("Please select a menu item.");
    return;
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    alert("Please enter a valid quantity.");
    return;
  }

  draft.push({
    menuItemId: menuItem.id,
    name: menuItem.name,
    price: menuItem.price,
    quantity,
    instructions: noteInput?.value.trim() || "",
  });

  quantityInput.value = "1";
  if (noteInput) noteInput.value = "";
};

// Restaurant availability
const restaurantStatus = document.querySelector("#restaurant-status");
const statusText = restaurantStatus.querySelector(".status-text");

let isRestaurantOpen = localStorage.getItem("restaurantOpen") !== "false";

// Remember the original state of interactive elements
const originalControlStates = new WeakMap();

function lockApplication() {
  const controls = document.querySelectorAll(
    'button:not(#restaurant-status), input, select, textarea, a, [draggable="true"]',
  );

  controls.forEach((element) => {
    if (!originalControlStates.has(element)) {
      originalControlStates.set(element, {
        disabled: "disabled" in element ? element.disabled : undefined,
        tabindex: element.getAttribute("tabindex"),
        ariaDisabled: element.getAttribute("aria-disabled"),
        draggable: element.getAttribute("draggable"),
      });
    }

    if ("disabled" in element) {
      element.disabled = true;
    }

    element.setAttribute("aria-disabled", "true");

    if (element.tagName === "A") {
      element.setAttribute("tabindex", "-1");
    }

    if (element.hasAttribute("draggable")) {
      element.setAttribute("draggable", "false");
    }
  });
}

function unlockApplication() {
  const controls = document.querySelectorAll(
    "button:not(#restaurant-status), input, select, textarea, a, [draggable]",
  );

  controls.forEach((element) => {
    const original = originalControlStates.get(element);

    if (!original) return;

    if ("disabled" in element) {
      element.disabled = original.disabled;
    }

    if (original.ariaDisabled === null) {
      element.removeAttribute("aria-disabled");
    } else {
      element.setAttribute("aria-disabled", original.ariaDisabled);
    }

    if (original.tabindex === null) {
      element.removeAttribute("tabindex");
    } else {
      element.setAttribute("tabindex", original.tabindex);
    }

    if (original.draggable === null) {
      element.removeAttribute("draggable");
    } else {
      element.setAttribute("draggable", original.draggable);
    }

    originalControlStates.delete(element);
  });
}

function updateRestaurantStatus() {
  restaurantStatus.classList.toggle("closed", !isRestaurantOpen);

  statusText.textContent = isRestaurantOpen
    ? "Restaurant Open"
    : "Restaurant Closed";

  restaurantStatus.setAttribute(
    "aria-label",
    isRestaurantOpen ? "Close restaurant" : "Open restaurant",
  );

  document.body.classList.toggle("restaurant-closed", !isRestaurantOpen);

  localStorage.setItem("restaurantOpen", isRestaurantOpen);

  if (isRestaurantOpen) {
    unlockApplication();
  } else {
    lockApplication();
  }
}

// Block interactions while the restaurant is closed.
// The restaurant status button is always exempt.
const blockedEvents = [
  "click",
  "submit",
  "change",
  "input",
  "keydown",
  "dragstart",
  "dragover",
  "drop",
];

blockedEvents.forEach((eventName) => {
  document.addEventListener(
    eventName,
    (event) => {
      if (isRestaurantOpen) return;

      const target = event.target;

      if (target instanceof Element && target.closest("#restaurant-status")) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
    },
    true,
  );
});

// Keep dynamically created controls locked too
const controlObserver = new MutationObserver(() => {
  if (!isRestaurantOpen) {
    lockApplication();
  }
});

controlObserver.observe(document.body, {
  childList: true,
  subtree: true,
});

restaurantStatus.addEventListener("click", () => {
  isRestaurantOpen = !isRestaurantOpen;
  updateRestaurantStatus();
});

// Apply saved status on page load
updateRestaurantStatus();

const handleAddItem = () => {
  addDraftItem(
    addDraft,
    html.add.menu,
    html.add.quantity,
    html.add.instructions,
  );

  renderOrderItems(html.add.items, addDraft, "data-remove-add-item");
};

const handleEditAddItem = () => {
  addDraftItem(
    editDraft,
    html.edit.menu,
    html.edit.quantity,
    html.edit.instructions,
  );

  renderOrderItems(html.edit.items, editDraft, "data-remove-edit-item");
};

const handleRemoveDraftItem = (event, draft, container, attribute) => {
  const button = event.target.closest(`[${attribute}]`);

  if (!button) return;

  const index = Number(button.getAttribute(attribute));

  if (!Number.isInteger(index)) return;

  draft.splice(index, 1);

  renderOrderItems(container, draft, attribute);
};

const openAddOrder = (event) => {
  event?.preventDefault();

  addDraft = [];

  html.add.form.reset();
  html.add.table.value = "1";
  html.add.quantity.value = "1";

  renderOrderItems(html.add.items, addDraft, "data-remove-add-item");
  show(html.add.overlay);
  html.add.menu?.focus();
};

const handleAddSubmit = (event) => {
  event.preventDefault();

  if (!addDraft.length) {
    alert("Add at least one menu item to the order.");
    return;
  }

  const order = createOrderData({
    table: html.add.table.value,
    items: addDraft,
  });

  state.orders[order.id] = order;

  saveOrders();
  renderOrders();

  addDraft = [];
  html.add.form.reset();
  html.add.table.value = "1";

  hide(html.add.overlay);
};

const openEditOrder = (event) => {
  const orderElement = event.target.closest(".order[data-id]");

  if (!orderElement) return;

  const order = state.orders[orderElement.dataset.id];

  if (!order) return;

  event.preventDefault();

  editDraft = order.items.map((item) => ({ ...item }));

  html.edit.id.value = order.id;
  html.edit.table.value = order.table;
  html.edit.column.value = order.column;
  html.edit.quantity.value = "1";
  html.edit.instructions.value = "";

  renderOrderItems(html.edit.items, editDraft, "data-remove-edit-item");

  show(html.edit.overlay);
};

const handleEditSubmit = (event) => {
  event.preventDefault();

  const id = html.edit.id.value;
  const order = state.orders[id];

  if (!order) return;

  if (!editDraft.length) {
    alert("An order must contain at least one item.");
    return;
  }

  order.table = html.edit.table.value;
  order.column = html.edit.column.value;
  order.items = editDraft.map((item) => ({ ...item }));
  order.total = calculateOrderTotal(order.items);
  order.updated = new Date();

  saveOrders();
  renderOrders();

  editDraft = [];
  hide(html.edit.overlay);
};

const handleDeleteOrder = (event) => {
  event.preventDefault();

  const id = html.edit.id.value;

  if (!state.orders[id]) return;

  if (!confirm("Are you sure you want to delete this order?")) {
    return;
  }

  delete state.orders[id];

  saveOrders();
  renderOrders();

  editDraft = [];
  hide(html.edit.overlay);
};

// Menu management
const openMenu = (event) => {
  event?.preventDefault();

  html.menu.form.reset();
  html.menu.id.value = "";

  populateSelects();
  renderMenu();
  show(html.menu.overlay);
};

const handleMenuSubmit = (event) => {
  event.preventDefault();

  const name = html.menu.name.value.trim();
  const category = html.menu.category.value;
  const price = Number(html.menu.price.value);
  const id = html.menu.id.value;

  if (!name || !category || !Number.isFinite(price) || price < 0) {
    alert("Please enter a valid menu item and price.");
    return;
  }

  if (id) {
    const existingItem = getMenuItem(id);

    if (!existingItem) return;

    existingItem.name = name;
    existingItem.category = category;
    existingItem.price = price;

    // Keep existing order snapshots unchanged.
  } else {
    state.menu.push(createMenuItem({ name, category, price }));
  }

  saveMenu();
  populateSelects();
  renderMenu();

  html.menu.form.reset();
  html.menu.id.value = "";
};

const handleMenuListClick = (event) => {
  const editButton = event.target.closest("[data-menu-edit]");
  const deleteButton = event.target.closest("[data-menu-delete]");

  if (editButton) {
    const item = getMenuItem(editButton.dataset.menuEdit);

    if (!item) return;

    html.menu.id.value = item.id;
    html.menu.name.value = item.name;
    html.menu.category.value = item.category;
    html.menu.price.value = item.price;

    html.menu.name.focus();
  }

  if (deleteButton) {
    const id = deleteButton.dataset.menuDelete;
    const item = getMenuItem(id);

    if (!item) return;

    if (!confirm(`Delete "${item.name}" from the menu?`)) return;

    state.menu = state.menu.filter((menuItem) => menuItem.id !== id);

    saveMenu();
    populateSelects();
    renderMenu();
  }
};

// Drag and drop
const handleDragStart = (event) => {
  const card = event.target.closest(".order[data-id]");

  if (!card) return;

  updateDragging({
    source: card.dataset.id,
    over: null,
  });

  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", card.dataset.id);

  card.classList.add("dragging");
};

const handleDragOver = (event) => {
  event.preventDefault();

  const area = event.target.closest("[data-area]");

  if (!area) return;

  updateDragging({ over: area.dataset.area });
  updateDraggingHtml({ over: area.dataset.area });
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
  updateDraggingHtml();
};

const handleDragEnd = (event) => {
  event.target.closest(".order[data-id]")?.classList.remove("dragging");

  updateDragging({ source: null, over: null });
  updateDraggingHtml();
};

// Event listeners
html.other.add?.addEventListener("click", openAddOrder);
html.add.cancel?.addEventListener("click", () => hide(html.add.overlay));
html.add.form?.addEventListener("submit", handleAddSubmit);
html.add.addItem?.addEventListener("click", handleAddItem);

html.add.items?.addEventListener("click", (event) =>
  handleRemoveDraftItem(
    event,
    addDraft,
    html.add.items,
    "data-remove-add-item",
  ),
);

html.other.grid?.addEventListener("click", openEditOrder);
html.edit.cancel?.addEventListener("click", () => hide(html.edit.overlay));
html.edit.form?.addEventListener("submit", handleEditSubmit);
html.edit.addItem?.addEventListener("click", handleEditAddItem);
html.edit.delete?.addEventListener("click", handleDeleteOrder);

html.edit.items?.addEventListener("click", (event) =>
  handleRemoveDraftItem(
    event,
    editDraft,
    html.edit.items,
    "data-remove-edit-item",
  ),
);

html.menu.open?.addEventListener("click", openMenu);
html.menu.close?.addEventListener("click", () => hide(html.menu.overlay));
html.menu.form?.addEventListener("submit", handleMenuSubmit);
html.menu.list?.addEventListener("click", handleMenuListClick);

html.other.help?.addEventListener("click", () => show(html.help.overlay));
html.help.cancel?.addEventListener("click", () => hide(html.help.overlay));

html.other.grid?.addEventListener("dragstart", handleDragStart);
html.other.grid?.addEventListener("dragover", handleDragOver);
html.other.grid?.addEventListener("drop", handleDrop);
html.other.grid?.addEventListener("dragend", handleDragEnd);

// Initialise application
loadData();
populateSelects();
renderMenu();
renderOrders();

html.other.add?.focus();
