const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) {
      return;
    }

    const key = match[1];
    let value = match[2].trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Keep shell-provided env vars as highest priority.
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  });
}

const projectRoot = path.join(__dirname, '..');
loadEnvFile(path.join(projectRoot, '.env.local'));
loadEnvFile(path.join(projectRoot, '.env'));

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'menu.db');

// Remove existing database
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

console.log('🗄️  Creating database tables...');

// Categories table
db.exec(`
  CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_tr TEXT NOT NULL,
    name_en TEXT,
    name_ar TEXT,
    description_tr TEXT,
    description_en TEXT,
    description_ar TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
  )
`);

// Products table
db.exec(`
  CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER,
    name_tr TEXT NOT NULL,
    name_en TEXT,
    name_ar TEXT,
    description_tr TEXT,
    description_en TEXT,
    description_ar TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    discount_percent INTEGER DEFAULT 0,
    image_url TEXT,
    is_published BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  )
`);

// Daily menu table
db.exec(`
  CREATE TABLE daily_menu (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
  )
`);

// Product views for analytics
db.exec(`
  CREATE TABLE product_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    view_date DATE NOT NULL,
    view_count INTEGER DEFAULT 1,
    UNIQUE(product_id, view_date),
    FOREIGN KEY (product_id) REFERENCES products(id)
  )
`);

// Site visits for analytics
db.exec(`
  CREATE TABLE site_visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visit_date DATE NOT NULL UNIQUE,
    visit_count INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Visitor sessions for unique visit tracking
db.exec(`
  CREATE TABLE visitor_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    first_visit DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_visit DATETIME DEFAULT CURRENT_TIMESTAMP,
    visit_count INTEGER DEFAULT 1,
    user_agent TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// System settings
db.exec(`
  CREATE TABLE settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value_tr TEXT,
    value_en TEXT,
    value_ar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Admin users
db.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    preferred_language TEXT DEFAULT 'tr',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    password_changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    twofa_backup_code TEXT,
    twofa_secret TEXT,
    twofa_enabled_for_login BOOLEAN DEFAULT false
  )
`);

// Image registry for smart image management
db.exec(`
  CREATE TABLE image_registry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hash TEXT UNIQUE NOT NULL,
    file_path TEXT UNIQUE NOT NULL,
    usage_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE twofa_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    verified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log('📝 Inserting demo data...');


// Temizlik: test kullanıcılarını sil
db.prepare(`DELETE FROM users WHERE username = 'test' OR username = 'testuser'`).run();

const adminUsername = process.env.ADMIN_USERNAME || 'admin';
const adminPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(24).toString('base64url');

if (adminPassword.length < 12) {
  console.error('ADMIN_PASSWORD must be at least 12 characters long.');
  process.exit(1);
}

const insertUser = db.prepare(`
  INSERT INTO users (username, password_hash, preferred_language, twofa_secret)
  VALUES (?, ?, ?, NULL)
`);
insertUser.run(adminUsername, bcrypt.hashSync(adminPassword, 12), 'tr');

// Insert system settings
const settings = [
  ['cafe_name', 'QR Cafe', 'QR Cafe', 'مقهى QR'],
  ['cafe_description', 'Teknoloji ve lezzet buluşuyor!', 'Where technology meets taste!', 'حيث تلتقي التكنولوجيا بالطعم!'],
  ['cafe_phone', '+90 000 000 00 00', '+90 000 000 00 00', '+90 000 000 00 00'],
  ['cafe_address', 'İstanbul, Türkiye', 'Istanbul, Turkey', 'اسطنبول، تركيا'],
  ['cafe_email', 'info@example.com', 'info@example.com', 'info@example.com'],
  ['cafe_website', 'example.com', 'example.com', 'example.com'],
  ['cafe_logo_url', '/uploads/logo.png', '/uploads/logo.png', '/uploads/logo.png'],
  ['cafe_working_hours', 'Pazartesi - Pazar: 08:00 - 22:00', 'Monday - Sunday: 08:00 - 22:00', 'من الإثنين إلى الأحد: 08:00 - 22:00']
];

const insertSetting = db.prepare(`
  INSERT INTO settings (key, value_tr, value_en, value_ar)
  VALUES (?, ?, ?, ?)
`);

settings.forEach(([key, tr, en, ar]) => {
  insertSetting.run(key, tr, en, ar);
});

// Insert demo categories
const categories = [
  ['Sıcak İçecekler', 'Hot Drinks', 'المشروبات الساخنة', 'Kahve, çay ve sıcak içecekler', 'Coffee, tea and hot beverages', 'القهوة والشاي والمشروبات الساخنة', 1],
  ['Soğuk İçecekler', 'Cold Drinks', 'المشروبات الباردة', 'Meyveli içecekler ve soğuk kahveler', 'Fruit drinks and cold coffees', 'مشروبات الفواكه والقهوة الباردة', 2],
  ['Ana Yemekler', 'Main Courses', 'الأطباق الرئيسية', 'Doyurucu ve lezzetli ana yemekler', 'Satisfying and delicious main courses', 'أطباق رئيسية مشبعة ولذيذة', 3],
  ['Tatlılar', 'Desserts', 'الحلويات', 'Ev yapımı tatlılar', 'Homemade desserts', 'حلويات منزلية الصنع', 4],
  ['Atıştırmalıklar', 'Snacks', 'الوجبات الخفيفة', 'Hafif atıştırmalıklar', 'Light snacks', 'وجبات خفيفة', 5],
  ['Nargileler', 'Hookah', 'الشيشة', 'Farklı aromalarda nargileler', 'Hookahs in various flavors', 'الشيشة بنكهات متنوعة', 6]
];

const insertCategory = db.prepare(`
  INSERT INTO categories (name_tr, name_en, name_ar, description_tr, description_en, description_ar, order_index, is_active)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

categories.forEach(([name_tr, name_en, name_ar, desc_tr, desc_en, desc_ar, order_index]) => {
  insertCategory.run(name_tr, name_en, name_ar, desc_tr, desc_en, desc_ar, order_index, 1);
});

// Insert demo products with food images
const products = [
  // Hot Drinks (category_id: 1)
  [1, 'Türk Kahvesi', 'Turkish Coffee', 'القهوة التركية', 'Geleneksel Türk kahvesi', 'Traditional Turkish coffee', 'قهوة تركية تقليدية', 25.00, null, 0, '/uploads/logo.png', true, 1],
  [1, 'Espresso', 'Espresso', 'إسبريسو', 'İtalyan usulü espresso', 'Italian style espresso', 'إسبريسو على الطريقة الإيطالية', 20.00, null, 0, '/uploads/logo.png', true, 2],
  [1, 'Cappuccino', 'Cappuccino', 'كابتشينو', 'Kremalı cappuccino', 'Creamy cappuccino', 'كابتشينو كريمي', 30.00, 35.00, 15, '/uploads/logo.png', true, 3],
  [1, 'Çay', 'Tea', 'شاي', 'Bergamot aromalı çay', 'Bergamot flavored tea', 'شاي بنكهة البرغموت', 15.00, null, 0, '/uploads/logo.png', true, 4],
  
  // Cold Drinks (category_id: 2)
  [2, 'Limonata', 'Lemonade', 'عصير الليمون', 'Taze sıkılmış limonata', 'Fresh squeezed lemonade', 'عصير ليمون طازج', 18.00, null, 0, '/uploads/logo.png', true, 1],
  [2, 'Soğuk Kahve', 'Iced Coffee', 'قهوة مثلجة', 'Buzlu soğuk kahve', 'Iced cold coffee', 'قهوة باردة مثلجة', 25.00, null, 0, '/uploads/logo.png', true, 2],
  [2, 'Milkshake', 'Milkshake', 'ميلك شيك', 'Çikolatalı milkshake', 'Chocolate milkshake', 'ميلك شيك بالشوكولاتة', 35.00, 40.00, 12, '/uploads/logo.png', true, 3],
  [2, 'Smoothie', 'Smoothie', 'سموذي', 'Meyveli smoothie', 'Fruit smoothie', 'سموذي الفواكه', 28.00, null, 0, '/uploads/logo.png', true, 4],
  
  // Main Courses (category_id: 3)
  [3, 'Izgara Tavuk', 'Grilled Chicken', 'دجاج مشوي', 'Baharatlarla marine edilmiş izgara tavuk', 'Grilled chicken marinated with spices', 'دجاج مشوي متبل بالتوابل', 85.00, null, 0, '/uploads/logo.png', true, 1],
  [3, 'Köfte', 'Meatballs', 'كفتة', 'Ev yapımı köfte', 'Homemade meatballs', 'كفتة منزلية الصنع', 75.00, null, 0, '/uploads/logo.png', true, 2],
  [3, 'Balık Izgara', 'Grilled Fish', 'سمك مشوي', 'Taze balık ızgara', 'Fresh grilled fish', 'سمك طازج مشوي', 95.00, 110.00, 15, '/uploads/logo.png', true, 3],
  [3, 'Pizza Margherita', 'Pizza Margherita', 'بيتزا مارغريتا', 'Klasik İtalyan pizzası', 'Classic Italian pizza', 'بيتزا إيطالية كلاسيكية', 65.00, null, 0, '/uploads/logo.png', true, 4],
  [3, 'Burger', 'Burger', 'برجر', 'Özel soslu burger', 'Special sauce burger', 'برجر بصوص خاص', 55.00, 65.00, 15, '/uploads/logo.png', true, 5],
  [3, 'Pasta', 'Pasta', 'باستا', 'Kremalı mantarlı pasta', 'Creamy mushroom pasta', 'باستا كريمية بالفطر', 70.00, null, 0, '/uploads/logo.png', true, 6],
  
  // Desserts (category_id: 4)
  [4, 'Tiramisu', 'Tiramisu', 'تيراميسو', 'İtalyan tiramisu', 'Italian tiramisu', 'تيراميسو إيطالي', 45.00, null, 0, '/uploads/logo.png', true, 1],
  [4, 'Cheesecake', 'Cheesecake', 'تشيز كيك', 'New York usulü cheesecake', 'New York style cheesecake', 'تشيز كيك على طريقة نيويورك', 40.00, null, 0, '/uploads/logo.png', true, 2],
  [4, 'Baklava', 'Baklava', 'بقلاوة', 'Geleneksel Türk baklavası', 'Traditional Turkish baklava', 'بقلاوة تركية تقليدية', 35.00, 42.00, 18, '/uploads/logo.png', true, 3],
  [4, 'Çikolatalı Kek', 'Chocolate Cake', 'كيك الشوكولاتة', 'Yoğun çikolatalı kek', 'Rich chocolate cake', 'كيك شوكولاتة غني', 38.00, null, 0, '/uploads/logo.png', true, 4],
  [4, 'Dondurma', 'Ice Cream', 'آيس كريم', 'Ev yapımı dondurma', 'Homemade ice cream', 'آيس كريم منزلي الصنع', 25.00, null, 0, '/uploads/logo.png', true, 5],
  
  // Snacks (category_id: 5)
  [5, 'Sandviç', 'Sandwich', 'ساندويتش', 'Tost sandviç', 'Grilled sandwich', 'ساندويتش مشوي', 25.00, null, 0, '/uploads/logo.png', true, 1],
  [5, 'Salata', 'Salad', 'سلطة', 'Mevsim salatası', 'Seasonal salad', 'سلطة موسمية', 30.00, null, 0, '/uploads/logo.png', true, 2],
  [5, 'Patates Kızartması', 'French Fries', 'بطاطس مقلية', 'Çıtır patates kızartması', 'Crispy french fries', 'بطاطس مقلية مقرمشة', 20.00, null, 0, '/uploads/logo.png', true, 3],
  [5, 'Nachos', 'Nachos', 'ناتشوز', 'Peynirli nachos', 'Cheesy nachos', 'ناتشوز بالجبن', 35.00, null, 0, '/uploads/logo.png', true, 4],
  [5, 'Çorba', 'Soup', 'شوربة', 'Günün çorbası', 'Soup of the day', 'شوربة اليوم', 22.00, null, 0, '/uploads/logo.png', true, 5],
  // Extra demo products for each category
  // Hot Drinks (category_id: 1)
  [1, 'Latte', 'Latte', 'لاتيه', 'Sütlü kahve', 'Coffee with milk', 'قهوة بالحليب', 32.00, null, 0, '/uploads/logo.png', true, 6],
  [1, 'Mocha', 'Mocha', 'موكا', 'Çikolatalı mocha', 'Chocolate mocha', 'موكا بالشوكولاتة', 34.00, null, 0, '/uploads/logo.png', true, 7],
  [1, 'Sıcak Çikolata', 'Hot Chocolate', 'شوكولاتة ساخنة', 'Yoğun sıcak çikolata', 'Rich hot chocolate', 'شوكولاتة ساخنة غنية', 28.00, null, 0, '/uploads/logo.png', true, 8],
  // Cold Drinks (category_id: 2)
  [2, 'Portakal Suyu', 'Orange Juice', 'عصير البرتقال', 'Taze portakal suyu', 'Fresh orange juice', 'عصير برتقال طازج', 20.00, null, 0, '/uploads/logo.png', true, 5],
  [2, 'Kola', 'Cola', 'كولا', 'Soğuk kola', 'Cold cola', 'كولا باردة', 16.00, null, 0, '/uploads/logo.png', true, 6],
  // Main Courses (category_id: 3)
  [3, 'Mantı', 'Turkish Dumplings', 'مانتي', 'Geleneksel Türk mantısı', 'Traditional Turkish dumplings', 'مانتي تركي تقليدي', 80.00, null, 0, '/uploads/logo.png', true, 7],
  [3, 'Tavuklu Pilav', 'Chicken Rice', 'أرز بالدجاج', 'Tavuklu pilav', 'Rice with chicken', 'أرز مع دجاج', 60.00, null, 0, '/uploads/logo.png', true, 8],
  [3, 'Sebzeli Güveç', 'Vegetable Stew', 'طاجن خضار', 'Sebzeli güveç', 'Vegetable stew', 'طاجن بالخضار', 70.00, null, 0, '/uploads/logo.png', true, 9],
  // Desserts (category_id: 4)
  [4, 'Profiterol', 'Profiterole', 'بروفيترول', 'Çikolatalı profiterol', 'Chocolate profiterole', 'بروفيترول بالشوكولاتة', 42.00, null, 0, '/uploads/logo.png', true, 6],
  [4, 'Sütlaç', 'Rice Pudding', 'أرز بالحليب', 'Fırın sütlaç', 'Baked rice pudding', 'أرز بالحليب مخبوز', 30.00, null, 0, '/uploads/logo.png', true, 7],
  [4, 'Magnolia', 'Magnolia', 'ماجنوليا', 'Meyveli magnolia', 'Magnolia with fruit', 'ماجنوليا بالفواكه', 36.00, null, 0, '/uploads/logo.png', true, 8],
  // Snacks (category_id: 5)
  [5, 'Sigara Böreği', 'Cigar Pastry', 'بورك السيجار', 'Peynirli sigara böreği', 'Cigar pastry with cheese', 'بورك السيجار بالجبن', 24.00, null, 0, '/uploads/logo.png', true, 7],
  [5, 'Mini Pizza', 'Mini Pizza', 'بيتزا صغيرة', 'Küçük boy pizza', 'Small size pizza', 'بيتزا صغيرة الحجم', 26.00, null, 0, '/uploads/logo.png', true, 8],
  [5, 'Mozzarella Sticks', 'Mozzarella Sticks', 'أصابع الموتزاريلا', 'Kızarmış mozzarella sticks', 'Fried mozzarella sticks', 'أصابع موتزاريلا مقلية', 28.00, null, 0, '/uploads/logo.png', true, 6],
  // Nargile (category_id: 6)
  [6, 'Nargile Elma', 'Apple Hookah', 'شيشة تفاح', 'Elma aromalı nargile', 'Apple flavored hookah', 'شيشة بنكهة التفاح', 120.00, null, 0, '/uploads/logo.png', true, 1],
  [6, 'Nargile Üzüm', 'Grape Hookah', 'شيشة عنب', 'Üzüm aromalı nargile', 'Grape flavored hookah', 'شيشة بنكهة العنب', 120.00, null, 0, '/uploads/logo.png', true, 2],
  [6, 'Nargile Nane', 'Mint Hookah', 'شيشة نعناع', 'Nane aromalı nargile', 'Mint flavored hookah', 'شيشة بنكهة النعناع', 120.00, null, 0, '/uploads/logo.png', true, 3],
  [6, 'Nargile Limon', 'Lemon Hookah', 'شيشة ليمون', 'Limon aromalı nargile', 'Lemon flavored hookah', 'شيشة بنكهة الليمون', 120.00, null, 0, '/uploads/logo.png', true, 4],
  [6, 'Nargile Çilek', 'Strawberry Hookah', 'شيشة فراولة', 'Çilek aromalı nargile', 'Strawberry flavored hookah', 'شيشة بنكهة الفراولة', 120.00, null, 0, '/uploads/logo.png', true, 5],
  [6, 'Nargile Karpuz', 'Watermelon Hookah', 'شيشة بطيخ', 'Karpuz aromalı nargile', 'Watermelon flavored hookah', 'شيشة بنكهة البطيخ', 120.00, null, 0, '/uploads/logo.png', true, 6],
  [6, 'Nargile Kavun', 'Melon Hookah', 'شيشة شمام', 'Kavun aromalı nargile', 'Melon flavored hookah', 'شيشة بنكهة الشمام', 120.00, null, 0, '/uploads/logo.png', true, 7],
  [6, 'Nargile Vişne', 'Sour Cherry Hookah', 'شيشة كرز', 'Vişne aromalı nargile', 'Sour cherry flavored hookah', 'شيشة بنكهة الكرز', 120.00, null, 0, '/uploads/logo.png', true, 8],
  [6, 'Nargile Muz', 'Banana Hookah', 'شيشة موز', 'Muz aromalı nargile', 'Banana flavored hookah', 'شيشة بنكهة الموز', 120.00, null, 0, '/uploads/logo.png', true, 9],
  [6, 'Nargile Kola', 'Cola Hookah', 'شيشة كولا', 'Kola aromalı nargile', 'Cola flavored hookah', 'شيشة بنكهة الكولا', 120.00, null, 0, '/uploads/logo.png', true, 10],
];

const insertProduct = db.prepare(`
  INSERT INTO products (category_id, name_tr, name_en, name_ar, description_tr, description_en, description_ar, price, original_price, discount_percent, image_url, is_published, order_index)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

products.forEach(([category_id, name_tr, name_en, name_ar, desc_tr, desc_en, desc_ar, price, original_price, discount_percent, image_url, is_published, order_index]) => {
  insertProduct.run(category_id, name_tr, name_en, name_ar, desc_tr, desc_en, desc_ar, price, original_price, discount_percent, image_url, is_published ? 1 : 0, order_index);
});

// Insert some demo analytics data
const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

// Site visits
const insertSiteVisit = db.prepare(`INSERT INTO site_visits (visit_date, visit_count) VALUES (?, ?)`);
insertSiteVisit.run(today, 45);
insertSiteVisit.run(yesterday, 38);
insertSiteVisit.run(weekAgo, 52);

// Product views
const insertProductView = db.prepare(`INSERT INTO product_views (product_id, view_date, view_count) VALUES (?, ?, ?)`);
insertProductView.run(1, today, 15);
insertProductView.run(3, today, 22);
insertProductView.run(8, today, 18);
insertProductView.run(11, today, 12);

console.log('✅ Database setup completed successfully!');
console.log('📊 Demo data inserted');
console.log(`👤 Admin user created: ${adminUsername}`);

if (!process.env.ADMIN_PASSWORD) {
  console.log(`🔐 Generated admin password: ${adminPassword}`);
}

console.log('🚀 You can now run: npm run dev');

db.close();
