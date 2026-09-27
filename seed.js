import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./src/models/User.js";
import Vendor from "./src/models/Vendor.js";
import Product from "./src/models/Product.js";
import Category from "./src/models/Category.js";
import Order from "./src/models/Order.js";
import VendorMessage from "./src/models/VendorMessage.js";
import { flashSaleProducts, bestSellingProducts, exploreProducts } from "./src/app/home-data.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/my-app";

async function seedDatabase() {
  let connection = null;
  try {
    connection = await mongoose.connect(MONGODB_URI);
    console.log("✓ Connected to database\n");

    // Clear existing data
    await Order.deleteMany({});
    await VendorMessage.deleteMany({});
    await User.deleteMany({});
    await Vendor.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log("✓ Cleared existing data\n");

    const categories = await Category.insertMany([
      { name: "Woman's Fashion", slug: "women", sortOrder: 10 },
      { name: "Men's Fashion", slug: "men", sortOrder: 20 },
      { name: "Electronics", slug: "electronics", sortOrder: 30 },
      { name: "Home & Lifestyle", slug: "home", sortOrder: 40 },
      { name: "Medicine", slug: "medicine", sortOrder: 50 },
      { name: "Sports & Outdoor", slug: "sports", sortOrder: 60 },
      { name: "Baby's & Toys", slug: "baby", sortOrder: 70 },
      { name: "Groceries & Pets", slug: "groceries", sortOrder: 80 },
      { name: "Health & Beauty", slug: "beauty", sortOrder: 90 },
      { name: "Phones", slug: "phones", sortOrder: 100 },
      { name: "Computers", slug: "computers", sortOrder: 110 },
      { name: "SmartWatch", slug: "smartwatch", sortOrder: 120 },
      { name: "Camera", slug: "camera", sortOrder: 130 },
      { name: "HeadPhones", slug: "headphones", sortOrder: 140 },
      { name: "Gaming", slug: "gaming", sortOrder: 150 },
    ]);
    console.log(`✓ Created ${categories.length} categories\n`);

    const admin = await User.create({
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      password: await bcrypt.hash("password123", 10),
      role: "admin",
    });

    const vendors = await Vendor.insertMany([
      {
        name: "TechSource Wholesale",
        contactName: "Usman Raza",
        email: "usman.vendor@example.com",
        phone: "03001112222",
        address: "Hall Road, Lahore",
        status: "active",
        reliabilityScore: 96,
      },
      {
        name: "Urban Home Supplies",
        contactName: "Ayesha Malik",
        email: "ayesha.vendor@example.com",
        phone: "03003334444",
        address: "Tariq Road, Karachi",
        status: "active",
        reliabilityScore: 91,
      },
    ]);

    const vendorAccounts = await User.insertMany([
      {
        firstName: "Usman",
        lastName: "Raza",
        email: "usman.vendor@example.com",
        phone: "03001112222",
        password: await bcrypt.hash("password123", 10),
        role: "vendor",
        vendorId: vendors[0]._id,
      },
      {
        firstName: "Ayesha",
        lastName: "Malik",
        email: "ayesha.vendor@example.com",
        phone: "03003334444",
        password: await bcrypt.hash("password123", 10),
        role: "vendor",
        vendorId: vendors[1]._id,
      },
    ]);
    await Vendor.bulkWrite(vendors.map((vendor, index) => ({
      updateOne: { filter: { _id: vendor._id }, update: { $set: { userId: vendorAccounts[index]._id } } },
    })));
    console.log(`✓ Created ${vendors.length} vendors and ${vendorAccounts.length} vendor accounts\n`);

    // Create test buyers
    const buyers = await User.insertMany([
      {
        firstName: "Ali",
        lastName: "Khan",
        email: "ali.buyer@example.com",
        phone: "03001234567",
        password: await bcrypt.hash("password123", 10),
        role: "customer",
      },
      {
        firstName: "Fatima",
        lastName: "Ahmed",
        email: "fatima.buyer@example.com",
        phone: "03009876543",
        password: await bcrypt.hash("password123", 10),
        role: "customer",
      },
      {
        firstName: "Hassan",
        lastName: "Ali",
        email: "hassan.buyer@example.com",
        phone: "03005555555",
        password: await bcrypt.hash("password123", 10),
        role: "customer",
      },
    ]);
    console.log(`✓ Created ${buyers.length} test buyers\n`);

    // Create test sellers
    const sellers = await User.insertMany([
      {
        firstName: "Ahmed",
        lastName: "Electronics",
        email: "ahmed.seller@example.com",
        phone: "03002222222",
        password: await bcrypt.hash("password123", 10),
        role: "seller",
        sellerProfile: {
          storeName: "Ahmed's Electronics Store",
          storeSlug: "ahmeds-electronics",
          description: "High quality electronics at best prices",
          verificationStatus: "approved",
        },
      },
      {
        firstName: "Sara",
        lastName: "Fashion",
        email: "sara.seller@example.com",
        phone: "03003333333",
        password: await bcrypt.hash("password123", 10),
        role: "seller",
        sellerProfile: {
          storeName: "Sara's Fashion Hub",
          storeSlug: "saras-fashion",
          description: "Latest fashion trends for everyone",
          verificationStatus: "approved",
        },
      },
      {
        firstName: "Zain",
        lastName: "Books",
        email: "zain.seller@example.com",
        phone: "03004444444",
        password: await bcrypt.hash("password123", 10),
        role: "seller",
        sellerProfile: {
          storeName: "Zain's Book Store",
          storeSlug: "zains-books",
          description: "Find your next favorite book here",
          verificationStatus: "approved",
        },
      },
    ]);
    console.log(`✓ Created ${sellers.length} test sellers\n`);

    // Create test products for each seller
    const products = await Product.insertMany([
      {
        sellerId: sellers[0]._id,
        name: "Gaming Laptop",
        slug: "gaming-laptop",
        description: "High performance laptop for gaming and work",
        basePrice: 1500,
        categoryIds: [],
        status: "active",
        variants: [
          {
            sku: "laptop-001",
            price: 1500,
            inventory: { quantity: 5 },
          },
        ],
      },
      {
        sellerId: sellers[0]._id,
        name: "Wireless Mouse",
        slug: "wireless-mouse",
        description: "Ergonomic wireless mouse with long battery life",
        basePrice: 25,
        categoryIds: [],
        status: "active",
        variants: [
          {
            sku: "mouse-001",
            price: 25,
            inventory: { quantity: 50 },
          },
        ],
      },
      {
        sellerId: sellers[1]._id,
        name: "Summer Dress",
        slug: "summer-dress",
        description: "Comfortable cotton summer dress",
        basePrice: 50,
        categoryIds: [],
        status: "active",
        variants: [
          {
            sku: "dress-001",
            price: 50,
            inventory: { quantity: 20 },
          },
        ],
      },
      {
        sellerId: sellers[1]._id,
        name: "Designer Handbag",
        slug: "designer-handbag",
        description: "Premium leather handbag",
        basePrice: 120,
        categoryIds: [],
        status: "active",
        variants: [
          {
            sku: "bag-001",
            price: 120,
            inventory: { quantity: 10 },
          },
        ],
      },
      {
        sellerId: sellers[2]._id,
        name: "The Great Gatsby",
        slug: "the-great-gatsby",
        description: "Classic novel by F. Scott Fitzgerald",
        basePrice: 15,
        categoryIds: [],
        status: "active",
        variants: [
          {
            sku: "book-001",
            price: 15,
            inventory: { quantity: 100 },
          },
        ],
      },
      {
        sellerId: sellers[2]._id,
        name: "Python Programming Guide",
        slug: "python-guide",
        description: "Learn Python from basics to advanced",
        basePrice: 35,
        categoryIds: [],
        status: "active",
        variants: [
          {
            sku: "book-002",
            price: 35,
            inventory: { quantity: 30 },
          },
        ],
      },
    ]);
    const vendorProducts = await Product.insertMany([
      {
        vendorId: vendors[0]._id,
        name: "Noise Cancelling Headphones",
        slug: "vendor-noise-cancelling-headphones",
        description: "Wireless headphones supplied by TechSource Wholesale.",
        basePrice: 120,
        categoryIds: ["headphones"],
        status: "active",
        vendorUnitCost: 72,
        vendorPaidAmount: 360,
        vendorPaymentDue: 360,
        vendorPaymentDueDate: new Date("2026-10-15"),
        variants: [{ sku: "vendor-headphones-001", price: 120, inventory: { quantity: 10 } }],
      },
      {
        vendorId: vendors[0]._id,
        name: "USB-C Fast Charger",
        slug: "vendor-usb-c-fast-charger",
        description: "Fast charging adapter supplied by TechSource Wholesale.",
        basePrice: 35,
        categoryIds: ["electronics"],
        status: "active",
        vendorUnitCost: 18,
        vendorPaidAmount: 180,
        vendorPaymentDue: 180,
        vendorPaymentDueDate: new Date("2026-10-30"),
        variants: [{ sku: "vendor-charger-001", price: 35, inventory: { quantity: 20 } }],
      },
      {
        vendorId: vendors[1]._id,
        name: "Bamboo Storage Basket",
        slug: "vendor-bamboo-storage-basket",
        description: "Handmade storage basket supplied by Urban Home Supplies.",
        basePrice: 45,
        categoryIds: ["home"],
        status: "active",
        vendorUnitCost: 24,
        vendorPaidAmount: 120,
        vendorPaymentDue: 168,
        vendorPaymentDueDate: new Date("2026-11-05"),
        variants: [{ sku: "vendor-basket-001", price: 45, inventory: { quantity: 12 } }],
      },
    ]);
    const storefrontProducts = [...flashSaleProducts, ...bestSellingProducts, ...exploreProducts];
    await Product.updateMany({ images: { $size: 0 } }, { $set: { storefrontSection: "legacy" } });
    await Product.deleteMany({ slug: { $in: storefrontProducts.map((product) => product.id) } });
    const seededStorefrontProducts = await Product.insertMany(
      storefrontProducts.map((product, index) => ({
        sellerId: sellers[index % sellers.length]._id,
        name: product.name,
        slug: product.id,
        description: `${product.name} from our curated storefront collection.`,
        basePrice: product.price,
        oldPrice: product.oldPrice || 0,
        discountPercent: product.discountPercent || 0,
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0,
        newArrival: Boolean(product.isNew),
        colors: product.colors || [],
        storefrontSection: flashSaleProducts.includes(product)
          ? "flashSale"
          : bestSellingProducts.includes(product)
            ? "bestSelling"
            : "explore",
        categoryIds: [product.category],
        images: [{ url: product.image }],
        status: "active",
        variants: [{ sku: `${product.id}-default`, price: product.price, inventory: { quantity: 25 } }],
      }))
    );
    console.log(`✓ Created ${seededStorefrontProducts.length} storefront products\n`);
    console.log(`✓ Created ${products.length} products\n`);
    console.log(`✓ Created ${vendorProducts.length} vendor products\n`);

    await VendorMessage.insertMany([
      { vendorId: vendors[0]._id, senderId: admin._id, senderRole: "admin", message: "Your headphone and charger stock has been received. Payment dates are updated on your dashboard." },
      { vendorId: vendors[0]._id, senderId: vendorAccounts[0]._id, senderRole: "vendor", message: "Thank you. Please confirm when the remaining amount is scheduled." },
      { vendorId: vendors[1]._id, senderId: admin._id, senderRole: "admin", message: "The basket shipment is listed with its current stock and payment due date." },
    ]);
    console.log("✓ Created sample vendor chat messages\n");

    const sampleOrders = await Order.insertMany([
      {
        orderNumber: "ORD-1001",
        customerId: buyers[0]._id,
        customerName: `${buyers[0].firstName} ${buyers[0].lastName}`,
        items: [
          {
            productId: products[0]._id,
            productName: products[0].name,
            sellerId: products[0].sellerId,
            quantity: 1,
            unitPrice: products[0].basePrice,
            lineTotal: products[0].basePrice,
          },
          {
            productId: products[3]._id,
            productName: products[3].name,
            sellerId: products[3].sellerId,
            quantity: 1,
            unitPrice: products[3].basePrice,
            lineTotal: products[3].basePrice,
          },
        ],
        pricing: {
          subtotal: products[0].basePrice + products[3].basePrice,
          tax: 0,
          shipping: 0,
          grandTotal: products[0].basePrice + products[3].basePrice,
        },
        status: "Processing",
        notes: "Sample order from Ali",
        statusHistory: [{ status: "Processing", note: "Order created", updatedAt: new Date() }],
      },
      {
        orderNumber: "ORD-1002",
        customerId: buyers[1]._id,
        customerName: `${buyers[1].firstName} ${buyers[1].lastName}`,
        items: [
          {
            productId: products[2]._id,
            productName: products[2].name,
            sellerId: products[2].sellerId,
            quantity: 2,
            unitPrice: products[2].basePrice,
            lineTotal: products[2].basePrice * 2,
          },
        ],
        pricing: {
          subtotal: products[2].basePrice * 2,
          tax: 0,
          shipping: 0,
          grandTotal: products[2].basePrice * 2,
        },
        status: "Shipped",
        notes: "Sample order from Fatima",
        statusHistory: [{ status: "Shipped", note: "Order created", updatedAt: new Date() }],
      },
      {
        orderNumber: "ORD-1003",
        customerId: buyers[2]._id,
        customerName: `${buyers[2].firstName} ${buyers[2].lastName}`,
        items: [
          {
            productId: products[4]._id,
            productName: products[4].name,
            sellerId: products[4].sellerId,
            quantity: 1,
            unitPrice: products[4].basePrice,
            lineTotal: products[4].basePrice,
          },
        ],
        pricing: {
          subtotal: products[4].basePrice,
          tax: 0,
          shipping: 0,
          grandTotal: products[4].basePrice,
        },
        status: "Delivered",
        notes: "Sample order from Hassan",
        statusHistory: [{ status: "Delivered", note: "Order created", updatedAt: new Date() }],
      },
    ]);

    console.log(`✓ Created ${sampleOrders.length} sample orders\n`);

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log("📊 DATABASE SEEDED SUCCESSFULLY!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("🛒 TEST BUYERS (Role: Customer):\n");
    buyers.forEach((buyer) => {
      console.log(`   Email: ${buyer.email}`);
      console.log(`   Name: ${buyer.firstName} ${buyer.lastName}`);
      console.log(`   Password: password123\n`);
    });

    console.log("🔐 ADMIN:\n");
    console.log(`   Email: ${admin.email}`);
    console.log("   Password: password123\n");

    console.log("🏪 TEST SELLERS:\n");
    sellers.forEach((seller) => {
      console.log(`   Email: ${seller.email}`);
      console.log(`   Name: ${seller.firstName} ${seller.lastName}`);
      console.log(`   Store: ${seller.storeName || seller.sellerProfile?.storeName || ""}`);
      console.log(`   Password: password123\n`);
    });

    console.log("🚚 TEST VENDORS:\n");
    vendors.forEach((vendor) => {
      console.log(`   Email: ${vendor.email}`);
      console.log(`   Name: ${vendor.contactName} (${vendor.name})`);
      console.log("   Password: password123\n");
    });

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log("✨ You can now log in with any of these accounts!\n");

    await connection.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error.message);
    if (connection) await connection.disconnect();
    process.exit(1);
  }
}

seedDatabase();
