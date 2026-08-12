import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import Product from '../models/Product';
import Category from '../models/Category';

// =====================================================
// GoalKart 50 Football Products Seed Data
// =====================================================

const CATEGORIES = [
  { name: 'Match Balls & Footballs', description: 'Match balls, training balls, and mini footballs for all skill levels.' },
  { name: 'Football Boots & Shoes', description: 'Beginner to elite firm ground boots, turf, and indoor football shoes.' },
  { name: 'Jerseys & Apparel', description: 'Official match jerseys, training tees, jackets, shorts, and performance wear.' },
  { name: 'Shin Guards & GK Gear', description: 'Junior and senior shin guards, pro goalkeeper gloves, and protection.' },
  { name: 'Training Equipment', description: 'Agility ladders, cones, bib sets, resistance bands, and fitness tools.' },
  { name: 'Bags & Pitch Accessories', description: 'Backpacks, boot bags, pumps, water bottles, captain armbands, and pitch gear.' },
];

const PRODUCTS = [
  // ── Match Balls & Footballs ──────────────────────────────
  {
    name: 'GoalKart Club Football (Size 5)',
    description: 'Durable TPU cover with machine-stitched panels for casual matches and club practice sessions.',
    price: 899,
    category: 'Match Balls & Footballs',
    images: ['/products/ball-club-size5.png'],
    stock: 50, sku: 'GK-BAL-001', brand: 'GoalKart', ratingsAverage: 4.6, ratingsCount: 120,
  },
  {
    name: 'GoalKart Pro Match Football',
    description: 'FIFA Quality approved thermally-bonded match ball with aerodynamic groove texture.',
    price: 1499, discountPrice: 1299,
    category: 'Match Balls & Footballs',
    images: ['/products/ball-pro-match.png'],
    stock: 35, sku: 'GK-BAL-002', brand: 'GoalKart', ratingsAverage: 4.9, ratingsCount: 245,
  },
  {
    name: 'Training Football (Size 4)',
    description: 'Size 4 football for youth players and academy training drills.',
    price: 799,
    category: 'Match Balls & Footballs',
    images: ['/products/ball-training-size4.png'],
    stock: 40, sku: 'GK-BAL-003', brand: 'GoalKart', ratingsAverage: 4.4, ratingsCount: 88,
  },
  {
    name: 'Mini Football',
    description: 'Compact skill ball for ball control practice, juggling drills, and kids.',
    price: 499,
    category: 'Match Balls & Footballs',
    images: ['/products/ball-mini.png'],
    stock: 60, sku: 'GK-BAL-004', brand: 'GoalKart', ratingsAverage: 4.5, ratingsCount: 62,
  },

  // ── Football Boots & Shoes ──────────────────────────────
  {
    name: 'Football Boots – Beginner',
    description: 'Comfortable entry-level firm ground boots with moulded studs for natural grass pitches.',
    price: 2499,
    category: 'Football Boots & Shoes',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'],
    stock: 30, sku: 'GK-BOT-001', brand: 'GoalKart', ratingsAverage: 4.3, ratingsCount: 75,
  },
  {
    name: 'Football Boots – Academy',
    description: 'Mid-range performance boots with textured upper for improved ball control.',
    price: 4999, discountPrice: 4499,
    category: 'Football Boots & Shoes',
    images: ['https://res.cloudinary.com/slg7aikj/image/upload/v1786553196/ChatGPT_Image_Aug_6_2026_11_08_00_PM.png'],
    stock: 25, sku: 'GK-BOT-002', brand: 'GoalKart', ratingsAverage: 4.7, ratingsCount: 112,
  },
  {
    name: 'Football Boots – Elite',
    description: 'Pro-tier ultra-lightweight carbon plate boots for maximum sprint acceleration.',
    price: 8999, discountPrice: 7999,
    category: 'Football Boots & Shoes',
    images: ['https://images.unsplash.com/photo-1511886929837-354d827aae26?w=600&q=80'],
    stock: 15, sku: 'GK-BOT-003', brand: 'GoalKart', ratingsAverage: 5.0, ratingsCount: 180,
  },
  {
    name: 'Indoor Football Shoes',
    description: 'Non-marking gum rubber sole for court traction and precision futsal control.',
    price: 2999,
    category: 'Football Boots & Shoes',
    images: ['https://res.cloudinary.com/slg7aikj/image/upload/v1786553677/ChatGPT_Image_Aug_6_2026_11_05_58_PM.png'],
    stock: 28, sku: 'GK-BOT-004', brand: 'GoalKart', ratingsAverage: 4.6, ratingsCount: 94,
  },
  {
    name: 'Turf Football Shoes',
    description: 'Multi-studded outsole designed for artificial turf grass fields.',
    price: 3999,
    category: 'Football Boots & Shoes',
    images: ['https://res.cloudinary.com/slg7aikj/image/upload/v1786553909/ChatGPT_Image_Aug_6_2026_11_03_10_PM.png'],
    stock: 32, sku: 'GK-BOT-005', brand: 'GoalKart', ratingsAverage: 4.5, ratingsCount: 81,
  },

  // ── Jerseys & Apparel ───────────────────────────────────
  {
    name: 'Football Jersey (Home)',
    description: 'Official GoalKart home match jersey with breathable dry-fit mesh panels.',
    price: 999,
    category: 'Jerseys & Apparel',
    images: ['https://images.unsplash.com/photo-1580087256394-dc596e1c8f4f?w=600&q=80'],
    stock: 55, sku: 'GK-APP-001', brand: 'GoalKart', ratingsAverage: 4.7, ratingsCount: 165,
  },
  {
    name: 'Football Jersey (Away)',
    description: 'Sleek away kit design with moisture-wicking technology.',
    price: 999,
    category: 'Jerseys & Apparel',
    images: ['https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=600&q=80'],
    stock: 50, sku: 'GK-APP-002', brand: 'GoalKart', ratingsAverage: 4.6, ratingsCount: 140,
  },
  {
    name: 'Premium Club Jersey',
    description: 'Authentic player-issue edition jersey with heat-applied badges and ergonomic athletic fit.',
    price: 1499, discountPrice: 1299,
    category: 'Jerseys & Apparel',
    images: ['https://images.unsplash.com/photo-1522670289-3b51d8f2e1dd?w=600&q=80'],
    stock: 35, sku: 'GK-APP-003', brand: 'GoalKart', ratingsAverage: 4.9, ratingsCount: 220,
  },
  {
    name: 'Goalkeeper Jersey',
    description: 'Padded elbow goalkeeper jersey with high-impact foam protection.',
    price: 1499,
    category: 'Jerseys & Apparel',
    images: ['https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80'],
    stock: 25, sku: 'GK-APP-004', brand: 'GoalKart', ratingsAverage: 4.8, ratingsCount: 95,
  },
  {
    name: 'Training T-Shirt',
    description: 'Lightweight performance t-shirt for gym sessions and pre-match warmups.',
    price: 799,
    category: 'Jerseys & Apparel',
    images: ['https://res.cloudinary.com/slg7aikj/image/upload/v1786556643/ChatGPT_Image_Aug_12_2026_11_13_44_PM.png'],
    stock: 65, sku: 'GK-APP-005', brand: 'GoalKart', ratingsAverage: 4.4, ratingsCount: 110,
  },
  {
    name: 'Polo T-Shirt',
    description: 'Smart casual team polo shirt with embroidered GoalKart crest.',
    price: 1199,
    category: 'Jerseys & Apparel',
    images: ['https://res.cloudinary.com/slg7aikj/image/upload/v1786556172/ChatGPT_Image_Aug_12_2026_11_05_54_PM.png'],
    stock: 40, sku: 'GK-APP-006', brand: 'GoalKart', ratingsAverage: 4.5, ratingsCount: 78,
  },
  {
    name: 'Training Shorts',
    description: 'Flexible football training shorts with elastic waistband and zip pockets.',
    price: 699,
    category: 'Jerseys & Apparel',
    images: ['https://res.cloudinary.com/slg7aikj/image/upload/v1786556172/ChatGPT_Image_Aug_12_2026_11_05_54_PM.png'],
    stock: 70, sku: 'GK-APP-007', brand: 'GoalKart', ratingsAverage: 4.3, ratingsCount: 130,
  },
  {
    name: 'Match Shorts',
    description: 'Lightweight match shorts designed for complete freedom of movement.',
    price: 799,
    category: 'Jerseys & Apparel',
    images: ['/products/match-shorts.jpg'],
    stock: 60, sku: 'GK-APP-008', brand: 'GoalKart', ratingsAverage: 4.6, ratingsCount: 88,
  },
  {
    name: 'Track Pants',
    description: 'Tapered slim-fit track pants with ankle zips for easy removal over boots.',
    price: 1299,
    category: 'Jerseys & Apparel',
    images: ['/products/track-pants.jpg'],
    stock: 45, sku: 'GK-APP-009', brand: 'GoalKart', ratingsAverage: 4.7, ratingsCount: 115,
  },
  {
    name: 'Training Jacket',
    description: 'Full-zip sidelines track jacket with wind-resistant fabric.',
    price: 2499, discountPrice: 2199,
    category: 'Jerseys & Apparel',
    images: ['/products/training-jacket.jpg'],
    stock: 30, sku: 'GK-APP-010', brand: 'GoalKart', ratingsAverage: 4.8, ratingsCount: 92,
  },
  {
    name: 'Hoodie',
    description: 'Cozy fleece-lined pullover hoodie for post-match recovery and travel.',
    price: 2199,
    category: 'Jerseys & Apparel',
    images: ['https://res.cloudinary.com/slg7aikj/image/upload/v1786555961/ChatGPT_Image_Aug_12_2026_11_02_14_PM.png'],
    stock: 35, sku: 'GK-APP-011', brand: 'GoalKart', ratingsAverage: 4.7, ratingsCount: 145,
  },
  {
    name: 'Windbreaker',
    description: 'Water-repellent lightweight jacket for stormy match days and rain training.',
    price: 2999,
    category: 'Jerseys & Apparel',
    images: ['https://res.cloudinary.com/slg7aikj/image/upload/v1786555871/ChatGPT_Image_Aug_12_2026_11_00_50_PM.png'],
    stock: 25, sku: 'GK-APP-012', brand: 'GoalKart', ratingsAverage: 4.6, ratingsCount: 64,
  },
  {
    name: 'Compression Shorts',
    description: 'Base layer compression shorts providing muscle support and preventing chafing.',
    price: 999,
    category: 'Jerseys & Apparel',
    images: ['/products/compression-shorts.jpg'],
    stock: 50, sku: 'GK-APP-013', brand: 'GoalKart', ratingsAverage: 4.5, ratingsCount: 105,
  },
  {
    name: 'Compression Calf Sleeves',
    description: 'Graduated compression calf sleeves to reduce leg fatigue and boost blood flow.',
    price: 799,
    category: 'Jerseys & Apparel',
    images: ['/products/compression-calf-sleeves.jpg'],
    stock: 55, sku: 'GK-APP-014', brand: 'GoalKart', ratingsAverage: 4.4, ratingsCount: 72,
  },
  {
    name: 'Football Socks',
    description: 'Knee-high cushioned football socks with arch support.',
    price: 349,
    category: 'Jerseys & Apparel',
    images: ['/products/football-socks.jpg'],
    stock: 120, sku: 'GK-APP-015', brand: 'GoalKart', ratingsAverage: 4.5, ratingsCount: 280,
  },
  {
    name: 'Grip Football Socks',
    description: 'Non-slip anti-blister grip socks to prevent foot slippage inside boots.',
    price: 699,
    category: 'Jerseys & Apparel',
    images: ['https://res.cloudinary.com/slg7aikj/image/upload/f_auto,q_auto/ChatGPT_Image_Aug_6_2026_11_17_53_PM'],
    stock: 90, sku: 'GK-APP-016', brand: 'GoalKart', ratingsAverage: 4.9, ratingsCount: 310,
  },
  {
    name: 'Football Gloves (Winter)',
    description: 'Thermal player gloves with silicone grip palm print for throw-ins.',
    price: 799,
    category: 'Jerseys & Apparel',
    images: ['https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80'],
    stock: 40, sku: 'GK-APP-017', brand: 'GoalKart', ratingsAverage: 4.3, ratingsCount: 51,
  },
  {
    name: 'Sports Cap',
    description: 'Adjustable moisture-wicking team cap for sunny training days.',
    price: 599,
    category: 'Jerseys & Apparel',
    images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80'],
    stock: 60, sku: 'GK-APP-018', brand: 'GoalKart', ratingsAverage: 4.2, ratingsCount: 68,
  },
  {
    name: 'Wrist Sweatbands',
    description: 'Cotton terry sweatbands for wiping sweat during high-tempo matches.',
    price: 299,
    category: 'Jerseys & Apparel',
    images: ['https://images.unsplash.com/photo-1562886812-41775a01195d?w=600&q=80'],
    stock: 80, sku: 'GK-APP-019', brand: 'GoalKart', ratingsAverage: 4.1, ratingsCount: 45,
  },

  // ── Shin Guards & GK Gear ───────────────────────────────
  {
    name: 'Shin Guards (Junior)',
    description: 'Lightweight tough shell shin guards tailored for youth players with padded backing.',
    price: 599,
    category: 'Shin Guards & GK Gear',
    images: ['/products/shin-guards-junior.jpg'],
    stock: 75, sku: 'GK-SHN-001', brand: 'GoalKart', ratingsAverage: 4.6, ratingsCount: 130,
  },
  {
    name: 'Shin Guards (Senior)',
    description: 'Ergonomic high-impact hard shell guards with compression sleeves.',
    price: 899,
    category: 'Shin Guards & GK Gear',
    images: ['/products/shin-guards-senior.jpg'],
    stock: 65, sku: 'GK-SHN-002', brand: 'GoalKart', ratingsAverage: 4.7, ratingsCount: 175,
  },
  {
    name: 'Goalkeeper Gloves (Training)',
    description: '3mm latex palm goalkeeper gloves suitable for synthetic turf and practice.',
    price: 1299,
    category: 'Shin Guards & GK Gear',
    images: ['/products/goalkeeper-gloves-training.jpg'],
    stock: 45, sku: 'GK-GKG-001', brand: 'GoalKart', ratingsAverage: 4.5, ratingsCount: 110,
  },
  {
    name: 'Goalkeeper Gloves (Professional)',
    description: '4mm German contact latex with finger protection spines for competitive match play.',
    price: 2499, discountPrice: 2199,
    category: 'Shin Guards & GK Gear',
    images: ['https://res.cloudinary.com/slg7aikj/image/upload/v1786555593/ChatGPT_Image_Aug_12_2026_10_56_08_PM.png'],
    stock: 25, sku: 'GK-GKG-002', brand: 'GoalKart', ratingsAverage: 4.9, ratingsCount: 190,
  },

  // ── Training Equipment ──────────────────────────────────
  {
    name: 'Training Bib Set (5)',
    description: 'Set of 5 high-visibility mesh bibs for team scrimmages and tactical training.',
    price: 1299,
    category: 'Training Equipment',
    images: ['/products/training-bib-set-5.jpg'],
    stock: 40, sku: 'GK-TRN-001', brand: 'GoalKart', ratingsAverage: 4.6, ratingsCount: 85,
  },
  {
    name: 'Speed Training Cones (20)',
    description: 'Pack of 20 flexible disc cones with carry strap for field marking and dribbling drills.',
    price: 899,
    category: 'Training Equipment',
    images: ['/products/speed-training-cones-20.jpg'],
    stock: 85, sku: 'GK-TRN-002', brand: 'GoalKart', ratingsAverage: 4.7, ratingsCount: 140,
  },
  {
    name: 'Agility Ladder',
    description: '6m heavy-duty agility speed ladder with adjustable rungs for footwork speed.',
    price: 1499,
    category: 'Training Equipment',
    images: ['/products/agility-ladder.jpg'],
    stock: 50, sku: 'GK-TRN-003', brand: 'GoalKart', ratingsAverage: 4.8, ratingsCount: 195,
  },
  {
    name: 'Resistance Bands',
    description: 'Set of 5 loop bands for leg strength, hip mobility, and injury prevention.',
    price: 799,
    category: 'Training Equipment',
    images: ['/products/resistance-bands.jpg'],
    stock: 75, sku: 'GK-TRN-004', brand: 'GoalKart', ratingsAverage: 4.5, ratingsCount: 98,
  },
  {
    name: 'Speed Parachute',
    description: '54-inch chute providing progressive resistance to improve sprint acceleration.',
    price: 999,
    category: 'Training Equipment',
    images: ['/products/speed-parachute.jpg'],
    stock: 35, sku: 'GK-TRN-005', brand: 'GoalKart', ratingsAverage: 4.4, ratingsCount: 64,
  },
  {
    name: 'Jump Rope',
    description: 'Speed ball-bearing jump rope for conditioning and footwork sharpness.',
    price: 499,
    category: 'Training Equipment',
    images: ['/products/jump-rope.jpg'],
    stock: 90, sku: 'GK-TRN-006', brand: 'GoalKart', ratingsAverage: 4.3, ratingsCount: 112,
  },

  // ── Bags & Pitch Accessories ───────────────────────────
  {
    name: 'Football Pump with Needle',
    description: 'Dual-action ball pump with metal needle and extension hose.',
    price: 299,
    category: 'Bags & Pitch Accessories',
    images: ['/products/pump-with-needle.png'],
    stock: 150, sku: 'GK-ACC-001', brand: 'GoalKart', ratingsAverage: 4.5, ratingsCount: 220,
  },
  {
    name: 'Football Net Carry Bag',
    description: 'Mesh ball bag holding up to 10 full-sized footballs for team coaches.',
    price: 399,
    category: 'Bags & Pitch Accessories',
    images: ['/products/bag-net-carry.png'],
    stock: 70, sku: 'GK-ACC-002', brand: 'GoalKart', ratingsAverage: 4.4, ratingsCount: 86,
  },
  {
    name: 'Football Backpack',
    description: 'Ergonomic team backpack with ball pouch and boot compartment.',
    price: 1299,
    category: 'Bags & Pitch Accessories',
    images: ['https://res.cloudinary.com/slg7aikj/image/upload/v1786554184/ChatGPT_Image_Aug_6_2026_11_00_44_PM.png'],
    stock: 45, sku: 'GK-ACC-003', brand: 'GoalKart', ratingsAverage: 4.7, ratingsCount: 140,
  },
  {
    name: 'Boot Bag',
    description: 'Ventilated shoe bag to keep muddy boots separate from your clean gear.',
    price: 699,
    category: 'Bags & Pitch Accessories',
    images: ['https://res.cloudinary.com/slg7aikj/image/upload/v1786554406/ChatGPT_Image_Aug_6_2026_10_14_39_PM.png'],
    stock: 65, sku: 'GK-ACC-004', brand: 'GoalKart', ratingsAverage: 4.6, ratingsCount: 95,
  },
  {
    name: 'Water Bottle (750ml)',
    description: 'BPA-free squeeze sports water bottle with leak-proof valve.',
    price: 399,
    category: 'Bags & Pitch Accessories',
    images: ['https://res.cloudinary.com/slg7aikj/image/upload/v1786554571/ChatGPT_Image_Aug_6_2026_10_11_41_PM.png'],
    stock: 120, sku: 'GK-ACC-005', brand: 'GoalKart', ratingsAverage: 4.5, ratingsCount: 180,
  },
  {
    name: 'Sports Towel',
    description: 'Microfiber quick-dry towel for sweat absorption during breaks.',
    price: 349,
    category: 'Bags & Pitch Accessories',
    images: ['https://res.cloudinary.com/slg7aikj/image/upload/v1786554770/ChatGPT_Image_Aug_6_2026_10_09_58_PM.png'],
    stock: 100, sku: 'GK-ACC-006', brand: 'GoalKart', ratingsAverage: 4.3, ratingsCount: 74,
  },
  {
    name: 'Captain Armband',
    description: 'Elastic high-vis captain armband with strong velcro closure.',
    price: 299,
    category: 'Bags & Pitch Accessories',
    images: ['https://res.cloudinary.com/slg7aikj/image/upload/v1786554906/ChatGPT_Image_Aug_6_2026_06_14_59_PM.png'],
    stock: 110, sku: 'GK-ACC-007', brand: 'GoalKart', ratingsAverage: 4.7, ratingsCount: 160,
  },
  {
    name: 'Goal Net',
    description: 'Heavy-duty weatherproof replacement goal net (Standard 24x8ft size).',
    price: 2999,
    category: 'Bags & Pitch Accessories',
    images: ['https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=600&q=80'],
    stock: 20, sku: 'GK-ACC-008', brand: 'GoalKart', ratingsAverage: 4.8, ratingsCount: 42,
  },
  {
    name: 'Corner Flags Set',
    description: 'Set of 4 flexible corner flags with ground spikes and carry bag.',
    price: 2499,
    category: 'Bags & Pitch Accessories',
    images: ['https://res.cloudinary.com/slg7aikj/image/upload/v1786555065/ChatGPT_Image_Aug_6_2026_06_06_52_PM.png'],
    stock: 25, sku: 'GK-ACC-009', brand: 'GoalKart', ratingsAverage: 4.6, ratingsCount: 38,
  },
  {
    name: 'Referee Whistle',
    description: 'Pealess loud referee whistle (115dB) with lanyard.',
    price: 299,
    category: 'Bags & Pitch Accessories',
    images: ['https://res.cloudinary.com/slg7aikj/image/upload/v1786555270/ChatGPT_Image_Aug_6_2026_06_05_13_PM.png'],
    stock: 95, sku: 'GK-ACC-010', brand: 'GoalKart', ratingsAverage: 4.5, ratingsCount: 115,
  },
  {
    name: 'Referee Card Set',
    description: 'Red and yellow penalty cards with score notebook and pencil.',
    price: 399,
    category: 'Bags & Pitch Accessories',
    images: ['/products/referee-card-set.jpg'],
    stock: 80, sku: 'GK-ACC-011', brand: 'GoalKart', ratingsAverage: 4.4, ratingsCount: 76,
  },
  {
    name: 'First Aid Sports Kit',
    description: 'Complete team medical kit with ice packs, bandages, antiseptic spray, and strapping tape.',
    price: 1499,
    category: 'Bags & Pitch Accessories',
    images: ['/products/first-aid-sports-kit.jpg'],
    stock: 35, sku: 'GK-ACC-012', brand: 'GoalKart', ratingsAverage: 4.9, ratingsCount: 130,
  },
];

// =====================================================
// Seed Function
// =====================================================
const seedDatabase = async (): Promise<void> => {
  try {
    await connectDB();
    console.log('🌱 Seeding database with 50 GoalKart products...');

    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('🧹 Cleared existing products and categories');

    const createdCategories: mongoose.Document[] = [];
    for (const catData of CATEGORIES) {
      const cat = new Category(catData);
      await cat.save();
      createdCategories.push(cat);
    }
    console.log(`✅ Created ${createdCategories.length} categories`);

    const categoryMap: Record<string, mongoose.Types.ObjectId> = {};
    for (const cat of createdCategories as (mongoose.Document & { name: string; _id: mongoose.Types.ObjectId })[]) {
      categoryMap[cat.name] = cat._id;
    }

    let productCount = 0;
    for (const productData of PRODUCTS) {
      const categoryId = categoryMap[productData.category];
      if (!categoryId) {
        console.warn(`⚠️ Category not found for product: ${productData.name}`);
        continue;
      }
      const product = new Product({ ...productData, category: categoryId });
      await product.save();
      productCount++;
    }
    console.log(`✅ Created ${productCount} products`);
    console.log('🌱 Seed complete!');
    process.exit(0);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Seed failed:', message);
    process.exit(1);
  }
};

seedDatabase();