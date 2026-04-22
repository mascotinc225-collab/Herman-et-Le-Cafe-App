export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  isBestseller?: boolean;
  isSignature?: boolean;
}

export interface MenuCategory {
  title: string;
  description?: string;
  items: MenuItem[];
}

export const menuData: MenuCategory[] = [
  {
    title: "Hot Coffee Specialities",
    description: "Classic brewing excellence with bold, concentrated flavors.",
    items: [
      { id: "h1", name: "Ristretto", description: "Short, concentrated shot of espresso with bold aroma and intense flavor", price: 800, image: "/Material/ristretto.webp", isSignature: true },
      { id: "h2", name: "2 × Ristretto", description: "Double ristretto shots for a stronger, richer taste", price: 1400, image: "/Material/double_espresso_v2.jpg" },
      { id: "h3", name: "Espresso", description: "Classic Italian coffee shot made from finely ground beans and hot water", price: 800, image: "/Material/espresso.webp", isBestseller: true },
      { id: "h4", name: "2 × Espresso", description: "Two shots of espresso for extra energy and depth", price: 1400, image: "/Material/double_espresso_v2.jpg" },
      { id: "h5", name: "Coffee (Classic)", description: "Smooth brewed coffee made from quality roasted beans", price: 1000, image: "/Material/coffee.webp" },
      { id: "h6", name: "2 × Coffee", description: "Double serving of classic brewed coffee", price: 1800, image: "/Material/coffee.webp" },
      { id: "h7", name: "Americano", description: "Espresso diluted with hot water for a lighter, longer drink", price: 1000, image: "/Material/espresso.webp" },
      { id: "h8", name: "2 × Americano", description: "Double Americano for extended enjoyment", price: 1800, image: "/Material/double_espresso.webp" },
      { id: "h9", name: "Lungo", description: "Long espresso with more water, slightly more bitter and aromatic", price: 1000, image: "/Material/espresso.webp" },
      { id: "h10", name: "2 × Lungo", description: "Double lungo for a stronger long coffee experience", price: 1800, image: "/Material/double_espresso.webp" },
      { id: "h11", name: "Special Coffee", description: "House blend with enhanced aroma and richer body", price: 1500, image: "/Material/coffee.webp" },
      { id: "h12", name: "2 × Special Coffee", description: "Double serving of our signature house coffee", price: 2600, image: "/Material/coffee.webp" },
      { id: "h13", name: "Espresso Doppio", description: "Two shots of espresso in one cup, bold and energizing", price: 1200, image: "/Material/double_espresso.webp" },
    ]
  },
  {
    title: "Milk-Based Coffees",
    description: "Smooth, creamy blends pairing our signature espresso with velvety milk.",
    items: [
      { id: "m1", name: "Espresso Macchiato", description: "Espresso topped with a small amount of steamed milk foam", price: 1000, image: "/Material/espresso_machiato.jpg" },
      { id: "m2", name: "2 × Espresso Macchiato", description: "Double espresso with light milk foam", price: 1800, image: "/Material/double_espresso_macchiato.webp" },
      { id: "m3", name: "Caffè Latte", description: "Espresso with steamed milk and a light layer of foam, smooth and creamy", price: 1500, image: "/Material/flat white.webp" },
      { id: "m4", name: "2 × Caffè Latte", description: "Double latte for a richer, milkier experience", price: 2600, image: "/Material/double_flat_white.webp" },
      { id: "m5", name: "Cappuccino", description: "Equal parts espresso, steamed milk, and foam, balanced and frothy", price: 1500, image: "/Material/cappuccino.webp", isBestseller: true },
      { id: "m6", name: "2 × Cappuccino", description: "Double cappuccino with extra richness", price: 2600, image: "/Material/double_cappuccino_v2.jpg" },
      { id: "m7", name: "Flat White", description: "Espresso with velvety microfoam milk, smooth and strong", price: 1700, image: "/Material/flat white.webp", isSignature: true },
      { id: "m8", name: "2 × Flat White", description: "Double flat white for a creamy yet bold taste", price: 3000, image: "/Material/double_flat_white.webp" },
      { id: "m9", name: "Latte Macchiato", description: "Steamed milk “stained” with a shot of espresso, layered and smooth", price: 1700, image: "/Material/flat white.webp" },
      { id: "m10", name: "2 × Latte Macchiato", description: "Double layered milk coffee with extra espresso", price: 3000, image: "/Material/double_flat_white.webp" },
    ]
  },
  {
    title: "Iced Coffee Selection",
    description: "Chilled perfection served over ice. Available flavors: Vanilla • Caramel • Hazelnut.",
    items: [
      { id: "i1", name: "Iced Ristretto", description: "Chilled ristretto served over ice, intense and refreshing", price: 1000, image: "/Material/ice_ristretto.png" },
      { id: "i2", name: "Iced Espresso", description: "Cold espresso over ice, bold and refreshing", price: 1000, image: "/Material/ice_espresso.png" },
      { id: "i3", name: "Iced Coffee", description: "Chilled brewed coffee served over ice", price: 1500, image: "/Material/ice_coffee.png" },
      { id: "i4", name: "Iced Americano", description: "Espresso with cold water and ice for a smooth, light drink", price: 1500, image: "/Material/ice_americano.png" },
      { id: "i5", name: "Iced Lungo", description: "Long espresso served cold over ice", price: 1500, image: "/Material/ice_lungo.png" },
      { id: "i6", name: "Iced Special Coffee", description: "Iced version of our house blend, rich and smooth", price: 2000, image: "/Material/ice_special_coffee.png" },
      { id: "i7", name: "Iced Latte", description: "Espresso with cold milk and ice, creamy and refreshing", price: 2000, image: "/Material/ice_latte_drinks.png" },
      { id: "i8", name: "Iced Cappuccino", description: "Cold espresso with milk and light foam over ice", price: 2000, image: "/Material/ice_cappuccino.png" },
      { id: "i9", name: "Iced Flat White", description: "Strong espresso with chilled microfoam milk", price: 2300, image: "/Material/ice_flat_white.png" },
      { id: "i10", name: "Iced Latte Macchiato", description: "Cold milk layered with espresso and ice", price: 2300, image: "/Material/ice_caramel_latte.png" },
    ]
  },
  {
    title: "Milkshakes (Youth Favorites)",
    description: "Indulgent blended treats for the next generation of connoisseurs.",
    items: [
      { id: "s1", name: "Oreo Milkshake", description: "Blended milk, ice cream, and crushed Oreo biscuits", price: 2500, image: "/Material/oreo_milkshake.png" },
      { id: "s2", name: "KitKat Milkshake", description: "Creamy milkshake blended with KitKat chocolate wafers", price: 2500, image: "/Material/kitkat_milkshake.png" },
      { id: "s3", name: "Kinder Bueno Milkshake", description: "Rich milkshake with Kinder Bueno chocolate and hazelnut cream", price: 2800, image: "/Material/kinder_bueno_milkshake.png" },
      { id: "s4", name: "Cadbury Milkshake", description: "Smooth chocolate milkshake made with Cadbury chocolate", price: 2500, image: "/Material/cadbury_milkshake.jpg" },
      { id: "s5", name: "Ferrero Rocher Milkshake", description: "Premium blend of chocolate, hazelnut, and Ferrero Rocher pieces", price: 3000, image: "/Material/ferrero_rocher_milkshake.png" },
    ]
  }
];

export const offers = [
  { id: "o1", title: "Duo Deal", description: "Any 2 coffees", discount: "-200 FCFA" },
  { id: "o2", title: "Chill Combo", description: "Iced drink + Milkshake", discount: "-300 FCFA" },
  { id: "o3", title: "Happy Hour", description: "3PM–6PM: Iced drinks", discount: "-10%" },
];
