# 🍽️ Kitchen Express

**A Restaurant Order Management & Kitchen Operations Dashboard**

Kitchen Express is a web-based restaurant order management application designed to simplify kitchen operations, improve order tracking, and help restaurant staff manage orders efficiently through a centralized dashboard.

The application provides a Kanban-style order management system where staff can track orders from placement to preparation and completion. It also includes menu management, multi-item ordering, restaurant availability controls, and persistent local data storage.

---

## ✨ Features

### 📊 Dashboard Overview
- View total orders, active orders, and completed orders.
- Monitor total revenue generated from orders.
- Track order counts across different workflow stages.
- View the current date and restaurant status.

### 🧾 Order Management
- Create new customer orders.
- Add multiple menu items to a single order.
- Specify item quantities and special instructions.
- Assign orders to restaurant tables.
- Edit existing orders.
- Delete orders when necessary.
- Automatically calculate order totals.

### 🍳 Kitchen Order Tracking
Manage orders through an intuitive Kanban board with three workflow stages:

- **Ordered:** Newly received customer orders.
- **Preparing:** Orders currently being prepared by kitchen staff.
- **Served:** Completed orders ready for or delivered to customers.

- Drag and drop orders between workflow columns.
- Visually track order progress.
- Automatically update order counts.

### 🍔 Menu Management
- Add new menu items.
- Edit existing menu items.
- Delete menu items.
- Organise items by menu categories.
- Set item prices.
- Dynamically display available menu items when creating orders.

### 🟢 Restaurant Availability Management
- Toggle between Restaurant Open and Restaurant Closed.
- Persist restaurant availability using browser local storage.
- Automatically restrict application functionality when the restaurant is closed.
- Allow only the restaurant availability control to remain accessible while closed.
- Restore normal functionality when the restaurant reopens.

### 💾 Local Data Persistence
- Store application data using browser `localStorage`.
- Preserve orders and menu items across page refreshes.
- Restore saved restaurant availability.
- Maintain order information without requiring a backend database.

### 📱 Responsive Interface
- Clean and modern user interface.
- Responsive layouts for different screen sizes.
- Consistent button styling and interactive elements.
- User-friendly dialogs and navigation.

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Application structure |
| CSS3 | Styling, layouts and responsive design |
| JavaScript (ES6+) | Application logic and interactivity |
| DOM API | Dynamic interface updates |
| HTML Drag and Drop API | Moving orders between columns |
| LocalStorage API | Persistent browser-side data storage |

---

## 📂 Project Structure

```text
Kitchen-Express/
│
├── index.html
│
├── CSS/
│   └── styles.css
│
├── JS/
│   ├── script.js
│   ├── data.js
│   └── view.js
│
└── README.md
```

### JavaScript Architecture

The JavaScript code is separated into three modules:

- **`data.js`** – Manages application state, order data, menu data, calculations, and local storage.
- **`view.js`** – Handles HTML generation, rendering, dashboard updates, and DOM-related functionality.
- **`script.js`** – Handles event listeners, user interactions, order operations, menu management, and restaurant availability.

---

## 🚀 Getting Started

### Prerequisites

You only need:
- A modern web browser.
- A code editor such as Visual Studio Code.
- A local development server (recommended).

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/kitchen-express.git
```

**2. Navigate into the project directory**

```bash
cd kitchen-express
```

**3. Open the project in Visual Studio Code**

```bash
code .
```

**4. Run the application**

Since the project uses JavaScript ES modules, launch it through a local development server.

For example, install and use the VS Code Live Server extension, then open `index.html` with Live Server.

---

## 💡 Key Development Concepts Demonstrated

Kitchen Express demonstrates practical front-end development skills, including:

- JavaScript ES6 modules and code organisation.
- State management without an external framework.
- CRUD (Create, Read, Update, Delete) operations.
- Dynamic DOM manipulation.
- Event delegation and event handling.
- Drag-and-drop interactions.
- Browser local storage and data persistence.
- Form validation and data handling.
- Responsive web design.
- Separation of application logic, data, and presentation.

---

## 🔮 Future Improvements

Potential enhancements include:

- Backend integration using Node.js and PostgreSQL.
- User authentication and role-based access control.
- Real-time order updates across multiple devices.
- Kitchen display system for dedicated kitchen screens.
- Receipt generation and printing.
- Sales reports and analytics.
- Inventory and stock management.
- Order notifications.
- Multiple restaurant and branch support.
- Cloud-based data synchronisation.

---

## 🎯 Project Purpose

Kitchen Express was built as a practical software development project to solve a real-world operational challenge in the restaurant industry: managing customer orders and coordinating kitchen workflows efficiently.

The project focuses on creating a simple, intuitive, and centralised system that helps restaurant staff monitor orders, manage menu items, track preparation progress, and control restaurant availability.

It also serves as an opportunity to strengthen core JavaScript skills by building a functional application without relying on a front-end framework.

---

## 👨‍💻 Author

**Nelson Zongezile Malgas**

Fullstack Software Engineer

- GitHub: [Your GitHub Profile](https://github.com/NelsonMALGAS)
- LinkedIn: [Nelson Zongezile Malgas](https://www.linkedin.com/in/nelson-zongezile-malgas/)

> If you can think it, I can build it.

---

## 📄 License

This project is available for educational and portfolio purposes. A formal open-source license can be added when the project is ready for public distribution.