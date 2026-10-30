export const TABLES = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
];

export const COLUMNS = ["ordered", "preparing", "served"];

const STORAGE_KEY = "kitchen-express-orders";

export const state = {
  orders: {},
  dragging: {
    source: null,
    over: null,
  },
};

const createUniqueId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random()
    .toString(36)
    .slice(2)}`;

export const createOrderData = ({ title, table, column = "ordered" }) => ({
  id: createUniqueId(),
  title: title.trim(),
  table: String(table),
  column,
  created: new Date(),
  updated: new Date(),
});

export const saveOrders = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.orders));
  } catch (error) {
    console.error("Could not save orders:", error);
  }
};

export const loadOrders = () => {
  try {
    const savedOrders = localStorage.getItem(STORAGE_KEY);

    if (!savedOrders) return;

    const parsedOrders = JSON.parse(savedOrders);

    state.orders = Object.fromEntries(
      Object.entries(parsedOrders).map(([id, order]) => [
        id,
        {
          ...order,
          id,
          table: String(order.table),
          column: COLUMNS.includes(order.column) ? order.column : "ordered",
          created: new Date(order.created),
          updated: order.updated
            ? new Date(order.updated)
            : new Date(order.created),
        },
      ]),
    );
  } catch (error) {
    console.error("Could not restore orders:", error);
    state.orders = {};
  }
};

export const updateDragging = (newDragging) => {
  state.dragging = {
    ...state.dragging,
    ...newDragging,
  };
};
