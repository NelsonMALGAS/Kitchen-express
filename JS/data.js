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

export const MENU_CATEGORIES = [
  "Burgers",
  "Pizza",
  "Main Meals",
  "Sides",
  "Drinks",
  "Desserts",
];

const ORDER_STORAGE_KEY = "kitchen-express-orders";
const MENU_STORAGE_KEY = "kitchen-express-menu";

const defaultMenu = [
  { id: "menu-1", name: "Chicken Burger", category: "Burgers", price: 85 },
  { id: "menu-2", name: "Beef Burger", category: "Burgers", price: 95 },
  { id: "menu-3", name: "Margherita Pizza", category: "Pizza", price: 110 },
  { id: "menu-4", name: "Chicken Pizza", category: "Pizza", price: 135 },
  { id: "menu-5", name: "Fish and Chips", category: "Main Meals", price: 120 },
  { id: "menu-6", name: "Chips", category: "Sides", price: 35 },
  { id: "menu-7", name: "Soft Drink", category: "Drinks", price: 22 },
  { id: "menu-8", name: "Chocolate Brownie", category: "Desserts", price: 45 },
];

const createUniqueId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const state = {
  orders: {},
  menu: [...defaultMenu],
  dragging: {
    source: null,
    over: null,
  },
};

export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(Number(amount) || 0);

export const calculateOrderTotal = (items = []) =>
  items.reduce(
    (total, item) => total + Number(item.price) * Number(item.quantity),
    0,
  );

export const createMenuItem = ({ name, category, price }) => ({
  id: createUniqueId(),
  name: name.trim(),
  category,
  price: Number(price),
});

export const createOrderData = ({ table, items, column = "ordered" }) => ({
  id: createUniqueId(),
  table: String(table),
  items: items.map((item) => ({ ...item })),
  column,
  created: new Date(),
  updated: new Date(),
  total: calculateOrderTotal(items),
});

export const saveOrders = () => {
  try {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(state.orders));
  } catch (error) {
    console.error("Could not save orders:", error);
  }
};

export const saveMenu = () => {
  try {
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(state.menu));
  } catch (error) {
    console.error("Could not save menu:", error);
  }
};

export const loadData = () => {
  try {
    const savedMenu = localStorage.getItem(MENU_STORAGE_KEY);
    const savedOrders = localStorage.getItem(ORDER_STORAGE_KEY);

    if (savedMenu) {
      state.menu = JSON.parse(savedMenu);
    }

    if (savedOrders) {
      const parsedOrders = JSON.parse(savedOrders);

      state.orders = Object.fromEntries(
        Object.entries(parsedOrders).map(([id, order]) => {
          // Basic migration for orders from the old single-title format.
          const items = Array.isArray(order.items)
            ? order.items
            : [
                {
                  menuItemId: null,
                  name: order.title || "Previous order",
                  price: 0,
                  quantity: 1,
                  instructions: "",
                },
              ];

          return [
            id,
            {
              ...order,
              id,
              table: String(order.table),
              items,
              total: calculateOrderTotal(items),
              column: COLUMNS.includes(order.column) ? order.column : "ordered",
              created: new Date(order.created),
              updated: order.updated
                ? new Date(order.updated)
                : new Date(order.created),
            },
          ];
        }),
      );
    }
  } catch (error) {
    console.error("Could not load Kitchen Express data:", error);
  }
};

export const updateDragging = (newDragging) => {
  state.dragging = {
    ...state.dragging,
    ...newDragging,
  };
};
