import mongoose from 'mongoose';
import Category from '../models/Category';
import Product from '../models/Product';
import { connectDB } from '../config/db';

// =====================================================
// Seed Data — Football Equipment Store
// =====================================================

const CATEGORIES = [
  {
    name: 'Jerseys',
    description: 'Official match jerseys, training tops, and replica kits for every level.',
    image: 'https://placehold.co/400x400/1B7A3D/FFFFFF?text=Jerseys',
  },
  {
    name: 'Football Boots',
    description: 'Studs, blades, and turf boots from top brands for every surface.',
    image: 'https://placehold.co/400x400/144E2A/FFFFFF?text=Boots',
  },
  {
    name: 'Match Balls',
    description: 'FIFA-approved match balls, training balls, and futsal balls.',
    image: 'https://placehold.co/400x400/2EDD79/0D1210?text=Balls',
  },
  {
    name: 'Shin Guards & Protection',
    description: 'Shin guards, ankle braces, mouthguards, and protective gear.',
    image: 'https://placehold.co/400x400/1E2B22/FFFFFF?text=Protection',
  },
  {
    name: 'Training Gear',
    description: 'Cones, agility ladders, resistance bands, and training accessories.',
    image: 'https://placehold.co/400x400/16201A/FFFFFF?text=Training',
  },
  {
    name: 'Goalkeeper Equipment',
    description: 'GK gloves, base layers, and goalkeeper-specific apparel.',
    image: 'https://placehold.co/400x400/2E3D33/FFFFFF?text=GK Gear',
  },
  {
    name: 'Club Accessories',
    description: 'Bags, water bottles, tape, whistles, and team accessories.',
    image: 'https://placehold.co/400x400/0D1210/FFFFFF?text=Accessories',
  },
];

const PRODUCTS = [
  // Jerseys
  {
    name: 'Premier League Home Jersey 2025',
    description: 'Official home jersey with moisture-wicking technology and club crest. Lightweight breathable fabric for match day performance.',
    price: 89.99,
    discountPrice: 69.99,
    category: 'Jerseys',
    images: ['https://placehold.co/600x600/1B7A3D/FFFFFF?text=Jersey+Home', 'https://placehold.co/600x600/144E2A/FFFFFF?text=Jersey+Back'],
    stock: 45,
    sku: 'JER-001',
    brand: 'GoalKart',
    ratingsAverage: 4.5,
    ratingsCount: 128,
  },
  {
    name: 'Away Training Jersey',
    description: 'Lightweight training jersey designed for high-intensity sessions. Reflective strips for visibility.',
    price: 54.99,
    category: 'Jerseys',
    images: ['https://placehold.co/600x600/2EDD79/0D1210?text=Training+Jersey'],
    stock: 30,
    sku: 'JER-002',
    brand: 'GoalKart',
    ratingsAverage: 4.2,
    ratingsCount: 56,
  },
  {
    name: 'Youth Replica Jersey',
    description: 'Official replica jersey for young fans. Same design as the pros, sized for kids aged 6-14.',
    price: 49.99,
    category: 'Jerseys',
    images: ['https://placehold.co/600x600/1E2B22/FFFFFF?text=Youth+Jersey'],
    stock: 60,
    sku: 'JER-003',
    brand: 'GoalKart',
    ratingsAverage: 4.7,
    ratingsCount: 210,
  },

  // Football Boots
  {
    name: 'Speedblade FG Boots',
    description: 'Lightweight firm-ground boots with blade studs for explosive acceleration. Synthetic upper with anatomical fit.',
    price: 129.99,
    discountPrice: 99.99,
    category: 'Football Boots',
    images: ['https://placehold.co/600x600/1B7A3D/FFFFFF?text=Speedblade+FG', 'https://placehold.co/600x600/144E2A/FFFFFF?text=Boot+Side'],
    stock: 25,
    sku: 'BOT-001',
    brand: 'GoalKart',
    ratingsAverage: 4.6,
    ratingsCount: 89,
  },
  {
    name: 'Turf Trainer Low',
    description: 'Versatile turf boots for artificial surfaces. Rubber sole provides grip and durability on 3G pitches.',
    price: 64.99,
    category: 'Football Boots',
    images: ['https://placehold.co/600x600/2EDD79/0D1210?text=Turf+Trainer'],
    stock: 40,
    sku: 'BOT-002',
    brand: 'GoalKart',
    ratingsAverage: 4.3,
    ratingsCount: 67,
  },
  {
    name: 'Indoor Futsal Boot',
    description: 'Low-profile indoor boot with non-marking gum rubber sole. Designed for futsal courts and hard surfaces.',
    price: 59.99,
    category: 'Football Boots',
    images: ['https://placehold.co/600x600/16201A/FFFFFF?text=Futsal+Boot'],
    stock: 35,
    sku: 'BOT-003',
    brand: 'GoalKart',
    ratingsAverage: 4.1,
    ratingsCount: 43,
  },

  // Match Balls
  {
    name: 'FIFA Qualifier Match Ball',
    description: 'FIFA-approved match ball with thermal bonding and consistent flight path. Official size and weight.',
    price: 149.99,
    category: 'Match Balls',
    images: ['https://placehold.co/600x600/D4A017/0D1210?text=Match+Ball'],
    stock: 15,
    sku: 'BALL-001',
    brand: 'GoalKart',
    ratingsAverage: 4.8,
    ratingsCount: 312,
  },
  {
    name: 'Training Match Ball',
    description: 'Durable training ball designed for daily use. Reinforced casing withstands rough surfaces.',
    price: 34.99,
    category: 'Match Balls',
    images: ['https://placehold.co/600x600/1B7A3D/FFFFFF?text=Training+Ball'],
    stock: 50,
    sku: 'BALL-002',
    brand: 'GoalKart',
    ratingsAverage: 4.4,
    ratingsCount: 78,
  },
  {
    name: 'Futsal Size 4 Ball',
    description: 'Weighted futsal ball for improved control on indoor courts. Low bounce design for fast play.',
    price: 44.99,
    category: 'Match Balls',
    images: ['https://placehold.co/600x600/144E2A/FFFFFF?text=Futsal+Ball'],
    stock: 28,
    sku: 'BALL-003',
    brand: 'GoalKart',
    ratingsAverage: 4.5,
    ratingsCount: 55,
  },

  // Shin Guards & Protection
  {
    name: 'Pro Shin Guard Set',
    description: 'Lightweight shin guards with CE Level 2 certification. Anatomical fit with adjustable straps.',
    price: 29.99,
    category: 'Shin Guards & Protection',
    images: ['https://placehold.co/600x600/1E2B22/FFFFFF?text=Shin+Guards'],
    stock: 70,
    sku: 'SHIN-001',
    brand: 'GoalKart',
    ratingsAverage: 4.3,
    ratingsCount: 195,
  },
  {
    name: 'Ankle Support Brace',
    description: 'Compression ankle brace with lateral stabilizers. Prevents sprains during quick directional changes.',
    price: 24.99,
    category: 'Shin Guards & Protection',
    images: ['https://placehold.co/600x600/2E3D33/FFFFFF?text=Ankle+Brace'],
    stock: 55,
    sku: 'SHIN-002',
    brand: 'GoalKart',
    ratingsAverage: 4.0,
    ratingsCount: 42,
  },

  // Training Gear
  {
    name: 'Agility Ladder 15ft',
    description: 'Portable speed ladder with 12 rungs. Non-slip anchors for any surface. Improves footwork and coordination.',
    price: 19.99,
    category: 'Training Gear',
    images: ['https://placehold.co/600x600/16201A/FFFFFF?text=Agility+Ladder'],
    stock: 80,
    sku: 'TRN-001',
    brand: 'GoalKart',
    ratingsAverage: 4.6,
    ratingsCount: 134,
  },
  {
    name: 'Resistance Band Set',
    description: 'Set of 5 resistance bands with varying tension levels. Includes door anchor and ankle straps.',
    price: 27.99,
    category: 'Training Gear',
    images: ['https://placehold.co/600x600/0D1210/FFFFFF?text=Resistance+Bands'],
    stock: 65,
    sku: 'TRN-002',
    brand: 'GoalKart',
    ratingsAverage: 4.4,
    ratingsCount: 88,
  },
  {
    name: 'Training Cone Set (10pc)',
    description: 'High-visibility orange cones for drills and marking. Stackable design for easy storage.',
    price: 14.99,
    category: 'Training Gear',
    images: ['https://placehold.co/600x600/D4A017/0D1210?text=Training+Cones'],
    stock: 100,
    sku: 'TRN-003',
    brand: 'GoalKart',
    ratingsAverage: 4.2,
    ratingsCount: 67,
  },

  // Goalkeeper Equipment
  {
    name: 'Pro Goalkeeper Gloves',
    description: 'Professional-grade GK gloves with latex palm for superior grip. Finger save technology for injury prevention.',
    price: 74.99,
    discountPrice: 59.99,
    category: 'Goalkeeper Equipment',
    images: ['https://placehold.co/600x600/2E3D33/FFFFFF?text=GK+Gloves', 'https://placehold.co/600x600/1E2B22/FFFFFF?text=Glove+Detail'],
    stock: 20,
    sku: 'GK-001',
    brand: 'GoalKart',
    ratingsAverage: 4.7,
    ratingsCount: 156,
  },
  {
    name: 'Goalkeeper Base Layer',
    description: 'Thermal base layer designed for goalkeepers. Stretch fabric allows full range of motion.',
    price: 39.99,
    category: 'Goalkeeper Equipment',
    images: ['https://placehold.co/600x600/1B7A3D/FFFFFF?text=GK+Base+Layer'],
    stock: 35,
    sku: 'GK-002',
    brand: 'GoalKart',
    ratingsAverage: 4.1,
    ratingsCount: 34,
  },

  // Club Accessories
  {
    name: 'Team Duffel Bag',
    description: 'Large capacity duffel bag with ventilated shoe compartment and waterproof base. Fits all football kit.',
    price: 44.99,
    category: 'Club Accessories',
    images: ['https://placehold.co/600x600/16201A/FFFFFF?text=Duffel+Bag'],
    stock: 42,
    sku: 'ACC-001',
    brand: 'GoalKart',
    ratingsAverage: 4.5,
    ratingsCount: 91,
  },
  {
    name: 'Insulated Water Bottle 1L',
    description: 'Double-wall insulated bottle keeps drinks cold for 24 hours. Leak-proof lid with carry loop.',
    price: 16.99,
    category: 'Club Accessories',
    images: ['https://placehold.co/600x600/2EDD79/0D1210?text=Water+Bottle'],
    stock: 90,
    sku: 'ACC-002',
    brand: 'GoalKart',
    ratingsAverage: 4.3,
    ratingsCount: 203,
  },
  {
    name: 'Medical Tape Roll (50m)',
    description: 'Professional-grade adhesive tape for taping and support. Breathable cotton fabric.',
    price: 8.99,
    category: 'Club Accessories',
    images: ['https://placehold.co/600x600/FFFFFF/1B7A3D?text=Medical+Tape'],
    stock: 120,
    sku: 'ACC-003',
    brand: 'GoalKart',
    ratingsAverage: 4.0,
    ratingsCount: 45,
  },
  {
    name: 'Referee Whistle with Lanyard',
    description: 'Professional pea whistle with adjustable lanyard. Loud, clear tone for match officiating.',
    price: 12.99,
    category: 'Club Accessories',
    images: ['https://placehold.co/600x600/D4A017/0D1210?text=Referee+Whistle'],
    stock: 75,
    sku: 'ACC-004',
    brand: 'GoalKart',
    ratingsAverage: 4.4,
    ratingsCount: 58,
  },
];

// =====================================================
// Seed Function
// =====================================================

const seedDatabase = async (): Promise<void> => {
  try {
    await connectDB();

    console.log('🌱 Seeding database...');

    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('🧹 Cleared existing products and categories');

    // Create categories individually so pre-save hooks fire (slug generation)
    const createdCategories: mongoose.Document[] = [];
    for (const catData of CATEGORIES) {
      const cat = new Category(catData);
      await cat.save();
      createdCategories.push(cat);
    }
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Build category name → ObjectId map
    const categoryMap: Record<string, mongoose.Types.ObjectId> = {};
    for (const cat of createdCategories as (mongoose.Document & { name: string; _id: mongoose.Types.ObjectId })[]) {
      categoryMap[cat.name] = cat._id;
    }

    // Create products individually so pre-save hooks fire (slug generation)
    let productCount = 0;
    for (const productData of PRODUCTS) {
      const categoryId = categoryMap[productData.category];
      if (!categoryId) {
        console.warn(`⚠️  Category not found for product: ${productData.name}`);
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