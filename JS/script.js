
/**
 * A handler that fires when a user drags over any element inside a column. In
 * order to determine which column the user is dragging over the entire event
 * bubble path is checked with `event.path` (or `event.composedPath()` for
 * browsers that don't support `event.path`). The bubbling path is looped over
 * until an element with a `data-area` attribute is found. Once found both the
 * active dragging column is set in the `state` object in "data.js" and the HTML
 * is updated to reflect the new column.
 *
 * @param {Event} event
 */

import { html, createOrderHtml, moveToColumn, updateDraggingHtml } from "./view.js";
import { createOrderData, state, updateDragging } from "./data.js";

html.other.add.focus();

const handleDragOver = (event) => {
  event.preventDefault();
  const path = event.path || event.composedPath();
  let column = null;

  for (const element of path) {
    const { area } = element.dataset;
    if (area) {
      column = area;
      break;
    }
  }

  if (!column) return;
  updateDragging({ over: column });
  updateDraggingHtml({ over: column });
};

const handleHelpToggle = (event) => {
  event.preventDefault();

  const helpOverlay = html.help.overlay;

  const isOverlayVisible = helpOverlay.style.display === "block";

  if (isOverlayVisible) {
    helpOverlay.style.display = "none";
    html.other.add.focus();
  } else {
    helpOverlay.style.display = "block";
    html.other.add.blur();
  }
};

const handleDragStart = (event) => {
  const id = event.target.dataset.id;
  const element = document.querySelector(`[data-id="${id}"]`);
  element.classList.add("dragging");
 
};

const handleDragEnd = (event) => {
  const { over } = state.dragging;
  

  // Get the order ID from the HTML element that was clicked
  const id = event.target.dataset.id;
  const element = document.querySelector(`[data-id="${id}"]`);
  element.classList.remove("dragging");
 
  // Update the order in the DOM
  moveToColumn(id, over);
};

const handleAddToggle = (event) => {
  const addOverlay = html.add.overlay;
  const isOverlayVisible = addOverlay.style.display === "block";

  if (isOverlayVisible) {
    addOverlay.style.display = "none";
    html.other.add.focus();
  } else {
    addOverlay.style.display = "block";
    html.other.add.blur();
  }
};

const handleAddSubmit = (event) => {
  event.preventDefault();

  const title = html.add.title.value;
  const table = html.add.table.value;

  const order = createOrderData({
    title,
    table,
    column: "ordered",
  });

  state.orders[order.id] = order;

  const element = createOrderHtml(order);

  const column = html.columns["ordered"];
  column.append(element);

  handleAddToggle();
  html.add.title.value = "";
  html.add.table.value = "1";
};

const handleEditToggle = (event) => {
  event.preventDefault();

  const editOverlay = html.edit.overlay;

  const isOverlayVisible = editOverlay.style.display === "block";

  if (isOverlayVisible) {
    editOverlay.style.display = "none";
    html.other.add.focus();
  } else if (!isOverlayVisible && event.target.className === "order") {
    editOverlay.style.display = "block";

    const id = event.target.dataset.id;

    const order = state.orders[id];

    html.edit.title.value = order.title;
    html.edit.table.value = order.table;
    html.edit.id.value = order.id;
    html.edit.column.value = order.column;

    html.other.add.blur();
  }
};
const handleEditSubmit = (event) => {
  event.preventDefault();

  const title = html.edit.title.value;
  const table = html.edit.table.value;
  const id = html.edit.id.value;
  const column = html.edit.column.value;

  const order = state.orders[id];

  order.title = title;
  order.table = table;
  order.column = column;

  const element = document.querySelector(`[data-id="${id}"]`);
  element.remove();
  const newElement = createOrderHtml(order);
  const newColumn = html.columns[column];
  newColumn.append(newElement);

  const editOverlay = html.edit.overlay;
  editOverlay.style.display = "none";
  html.other.add.focus();
};

const handleDelete = (event) => {
  const id = html.edit.id.value;

  const editOverlay = html.edit.overlay;
  editOverlay.style.display = "none";
  html.other.add.focus();

  delete state.orders[id];

  const element = document.querySelector(`[data-id="${id}"]`);
  element.remove();
};

html.add.cancel.addEventListener("click", handleAddToggle);
html.other.add.addEventListener("click", handleAddToggle);
html.add.form.addEventListener("submit", handleAddSubmit);

html.other.grid.addEventListener("click", handleEditToggle);
html.edit.cancel.addEventListener("click", handleEditToggle);
html.edit.form.addEventListener("submit", handleEditSubmit);
html.edit.delete.addEventListener("click", handleDelete);

html.help.cancel.addEventListener("click", handleHelpToggle);
html.other.help.addEventListener("click", handleHelpToggle);

for (const htmlColumn of Object.values(html.columns)) {
  htmlColumn.addEventListener("dragstart", handleDragStart);
  htmlColumn.addEventListener("dragend", handleDragEnd);
}

for (const htmlArea of Object.values(html.area)) {
  htmlArea.addEventListener("dragover", handleDragOver);
}

