import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'stockflow.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'manager',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    color TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT DEFAULT '',
    address TEXT DEFAULT '',
    contact_person TEXT DEFAULT '',
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    sku TEXT NOT NULL,
    description TEXT DEFAULT '',
    category_id TEXT NOT NULL,
    supplier_id TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 10,
    unit_price REAL NOT NULL DEFAULT 0,
    cost_price REAL NOT NULL DEFAULT 0,
    location TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
  );

  CREATE TABLE IF NOT EXISTS movements (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    reason TEXT NOT NULL,
    reference TEXT DEFAULT '',
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS settings (
    user_id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL DEFAULT 'StockFlow Inc.',
    currency TEXT NOT NULL DEFAULT 'USD',
    low_stock_alerts INTEGER NOT NULL DEFAULT 1,
    dark_mode INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function seedDemoData(userId) {
  const now = new Date().toISOString();

  const categories = [
    { id: generateId('cat'), name: 'Electronics', description: 'Electronic devices and accessories', color: '#6366f1' },
    { id: generateId('cat'), name: 'Office Supplies', description: 'Stationery and office equipment', color: '#10b981' },
    { id: generateId('cat'), name: 'Furniture', description: 'Office and warehouse furniture', color: '#f59e0b' },
    { id: generateId('cat'), name: 'Raw Materials', description: 'Manufacturing raw materials', color: '#ef4444' },
  ];

  const insertCat = db.prepare(
    'INSERT INTO categories (id, user_id, name, description, color, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  );
  categories.forEach((c) => insertCat.run(c.id, userId, c.name, c.description, c.color, now));

  const suppliers = [
    { id: generateId('sup'), name: 'TechParts Global', email: 'orders@techparts.com', phone: '+1 (555) 123-4567', address: '123 Tech Blvd, San Francisco, CA', contactPerson: 'Sarah Johnson' },
    { id: generateId('sup'), name: 'Office Depot Wholesale', email: 'wholesale@officedepot.com', phone: '+1 (555) 987-6543', address: '456 Supply Ave, Chicago, IL', contactPerson: 'Mike Chen' },
    { id: generateId('sup'), name: 'FurniCraft Ltd', email: 'sales@furnicraft.com', phone: '+1 (555) 456-7890', address: '789 Design St, Austin, TX', contactPerson: 'Emily Davis' },
  ];

  const insertSup = db.prepare(
    'INSERT INTO suppliers (id, user_id, name, email, phone, address, contact_person, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  suppliers.forEach((s) => insertSup.run(s.id, userId, s.name, s.email, s.phone, s.address, s.contactPerson, now));

  const products = [
    { name: 'Wireless Mouse', sku: 'ELEC-WM-001', description: 'Ergonomic wireless mouse with USB receiver', categoryId: categories[0].id, supplierId: suppliers[0].id, quantity: 145, minStock: 30, unitPrice: 29.99, costPrice: 15.5, location: 'A-12-03' },
    { name: 'Mechanical Keyboard', sku: 'ELEC-KB-002', description: 'RGB mechanical keyboard with Cherry MX switches', categoryId: categories[0].id, supplierId: suppliers[0].id, quantity: 67, minStock: 20, unitPrice: 89.99, costPrice: 52.0, location: 'A-12-04' },
    { name: 'A4 Copy Paper (500 sheets)', sku: 'OFF-PAP-001', description: 'Premium white A4 copy paper, 80gsm', categoryId: categories[1].id, supplierId: suppliers[1].id, quantity: 8, minStock: 25, unitPrice: 6.99, costPrice: 3.2, location: 'B-01-01' },
    { name: 'Ballpoint Pens (Box of 50)', sku: 'OFF-PEN-002', description: 'Blue ink ballpoint pens, medium tip', categoryId: categories[1].id, supplierId: suppliers[1].id, quantity: 42, minStock: 15, unitPrice: 12.99, costPrice: 6.5, location: 'B-02-03' },
    { name: 'Ergonomic Office Chair', sku: 'FUR-CHR-001', description: 'Adjustable lumbar support office chair', categoryId: categories[2].id, supplierId: suppliers[2].id, quantity: 0, minStock: 5, unitPrice: 349.99, costPrice: 210.0, location: 'C-05-01' },
    { name: 'Standing Desk', sku: 'FUR-DSK-002', description: 'Electric height-adjustable standing desk', categoryId: categories[2].id, supplierId: suppliers[2].id, quantity: 12, minStock: 5, unitPrice: 599.99, costPrice: 380.0, location: 'C-05-02' },
    { name: 'USB-C Hub 7-in-1', sku: 'ELEC-HUB-003', description: 'Multi-port USB-C hub with HDMI and SD card', categoryId: categories[0].id, supplierId: suppliers[0].id, quantity: 18, minStock: 25, unitPrice: 49.99, costPrice: 22.0, location: 'A-13-01' },
    { name: 'Steel Bolts (Pack of 100)', sku: 'RAW-BLT-001', description: 'M8 stainless steel bolts', categoryId: categories[3].id, supplierId: suppliers[1].id, quantity: 320, minStock: 100, unitPrice: 24.99, costPrice: 11.0, location: 'D-01-05' },
  ];

  const insertProd = db.prepare(`
    INSERT INTO products (id, user_id, name, sku, description, category_id, supplier_id, quantity, min_stock, unit_price, cost_price, location, image_url, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', ?, ?)
  `);

  const productIds = [];
  products.forEach((p) => {
    const id = generateId('prod');
    productIds.push(id);
    insertProd.run(id, userId, p.name, p.sku, p.description, p.categoryId, p.supplierId, p.quantity, p.minStock, p.unitPrice, p.costPrice, p.location, now, now);
  });

  const movements = [
    { productId: productIds[0], type: 'in', quantity: 50, previousQuantity: 95, newQuantity: 145, reason: 'Restock from supplier', reference: 'PO-2025-042' },
    { productId: productIds[2], type: 'out', quantity: 12, previousQuantity: 20, newQuantity: 8, reason: 'Office consumption', reference: 'REQ-2025-118' },
    { productId: productIds[4], type: 'out', quantity: 3, previousQuantity: 3, newQuantity: 0, reason: 'Sold to customer', reference: 'SO-2025-089' },
  ];

  const insertMov = db.prepare(`
    INSERT INTO movements (id, user_id, product_id, type, quantity, previous_quantity, new_quantity, reason, reference, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  movements.forEach((m) => {
    insertMov.run(generateId('mov'), userId, m.productId, m.type, m.quantity, m.previousQuantity, m.newQuantity, m.reason, m.reference, now);
  });
}

const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (userCount.count === 0) {
  const adminId = generateId('user');
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  const now = new Date().toISOString();

  db.prepare(
    'INSERT INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(adminId, 'Admin User', 'admin@stockflow.com', hashedPassword, 'admin', now);

  db.prepare(
    'INSERT INTO settings (user_id, company_name, currency, low_stock_alerts, dark_mode) VALUES (?, ?, ?, ?, ?)'
  ).run(adminId, 'StockFlow Inc.', 'USD', 1, 0);

  seedDemoData(adminId);
  console.log('Default admin created: admin@stockflow.com / admin123');
}

export { db, generateId, seedDemoData };
