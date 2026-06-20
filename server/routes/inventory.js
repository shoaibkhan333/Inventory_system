import { Router } from 'express';
import { db, generateId, seedDemoData } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

function mapCategory(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    color: row.color,
    createdAt: row.created_at,
  };
}

function mapSupplier(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    contactPerson: row.contact_person,
    createdAt: row.created_at,
  };
}

function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    description: row.description,
    categoryId: row.category_id,
    supplierId: row.supplier_id,
    quantity: row.quantity,
    minStock: row.min_stock,
    unitPrice: row.unit_price,
    costPrice: row.cost_price,
    location: row.location,
    imageUrl: row.image_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMovement(row) {
  return {
    id: row.id,
    productId: row.product_id,
    type: row.type,
    quantity: row.quantity,
    previousQuantity: row.previous_quantity,
    newQuantity: row.new_quantity,
    reason: row.reason,
    reference: row.reference,
    createdAt: row.created_at,
  };
}

function mapSettings(row) {
  if (!row) {
    return {
      companyName: 'StockFlow Inc.',
      currency: 'USD',
      lowStockAlerts: true,
      darkMode: false,
    };
  }
  return {
    companyName: row.company_name,
    currency: row.currency,
    lowStockAlerts: !!row.low_stock_alerts,
    darkMode: !!row.dark_mode,
  };
}

// ── Full state ──
router.get('/state', (req, res) => {
  const userId = req.user.id;
  const categories = db.prepare('SELECT * FROM categories WHERE user_id = ? ORDER BY created_at').all(userId).map(mapCategory);
  const suppliers = db.prepare('SELECT * FROM suppliers WHERE user_id = ? ORDER BY created_at').all(userId).map(mapSupplier);
  const products = db.prepare('SELECT * FROM products WHERE user_id = ? ORDER BY created_at').all(userId).map(mapProduct);
  const movements = db.prepare('SELECT * FROM movements WHERE user_id = ? ORDER BY created_at DESC').all(userId).map(mapMovement);
  const settingsRow = db.prepare('SELECT * FROM settings WHERE user_id = ?').get(userId);

  res.json({
    categories,
    suppliers,
    products,
    movements,
    settings: mapSettings(settingsRow),
  });
});

// ── Categories ──
router.get('/categories', (req, res) => {
  const rows = db.prepare('SELECT * FROM categories WHERE user_id = ? ORDER BY created_at').all(req.user.id);
  res.json(rows.map(mapCategory));
});

router.post('/categories', (req, res) => {
  const { name, description, color } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });

  const id = generateId('cat');
  const now = new Date().toISOString();
  db.prepare(
    'INSERT INTO categories (id, user_id, name, description, color, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, req.user.id, name.trim(), description || '', color || '#6366f1', now);

  res.status(201).json(mapCategory(db.prepare('SELECT * FROM categories WHERE id = ?').get(id)));
});

router.put('/categories/:id', (req, res) => {
  const { name, description, color } = req.body;
  const existing = db.prepare('SELECT * FROM categories WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ error: 'Category not found' });

  db.prepare('UPDATE categories SET name = ?, description = ?, color = ? WHERE id = ? AND user_id = ?')
    .run(name ?? existing.name, description ?? existing.description, color ?? existing.color, req.params.id, req.user.id);

  res.json(mapCategory(db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id)));
});

router.delete('/categories/:id', (req, res) => {
  const count = db.prepare('SELECT COUNT(*) as count FROM products WHERE category_id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (count.count > 0) return res.status(400).json({ error: 'Cannot delete category with linked products' });

  const result = db.prepare('DELETE FROM categories WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Category not found' });
  res.json({ success: true });
});

// ── Suppliers ──
router.get('/suppliers', (req, res) => {
  const rows = db.prepare('SELECT * FROM suppliers WHERE user_id = ? ORDER BY created_at').all(req.user.id);
  res.json(rows.map(mapSupplier));
});

router.post('/suppliers', (req, res) => {
  const { name, email, phone, address, contactPerson } = req.body;
  if (!name?.trim() || !email?.trim()) return res.status(400).json({ error: 'Name and email are required' });

  const id = generateId('sup');
  const now = new Date().toISOString();
  db.prepare(
    'INSERT INTO suppliers (id, user_id, name, email, phone, address, contact_person, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(id, req.user.id, name.trim(), email.trim(), phone || '', address || '', contactPerson || '', now);

  res.status(201).json(mapSupplier(db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id)));
});

router.put('/suppliers/:id', (req, res) => {
  const { name, email, phone, address, contactPerson } = req.body;
  const existing = db.prepare('SELECT * FROM suppliers WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ error: 'Supplier not found' });

  db.prepare('UPDATE suppliers SET name = ?, email = ?, phone = ?, address = ?, contact_person = ? WHERE id = ? AND user_id = ?')
    .run(name ?? existing.name, email ?? existing.email, phone ?? existing.phone, address ?? existing.address, contactPerson ?? existing.contact_person, req.params.id, req.user.id);

  res.json(mapSupplier(db.prepare('SELECT * FROM suppliers WHERE id = ?').get(req.params.id)));
});

router.delete('/suppliers/:id', (req, res) => {
  const count = db.prepare('SELECT COUNT(*) as count FROM products WHERE supplier_id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (count.count > 0) return res.status(400).json({ error: 'Cannot delete supplier with linked products' });

  const result = db.prepare('DELETE FROM suppliers WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Supplier not found' });
  res.json({ success: true });
});

// ── Products ──
router.get('/products', (req, res) => {
  const rows = db.prepare('SELECT * FROM products WHERE user_id = ? ORDER BY created_at').all(req.user.id);
  res.json(rows.map(mapProduct));
});

router.post('/products', (req, res) => {
  const { name, sku, description, categoryId, supplierId, quantity, minStock, unitPrice, costPrice, location, imageUrl } = req.body;
  if (!name?.trim() || !sku?.trim() || !categoryId || !supplierId) {
    return res.status(400).json({ error: 'Name, SKU, category, and supplier are required' });
  }

  const id = generateId('prod');
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO products (id, user_id, name, sku, description, category_id, supplier_id, quantity, min_stock, unit_price, cost_price, location, image_url, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.user.id, name.trim(), sku.trim(), description || '', categoryId, supplierId, quantity ?? 0, minStock ?? 10, unitPrice ?? 0, costPrice ?? 0, location || '', imageUrl || '', now, now);

  res.status(201).json(mapProduct(db.prepare('SELECT * FROM products WHERE id = ?').get(id)));
});

router.put('/products/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });

  const { name, sku, description, categoryId, supplierId, quantity, minStock, unitPrice, costPrice, location, imageUrl } = req.body;
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE products SET name = ?, sku = ?, description = ?, category_id = ?, supplier_id = ?, quantity = ?, min_stock = ?, unit_price = ?, cost_price = ?, location = ?, image_url = ?, updated_at = ?
    WHERE id = ? AND user_id = ?
  `).run(
    name ?? existing.name, sku ?? existing.sku, description ?? existing.description,
    categoryId ?? existing.category_id, supplierId ?? existing.supplier_id,
    quantity ?? existing.quantity, minStock ?? existing.min_stock,
    unitPrice ?? existing.unit_price, costPrice ?? existing.cost_price,
    location ?? existing.location, imageUrl ?? existing.image_url,
    now, req.params.id, req.user.id
  );

  res.json(mapProduct(db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id)));
});

router.delete('/products/:id', (req, res) => {
  db.prepare('DELETE FROM movements WHERE product_id = ? AND user_id = ?').run(req.params.id, req.user.id);
  const result = db.prepare('DELETE FROM products WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Product not found' });
  res.json({ success: true });
});

// ── Movements ──
router.get('/movements', (req, res) => {
  const rows = db.prepare('SELECT * FROM movements WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json(rows.map(mapMovement));
});

router.post('/movements', (req, res) => {
  const { productId, type, quantity, reason, reference } = req.body;
  if (!productId || !type || !quantity || !reason?.trim()) {
    return res.status(400).json({ error: 'Product, type, quantity, and reason are required' });
  }

  const product = db.prepare('SELECT * FROM products WHERE id = ? AND user_id = ?').get(productId, req.user.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  let delta = quantity;
  if (type === 'out') delta = -Math.abs(quantity);
  if (type === 'in') delta = Math.abs(quantity);

  const previousQuantity = product.quantity;
  const newQuantity = Math.max(0, previousQuantity + delta);
  const now = new Date().toISOString();
  const id = generateId('mov');

  db.prepare(`
    INSERT INTO movements (id, user_id, product_id, type, quantity, previous_quantity, new_quantity, reason, reference, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.user.id, productId, type, Math.abs(quantity), previousQuantity, newQuantity, reason.trim(), reference || '', now);

  db.prepare('UPDATE products SET quantity = ?, updated_at = ? WHERE id = ? AND user_id = ?')
    .run(newQuantity, now, productId, req.user.id);

  res.status(201).json(mapMovement(db.prepare('SELECT * FROM movements WHERE id = ?').get(id)));
});

// ── Settings ──
router.get('/settings', (req, res) => {
  const row = db.prepare('SELECT * FROM settings WHERE user_id = ?').get(req.user.id);
  res.json(mapSettings(row));
});

router.put('/settings', (req, res) => {
  const { companyName, currency, lowStockAlerts, darkMode } = req.body;
  const existing = db.prepare('SELECT * FROM settings WHERE user_id = ?').get(req.user.id);

  if (!existing) {
    db.prepare('INSERT INTO settings (user_id, company_name, currency, low_stock_alerts, dark_mode) VALUES (?, ?, ?, ?, ?)')
      .run(req.user.id, companyName || 'StockFlow Inc.', currency || 'USD', lowStockAlerts ? 1 : 0, darkMode ? 1 : 0);
  } else {
    db.prepare('UPDATE settings SET company_name = ?, currency = ?, low_stock_alerts = ?, dark_mode = ? WHERE user_id = ?')
      .run(
        companyName ?? existing.company_name,
        currency ?? existing.currency,
        lowStockAlerts !== undefined ? (lowStockAlerts ? 1 : 0) : existing.low_stock_alerts,
        darkMode !== undefined ? (darkMode ? 1 : 0) : existing.dark_mode,
        req.user.id
      );
  }

  res.json(mapSettings(db.prepare('SELECT * FROM settings WHERE user_id = ?').get(req.user.id)));
});

// ── Reset & Import/Export ──
router.post('/reset', (req, res) => {
  const userId = req.user.id;
  db.prepare('DELETE FROM movements WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM products WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM categories WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM suppliers WHERE user_id = ?').run(userId);
  seedDemoData(userId);

  const categories = db.prepare('SELECT * FROM categories WHERE user_id = ?').all(userId).map(mapCategory);
  const suppliers = db.prepare('SELECT * FROM suppliers WHERE user_id = ?').all(userId).map(mapSupplier);
  const products = db.prepare('SELECT * FROM products WHERE user_id = ?').all(userId).map(mapProduct);
  const movements = db.prepare('SELECT * FROM movements WHERE user_id = ? ORDER BY created_at DESC').all(userId).map(mapMovement);
  const settingsRow = db.prepare('SELECT * FROM settings WHERE user_id = ?').get(userId);

  res.json({ categories, suppliers, products, movements, settings: mapSettings(settingsRow) });
});

router.post('/import', (req, res) => {
  const { categories, suppliers, products, movements, settings } = req.body;
  if (!categories || !suppliers || !products) {
    return res.status(400).json({ error: 'Invalid import data' });
  }

  const userId = req.user.id;
  db.prepare('DELETE FROM movements WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM products WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM categories WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM suppliers WHERE user_id = ?').run(userId);

  const insertCat = db.prepare('INSERT INTO categories (id, user_id, name, description, color, created_at) VALUES (?, ?, ?, ?, ?, ?)');
  categories.forEach((c) => insertCat.run(c.id, userId, c.name, c.description || '', c.color, c.createdAt || new Date().toISOString()));

  const insertSup = db.prepare('INSERT INTO suppliers (id, user_id, name, email, phone, address, contact_person, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  suppliers.forEach((s) => insertSup.run(s.id, userId, s.name, s.email, s.phone || '', s.address || '', s.contactPerson || '', s.createdAt || new Date().toISOString()));

  const insertProd = db.prepare(`
    INSERT INTO products (id, user_id, name, sku, description, category_id, supplier_id, quantity, min_stock, unit_price, cost_price, location, image_url, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  products.forEach((p) => insertProd.run(p.id, userId, p.name, p.sku, p.description || '', p.categoryId, p.supplierId, p.quantity, p.minStock, p.unitPrice, p.costPrice, p.location || '', p.imageUrl || '', p.createdAt || new Date().toISOString(), p.updatedAt || new Date().toISOString()));

  if (movements?.length) {
    const insertMov = db.prepare(`
      INSERT INTO movements (id, user_id, product_id, type, quantity, previous_quantity, new_quantity, reason, reference, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    movements.forEach((m) => insertMov.run(m.id, userId, m.productId, m.type, m.quantity, m.previousQuantity, m.newQuantity, m.reason, m.reference || '', m.createdAt || new Date().toISOString()));
  }

  if (settings) {
    db.prepare('UPDATE settings SET company_name = ?, currency = ?, low_stock_alerts = ?, dark_mode = ? WHERE user_id = ?')
      .run(settings.companyName, settings.currency, settings.lowStockAlerts ? 1 : 0, settings.darkMode ? 1 : 0, userId);
  }

  res.json({ success: true });
});

export default router;
