// Crunch Cartel Menu Data
// Extracted accurately from official Crunch Cartel Menu cards

const MENU_CATEGORIES = [
  { id: 'all', name: 'All Items', icon: 'fa-utensils' },
  { id: 'deals', name: 'Boss Deals', icon: 'fa-crown', badge: 'Popular' },
  { id: 'combos', name: 'Feast Combos', icon: 'fa-fire', badge: 'Value' },
  { id: 'burgers', name: 'Burgers & Wraps', icon: 'fa-burger' },
  { id: 'chicken', name: 'Chicken & Broast', icon: 'fa-drumstick-bite' },
  { id: 'fries', name: 'Loaded Fries', icon: 'fa-bowl-food' }
];

const MENU_ITEMS = [
  // --- BOSS OF THE WEEK DEALS ---
  {
    id: 'deal-1',
    name: 'Deal 1 (Boss of the Week)',
    category: 'deals',
    price: 949,
    originalPrice: 1150,
    badge: 'Boss Pick',
    rating: 4.9,
    image: 'assets/images/broast-combo.jpg',
    description: 'The ultimate power lunch: Kingpin Burger + Cartel Wrap + 2 Crispy Wings + Hot Fries + 500ml Cold Drink.',
    tags: ['Kingpin', 'Cartel Wrap', '2 Wings', 'Fries', '500ml Drink'],
    popular: true
  },
  {
    id: 'deal-2',
    name: 'Deal 2 (Broast & Wrap)',
    category: 'deals',
    price: 899,
    originalPrice: 1099,
    badge: 'Best Value',
    rating: 4.8,
    image: 'assets/images/broast-fries.jpg',
    description: 'Crispy perfection: Chest Broast + Signature Cartel Wrap + Hot Fries + 500ml Cold Drink.',
    tags: ['Chest Broast', 'Cartel Wrap', 'Fries', '500ml Drink'],
    popular: true
  },
  {
    id: 'deal-3',
    name: 'Deal 3 (Triple Mafia Threat)',
    category: 'deals',
    price: 999,
    originalPrice: 1220,
    badge: 'Super Feast',
    rating: 5.0,
    image: 'assets/images/cartel-wrap-2.jpg',
    description: 'Heavy hitter: Patty Hiest Burger + Cartel Wrap + 2 Deadly Drum Sticks + Fries + 500ml Cold Drink.',
    tags: ['Patty Hiest', 'Cartel Wrap', '2 Drumsticks', 'Fries', '500ml Drink'],
    popular: true
  },
  {
    id: 'deal-4',
    name: 'Deal 4 (Leg Broast Duo)',
    category: 'deals',
    price: 949,
    originalPrice: 1140,
    badge: 'Chef Choice',
    rating: 4.9,
    image: 'assets/images/mafia-broast.jpg',
    description: 'Crispy crunchy bliss: Golden Leg Broast + Kingpin Burger + Hot Fries + 500ml Cold Drink.',
    tags: ['Leg Broast', 'Kingpin', 'Fries', '500ml Drink'],
    popular: true
  },

  // --- SPECIAL COMBOS & FAMILY DEALS (Page 2) ---
  {
    id: 'crunch-don',
    name: 'The Crunch Don',
    category: 'combos',
    price: 399,
    originalPrice: 480,
    badge: 'Budget King',
    rating: 4.7,
    image: 'assets/images/kingpin-burger.jpg',
    description: 'Solo Mafia hunger buster: Patty Hiest + Crispy Fries + 345ml Cold Drink.',
    tags: ['Patty Hiest', 'Fries', '345ml Drink'],
    popular: false
  },
  {
    id: 'hitman-special',
    name: 'Hitman Special',
    category: 'combos',
    price: 499,
    originalPrice: 620,
    badge: 'Top Seller',
    rating: 4.9,
    image: 'assets/images/kingpin-burger.jpg',
    description: 'The hitman signature: Kingpin Crispy Burger + Fresh Crispy Fries + 345ml Cold Drink.',
    tags: ['Kingpin Burger', 'Fries', '345ml Drink'],
    popular: true
  },
  {
    id: 'mafia-feast',
    name: 'Mafia Feast',
    category: 'combos',
    price: 1149,
    originalPrice: 1390,
    badge: 'Duo Special',
    rating: 4.9,
    image: 'assets/images/broast-combo.jpg',
    description: 'Feast for two: Kingpin + Patty Hiest + 2 Deadly Drum Sticks + Fries + 2x 300ml Cold Drinks.',
    tags: ['Kingpin', 'Patty Hiest', '2 Drumsticks', 'Fries', '2 Drinks'],
    popular: true
  },
  {
    id: 'bossman-deal',
    name: 'Bossman Deal',
    category: 'combos',
    price: 1549,
    originalPrice: 1850,
    badge: 'Squad Pick',
    rating: 4.9,
    image: 'assets/images/double-hiest-hand.jpg',
    description: 'Feed the crew: Any 2 Burgers of your choice + Crispy Fries + 4 Gangster Wings + 2x 300ml Drinks.',
    tags: ['2 Burgers', '4 Wings', 'Fries', '2 Drinks'],
    popular: true
  },
  {
    id: 'the-food-don',
    name: 'The Food Don',
    category: 'combos',
    price: 1999,
    originalPrice: 2400,
    badge: 'Mega Feast',
    rating: 5.0,
    image: 'assets/images/broast-combo.jpg',
    description: 'Don-level spread: 4 Grill Syndicate Burgers + 2 Cartel Wraps + Crispy Fries + 1 Liter Cold Drink.',
    tags: ['4 Grill Syndicate', '2 Wraps', 'Fries', '1L Drink'],
    popular: true
  },
  {
    id: 'burger-empire',
    name: 'Burger Empire',
    category: 'combos',
    price: 2999,
    originalPrice: 3600,
    badge: 'Cartel Empire',
    rating: 5.0,
    image: 'assets/images/double-hiest-hand.jpg',
    description: 'The king of all feasts: Any 4 Burgers + 8 Gangster Wings + Loaded Fries basket + 1 Liter Cold Drink.',
    tags: ['4 Burgers', '8 Wings', 'Fries Basket', '1L Drink'],
    popular: true
  },

  // --- BURGERS & WRAPS ---
  {
    id: 'cartel-wrap',
    name: 'Cartel Wrap',
    category: 'burgers',
    price: 269,
    originalPrice: null,
    badge: 'Crowd Fav',
    rating: 4.8,
    image: 'assets/images/cartel-wrap.jpg',
    description: 'Crispy fried chicken tender fillet wrapped in warm flatbread with fresh lettuce and secret creamy Cartel garlic pepper sauce.',
    tags: ['Crispy Chicken', 'Tortilla', 'Cartel Sauce'],
    popular: true
  },
  {
    id: 'kingpin',
    name: 'Kingpin Burger',
    category: 'burgers',
    price: 399,
    originalPrice: null,
    badge: 'Iconic',
    rating: 4.9,
    image: 'assets/images/kingpin-burger.jpg',
    description: 'Signature crispy fried chicken fillet, golden toasted sesame bun, chilled shredded lettuce & creamy spicy dressing.',
    tags: ['Crispy Fillet', 'Sesame Bun', 'Creamy Dip'],
    popular: true
  },
  {
    id: 'patty-hiest',
    name: 'Patty Hiest',
    category: 'burgers',
    price: 349,
    originalPrice: null,
    badge: 'Classic',
    rating: 4.7,
    image: 'assets/images/kingpin-burger.jpg',
    description: 'Thick grilled chicken patty seasoned with secret cartel spices, melted cheese, mayo, and crisp lettuce.',
    tags: ['Grilled Patty', 'Melted Cheese', 'Classic Sauce'],
    popular: false
  },
  {
    id: 'grill-syndicate',
    name: 'Grill Syndicate',
    category: 'burgers',
    price: 599,
    originalPrice: null,
    badge: 'Smoky & Bold',
    rating: 4.9,
    image: 'assets/images/double-hiest-hand.jpg',
    description: 'Tender flame-grilled peri-peri chicken breast layered with smoky BBQ syndicate sauce and fresh caramelized onions.',
    tags: ['Smoky Grilled', 'Peri-Peri Glaze', 'Premium'],
    popular: true
  },
  {
    id: 'kingpin-tower',
    name: 'Kingpin Tower',
    category: 'burgers',
    price: 599,
    originalPrice: null,
    badge: 'Double Fillet',
    rating: 5.0,
    image: 'assets/images/kingpin-tower.jpg',
    description: 'Double crispy fried chicken fillets stacked tall, drenched in melted cheese sauce and signature spicy white pepper sauce.',
    tags: ['2x Crispy Fillets', 'Double Cheese', 'Tower Sized'],
    popular: true
  },
  {
    id: 'double-hiest',
    name: 'Double Hiest',
    category: 'burgers',
    price: 499,
    originalPrice: null,
    badge: 'Double Patty',
    rating: 4.8,
    image: 'assets/images/double-hiest-hand.jpg',
    description: 'Two seasoned patties, double melted cheddar, secret cartel dressing on a toasted gourmet brioche bun.',
    tags: ['Double Patty', 'Double Cheddar', 'Heist Special'],
    popular: false
  },

  // --- CHICKEN & WINGS ---
  {
    id: 'mafia-leg',
    name: 'Mafia Leg Broast',
    category: 'chicken',
    price: 499,
    originalPrice: null,
    badge: 'Extra Crispy',
    rating: 4.9,
    image: 'assets/images/mafia-broast.jpg',
    description: 'Golden, super-crunchy chicken leg broast piece cooked to juicy tenderness, served with garlic mayo dip and fries.',
    tags: ['Leg Broast', 'Juicy Inside', 'Garlic Mayo'],
    popular: true
  },
  {
    id: 'mafia-chest',
    name: 'Mafia Chest Broast',
    category: 'chicken',
    price: 499,
    originalPrice: null,
    badge: 'Meaty & Tender',
    rating: 4.8,
    image: 'assets/images/broast-combo.jpg',
    description: 'Large premium chicken chest broast piece with unbeatable crunch, seasoned with secret cartel spices and hot dip.',
    tags: ['Chest Broast', 'Crispy Crust', 'Fries & Dip'],
    popular: true
  },
  {
    id: 'deadly-drum-sticks',
    name: 'Deadly Drum Sticks (2 Pcs)',
    category: 'chicken',
    price: 349,
    originalPrice: null,
    badge: 'Hot Pick',
    rating: 4.8,
    image: 'assets/images/chicken-dip.jpg',
    description: '2 jumbo chicken drumsticks fried to ultra-crispy perfection, served with signature cartel pepper dip.',
    tags: ['2 Pcs Jumbo', 'Pepper Dip', 'Crunchy Skin'],
    popular: true
  },
  {
    id: 'gangster-wings',
    name: 'Gangster Wings (2 Pcs)',
    category: 'chicken',
    price: 149,
    originalPrice: null,
    badge: 'Snack Hit',
    rating: 4.7,
    image: 'assets/images/gangster-wings.jpg',
    description: '2 crunchy coated fried wings tossed with red cartel spice dust, paired with sweet spicy chili sauce.',
    tags: ['2 Wings', 'Sweet Chili Dip', 'Spicy Batter'],
    popular: false
  },

  // --- FRIES & SIDES ---
  {
    id: 'loaded-fries',
    name: 'Loaded Fries',
    category: 'fries',
    price: 499,
    originalPrice: null,
    badge: 'Cartel Signature',
    rating: 4.9,
    image: 'assets/images/broast-fries.jpg',
    description: 'Golden crispy crinkle fries smothered in melted cheddar cheese, crispy fried chicken chunks, jalapeños & cartel sauce.',
    tags: ['Melted Cheddar', 'Chicken Chunks', 'Jalapenos'],
    popular: true
  },
  {
    id: 'criminal-fries',
    name: 'Criminal Fries',
    category: 'fries',
    price: 149,
    originalPrice: null,
    badge: 'Crispy & Hot',
    rating: 4.6,
    image: 'assets/images/broast-fries.jpg',
    description: 'Hot, salted, extra-crispy golden potato fries sprinkled with Crunch Cartel secret peri-peri seasoning.',
    tags: ['Hot Salted', 'Peri-Peri Dust', 'Crispy'],
    popular: false
  }
];

// Contact & Social information exactly as requested
const CARTEL_INFO = {
  name: 'Crunch Cartel',
  tagline: 'More Taste, More Value. Bigger Bite, Bolder Vibe.',
  phone: '0340 2402120',
  phoneClean: '923402402120',
  email: 'Cartelcrunch50@gmail.com',
  facebook: 'https://www.facebook.com/share/1C8iUvvGta/',
  instagram: 'https://www.instagram.com/crunchcartel_?obrf=MWU5Y2xsaWVjYTZxbQ==',
  deliveryHours: '4:00 PM – 3:00 AM (Open 7 Days)',
  address: 'Crunch Cartel HQ — Karachi, Pakistan'
};
