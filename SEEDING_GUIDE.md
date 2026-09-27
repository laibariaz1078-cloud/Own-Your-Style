# Database Seeding Guide

## Populate Test Data

To seed the database with test users and products, follow these steps:

### Step 1: Make sure MongoDB is running
```bash
# MongoDB should be running on localhost:27017
# If using Windows with MongoDB installed:
mongod
```

### Step 2: Run the seed script
```bash
cd d:/Ecommerce/my-app
$env:MONGODB_URI=""
node --loader tsx seed.js
```

Or using npm:
```bash
npm run seed
```

### Step 3: Test Accounts

After seeding, you'll have the following test accounts:

#### 🛒 **BUYERS (Customers)**

1. **Ali Khan**
   - Email: `ali.buyer@example.com`
   - Password: `password123`

2. **Fatima Ahmed**
   - Email: `fatima.buyer@example.com`
   - Password: `password123`

3. **Hassan Ali**
   - Email: `hassan.buyer@example.com`
   - Password: `password123`

#### 🏪 **SELLERS**

1. **Ahmed's Electronics Store**
   - Email: `ahmed.seller@example.com`
   - Store Name: Ahmed's Electronics Store
   - Products: Gaming Laptop, Wireless Mouse
   - Password: `password123`

2. **Sara's Fashion Hub**
   - Email: `sara.seller@example.com`
   - Store Name: Sara's Fashion Hub
   - Products: Summer Dress, Designer Handbag
   - Password: `password123`

3. **Zain's Book Store**
   - Email: `zain.seller@example.com`
   - Store Name: Zain's Book Store
   - Products: The Great Gatsby, Python Programming Guide
   - Password: `password123`

---

## Signup with Role Selection

You can also create new accounts during signup:
SignUp page
2. Fill in your details
3. Select your role:
   - **Buyer** - For purchasing products
   - **Seller** - For selling products
4. Click "Create Account"

The system automatically assigns the correct role and creates the appropriate dashboard access.

---

