# StockFlow — Inventory Management System

A professional, interactive inventory management web application built with React, TypeScript, and Tailwind CSS.

![StockFlow](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3-blue)

## Features

- **Dashboard** — Real-time stats, charts, stock alerts, and recent activity
- **Product Management** — Full CRUD with grid/list views, search, and filters
- **Categories** — Organize products with color-coded categories
- **Suppliers** — Manage vendor contacts and relationships
- **Stock Movements** — Track stock in, stock out, and adjustments
- **Reports & Analytics** — Inventory value, category breakdown, supplier performance
- **Settings** — Dark mode, currency, data export/import, and reset
- **Persistent Storage** — All data saved automatically to localStorage

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:5180](http://localhost:5180) in your browser.

> **Note:** The backend API must also be running: `npm run dev:server` (in a second terminal).

### Build for Production

```bash
npm run build
npm run preview
```

## Tech Stack

| Layer      | Technology              |
| ---------- | ----------------------- |
| Frontend   | React 18 + TypeScript   |
| Build Tool | Vite 5                  |
| Styling    | Tailwind CSS 3          |
| Charts     | Recharts                |
| Icons      | Lucide React            |
| Routing    | React Router 6          |
| Storage    | Browser localStorage    |

## Project Structure

```
src/
├── components/
│   ├── layout/       # Sidebar, Header, Layout
│   └── ui/           # Reusable UI components
├── context/          # Global state management
├── pages/            # Route pages
├── types/            # TypeScript interfaces
└── utils/            # Storage helpers & formatters
```

## License

MIT
