import {state , COLUMNS , createOrderData  , updateDragging } from './data.js'
import {createOrderHtml , createTableOptionsHtml ,html ,updateDraggingHtml ,moveToColumn} from './view.js'

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


const handleDragOver = (event) => {
  event.preventDefault();
  const path = event.path || event.composedPath()
  let column = ''

  for (const element of path) {
      const { area } = element.dataset
      if (area) {
          column = area
          break;
      }
  }

  if (!column) return
  updateDragging({ over: column })
  updateDraggingHtml({ over: column })
  //moveToColumn();
}

// Get all draggable elements
const draggableElements = document.querySelectorAll('[draggable="true"]');

// Add event listeners for drag start and end
draggableElements.forEach((element) => {
  element.addEventListener('dragstart', (event) => {
    event.dataTransfer.setData('text/plain', event.target.dataset.id);
    event.target.classList.add('dragging');
  });

  element.addEventListener('dragend', (event) => {
    event.target.classList.remove('dragging');
  });
});

// Get all droppable targets
const droppableTargets = document.querySelectorAll('[data-column]');

// Add event listeners for drag over and drop
droppableTargets.forEach((target) => {
  target.addEventListener('dragover', (event) => {
    event.preventDefault();
    target.classList.add('dragover');
  });

  target.addEventListener('dragleave', () => {
    target.classList.remove('dragover');
  });

  target.addEventListener('drop', (event) => {
    event.preventDefault();
    const column = event.target.closest('[data-column]');
    const orderId = event.dataTransfer.getData('text/plain');
    const orderElement = document.querySelector(`[data-id="${orderId}"]`);

    if (column && orderId && orderElement) {
      column.appendChild(orderElement);
    }
  });
});


const handleDragStart = (event) => {
 event.dataTransfer.setData('text/html' , event.target.innerHTML)
  handleDragOver();
   updateDragging();
   updateDraggingHtml();
    
}

 const handleDragEnd = () => {
   updateDragging();
   updateDraggingHtml();
   handleDragOver();
   moveToColumn();
 }
const handleHelpToggle = () => {
  const helpOverlay = html.help.overlay;
  const helpCancel = html.help.cancel;

  if (helpOverlay.style.display === 'block') {
    helpOverlay.style.display = 'none';
  } else {
    helpOverlay.style.display = 'block';
  }

  helpCancel.addEventListener('click', () => {
    html.add.form.reset()
    helpOverlay.style.display = 'none';
    
  });
};

  const handleAddToggle = () => {
  const addOverlay = html.add.overlay
  addOverlay.style.display = 'block'
 
}
  const addCancelButton = document.querySelector('[data-add-cancel]')
  const addOverlay2 = html.add.overlay
  const addForm = html.add.form
  addCancelButton.addEventListener('click', ()=>{
   addOverlay2.style.display = 'none'
   addOverlay2.reset() 
    addForm.reset()
   
  });


const handleAddSubmit = (event) => {
    event.preventDefault()
  const order ={
    title : html.add.title.value,
    table : html.add.table.value,
    column : 'ordered'
  }
    
    let orderData = createOrderData(order)
    html.add.overlay.style.display = ''
    const changeOfOrder = createOrderHtml(orderData)
    const customerOrder = html.other.grid.querySelector(`[data-column ="${orderData.column}"]`)
    customerOrder.innerHTML += changeOfOrder.innerHTML
    customerOrder.setAttribute('draggable', true);
    
  };
  

const handleEditToggle = () => {
    const editOverlay = html.edit.overlay;
    const editForm = html.edit.form;
    const editDeleteButton = html.edit.delete;
    
    if (editOverlay.style.display === 'block') {
      editOverlay.style.display = '';
      editForm.reset();
      editDeleteButton.style.display = 'block';
    } else {
      editOverlay.style.display = 'block';
    }
  }
  

const handleEditSubmit = (event) => {
    event.preventDefault();
  
    // Get the order data from the form
    const order = {
      title: html.edit.title.value,
      table: html.edit.table.value,

    };
       
      // Hide the edit form and reset the delete button
      const editOverlay = html.edit.overlay;
      const editForm = html.edit.form;
      const editDeleteButton = html.edit.delete;
      editOverlay.style.display = '';
      editForm.reset(order);
      
}
const handleDelete = () => {
  document.querySelector('[data-order]').remove()
  html.edit.form.reset()
  
}

const updateButton = document.querySelector('button[type="submit"][form="edit-form"]')

const updateEdit =(event)=>{
  html.edit.overlay.style.display = '';
  event.preventDefault()
  const order1 ={
    title : html.edit.title.value,
    table : html.edit.table.value,
    column : html.edit.column.value
  }
  
    
    let orderData = createOrderData(order1)
    html.add.overlay.style.display = ''
    const changeOfOrder1 = createOrderHtml(orderData)
    const customerOrder1 = html.other.grid.querySelector(`[data-column ="${orderData.column}"]`)
    customerOrder1.innerHTML = changeOfOrder1.innerHTML
    customerOrder1.setAttribute('draggable', true);

    customerOrder1.querySelector('[data-edit-title]').innerHTML === order1.title;
    customerOrder1.querySelector('[data-edit-table]').innerHTML === order1.table;

    const orderedColumn = html.other.grid.querySelector(`[data-column ="${orderData.column}"]`);
    const orderToRemove = orderedColumn.querySelector(`[data-id="${orderData.id}"]`);
    orderedColumn.removeChild(orderToRemove);

    const newOrder = createOrderHtml(orderData)
    newOrder.setAttribute('draggable' , true)
    

  };

const addButton = document.querySelector('[data-add]')

addButton.addEventListener('click', handleAddToggle)
updateButton.addEventListener('click', updateEdit)
html.other.add.addEventListener('click', handleAddToggle)
html.add.form.addEventListener('submit', handleAddSubmit)

html.other.grid.addEventListener('click', handleEditToggle)
html.edit.cancel.addEventListener('click', handleEditToggle)
html.edit.form.addEventListener('submit', handleEditSubmit)
html.edit.delete.addEventListener('click', handleDelete)

html.help.cancel.addEventListener('click', handleHelpToggle)
html.other.help.addEventListener('click', handleHelpToggle)

for (const htmlColumn of Object.values(html.columns)) {
  htmlColumn.addEventListener('dragstart', handleDragStart)
  htmlColumn.addEventListener('dragend', handleDragEnd)
}

for (const htmlArea of Object.values(html.area)) {
  htmlArea.addEventListener('dragover', handleDragOver)
}

/**
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

const handleDragStart = (event) => {};

const handleDragEnd = (event) => {
  const { over } = state.dragging;

  // Get the order ID from the HTML element that was clicked
  const id = event.target.dataset.id;

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
*/
