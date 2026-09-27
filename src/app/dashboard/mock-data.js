export const mockAdminStats = {
  metrics: { totalRevenue: 24890.5, totalOrders: 186, activeSellers: 24 },
  reportStats: { customers: 842, products: 156, inStock: 128, lowStock: 28 },
  weeklyVolumes: [
    { label: "Sun", value: 18 },
    { label: "Mon", value: 27 },
    { label: "Tue", value: 22 },
    { label: "Wed", value: 34 },
    { label: "Thu", value: 29 },
    { label: "Fri", value: 41 },
    { label: "Sat", value: 35 },
  ],
  activity: [
    { title: "New seller application received", status: "open", time: "2026-09-02T09:30:00.000Z" },
    { title: "Payment complaint marked in review", status: "in_review", time: "2026-09-01T14:15:00.000Z" },
    { title: "Delivery complaint resolved", status: "resolved", time: "2026-08-31T11:45:00.000Z" },
  ],
};

export const mockSellers = [
  { _id: "mock-seller-1", name: "Ayesha Khan", email: "ayesha@example.com", sales: 8420, status: "Active" },
  { _id: "mock-seller-2", name: "Hamza Store", email: "hamza@example.com", sales: 6175, status: "Active" },
  { _id: "mock-seller-3", name: "Sound House", email: "sound@example.com", sales: 4295.5, status: "Active" },
];

export const mockUsers = {
  customers: [
    { _id: "mock-customer-1", firstName: "Sara", lastName: "Ahmed", email: "sara@example.com", status: "active" },
    { _id: "mock-customer-2", firstName: "Bilal", lastName: "Raza", email: "bilal@example.com", status: "active" },
  ],
  sellers: mockSellers.map((seller) => ({
    _id: seller._id,
    firstName: seller.name,
    lastName: "",
    email: seller.email,
    status: "active",
  })),
};

export const mockProducts = [
  { _id: "mock-product-1", name: "Wireless Headphones", categoryIds: ["Audio"], basePrice: 129.99, variants: [{ inventory: { quantity: 42 } }] },
  { _id: "mock-product-2", name: "Studio Microphone", categoryIds: ["Recording"], basePrice: 219.5, variants: [{ inventory: { quantity: 8 } }] },
  { _id: "mock-product-3", name: "Portable Speaker", categoryIds: ["Audio"], basePrice: 89, variants: [{ inventory: { quantity: 26 } }] },
];

export const mockOrders = [
  { _id: "mock-order-1", orderNumber: "ORD-1001", pricing: { grandTotal: 349.49 }, status: "Delivered", createdAt: "2026-09-01T10:00:00.000Z", items: [{ sellerId: "mock-seller-1", lineTotal: 349.49, productName: "Wireless Headphones" }] },
  { _id: "mock-order-2", orderNumber: "ORD-1002", pricing: { grandTotal: 219.5 }, status: "Processing", createdAt: "2026-08-28T15:30:00.000Z", items: [{ sellerId: "mock-seller-2", lineTotal: 219.5, productName: "Studio Microphone" }] },
];

export const mockComplaints = [
  { _id: "mock-complaint-1", title: "Delivery arrived late", description: "Order arrived two days after the expected date.", category: "delivery", priority: "medium", status: "open", userName: "Sara Ahmed", createdAt: "2026-09-02T08:30:00.000Z" },
  { _id: "mock-complaint-2", title: "Product specification mismatch", description: "The received product differs from the listed specification.", category: "product", priority: "high", status: "in_review", userName: "Bilal Raza", createdAt: "2026-09-01T12:00:00.000Z" },
];

export const mockSellerStats = { totalProducts: 18, totalOrders: 64, monthlyRevenue: "4820.75" };
