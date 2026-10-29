import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { Product, Category, Order, SiteSettings, ContactMessage, CommissionRequest, JournalArticle } from './src/types/index.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const UPLOADS_DIR = path.resolve(process.cwd(), 'public/uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// In-memory token store for active sessions
interface Session {
  token: string;
  userId: string;
  email: string;
  role: string;
  expiresAt: number;
}
const activeSessions = new Map<string, Session>();

// Cryptographic helpers
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Database initial structure
interface DatabaseSchema {
  categories: Category[];
  products: Product[];
  orders: Order[];
  settings: SiteSettings;
  contactMessages: ContactMessage[];
  commissions: CommissionRequest[];
  journalArticles: JournalArticle[];
  users: Array<{
    id: string;
    email: string;
    passwordHash: string;
    salt: string;
    name: string;
    role: 'admin' | 'superadmin';
    createdAt: string;
  }>;
}

const REQUIRED_ADMIN_EMAIL = 'admin@artistictouch.com';
const REQUIRED_ADMIN_PASSWORD = 'hagar6090@#';

function getInitialJournalArticles(): JournalArticle[] {
  return [
    {
      id: 'journal-1',
      title: 'The Art of Preserving Wild Botanicals & Caring for Resin Art',
      title_ar: 'فن تجفيف الزهور الطبيعية والعناية الفائقة بقطع الريزن اليدوية',
      slug: 'botanical-resin-care-guide',
      read_time: '4 min read',
      read_time_ar: 'قراءة في ٤ دقائق',
      category: 'Atelier Care Guide',
      category_ar: 'دليل العناية بالمرسم',
      excerpt: 'Discover how we hand-press seasonal Egyptian flora and the simple secrets to keeping your crystal resin trays gleaming for decades.',
      excerpt_ar: 'تعرفوا على أسلوبنا اليدوي في تجفيف زهور الموسم وكيفية الحفاظ على نقاء ولمعان صواني الريزن مدى الحياة.',
      content: 'Every petal embedded in our botanical pieces undergoes a meticulous 3-week moisture extraction process. To preserve your handmade tray:\n\n1. Clean only with a soft microfiber cloth and lukewarm water.\n2. Avoid abrasive sponges, harsh chemical cleaners, or dishwashers.\n3. Keep away from extreme heat sources (above 60°C) and prolonged direct summer desert sun.\n4. Apply a drop of mineral oil once a year to restore the brilliant satin gloss.',
      content_ar: 'تمر كل بتلة زهرة في قطعنا الفنية بمرحلة تجفيف دقيقة تستغرق ثلاثة أسابيع لسحب الرطوبة دون فقدان اللون.\n\nللحفاظ على قطعتك الفنية:\n١. نظفي السطح بقطعة قماش ناعمة من المايكروفايبر والماء الفاتر فقط.\n٢. تجنبي الإسفنج الخشن أو غسالات الصحون أو المنظفات الكيميائية القوية.\n٣. تجنبي وضع الأواني الساخنة جداً أو تعريضها لشمس الصيف الحارقة فترات طويلة.\n٤. نقطة خفيفة من الزيت الطبيعي مرة سنوياً تعيد للقطعة بريقها الساحر.',
      image: '/src/assets/images/handmade_resin_decor_1793303318148.jpg',
      published_at: new Date().toISOString(),
    },
    {
      id: 'journal-2',
      title: 'Deckled-Edge Cotton Journals: The Lost Poetry of Fine Stationery',
      title_ar: 'دفاتر الحواف القطنية يدوية الصنع: عودة لسحر القرطاسية الكلاسيكية',
      slug: 'deckled-cotton-paper-poetry',
      read_time: '5 min read',
      read_time_ar: 'قراءة في ٥ دقائق',
      category: 'Craftsmanship Story',
      category_ar: 'كواليس الحرفة',
      excerpt: 'Why raw deckled edges and 100% rag cotton create an unmatched fountain pen and watercolor journaling experience.',
      excerpt_ar: 'لماذا تمنح الحواف القطنية الطبيعية تجربة فريدة لا تُضاهى لمحبي الخط العربي والألوان المائية والتأمل.',
      content: 'In a digital world, feeling the tactile resistance of 300gsm cold-pressed cotton paper awakens creativity. The natural feathered deckle edges are formed by hand in a water mould, ensuring no two pages have identical textures. Archival inks will not bleed through, allowing watercolor washes and dip-pen calligraphy to dance effortlessly across every leaf.',
      content_ar: 'في عالم مليء بالشاشات، يُعيد ملمس الورق القطني الخام بوزن ٣٠٠ جرام متعة الكتابة والتأمل. تتشكل الحواف الطبيعية المشرشفة يدوياً داخل قوالب مائية خاصة لضمان تميز كل صفحة.\n\nهذه الأوراق الأرشيفية لا تنفذ منها أحبار أقلام الحبر أو ألوان الماء، مما يمنح الخطاط والرسام حرية إبداعية مطلقة.',
      image: '/src/assets/images/artistic_stationery_set_1793303318911.jpg',
      published_at: new Date().toISOString(),
    },
    {
      id: 'journal-3',
      title: 'Bridal Bouquet Preservation: Turning Your Wedding Flowers Into Art',
      title_ar: 'حفظ باقة ورد الزفاف: تحويل زهور ليلة العمر إلى تحفة فنية خالدة',
      slug: 'bridal-bouquet-preservation',
      read_time: '6 min read',
      read_time_ar: 'قراءة في ٦ دقائق',
      category: 'Bespoke Commissions',
      category_ar: 'طلبات خاصة',
      excerpt: 'How Hager immortalizes your most cherished memories into heirloom vanity trays and personalized gold-embossed shadow boxes.',
      excerpt_ar: 'كيف تحول هاجر باقة زهورك المحبوبة إلى صواني زينة راقية ومؤطرة بلمسات الذهب لتبقى ذكرى حية معك دائماً.',
      content: 'Your wedding bouquet represents one of the happiest days of your life. Instead of watching delicate blooms wilt, brides send their fresh flowers to our Cairo atelier within 48 hours. Hager arranges each blossom, embeds them into UV-stabilized crystal resin, and gilds the rim with champagne gold leaf along with the couple\'s wedding date.',
      content_ar: 'باقة زهور الزفاف تحمل أروع ذكريات العمر. بدلاً من أن تذبل، تستقبل هاجر زهورك في المرسم بالقاهرة خلال ٤٨ ساعة من حفل الزفاف، لتنسق كل زهرة بعناية داخل ريزن بلوري مقاوم للاصفرار وتطعم الحواف بورق الذهب مع تدوين تاريخ الزفاف وأسماء العروسين.',
      image: '/src/assets/images/artist_studio_craft_1793303319329.jpg',
      published_at: new Date().toISOString(),
    },
  ];
}

function getInitialDatabase(): DatabaseSchema {
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(REQUIRED_ADMIN_PASSWORD, salt);

  const initialCategories: Category[] = [
    {
      id: 'cat-art-supplies',
      name: 'Art Supplies & Tools',
      name_ar: 'أدوات ومستلزمات فنية',
      slug: 'art-supplies-tools',
      description: 'Handcrafted brushes, professional pigments, and fine artist supplies.',
      description_ar: 'فرش فنية يدوية الصنع وألوان احترافية وأدوات فنية راقية.',
      image: '/src/assets/images/art_supplies_collection_1793303317410.jpg',
      order: 1,
      is_published: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'cat-botanical-resin',
      name: 'Botanical & Resin Art',
      name_ar: 'إبداعات الريزن والزهور',
      slug: 'botanical-resin-art',
      description: 'Preserved botanicals, pressed blooms, and crystal-clear resin homeware.',
      description_ar: 'زهور طبيعية مجففة وريزن نقي مدمج بلمسات ذهبية عصرية.',
      image: '/src/assets/images/handmade_resin_decor_1793303318148.jpg',
      order: 2,
      is_published: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'cat-stationery',
      name: 'Fine Stationery & Journals',
      name_ar: 'قرطاسية ودفاتر فنية',
      slug: 'fine-stationery-journals',
      description: 'Deckle-edge handmade journals, wax seals, and calligraphy papers.',
      description_ar: 'دفاتر قطنية يدوية الصنع بلمسات شمعية وورق كلاسيكي فاخر.',
      image: '/src/assets/images/artistic_stationery_set_1793303318911.jpg',
      order: 3,
      is_published: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'cat-special-pieces',
      name: 'Custom Artworks & Keepsakes',
      name_ar: 'قطع مخصصة وتذكارية',
      slug: 'custom-artworks-keepsakes',
      description: 'One-of-a-kind commissioned artworks and customized artistic keepsakes.',
      description_ar: 'لوحات فنية خاصة ومصنوعات تذكارية مصممة حسب الطلب.',
      image: '/src/assets/images/artist_studio_craft_1793303319329.jpg',
      order: 4,
      is_published: true,
      created_at: new Date().toISOString(),
    },
  ];

  const initialProducts: Product[] = [
    {
      id: 'prod-resin-botanical-tray',
      name: 'Artisan Botanical Pressed Flower Resin Tray',
      name_ar: 'صينية ريزن بالزهور الطبيعية والذهب',
      slug: 'artisan-botanical-resin-tray',
      short_description: 'Hand-poured crystal resin with handpicked preserved petals and genuine gold leaf rim.',
      short_description_ar: 'ريزن نقي مصبوب يدوياً مع بتلات زهور طبيعية مجففة وحواف من ورق الذهب الأصلي.',
      description: 'Individually cast and polished in our atelier, this sculptural botanical tray captures the ephemeral beauty of wild blooms suspended in crystal-clear resin. Every tray features a subtly organic scalloped rim finished with champagne gold detailing. Ideal as a refined vanity tray, centerpiece, or jewelry holder.',
      description_ar: 'قطعة فنية فريدة مصبوبة ومصقولة يدوياً في مرسمنا. تحتضن بتلات الزهور البرية في ريزن شفاف فائق النقاء بحواف طبيعية مموجة ومطعمة بذهب الشمبانيا. مثالية كصينية ديكور راقية أو لحفظ المجوهرات.',
      price: 850,
      original_price: 980,
      currency: 'EGP',
      category_id: 'cat-botanical-resin',
      sku: 'AT-RESIN-01',
      stock_quantity: 8,
      track_inventory: true,
      is_featured: true,
      is_published: true,
      images: [
        '/src/assets/images/handmade_resin_decor_1793303318148.jpg',
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-sable-brush-set',
      name: 'Masterclass Sable Fine Art Brushes & Pigment Trio',
      name_ar: 'مجموعة فرش فنية فاخرة مع ألوان غواش',
      slug: 'masterclass-sable-fine-art-brushes',
      short_description: 'Hand-tied artist brushes with brass ferrules and artisanal pastel gouache tubes.',
      short_description_ar: 'فرش فنية مصنوعة يدوياً مع حلقات نحاسية ذهبية وألوان غواش ناعمة.',
      description: 'Crafted for serious watercolorists and illustrators, this curated set includes hand-tied natural sable hair brushes that hold generous pigment loads with razor-sharp tip precision, alongside 3 artist-grade pastel gouache tubes.',
      description_ar: 'صُممت خصيصاً لمحبي ألوان الماء والرسامين المحترفين. تحتوي المجموعة على فرش ناعمة مربوطة يدوياً بحلقات نحاسية دقيقة تحتفظ باللون وتمنح تحكماً فائقاً في أدق التفاصيل.',
      price: 1250,
      original_price: 1450,
      currency: 'EGP',
      category_id: 'cat-art-supplies',
      sku: 'AT-BRUSH-04',
      stock_quantity: 12,
      track_inventory: true,
      is_featured: true,
      is_published: true,
      images: [
        '/src/assets/images/art_supplies_collection_1793303317410.jpg',
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-deckle-journal',
      name: 'Handmade Deckle-Edge Cotton Journal with Wax Seal',
      name_ar: 'دفتر فني يدوي الصنع بحواف قطنية وخاتم شمعي',
      slug: 'handmade-deckle-edge-cotton-journal',
      short_description: '300gsm cold-pressed cotton paper with gold-stamped cover and vintage rose wax seal.',
      short_description_ar: 'ورق قطني يدوي 300 جرام بحواف كلاسيكية وخاتم شمعي بلون الورد العتيق.',
      description: 'Bound by hand using archival cotton paper with natural deckled edges. Perfect for fountain pen calligraphy, watercolor sketches, or journaling sacred thoughts. Finished with satin ribbon and an authentic rose crest wax seal.',
      description_ar: 'مجلّد يدوياً بأوراق قطنية نقية ذات حواف طبيعية خشنة تحتفظ برونق القرطاسية الكلاسيكية، ومناسبة لأحبار الخط والرسم بالألوان المائية. مزود برباط حريري وخاتم شمعي أصيل.',
      price: 620,
      original_price: 700,
      currency: 'EGP',
      category_id: 'cat-stationery',
      sku: 'AT-JOURNAL-02',
      stock_quantity: 15,
      track_inventory: true,
      is_featured: true,
      is_published: true,
      images: [
        '/src/assets/images/artistic_stationery_set_1793303318911.jpg',
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  return {
    categories: initialCategories,
    products: initialProducts,
    orders: [], // Real database starts with 0 fabricated orders!
    contactMessages: [],
    commissions: [],
    journalArticles: getInitialJournalArticles(),
    settings: {
      announcement_bar_text: 'Welcome to Artistic Touch #Hager — Every creation has a story. Worldwide inspiration, nationwide delivery.',
      announcement_bar_text_ar: 'أهلاً بكم في آرتيستك تاتش #هاجر — كل لمسة فنية وراها حكاية. شحن لجميع أنحاء الجمهورية.',
      announcement_bar_enabled: true,
      hero_headline: 'Every Creation Has a Story.',
      hero_headline_ar: 'كل لمسة فنية وراها حكاية.',
      hero_subheadline: 'Discover a world of creativity, color, and carefully crafted artistic details.',
      hero_subheadline_ar: 'اكتشفوا عالم من الإبداع والألوان والتفاصيل الفنية المميزة.',
      hero_image: '/src/assets/images/hero_artist_atelier_1793303316706.jpg',
      brand_story: 'Founded by artist Hager, Artistic Touch embodies a commitment to tactile luxury, timeless beauty, and thoughtful craftsmanship. We create handmade treasures, bespoke resin designs, and carefully curated art materials designed to awaken the creator in you.',
      brand_story_ar: 'تأسست علامة آرتيستك تاتش على يد الفنانة هاجر لتجسد الشغف بالجمال الأصيل والتفاصيل الفنية المتقنة. نقدم قطعاً يدوية فريدة، وإبداعات ريزن طبيعية، ومواد فنية مختارة بعناية لتلهم كل محب للفن والإبداع.',
      about_philosophy: 'We believe art is not merely an object, but a tangible feeling. Each brushstroke, pressed bloom, and gold flake is applied by hand with intention and heart.',
      about_philosophy_ar: 'نؤمن أن الفن ليس مجرد منتج، بل إحساس ملموس. كل لمسة فرشاة، وكل بتلة زهرة، وكل تفصيلة ذهبية تُصنع يدوياً بحب وشغف.',
      whatsapp_number: '+201023456789',
      contact_email: 'hello@artistictouch.art',
      contact_phone: '+20 102 345 6789',
      contact_address: 'Cairo, Egypt — Atelier Studio',
      instagram_url: 'https://instagram.com/artistictouch.hager',
      facebook_url: 'https://facebook.com/artistictouch.hager',
      tiktok_url: '',
      pinterest_url: '',
      currency: 'EGP',
      default_language: 'en',
    },
    users: [
      {
        id: 'usr-admin-1',
        email: 'admin@artistictouch.com',
        passwordHash,
        salt,
        name: 'Hager',
        role: 'superadmin',
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

// Database Read / Write operations
function readDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialDatabase();
      writeDatabase(initial);
      return initial;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data) as DatabaseSchema;
    if (!parsed.commissions) parsed.commissions = [];
    if (!parsed.journalArticles) parsed.journalArticles = getInitialJournalArticles();
    if (!parsed.users) parsed.users = [];

    // Enforce official admin credentials strictly: admin@artistictouch.com / hagar6090@#
    let adminUser = parsed.users.find(u => u.email.toLowerCase() === REQUIRED_ADMIN_EMAIL);
    const expectedHash = adminUser ? hashPassword(REQUIRED_ADMIN_PASSWORD, adminUser.salt) : null;
    if (!adminUser || adminUser.passwordHash !== expectedHash) {
      const newSalt = crypto.randomBytes(16).toString('hex');
      const newHash = hashPassword(REQUIRED_ADMIN_PASSWORD, newSalt);
      if (!adminUser) {
        adminUser = {
          id: 'usr-admin-1',
          email: REQUIRED_ADMIN_EMAIL,
          passwordHash: newHash,
          salt: newSalt,
          name: 'Hager',
          role: 'superadmin',
          createdAt: new Date().toISOString(),
        };
        parsed.users.push(adminUser);
      } else {
        adminUser.salt = newSalt;
        adminUser.passwordHash = newHash;
      }
      writeDatabase(parsed);
    }

    return parsed;
  } catch (err) {
    console.error('Error reading database file, resetting to initial:', err);
    const initial = getInitialDatabase();
    writeDatabase(initial);
    return initial;
  }
}

function writeDatabase(data: DatabaseSchema): void {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

// Initialize database file on startup
readDatabase();

// Middleware
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Auth verification helper
function authenticateAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.substring(7);
  const session = activeSessions.get(token);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized: Session invalid or expired' });
  }

  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return res.status(401).json({ error: 'Unauthorized: Session expired, please sign in again' });
  }

  (req as any).user = session;
  next();
}

// -------------------------------------------------------------
// PUBLIC API ROUTES
// -------------------------------------------------------------

// Site Settings
app.get('/api/settings', (req, res) => {
  const db = readDatabase();
  res.json({ success: true, settings: db.settings });
});

// Categories (Public: published only)
app.get('/api/categories', (req, res) => {
  const db = readDatabase();
  const publishedCategories = db.categories
    .filter(c => c.is_published)
    .sort((a, b) => a.order - b.order)
    .map(c => {
      const count = db.products.filter(p => p.category_id === c.id && p.is_published).length;
      return { ...c, product_count: count };
    });
  res.json({ success: true, categories: publishedCategories });
});

// Products (Public: published only)
app.get('/api/products', (req, res) => {
  const db = readDatabase();
  let list = db.products.filter(p => p.is_published);

  const { category, search, sort, featured } = req.query;

  if (featured === 'true') {
    list = list.filter(p => p.is_featured);
  }

  if (category && typeof category === 'string' && category !== 'all') {
    list = list.filter(p => p.category_id === category);
  }

  if (search && typeof search === 'string' && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.name_ar && p.name_ar.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  }

  if (sort === 'price-asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (sort === 'name-asc') {
    list.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // default: newest
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  res.json({ success: true, products: list });
});

// Single Product by slug or id
app.get('/api/products/:slugOrId', (req, res) => {
  const db = readDatabase();
  const param = req.params.slugOrId;
  const product = db.products.find(p => (p.slug === param || p.id === param) && p.is_published);

  if (!product) {
    return res.status(404).json({ error: 'Product not found or unavailable' });
  }

  // Related products from same category
  const related = db.products
    .filter(p => p.category_id === product.category_id && p.id !== product.id && p.is_published)
    .slice(0, 3);

  // Category info
  const category = db.categories.find(c => c.id === product.category_id);

  res.json({ success: true, product, category, related });
});

// Create Order (Cart Checkout / WhatsApp Order Record)
app.post('/api/orders', (req, res) => {
  const db = readDatabase();
  const { customer_name, customer_email, customer_phone, customer_address, notes, items, payment_method } = req.body;

  if (!customer_name || !customer_phone || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Missing required order details (name, phone, items)' });
  }

  // Calculate order total and verify stock
  let total_amount = 0;
  const verifiedItems: Array<{
    product_id: string;
    product_name: string;
    price: number;
    quantity: number;
    image?: string;
  }> = [];

  for (const item of items) {
    const prod = db.products.find(p => p.id === item.product_id);
    if (!prod) {
      return res.status(400).json({ error: `Product ${item.product_name || item.product_id} no longer exists` });
    }
    if (!prod.is_published) {
      return res.status(400).json({ error: `Product "${prod.name}" is currently not available` });
    }
    if (prod.track_inventory && prod.stock_quantity < item.quantity) {
      return res.status(400).json({
        error: `Insufficient stock for "${prod.name}". Available: ${prod.stock_quantity}`
      });
    }

    const itemTotal = prod.price * item.quantity;
    total_amount += itemTotal;

    verifiedItems.push({
      product_id: prod.id,
      product_name: prod.name,
      price: prod.price,
      quantity: item.quantity,
      image: prod.images?.[0] || '',
    });

    // Decrement stock if inventory tracking is enabled
    if (prod.track_inventory) {
      prod.stock_quantity = Math.max(0, prod.stock_quantity - item.quantity);
      prod.updated_at = new Date().toISOString();
    }
  }

  const orderNumber = `AT-${Date.now().toString().slice(-6)}`;
  const newOrder: Order = {
    id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    order_number: orderNumber,
    customer_name: customer_name.trim(),
    customer_email: (customer_email || '').trim(),
    customer_phone: customer_phone.trim(),
    customer_address: (customer_address || '').trim(),
    notes: (notes || '').trim(),
    items: verifiedItems,
    total_amount,
    currency: db.settings.currency || 'EGP',
    status: 'pending',
    payment_method: payment_method || 'cod',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.orders.unshift(newOrder);
  writeDatabase(db);

  res.status(201).json({ success: true, order: newOrder });
});

// Contact Form Inquiries
app.post('/api/contact', (req, res) => {
  const db = readDatabase();
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  const newMsg: ContactMessage = {
    id: `msg-${Date.now()}`,
    name: name.trim(),
    email: email.trim(),
    phone: (phone || '').trim(),
    message: message.trim(),
    created_at: new Date().toISOString(),
    read: false,
  };

  db.contactMessages.unshift(newMsg);
  writeDatabase(db);

  res.status(201).json({ success: true, message: 'Message sent successfully. Thank you for contacting Artistic Touch.' });
});

// Live Order Tracking (Customer lookup by Order Number or Phone)
app.get('/api/orders/track/:query', (req, res) => {
  const db = readDatabase();
  const rawQuery = req.params.query.trim().toLowerCase();
  const cleanPhone = rawQuery.replace(/[^\d]/g, '');

  const order = db.orders.find(o =>
    o.order_number.toLowerCase() === rawQuery ||
    (cleanPhone.length >= 8 && o.customer_phone.replace(/[^\d]/g, '').includes(cleanPhone))
  );

  if (!order) {
    return res.status(404).json({ error: 'No order found with this reference. Please check your order number or phone.' });
  }

  res.json({
    success: true,
    order: {
      id: order.id,
      order_number: order.order_number,
      customer_name: order.customer_name,
      status: order.status,
      items: order.items,
      total_amount: order.total_amount,
      currency: order.currency,
      created_at: order.created_at,
      updated_at: order.updated_at,
    },
  });
});

// Bespoke Commission Request Submission
app.post('/api/commissions', (req, res) => {
  const db = readDatabase();
  const { customer_name, customer_phone, customer_email, medium_type, color_palette, personalization_text, notes } = req.body;

  if (!customer_name || !customer_phone || !medium_type) {
    return res.status(400).json({ error: 'Name, phone number, and medium selection are required' });
  }

  const reqNumber = `BESPOKE-${Date.now().toString().slice(-6)}`;
  const newCommission: CommissionRequest = {
    id: `comm-${Date.now()}`,
    request_number: reqNumber,
    customer_name: customer_name.trim(),
    customer_phone: customer_phone.trim(),
    customer_email: (customer_email || '').trim(),
    medium_type: medium_type || 'resin_tray',
    color_palette: (color_palette || 'Blush & Gold').trim(),
    personalization_text: (personalization_text || '').trim(),
    notes: (notes || '').trim(),
    status: 'new',
    created_at: new Date().toISOString(),
  };

  db.commissions.unshift(newCommission);
  writeDatabase(db);

  res.status(201).json({ success: true, commission: newCommission });
});

// Atelier Journal & Care Guides
app.get('/api/journal', (req, res) => {
  const db = readDatabase();
  res.json({ success: true, articles: db.journalArticles || [] });
});

// -------------------------------------------------------------
// ADMIN AUTHENTICATION
// -------------------------------------------------------------

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanPassword = String(password);

  // Strict check requested by user:
  // "ده الاميل admin@artistictouch.com
  // ,ده password hagar6090@#
  // اي حد يدخل اميل او باسورد غير ده ميدخلش معاه"
  if (cleanEmail !== REQUIRED_ADMIN_EMAIL || cleanPassword !== REQUIRED_ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const db = readDatabase();
  const user = db.users.find(u => u.email.toLowerCase() === REQUIRED_ADMIN_EMAIL);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Generate session token (valid for 7 days)
  const token = generateToken();
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  activeSessions.set(token, {
    token,
    userId: user.id,
    email: user.email,
    role: user.role,
    expiresAt,
  });

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
});

app.post('/api/admin/logout', authenticateAdmin, (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    activeSessions.delete(token);
  }
  res.json({ success: true });
});

app.get('/api/admin/me', authenticateAdmin, (req, res) => {
  const user = (req as any).user;
  res.json({ success: true, user });
});

app.put('/api/admin/change-password', authenticateAdmin, (req, res) => {
  const db = readDatabase();
  const userSession = (req as any).user;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long' });
  }

  const user = db.users.find(u => u.id === userSession.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const currentHash = hashPassword(currentPassword, user.salt);
  if (currentHash !== user.passwordHash) {
    return res.status(400).json({ error: 'Incorrect current password' });
  }

  const newSalt = crypto.randomBytes(16).toString('hex');
  user.salt = newSalt;
  user.passwordHash = hashPassword(newPassword, newSalt);

  writeDatabase(db);
  res.json({ success: true, message: 'Password updated successfully' });
});

// -------------------------------------------------------------
// ADMIN DASHBOARD & ANALYTICS
// -------------------------------------------------------------

app.get('/api/admin/analytics', authenticateAdmin, (req, res) => {
  const db = readDatabase();

  const totalProducts = db.products.length;
  const activeProducts = db.products.filter(p => p.is_published).length;
  const totalCategories = db.categories.length;
  const outOfStockCount = db.products.filter(p => p.track_inventory && p.stock_quantity <= 0).length;

  const totalOrders = db.orders.length;
  const totalRevenue = db.orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const pendingOrders = db.orders.filter(o => o.status === 'pending').length;
  const confirmedOrders = db.orders.filter(o => o.status === 'confirmed').length;

  res.json({
    success: true,
    stats: {
      total_products: totalProducts,
      active_products: activeProducts,
      total_categories: totalCategories,
      out_of_stock_count: outOfStockCount,
      total_orders: totalOrders,
      total_revenue: totalRevenue,
      pending_orders: pendingOrders,
      confirmed_orders: confirmedOrders,
      recent_products: db.products.slice(0, 5),
      recent_orders: db.orders.slice(0, 5),
      currency: db.settings.currency || 'EGP',
    },
  });
});

// -------------------------------------------------------------
// ADMIN PRODUCT MANAGEMENT (CRUD)
// -------------------------------------------------------------

// List all products (including unpublished)
app.get('/api/admin/products', authenticateAdmin, (req, res) => {
  const db = readDatabase();
  res.json({ success: true, products: db.products });
});

// Create product
app.post('/api/admin/products', authenticateAdmin, (req, res) => {
  const db = readDatabase();
  const {
    name,
    name_ar,
    slug,
    short_description,
    short_description_ar,
    description,
    description_ar,
    price,
    original_price,
    currency,
    category_id,
    sku,
    stock_quantity,
    track_inventory,
    is_featured,
    is_published,
    images,
  } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Product name is required' });
  }

  const numericPrice = parseFloat(price);
  if (isNaN(numericPrice) || numericPrice < 0) {
    return res.status(400).json({ error: 'Selling price must be a valid non-negative number' });
  }

  let finalOriginalPrice: number | undefined = undefined;
  if (original_price !== undefined && original_price !== null && original_price !== '') {
    const numOrig = parseFloat(original_price);
    if (isNaN(numOrig) || numOrig < 0) {
      return res.status(400).json({ error: 'Original price must be a valid non-negative number' });
    }
    finalOriginalPrice = numOrig;
  }

  const generatedSlug = (slug || name)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');

  // Verify unique slug
  let uniqueSlug = generatedSlug || `product-${Date.now()}`;
  let count = 1;
  while (db.products.some(p => p.slug === uniqueSlug)) {
    uniqueSlug = `${generatedSlug}-${count++}`;
  }

  const newProduct: Product = {
    id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    name_ar: (name_ar || '').trim(),
    slug: uniqueSlug,
    short_description: (short_description || '').trim(),
    short_description_ar: (short_description_ar || '').trim(),
    description: (description || '').trim(),
    description_ar: (description_ar || '').trim(),
    price: numericPrice,
    original_price: finalOriginalPrice,
    currency: currency || db.settings.currency || 'EGP',
    category_id: category_id || (db.categories[0]?.id ?? ''),
    sku: (sku || '').trim(),
    stock_quantity: track_inventory ? Math.max(0, parseInt(stock_quantity || 0, 10)) : 999,
    track_inventory: Boolean(track_inventory),
    is_featured: Boolean(is_featured),
    is_published: Boolean(is_published),
    images: Array.isArray(images) && images.length > 0 ? images : ['/assets/aistudio/Artistic_Touch_Gold_Badge_Logo_4af8445d.png'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.products.unshift(newProduct);
  writeDatabase(db);

  res.status(201).json({ success: true, product: newProduct });
});

// Update product
app.put('/api/admin/products/:id', authenticateAdmin, (req, res) => {
  const db = readDatabase();
  const id = req.params.id;
  const index = db.products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const existing = db.products[index];
  const updates = req.body;

  if (updates.name !== undefined) {
    if (!updates.name.trim()) {
      return res.status(400).json({ error: 'Product name cannot be empty' });
    }
    existing.name = updates.name.trim();
  }

  if (updates.price !== undefined) {
    const numPrice = parseFloat(updates.price);
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ error: 'Price must be a valid non-negative number' });
    }
    existing.price = numPrice;
  }

  if (updates.original_price !== undefined) {
    if (updates.original_price === null || updates.original_price === '') {
      existing.original_price = undefined;
    } else {
      const numOrig = parseFloat(updates.original_price);
      if (isNaN(numOrig) || numOrig < 0) {
        return res.status(400).json({ error: 'Original price must be a valid non-negative number' });
      }
      existing.original_price = numOrig;
    }
  }

  if (updates.slug !== undefined && updates.slug.trim() !== '') {
    const newSlug = updates.slug.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    if (db.products.some(p => p.slug === newSlug && p.id !== id)) {
      return res.status(400).json({ error: 'This slug is already used by another product' });
    }
    existing.slug = newSlug;
  }

  if (updates.name_ar !== undefined) existing.name_ar = updates.name_ar;
  if (updates.short_description !== undefined) existing.short_description = updates.short_description;
  if (updates.short_description_ar !== undefined) existing.short_description_ar = updates.short_description_ar;
  if (updates.description !== undefined) existing.description = updates.description;
  if (updates.description_ar !== undefined) existing.description_ar = updates.description_ar;
  if (updates.category_id !== undefined) existing.category_id = updates.category_id;
  if (updates.sku !== undefined) existing.sku = updates.sku;
  if (updates.track_inventory !== undefined) existing.track_inventory = Boolean(updates.track_inventory);
  if (updates.stock_quantity !== undefined) existing.stock_quantity = Math.max(0, parseInt(updates.stock_quantity || 0, 10));
  if (updates.is_featured !== undefined) existing.is_featured = Boolean(updates.is_featured);
  if (updates.is_published !== undefined) existing.is_published = Boolean(updates.is_published);
  if (updates.images !== undefined && Array.isArray(updates.images)) existing.images = updates.images;

  existing.updated_at = new Date().toISOString();

  db.products[index] = existing;
  writeDatabase(db);

  res.json({ success: true, product: existing });
});

// Delete product
app.delete('/api/admin/products/:id', authenticateAdmin, (req, res) => {
  const db = readDatabase();
  const id = req.params.id;
  const initialLength = db.products.length;
  db.products = db.products.filter(p => p.id !== id);

  if (db.products.length === initialLength) {
    return res.status(404).json({ error: 'Product not found' });
  }

  writeDatabase(db);
  res.json({ success: true, message: 'Product deleted successfully' });
});

// Duplicate product
app.post('/api/admin/products/:id/duplicate', authenticateAdmin, (req, res) => {
  const db = readDatabase();
  const id = req.params.id;
  const original = db.products.find(p => p.id === id);

  if (!original) {
    return res.status(404).json({ error: 'Original product not found' });
  }

  const duplicated: Product = {
    ...original,
    id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: `${original.name} (Copy)`,
    name_ar: original.name_ar ? `${original.name_ar} (نسخة)` : undefined,
    slug: `${original.slug}-copy-${Date.now().toString().slice(-4)}`,
    is_published: false, // draft on duplicate
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.products.unshift(duplicated);
  writeDatabase(db);

  res.status(201).json({ success: true, product: duplicated });
});

// -------------------------------------------------------------
// ADMIN CATEGORY MANAGEMENT (CRUD)
// -------------------------------------------------------------

app.get('/api/admin/categories', authenticateAdmin, (req, res) => {
  const db = readDatabase();
  const categoriesWithCount = db.categories.map(c => {
    const count = db.products.filter(p => p.category_id === c.id).length;
    return { ...c, product_count: count };
  });
  res.json({ success: true, categories: categoriesWithCount });
});

app.post('/api/admin/categories', authenticateAdmin, (req, res) => {
  const db = readDatabase();
  const { name, name_ar, slug, description, description_ar, image, is_published } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const generatedSlug = (slug || name)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');

  let uniqueSlug = generatedSlug || `category-${Date.now()}`;
  let count = 1;
  while (db.categories.some(c => c.slug === uniqueSlug)) {
    uniqueSlug = `${generatedSlug}-${count++}`;
  }

  const newCategory: Category = {
    id: `cat-${Date.now()}`,
    name: name.trim(),
    name_ar: (name_ar || '').trim(),
    slug: uniqueSlug,
    description: (description || '').trim(),
    description_ar: (description_ar || '').trim(),
    image: image || '/src/assets/images/hero_artist_atelier_1793303316706.jpg',
    order: db.categories.length + 1,
    is_published: is_published !== false,
    created_at: new Date().toISOString(),
  };

  db.categories.push(newCategory);
  writeDatabase(db);

  res.status(201).json({ success: true, category: newCategory });
});

app.put('/api/admin/categories/:id', authenticateAdmin, (req, res) => {
  const db = readDatabase();
  const id = req.params.id;
  const index = db.categories.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Category not found' });
  }

  const existing = db.categories[index];
  const updates = req.body;

  if (updates.name !== undefined) {
    if (!updates.name.trim()) {
      return res.status(400).json({ error: 'Category name cannot be empty' });
    }
    existing.name = updates.name.trim();
  }
  if (updates.name_ar !== undefined) existing.name_ar = updates.name_ar;
  if (updates.description !== undefined) existing.description = updates.description;
  if (updates.description_ar !== undefined) existing.description_ar = updates.description_ar;
  if (updates.image !== undefined) existing.image = updates.image;
  if (updates.order !== undefined) existing.order = parseInt(updates.order, 10);
  if (updates.is_published !== undefined) existing.is_published = Boolean(updates.is_published);

  db.categories[index] = existing;
  writeDatabase(db);

  res.json({ success: true, category: existing });
});

app.delete('/api/admin/categories/:id', authenticateAdmin, (req, res) => {
  const db = readDatabase();
  const id = req.params.id;

  // Safeguard: Check if products belong to this category
  const productCount = db.products.filter(p => p.category_id === id).length;
  if (productCount > 0 && req.query.force !== 'true') {
    return res.status(400).json({
      error: `Cannot delete category: ${productCount} product(s) are assigned to it. Please reassign or delete these products first, or pass force=true.`
    });
  }

  // If force deleting, reassign products to uncategorized or default
  if (productCount > 0 && req.query.force === 'true') {
    const fallbackCategory = db.categories.find(c => c.id !== id);
    db.products.forEach(p => {
      if (p.category_id === id) {
        p.category_id = fallbackCategory ? fallbackCategory.id : '';
      }
    });
  }

  db.categories = db.categories.filter(c => c.id !== id);
  writeDatabase(db);

  res.json({ success: true, message: 'Category deleted successfully' });
});

// -------------------------------------------------------------
// ADMIN ORDER MANAGEMENT
// -------------------------------------------------------------

app.get('/api/admin/orders', authenticateAdmin, (req, res) => {
  const db = readDatabase();
  res.json({ success: true, orders: db.orders });
});

app.put('/api/admin/orders/:id/status', authenticateAdmin, (req, res) => {
  const db = readDatabase();
  const id = req.params.id;
  const { status } = req.body;

  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const order = db.orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // If order was cancelled and now reopened, or cancelled from active, handle inventory return
  if (status === 'cancelled' && order.status !== 'cancelled') {
    // Return items to inventory
    for (const item of order.items) {
      const prod = db.products.find(p => p.id === item.product_id);
      if (prod && prod.track_inventory) {
        prod.stock_quantity += item.quantity;
      }
    }
  }

  order.status = status;
  order.updated_at = new Date().toISOString();

  writeDatabase(db);
  res.json({ success: true, order });
});

// -------------------------------------------------------------
// ADMIN SETTINGS MANAGEMENT
// -------------------------------------------------------------

app.put('/api/admin/settings', authenticateAdmin, (req, res) => {
  const db = readDatabase();
  const updates = req.body;

  db.settings = {
    ...db.settings,
    ...updates,
  };

  writeDatabase(db);
  res.json({ success: true, settings: db.settings });
});

// -------------------------------------------------------------
// ADMIN IMAGE UPLOADS
// -------------------------------------------------------------

app.post('/api/admin/upload', authenticateAdmin, (req, res) => {
  const { imageBase64, filename, contentType } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'Missing imageBase64 data' });
  }

  try {
    // Clean base64 string
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Determine extension
    let ext = '.jpg';
    if (contentType?.includes('png')) ext = '.png';
    else if (contentType?.includes('webp')) ext = '.webp';
    else if (filename?.endsWith('.png')) ext = '.png';
    else if (filename?.endsWith('.webp')) ext = '.webp';

    const safeName = `art_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const targetPath = path.join(UPLOADS_DIR, safeName);

    fs.writeFileSync(targetPath, buffer);

    const publicUrl = `/uploads/${safeName}`;
    res.json({ success: true, url: publicUrl, filename: safeName });
  } catch (err: any) {
    console.error('Upload failed:', err);
    res.status(500).json({ error: 'Failed to save uploaded image: ' + err.message });
  }
});

// Inquiries / Messages
app.get('/api/admin/messages', authenticateAdmin, (req, res) => {
  const db = readDatabase();
  res.json({ success: true, messages: db.contactMessages });
});

app.put('/api/admin/messages/:id/read', authenticateAdmin, (req, res) => {
  const db = readDatabase();
  const msg = db.contactMessages.find(m => m.id === req.params.id);
  if (msg) {
    msg.read = true;
    writeDatabase(db);
  }
  res.json({ success: true });
});

// Admin Commissions Management
app.get('/api/admin/commissions', authenticateAdmin, (req, res) => {
  const db = readDatabase();
  res.json({ success: true, commissions: db.commissions || [] });
});

app.put('/api/admin/commissions/:id/status', authenticateAdmin, (req, res) => {
  const db = readDatabase();
  const comm = (db.commissions || []).find(c => c.id === req.params.id);
  if (!comm) {
    return res.status(404).json({ error: 'Commission request not found' });
  }
  comm.status = req.body.status;
  writeDatabase(db);
  res.json({ success: true, commission: comm });
});

// -------------------------------------------------------------
// STATIC & VITE MIDDLEWARE
// -------------------------------------------------------------

// Serve uploaded assets directly
app.use('/uploads', express.static(UPLOADS_DIR));

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the built dist directory
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Artistic Touch #Hager] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
