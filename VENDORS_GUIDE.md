

1. **Vendor Model** (`src/models/Vendor.js`)
   - name (ضروری)
   - contactName
   - email
   - phone
   - address

2. **Vendor APIs** (`src/app/api/dashboard/admin/vendors/`)
   - `GET` → تمام vendors لاؤ
   - `POST` → نیا vendor add کرو
   - `DELETE` → vendor ڈیلیٹ کرو

3. **Vendor Page** (`src/app/dashboard/admin/vendors/page.jsx`)
   - Vendor add کریں
   - Vendors کی لسٹ دیکھیں
   - Vendor ڈیلیٹ کریں

4. **Product Integration**
   - Admin جب product add کرے → vendor select کریں
   - Seller products میں vendor use نہیں (صرف admin)
   - Product model میں vendorId field موجود

---

## 🔄 Complete Flow:

```
┌─────────────────────────────────────────────────────┐
│         ADMIN VENDOR MANAGEMENT FLOW                │
└─────────────────────────────────────────────────────┘

1️⃣  Admin → Dashboard → Vendors page
    ↓
2️⃣  Vendor add کریں (نام, رابطہ, ای میل وغیرہ)
    ↓
3️⃣  API: /api/dashboard/admin/vendors (POST)
    ↓
4️⃣  Vendor database میں save
    ↓
5️⃣  Admin → Products → Add Product
    ↓
6️⃣  Product form میں Vendor select کریں
    ↓
7️⃣  API: /api/dashboard/products (POST with vendorId)
    ↓
8️⃣  Product vendor کے ساتھ save
    ↓
9️⃣  Admin products list میں vendor کا نام دکھے
```

---

## 📋 اضافی Features جو Add کر سکتے ہیں:

### 1️⃣ **Vendor Statistics Page**
```
Vendor: Samsung Electronics
├─ Total Products: 25
├─ Total Revenue: $45,000
├─ Orders Count: 150
└─ Last Updated: 2 days ago
```

### 2️⃣ **Vendor Edit Page**
```
/dashboard/admin/vendors/[id]/edit
└─ Vendor کی معلومات update کریں
```

### 3️⃣ **Vendor Products View**
```
/dashboard/admin/vendors/[id]/products
└─ اس vendor کے تمام products دیکھیں
```

### 4️⃣ **Vendor Rating/Review**
```
schema میں شامل کریں:
- rating: average rating
- totalReviews: count
- reliabilityScore: کتنی بار issues ہوئے
```

### 5️⃣ **Vendor Contact History**
```
Admin vendor کو پیغام بھج سکے
- Query
- Payment status
- Product quality issues
```

---

## 🔐 Permission Structure:

| Action | Seller | Admin |
|--------|--------|-------|
| Vendor add | ❌ No | ✅ Yes |
| Vendor edit | ❌ No | ✅ Yes |
| Vendor delete | ❌ No | ✅ Yes |
| Product add with Vendor | ❌ No (use self) | ✅ Yes |
| View vendor stats | ❌ No | ✅ Yes |

---

## 💾 Database Relationships:

```
Vendor
├─ _id
├─ name
├─ contactName
├─ email
├─ phone
├─ address
└─ timestamps

Product
├─ _id
├─ name
├─ vendorId → (Vendor._id) 🔗
├─ sellerId → (User._id) 🔗 [optional for admin products]
└─ ...other fields
```

---

## ✨ Next Steps (اگر مزید features چاہیں):

### Priority 1: 📊 Vendor Stats
- Vendor کے کل products count
- Vendor کی revenue
- Vendor کے orders track کریں

### Priority 2: ✏️ Vendor Edit
- Vendor کی information update کریں
- Status field add کریں (active/inactive)

### Priority 3: 📱 Vendor Contact
- Admin vendor کو پیغام بھج سکے
- Vendor payment tracking

### Priority 4: ⭐ Vendor Rating
- Vendor quality score
- On-time delivery tracking
- Customer satisfaction

---

## 🧪 Testing Checklist:

✅ Vendor add/delete working
✅ Admin product add with vendor select
✅ Vendor appearing in product list
✅ Product showing vendor info
⏳ Vendor stats (اگر add کریں)
⏳ Vendor edit (اگر add کریں)
⏳ Vendor products view (اگر add کریں)

---

## 📁 Files

- Model: `src/models/Vendor.js`
- APIs: `src/app/api/dashboard/admin/vendors/*`
- Page: `src/app/dashboard/admin/vendors/page.jsx`
- Modal: `src/components/dashboard/AddProductModal.js` (updated)
- Products API: `src/app/api/dashboard/products/route.js` (updated)
