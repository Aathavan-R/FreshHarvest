const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

const INITIAL_PRODUCTS = [
  {
    name: 'Fresh Organic Farm Tomatoes',
    description: 'Vine-ripened, hand-picked farm fresh tomatoes. Rich in antioxidants and bursting with natural flavor.',
    category: 'Vegetables',
    price: 38,
    unit: 'kg',
    stock: 65,
    farmerName: 'Ramasamy Farms',
    farmLocation: 'Perundurai, Erode',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
    rating: 4.8,
    isOrganic: true
  },
  {
    name: 'Hilltop Cavendish Bananas',
    description: 'Naturally sweetened, chemical-free bananas harvested from the foothills of Sirumalai.',
    category: 'Fruits',
    price: 55,
    unit: 'dozen',
    stock: 40,
    farmerName: 'Kaveri Valley Orchards',
    farmLocation: 'Pollachi, Coimbatore',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    isOrganic: true
  },
  {
    name: 'Traditional Brown Ponni Rice',
    description: 'Unpolished traditional single-boiled rice rich in fiber, vitamins, and minerals.',
    category: 'Grains & Pulses',
    price: 85,
    unit: 'kg',
    stock: 120,
    farmerName: 'Thirunavukkarasu Naturals',
    farmLocation: 'Thanjavur, Tamil Nadu',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    isOrganic: true
  },
  {
    name: 'Pure Desi A2 Cow Milk',
    description: 'Raw, unpasteurized, nutrient-dense pure A2 milk directly from grass-fed Kangayam cows.',
    category: 'Dairy & Organic',
    price: 70,
    unit: 'litre',
    stock: 30,
    farmerName: 'Kangayam Indigenous Dairy',
    farmLocation: 'Tiruppur, Tamil Nadu',
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&auto=format&fit=crop&q=80',
    rating: 5.0,
    isOrganic: true
  },
  {
    name: 'Fresh Crisp Country Spinach (Palak)',
    description: 'Crisp, iron-rich fresh green spinach harvested early morning for maximum nutrition.',
    category: 'Vegetables',
    price: 25,
    unit: 'bunch',
    stock: 50,
    farmerName: 'Greenfield Agri Co-op',
    farmLocation: 'Bhavani, Erode',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80',
    rating: 4.7,
    isOrganic: true
  },
  {
    name: 'Wild Forest Raw Honey',
    description: 'Unprocessed, unheated multi-floral natural honey sustainably gathered from Western Ghats apiaries.',
    category: 'Dairy & Organic',
    price: 320,
    unit: '500g',
    stock: 25,
    farmerName: 'Nilgiri Tribal Collective',
    farmLocation: 'Kotagiri, Nilgiris',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    isOrganic: true
  },
  {
    name: 'Fresh Seedless Watermelon',
    description: 'Sweet, hydrating, juicy red watermelon cultivated without artificial stimulants.',
    category: 'Fruits',
    price: 32,
    unit: 'kg',
    stock: 35,
    farmerName: 'Marudham Sun Farms',
    farmLocation: 'Dharmapuri, Tamil Nadu',
    image: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=600&auto=format&fit=crop&q=80',
    rating: 4.6,
    isOrganic: true
  },
  {
    name: 'Raw Organic Turmeric Fingers',
    description: 'High-curcumin fresh Salem turmeric roots. Naturally sun-dried and pesticide-free.',
    category: 'Herbs & Spices',
    price: 140,
    unit: '500g',
    stock: 45,
    farmerName: 'Kongu Spice Growers',
    farmLocation: 'Salem, Tamil Nadu',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    isOrganic: true
  },
  {
    name: 'Organic Country Carrots',
    description: 'Crunchy sweet carrots straight from the cool hills of Ooty. Loaded with beta carotene.',
    category: 'Vegetables',
    price: 45,
    unit: 'kg',
    stock: 55,
    farmerName: 'Highland Organic Growers',
    farmLocation: 'Ooty, Nilgiris',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=80',
    rating: 4.8,
    isOrganic: true
  }
];

// Seed initial products if collection is empty
async function seedProductsIfNeeded() {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(INITIAL_PRODUCTS);
      console.log('Seeded initial FreshHarvest products into database.');
    }
  } catch (err) {
    console.error('Error seeding products:', err.message);
  }
}

// GET /api/products - Browse, search, filter, paginate
router.get('/', async (req, res) => {
  try {
    await seedProductsIfNeeded();

    const {
      search = '',
      category = 'All',
      page = 1,
      limit = 6,
      sortBy = 'newest'
    } = req.query;

    const query = {};

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Search query (case-insensitive substring match on name, description, farmerName)
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { farmerName: searchRegex },
        { farmLocation: searchRegex }
      ];
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sortBy === 'price-low') sortOptions = { price: 1 };
    if (sortBy === 'price-high') sortOptions = { price: -1 };
    if (sortBy === 'rating') sortOptions = { rating: -1 };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 6);
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const categories = [
      'All',
      'Vegetables',
      'Fruits',
      'Grains & Pulses',
      'Dairy & Organic',
      'Herbs & Spices'
    ];

    res.status(200).json({
      products,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      categories
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving products.', error: error.message });
  }
});

// GET /api/products/categories
router.get('/categories', async (req, res) => {
  const categories = [
    'All',
    'Vegetables',
    'Fruits',
    'Grains & Pulses',
    'Dairy & Organic',
    'Herbs & Spices'
  ];
  res.status(200).json({ categories });
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.status(200).json({ product });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product details.', error: error.message });
  }
});

module.exports = router;
