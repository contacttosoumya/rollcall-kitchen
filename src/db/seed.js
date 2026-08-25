/**
 * src/db/seed.js
 *
 * Populates the database with RollCall Kitchen's real menu, location, and
 * site content — reconstructed from the restaurant's own menu sheet.
 *
 * Every insert is an upsert (ON CONFLICT ... DO UPDATE) keyed by a natural
 * key (slug / key / a unique label), so this script is safe to re-run any
 * time — editing this file and re-running `npm run db:seed` is the
 * supported way to update menu items, prices, or site copy.
 *
 * NOTE: phone, email, and social links below are placeholders — swap them
 * for RollCall Kitchen's real details before going live (see README).
 *
 * Usage: node src/db/seed.js
 */
const { withTransaction, close } = require("../config/database");
const logger = require("../config/logger");

const categories = [
  { slug: "chaat", label: "Chaat & Street Snacks", icon: "🧆", blurb: "Kolkata-style tang, crunch & spice", sort_order: 1 },
  { slug: "rolls", label: "Kathi Rolls", icon: "🌯", blurb: "Our signature — rolled fresh to order", sort_order: 2 },
  { slug: "wraps", label: "Indi-Dilla Wraps", icon: "🧀", blurb: "Our twist on the quesadilla", sort_order: 3 },
  { slug: "naan-platters", label: "Naan Platters", icon: "🫓", blurb: "Served with salan & your choice of naan", sort_order: 4 },
  { slug: "pulao-platters", label: "Pulao Platters", icon: "🍚", blurb: "Fragrant rice platters, served with salan", sort_order: 5 },
  { slug: "wings", label: "Tandoori Wings", icon: "🍗", blurb: "By the piece — for the table or just you", sort_order: 6 },
  { slug: "kebabs", label: "Kebabs & Tandoori", icon: "🍢", blurb: "Charcoal-fired classics", sort_order: 7 },
  { slug: "biryani-curry", label: "Biryani, Curry & Specials", icon: "🍛", blurb: "Weekend-worthy, made any day", sort_order: 8 },
  { slug: "dosa", label: "Dosa & South Indian", icon: "🥞", blurb: "Crisp, fermented, comforting", sort_order: 9 },
  { slug: "roti", label: "Roti, Paratha & Breakfast", icon: "🍞", blurb: "Griddled fresh, served warm", sort_order: 10 },
  { slug: "tangra", label: "Tangra Chinese", icon: "🥡", blurb: "Kolkata's Indo-Chinese specials", sort_order: 11 },
  { slug: "sides", label: "Sides, Soups & Momos", icon: "🍟", blurb: "Small plates worth ordering extra of", sort_order: 12 },
  { slug: "desserts", label: "Desserts", icon: "🍮", blurb: "A sweet finish", sort_order: 13 },
  { slug: "drinks", label: "Beverages & Bobba", icon: "🧋", blurb: "Chai, boba, mocktails & more", sort_order: 14 },
];

// price given in dollars for readability; converted to cents on insert.
const dishes = [
  // ---- Chaat & Street Snacks ----
  { slug: "fuchka-pani-puri", category: "chaat", name: "Fuchka / Pani Puri", price: 4.99, veg: true, spice: 2, tags: ["bestseller"], desc: "Crisp puris, tangy spiced water, and a chickpea-potato filling." },
  { slug: "dahi-puri", category: "chaat", name: "Dahi Puri", price: 6.99, veg: true, spice: 1, tags: [], desc: "Puris topped with whipped yogurt, sev, and two chutneys." },
  { slug: "jhalmuri", category: "chaat", name: "Jhalmuri", price: 4.49, veg: true, spice: 2, tags: [], desc: "Kolkata's classic puffed-rice snack, tossed with mustard oil and spice." },
  { slug: "bhel-puri", category: "chaat", name: "Bhel Puri", price: 4.49, veg: true, spice: 1, tags: [], desc: "Puffed rice, crunchy sev, onion, and tamarind chutney." },
  { slug: "samosa-chaat", category: "chaat", name: "Samosa Chaat", price: 6.99, veg: true, spice: 2, tags: [], desc: "Crushed samosas layered with chickpeas, yogurt, and chutneys." },
  { slug: "papdi-chaat", category: "chaat", name: "Papdi Chaat", price: 6.99, veg: true, spice: 1, tags: [], desc: "Crisp papdi, potato, yogurt, and tangy-sweet chutneys." },
  { slug: "tossed-idli-chaat", category: "chaat", name: "Tossed Idli Chaat", price: 7.99, veg: true, spice: 2, tags: ["new"], desc: "Bite-sized idlis tossed street-cart style with chutneys and spice." },
  { slug: "masala-papad", category: "chaat", name: "Masala Papad", price: 3.99, veg: true, spice: 1, tags: [], desc: "Crisp papad topped with onion, tomato, and chaat masala." },
  { slug: "masala-peanuts", category: "chaat", name: "Masala Peanuts", price: 4.99, veg: true, spice: 1, tags: [], desc: "Roasted peanuts tossed with onion, chili, and lemon." },
  { slug: "veggie-chop", category: "chaat", name: "Veggie Chop (2 pc)", price: 4.99, veg: true, spice: 1, tags: [], desc: "Kolkata-style breaded vegetable croquettes." },

  // ---- Kathi Rolls (signature) ----
  { slug: "egg-roll", category: "rolls", name: "Egg Roll", price: 6.99, veg: false, spice: 1, tags: [], desc: "The Kolkata classic — egg-laced paratha rolled with onion and chutney." },
  { slug: "paneer-roll", category: "rolls", name: "Paneer Kathi Roll", price: 9.99, veg: true, spice: 1, tags: [], desc: "Grilled paneer, onions, and mint chutney rolled in a flaky paratha." },
  { slug: "chicken-tikka-roll", category: "rolls", name: "Chicken Tikka Kathi Roll", price: 9.99, veg: false, spice: 2, tags: [], desc: "Char-grilled chicken tikka rolled hot off the tawa." },
  { slug: "chicken-malai-tikka-roll", category: "rolls", name: "Chicken Malai Tikka Kathi Roll", price: 9.99, veg: false, spice: 1, tags: [], desc: "Creamy, mildly spiced malai tikka chicken, rolled fresh." },
  { slug: "chicken-seekh-kebab-roll", category: "rolls", name: "Chicken Seekh Kebab Kathi Roll", price: 9.99, veg: false, spice: 2, tags: ["bestseller"], desc: "Minced spiced chicken seekh kebab, onions, and chutney." },
  { slug: "mutton-seekh-kabab-roll", category: "rolls", name: "Mutton Seekh Kabab Kathi Roll", price: 11.99, veg: false, spice: 2, tags: ["chefs-pick"], desc: "Slow-spiced minced mutton kebab, rolled the authentic way." },
  { slug: "lamb-gyro-roll", category: "rolls", name: "Lamb Gyro Kathi Roll", price: 11.99, veg: false, spice: 1, tags: [], desc: "Seasoned lamb gyro rolled kathi-style with fresh toppings." },
  { slug: "falafel-roll", category: "rolls", name: "Falafel Kathi Roll", price: 8.99, veg: true, spice: 1, tags: [], desc: "Crisp falafel, fresh veggies, and chutney, rolled to order." },
  { slug: "house-special-chicken-roll", category: "rolls", name: "Special House Chicken Roll", price: 12.99, veg: false, spice: 2, tags: ["bestseller"], desc: "Our loaded signature roll — ask your server what's in it today." },

  // ---- Indi-Dilla Wraps ----
  { slug: "paneer-indidilla", category: "wraps", name: "Paneer Indi-Dilla", price: 9.99, veg: true, spice: 1, tags: [], desc: "Our twist on the quesadilla — grilled paneer and melted cheese." },
  { slug: "chicken-indidilla", category: "wraps", name: "Chicken Indi-Dilla", price: 9.99, veg: false, spice: 2, tags: [], desc: "Spiced chicken and melted cheese pressed into a crisp tortilla." },
  { slug: "mutton-indidilla", category: "wraps", name: "Mutton Indi-Dilla", price: 11.99, veg: false, spice: 2, tags: [], desc: "Slow-spiced mutton and cheese, grilled to order." },
  { slug: "lamb-gyro-indidilla", category: "wraps", name: "Lamb Gyro Indi-Dilla", price: 11.99, veg: false, spice: 1, tags: [], desc: "Seasoned lamb gyro and melted cheese in a crisp quesadilla." },

  // ---- Naan Platters (served with salan; choice of plain, butter, or butter garlic naan) ----
  { slug: "paneer-naan-platter", category: "naan-platters", name: "Paneer Naan Platter", price: 9.99, veg: true, spice: 1, tags: [], desc: "Grilled paneer with salan and your choice of naan." },
  { slug: "chicken-tikka-naan-platter", category: "naan-platters", name: "Chicken Tikka Naan Platter", price: 9.99, veg: false, spice: 2, tags: [], desc: "Char-grilled chicken tikka with salan and your choice of naan." },
  { slug: "chicken-malai-tikka-naan-platter", category: "naan-platters", name: "Chicken Malai Tikka Naan Platter", price: 9.99, veg: false, spice: 1, tags: [], desc: "Creamy malai tikka chicken with salan and your choice of naan." },
  { slug: "chicken-seekh-kebab-naan-platter", category: "naan-platters", name: "Chicken Seekh Kebab Naan Platter", price: 9.99, veg: false, spice: 2, tags: [], desc: "Spiced chicken seekh kebab with salan and your choice of naan." },
  { slug: "mutton-seekh-kabab-naan-platter", category: "naan-platters", name: "Mutton Seekh Kabab Naan Platter", price: 11.99, veg: false, spice: 2, tags: [], desc: "Minced mutton kebab with salan and your choice of naan." },
  { slug: "lamb-gyro-naan-platter", category: "naan-platters", name: "Lamb Gyro Naan Platter", price: 11.99, veg: false, spice: 1, tags: [], desc: "Seasoned lamb gyro with salan and your choice of naan." },
  { slug: "falafel-naan-platter", category: "naan-platters", name: "Falafel Naan Platter", price: 8.99, veg: true, spice: 1, tags: [], desc: "Crisp falafel with salan and your choice of naan." },
  { slug: "combo-naan-platter", category: "naan-platters", name: "Combo Platter (any 2, chicken or veg)", price: 12.99, veg: false, spice: 2, tags: [], desc: "Pick any two proteins, served together with salan and naan." },

  // ---- Pulao Platters (served with salan) ----
  { slug: "butter-chicken-pulao", category: "pulao-platters", name: "Butter Chicken Pulao Platter", price: 12.99, veg: false, spice: 1, tags: [], desc: "Creamy tomato-butter chicken over fragrant pulao rice." },
  { slug: "kadai-chicken-pulao", category: "pulao-platters", name: "Kadai Chicken Pulao Platter", price: 12.99, veg: false, spice: 2, tags: [], desc: "Kadai-style chicken with peppers and onion, over pulao rice." },
  { slug: "butter-chicken-pulao-naan", category: "pulao-platters", name: "Butter Chicken with Pulao & Naan", price: 15.99, veg: false, spice: 1, tags: [], desc: "Butter chicken, pulao rice, and fresh naan — the full plate." },
  { slug: "kadai-chicken-pulao-naan", category: "pulao-platters", name: "Kadai Chicken with Pulao & Naan", price: 15.99, veg: false, spice: 2, tags: [], desc: "Kadai chicken, pulao rice, and fresh naan — the full plate." },
  { slug: "paneer-pulao-platter", category: "pulao-platters", name: "Paneer Pulao Platter", price: 9.99, veg: true, spice: 1, tags: [], desc: "Grilled paneer with salan over fragrant pulao rice." },
  { slug: "chicken-tikka-pulao-platter", category: "pulao-platters", name: "Chicken Tikka Pulao Platter", price: 9.99, veg: false, spice: 2, tags: [], desc: "Char-grilled chicken tikka with salan over pulao rice." },
  { slug: "chicken-malai-tikka-pulao-platter", category: "pulao-platters", name: "Chicken Malai Tikka Pulao Platter", price: 9.99, veg: false, spice: 1, tags: [], desc: "Creamy malai tikka chicken with salan over pulao rice." },
  { slug: "chicken-seekh-kebab-pulao-platter", category: "pulao-platters", name: "Chicken Seekh Kebab Pulao Platter", price: 9.99, veg: false, spice: 2, tags: [], desc: "Spiced chicken seekh kebab with salan over pulao rice." },
  { slug: "mutton-seekh-kabab-pulao-platter", category: "pulao-platters", name: "Mutton Seekh Kabab Pulao Platter", price: 11.99, veg: false, spice: 2, tags: [], desc: "Minced mutton kebab with salan over pulao rice." },
  { slug: "lamb-gyro-pulao-platter", category: "pulao-platters", name: "Lamb Gyro Pulao Platter", price: 11.99, veg: false, spice: 1, tags: [], desc: "Seasoned lamb gyro with salan over pulao rice." },
  { slug: "falafel-pulao-platter", category: "pulao-platters", name: "Falafel Pulao Platter", price: 8.99, veg: true, spice: 1, tags: [], desc: "Crisp falafel with salan over pulao rice." },
  { slug: "combo-pulao-platter", category: "pulao-platters", name: "Combo Platter (any 2, chicken or veg)", price: 12.99, veg: false, spice: 2, tags: [], desc: "Pick any two proteins, served together over pulao rice." },

  // ---- Tandoori Wings ----
  { slug: "tandoori-wings-6", category: "wings", name: "Tandoori Wings (6 pc)", price: 8.99, veg: false, spice: 2, tags: [], desc: "Charcoal-fired tandoori wings, marinated overnight." },
  { slug: "tandoori-wings-10", category: "wings", name: "Tandoori Wings (10 pc)", price: 13.99, veg: false, spice: 2, tags: [], desc: "Charcoal-fired tandoori wings, marinated overnight." },
  { slug: "tandoori-wings-15", category: "wings", name: "Tandoori Wings (15 pc)", price: 19.99, veg: false, spice: 2, tags: [], desc: "Charcoal-fired tandoori wings, marinated overnight." },
  { slug: "tandoori-wings-20", category: "wings", name: "Tandoori Wings (20 pc)", price: 25.99, veg: false, spice: 2, tags: [], desc: "Charcoal-fired tandoori wings — built for the table." },
  { slug: "tandoori-wings-25", category: "wings", name: "Tandoori Wings (25 pc)", price: 31.99, veg: false, spice: 2, tags: [], desc: "Charcoal-fired tandoori wings — built for the table." },
  { slug: "tandoori-wings-30", category: "wings", name: "Tandoori Wings (30 pc)", price: 37.99, veg: false, spice: 2, tags: [], desc: "Charcoal-fired tandoori wings — the party size." },

  // ---- Kebabs & Tandoori ----
  { slug: "maharaja-kebab-platter", category: "kebabs", name: "Maharaja Kebab Platter", price: 19.99, veg: false, spice: 2, tags: ["bestseller"], desc: "Assorted grilled kebabs served with rice, fresh salad, and our signature sauces — built for sharing." },
  { slug: "chicken-tandoor-half", category: "kebabs", name: "Chicken Tandoor (Half)", price: 14.99, veg: false, spice: 2, tags: [], desc: "Charcoal-roasted tandoori chicken, marinated in yogurt and spice." },
  { slug: "chicken-tandoor-full", category: "kebabs", name: "Chicken Tandoor (Full)", price: 18.99, veg: false, spice: 2, tags: [], desc: "A full charcoal-roasted tandoori chicken, marinated overnight." },
  { slug: "fish-fry", category: "kebabs", name: "Fish Fry (1 pc)", price: 7.99, veg: false, spice: 1, tags: [], desc: "Crisp-fried, Kolkata-style spiced fish." },

  // ---- Biryani, Curry & Specials ----
  { slug: "chicken-biryani", category: "biryani-curry", name: "Chicken Biryani", price: 14.99, veg: false, spice: 2, tags: ["bestseller"], desc: "Layered basmati rice and marinated chicken, slow-cooked on dum." },
  { slug: "goat-biryani", category: "biryani-curry", name: "Goat Biryani", price: 17.99, veg: false, spice: 2, tags: ["chefs-pick"], desc: "Bone-in goat, dum-sealed with basmati for maximum depth." },
  { slug: "vegetable-biryani", category: "biryani-curry", name: "Vegetable Biryani", price: 13.99, veg: true, spice: 1, tags: [], desc: "Fragrant basmati layered with mixed vegetables and whole spices." },
  { slug: "chicken-curry", category: "biryani-curry", name: "Chicken Curry", price: 12.99, veg: false, spice: 2, tags: [], desc: "Home-style chicken curry, simmered in onion-tomato masala." },
  { slug: "paneer-butter-masala", category: "biryani-curry", name: "Paneer Butter Masala", price: 12.99, veg: true, spice: 1, tags: [], desc: "Soft paneer cubes in a rich, buttery tomato gravy." },
  { slug: "goat-curry", category: "biryani-curry", name: "Goat Curry", price: 15.99, veg: false, spice: 2, tags: [], desc: "Slow-simmered bone-in goat curry, deeply spiced." },
  { slug: "veg-platter", category: "biryani-curry", name: "Veg Platter", price: 14.99, veg: true, spice: 1, tags: [], desc: "Rice, naan, paneer butter masala or kadai paneer, potato twister & papad." },
  { slug: "chicken-platter", category: "biryani-curry", name: "Chicken Platter", price: 16.99, veg: false, spice: 2, tags: [], desc: "Rice, naan, chicken butter masala or kadai chicken, potato twister & papad." },
  { slug: "goat-platter", category: "biryani-curry", name: "Goat Platter", price: 19.99, veg: false, spice: 2, tags: [], desc: "Rice, naan, goat curry, potato twister & papad." },
  { slug: "chole-kulcha", category: "biryani-curry", name: "Chole Kulcha", price: 14.99, veg: true, spice: 2, tags: ["new"], desc: "Spiced chickpea curry served with soft, griddled kulcha bread." },
  { slug: "masala-pompano", category: "biryani-curry", name: "Masala Pompano", price: 14.99, veg: false, spice: 2, tags: [], desc: "Whole pompano fish, marinated and cooked in a spiced masala." },
  { slug: "fish-and-chips", category: "biryani-curry", name: "Fish and Chips", price: 11.99, veg: false, spice: 0, tags: [], desc: "Crisp-battered fish with a side of fries." },

  // ---- Dosa & South Indian ----
  { slug: "idli", category: "dosa", name: "Idli (4 pc)", price: 9.99, veg: true, spice: 0, tags: [], desc: "Steamed rice-and-lentil cakes, served with sambar and chutney." },
  { slug: "plain-dosa", category: "dosa", name: "Plain Dosa", price: 8.99, veg: true, spice: 0, tags: [], desc: "Crisp, fermented rice-and-lentil crepe." },
  { slug: "masala-dosa", category: "dosa", name: "Masala Dosa", price: 9.99, veg: true, spice: 1, tags: ["chefs-pick"], desc: "Crisp dosa filled with spiced potato masala." },
  { slug: "moong-dal-dosa-plain", category: "dosa", name: "Moong Dal Dosa (Plain)", price: 9.99, veg: true, spice: 0, tags: [], desc: "A lighter dosa made from moong dal batter." },
  { slug: "masala-moong-dal-dosa", category: "dosa", name: "Masala Moong Dal Dosa", price: 12.99, veg: true, spice: 1, tags: [], desc: "Moong dal dosa filled with spiced potato masala." },
  { slug: "green-moong-uttapam", category: "dosa", name: "Green Moong Uttapam", price: 13.99, veg: true, spice: 1, tags: ["new"], desc: "Thick, savory pancake made from green moong batter." },
  { slug: "masala-uttapam", category: "dosa", name: "Masala Uttapam", price: 8.99, veg: true, spice: 1, tags: [], desc: "Thick savory pancake topped with onion, tomato & chili." },
  { slug: "poori-sabji", category: "dosa", name: "Poori & Sabji", price: 9.99, veg: true, spice: 1, tags: [], desc: "Puffed fried bread served with spiced vegetable curry." },
  { slug: "upma", category: "dosa", name: "Upma", price: 8.99, veg: true, spice: 0, tags: [], desc: "Savory semolina porridge, tempered with mustard seed and curry leaf." },

  // ---- Roti, Paratha & Breakfast ----
  { slug: "chapathi-roti-sabji", category: "roti", name: "Chapathi / Roti & Sabji", price: 9.99, veg: true, spice: 1, tags: [], desc: "Griddled whole-wheat bread with spiced vegetable curry." },
  { slug: "paratha-with-sabji", category: "roti", name: "Paratha with Sabji", price: 11.99, veg: true, spice: 1, tags: [], desc: "Layered griddled paratha served with vegetable curry." },
  { slug: "onion-paratha-pickle", category: "roti", name: "Onion Paratha with Pickle", price: 3.99, veg: true, spice: 0, tags: [], desc: "Stuffed onion paratha, served with tangy pickle." },
  { slug: "aloo-paratha", category: "roti", name: "Aloo Paratha", price: 3.99, veg: true, spice: 0, tags: [], desc: "Griddled paratha stuffed with spiced potato." },
  { slug: "spinach-paratha", category: "roti", name: "Spinach Paratha", price: 3.99, veg: true, spice: 0, tags: [], desc: "Griddled paratha stuffed with seasoned spinach." },
  { slug: "bread-jam-butter", category: "roti", name: "Bread with Jam/Butter", price: 4.99, veg: true, spice: 0, tags: [], desc: "Toasted bread, served with jam and butter." },
  { slug: "bread-toast", category: "roti", name: "Bread Toast", price: 7.99, veg: true, spice: 0, tags: [], desc: "Golden griddled toast, served warm." },
  { slug: "omelette", category: "roti", name: "Omelette (2 Eggs)", price: 4.99, veg: false, spice: 0, tags: [], desc: "Simple, fluffy two-egg omelette." },
  { slug: "pav-bhaji", category: "roti", name: "Pav Bhaji", price: 7.99, veg: true, spice: 2, tags: [], desc: "Spiced mashed vegetable curry, served with buttered pav." },
  { slug: "bread-burji", category: "roti", name: "Bread Burji", price: 7.99, veg: false, spice: 1, tags: [], desc: "Scrambled spiced egg burji, served with bread." },

  // ---- Tangra Chinese (Kolkata Indo-Chinese) ----
  { slug: "stir-fried-veg-noodles", category: "tangra", name: "Stir Fried Veg Noodles", price: 9.99, veg: true, spice: 1, tags: [], desc: "Wok-tossed noodles with fresh vegetables, Tangra style." },
  { slug: "stir-fried-egg-noodles", category: "tangra", name: "Stir Fried Egg Noodles", price: 11.99, veg: false, spice: 1, tags: [], desc: "Wok-tossed egg noodles, Tangra style." },
  { slug: "stir-fried-chicken-noodles", category: "tangra", name: "Stir Fried Chicken Noodles", price: 12.99, veg: false, spice: 1, tags: [], desc: "Wok-tossed noodles with chicken, Tangra style. Add egg for $1.50." },
  { slug: "maggi-masala", category: "tangra", name: "Maggi Masala", price: 7.99, veg: true, spice: 1, tags: [], desc: "Spiced masala Maggi noodles, street-cart style." },
  { slug: "hot-tangy-roasted-chicken", category: "tangra", name: "Hot and Tangy Roasted Chicken", price: 11.99, veg: false, spice: 2, tags: [], desc: "Wok-roasted chicken in a hot, tangy Tangra-style sauce." },
  { slug: "spicy-tangy-chicken", category: "tangra", name: "Spicy and Tangy Chicken", price: 11.99, veg: false, spice: 2, tags: [], desc: "Chicken tossed in a spicy, tangy Indo-Chinese sauce. Add fried rice for $4." },
  { slug: "lemon-chicken", category: "tangra", name: "Lemon Chicken", price: 11.99, veg: false, spice: 1, tags: [], desc: "Crisp chicken tossed in a bright lemon glaze. Add fried rice for $4." },
  { slug: "chicken-shimla-mirch", category: "tangra", name: "Chicken Shimla Mirch", price: 11.99, veg: false, spice: 2, tags: ["new"], desc: "Chicken wok-tossed with bell peppers, Tangra style. Add fried rice for $4." },
  { slug: "spicy-tangy-paneer-falafel", category: "tangra", name: "Spicy and Tangy Paneer / Falafel", price: 9.99, veg: true, spice: 2, tags: [], desc: "Paneer or falafel tossed in a spicy, tangy sauce." },
  { slug: "paneer-falafel-shimla-mirch", category: "tangra", name: "Paneer / Falafel Shimla Mirch", price: 9.99, veg: true, spice: 1, tags: [], desc: "Paneer or falafel wok-tossed with bell peppers." },

  // ---- Sides, Soups & Momos ----
  { slug: "falafel-4pc", category: "sides", name: "Falafel (4 pc)", price: 6.99, veg: true, spice: 1, tags: [], desc: "Crisp-fried chickpea falafel." },
  { slug: "masala-fries", category: "sides", name: "Masala Fries", price: 5.99, veg: true, spice: 1, tags: [], desc: "Golden fries tossed in house masala spice." },
  { slug: "cheesy-fries", category: "sides", name: "Cheesy Fries", price: 6.99, veg: true, spice: 1, tags: [], desc: "Golden fries loaded with melted cheese." },
  { slug: "golden-crunch-chicken-combo", category: "sides", name: "Golden Crunch Chicken Combo", price: 9.99, veg: false, spice: 1, tags: [], desc: "Crispy fried chicken, served as a combo." },
  { slug: "chicken-nuggets", category: "sides", name: "Chicken Nuggets (8 pc)", price: 5.99, veg: false, spice: 0, tags: [], desc: "Golden fried chicken nuggets." },
  { slug: "cheese-fries-4pc", category: "sides", name: "Cheese Fries (4 pc)", price: 5.99, veg: true, spice: 0, tags: [], desc: "A smaller order of our loaded cheese fries." },
  { slug: "veg-pakora", category: "sides", name: "Veg Pakora (100g)", price: 4.99, veg: true, spice: 1, tags: [], desc: "Crisp-fried spiced vegetable fritters." },
  { slug: "chicken-pakora", category: "sides", name: "Chicken Pakora (100g)", price: 7.99, veg: false, spice: 1, tags: [], desc: "Crisp-fried spiced chicken fritters." },
  { slug: "aloo-bonda", category: "sides", name: "Aloo Bonda (2 pc)", price: 4.99, veg: true, spice: 1, tags: [], desc: "Spiced mashed potato, battered and fried." },
  { slug: "veg-puff", category: "sides", name: "Veg Puff", price: 3.99, veg: true, spice: 0, tags: [], desc: "Flaky pastry filled with spiced vegetables." },
  { slug: "egg-puff", category: "sides", name: "Egg Puff", price: 4.99, veg: false, spice: 0, tags: [], desc: "Flaky pastry filled with spiced egg." },
  { slug: "mirchi-bhaji", category: "sides", name: "Mirchi Bhaji (2 pc)", price: 3.99, veg: true, spice: 3, tags: [], desc: "Whole chilies, stuffed and fried — for the heat-seekers." },
  { slug: "chicken-slider", category: "sides", name: "Chicken Slider", price: 6.99, veg: false, spice: 1, tags: [], desc: "A mini spiced chicken slider." },
  { slug: "chicken-puff", category: "sides", name: "Chicken Puff", price: 4.99, veg: false, spice: 1, tags: [], desc: "Flaky pastry filled with spiced chicken." },
  { slug: "samosa-2pc", category: "sides", name: "Samosa (2 pc)", price: 4.99, veg: true, spice: 1, tags: [], desc: "Crispy pastry filled with spiced potato and peas." },
  { slug: "vada", category: "sides", name: "Vada", price: 7.99, veg: true, spice: 1, tags: [], desc: "Crisp fried lentil doughnuts, South Indian style." },
  { slug: "sweet-and-sour-soup", category: "sides", name: "Sweet and Sour Soup", price: 4.99, veg: true, spice: 1, tags: [], desc: "Classic Indo-Chinese sweet and sour soup." },
  { slug: "lentil-soup", category: "sides", name: "Lentil Soup", price: 4.99, veg: true, spice: 0, tags: [], desc: "Comforting, home-style lentil soup." },
  { slug: "egg-drop-soup-meatballs", category: "sides", name: "Egg Drop Soup with Chicken Meatballs", price: 4.99, veg: false, spice: 0, tags: [], desc: "Silky egg drop soup with tender chicken meatballs." },
  { slug: "chicken-momo", category: "sides", name: "Chicken Momo (6 pc)", price: 8.99, veg: false, spice: 2, tags: ["bestseller"], desc: "Steamed chicken dumplings, served with spiced chutney." },
  { slug: "veg-momo", category: "sides", name: "Veg Momo (6 pc)", price: 7.99, veg: true, spice: 1, tags: [], desc: "Steamed vegetable dumplings, served with spiced chutney." },

  // ---- Desserts ----
  { slug: "bhapa-doi", category: "desserts", name: "Bhapa Doi", price: 4.99, veg: true, spice: 0, tags: [], desc: "Steamed sweetened yogurt, a Bengali classic." },
  { slug: "gulab-jamoon", category: "desserts", name: "Gulab Jamoon (2 pc)", price: 4.99, veg: true, spice: 0, tags: ["bestseller"], desc: "Warm milk-solid dumplings soaked in cardamom syrup." },
  { slug: "kalakaand", category: "desserts", name: "Kalakaand (2 pc)", price: 4.99, veg: true, spice: 0, tags: [], desc: "Soft, grainy milk fudge, lightly sweetened." },
  { slug: "rosogolla", category: "desserts", name: "Rosogolla", price: 4.99, veg: true, spice: 0, tags: [], desc: "Spongy cheese balls soaked in light sugar syrup." },

  // ---- Beverages & Bobba ----
  { slug: "masala-tea", category: "drinks", name: "Masala Tea", price: 1.49, veg: true, spice: 0, tags: ["bestseller"], desc: "Slow-brewed spiced chai, poured hot." },
  { slug: "coffee", category: "drinks", name: "Coffee", price: 1.99, veg: true, spice: 0, tags: [], desc: "Freshly brewed coffee." },
  { slug: "soda", category: "drinks", name: "Soda", price: 2.99, veg: true, spice: 0, tags: [], desc: "Your choice of fountain soda." },
  { slug: "energy-drinks", category: "drinks", name: "Energy Drinks", price: 3.99, veg: true, spice: 0, tags: [], desc: "Assorted energy drinks, chilled and ready." },
  { slug: "boba", category: "drinks", name: "Bobba", price: 6.99, veg: true, spice: 0, tags: [], desc: "Classic milk tea with chewy tapioca pearls." },
  { slug: "exotic-boba", category: "drinks", name: "Exotic Bobba (11 flavors)", price: 7.99, veg: true, spice: 0, tags: ["new"], desc: "Choose from 11 exotic bobba flavors, made fresh to order." },
  { slug: "coffee-mocktails", category: "drinks", name: "Coffee Mocktails (7 flavors)", price: 7.99, veg: true, spice: 0, tags: [], desc: "Coffee-based mocktails, 7 flavors to choose from." },
  { slug: "masala-soda", category: "drinks", name: "Masala Soda (3 flavors)", price: 4.99, veg: true, spice: 1, tags: [], desc: "Spiced, fizzy masala soda — 3 flavors available." },
  { slug: "mocktails", category: "drinks", name: "Mocktails (9 varieties)", price: 5.99, veg: true, spice: 0, tags: [], desc: "9 refreshing mocktail varieties to pick from." },
  { slug: "sweet-fresh-lime-soda", category: "drinks", name: "Sweet Fresh Lime Soda", price: 4.99, veg: true, spice: 0, tags: [], desc: "Freshly squeezed lime, soda, and a touch of sweetness." },
  { slug: "lassi-milkshakes", category: "drinks", name: "Lassi and Milkshakes", price: 4.99, veg: true, spice: 0, tags: [], desc: "Thick yogurt lassi or classic milkshakes, made fresh." },
  { slug: "doodh-soda", category: "drinks", name: "Doodh Soda", price: 4.99, veg: true, spice: 0, tags: [], desc: "A creamy, fizzy milk soda." },
  { slug: "falooda", category: "drinks", name: "Falooda", price: 6.99, veg: true, spice: 0, tags: ["chefs-pick"], desc: "Layered rose milk, vermicelli, basil seeds, and kulfi." },
];

// Single real location.
const locations = [
  {
    slug: "university-city",
    name: "RollCall Kitchen — University City",
    address: "9630 University City Blvd, Charlotte, NC 28213 Unit D",
    phone: "(704) 000-0000",
    map_query: "9630 University City Blvd, Charlotte, NC 28213 Unit D",
    hours: [
      { days: "Mon – Thu", time: "11:00 AM – 9:00 PM" },
      { days: "Fri – Sat", time: "11:00 AM – 10:00 PM" },
      { days: "Sunday", time: "12:00 PM – 9:00 PM" },
    ],
    features: ["Dine-in", "Takeout", "Online Ordering"],
    sort_order: 1,
  },
];

const testimonials = [
  { author_name: "Priya M.", author_detail: "University City", rating: 5, sort_order: 1,
    quote: "The Special House Chicken Roll is worth the trip alone — rolled fresh, properly spiced, and huge. Finally an authentic kathi roll spot in Charlotte." },
  { author_name: "Daniel K.", author_detail: "Regular customer", rating: 5, sort_order: 2,
    quote: "Their Maharaja Kebab Platter is now our go-to for date night. The Exotic Bobba flavors are a fun bonus nobody expects from an Indian kitchen." },
  { author_name: "Ananya R.", author_detail: "University City", rating: 5, sort_order: 3,
    quote: "Grew up on Kolkata street food and this is the real thing — the jhalmuri and fuchka taste exactly like home." },
  { author_name: "The Rahman Family", author_detail: "Weekend regulars", rating: 5, sort_order: 4,
    quote: "The dosa corner is criminally underrated. Masala dosa is crisp every single time, and the kids love the momos." },
];

const galleryItems = [
  { icon: "🌯", swatch: "sw-marigold", sort_order: 1 },
  { icon: "🍢", swatch: "sw-chili", sort_order: 2 },
  { icon: "🥞", swatch: "sw-curry", sort_order: 3 },
  { icon: "🧋", swatch: "sw-maroon", sort_order: 4 },
  { icon: "🥟", swatch: "sw-marigold", sort_order: 5 },
  { icon: "🍛", swatch: "sw-chili", sort_order: 6 },
  { icon: "🍮", swatch: "sw-curry", sort_order: 7 },
  { icon: "🥡", swatch: "sw-maroon", sort_order: 8 },
];

const faqs = [
  { question: "Do you offer vegetarian and vegan options?", sort_order: 1,
    answer: "Yes — paneer, falafel, and vegetable dishes run across nearly every section of the menu, from kathi rolls to naan and pulao platters. Ask your server about vegan swaps." },
  { question: "What does the spice meter mean?", sort_order: 2,
    answer: "It's a rough guide from mild to hot, based on how the dish is traditionally prepared. Every dish can be adjusted milder or spicier on request." },
  { question: "Can I order catering for an event?", sort_order: 3,
    answer: "Yes — our catering packages are a starting point, and our team will build a custom menu around your guest count and budget. Head to the Catering page to request a quote." },
  { question: "Where are you located?", sort_order: 4,
    answer: "We're at 9630 University City Blvd, Charlotte, NC 28213, Unit D. See the Locations page for hours and directions." },
];

const timelineEvents = [
  { year_label: "The Spark", title: "A Craving Worth Solving", sort_order: 1,
    description: "RollCall Kitchen started with a simple problem — nowhere nearby served a truly authentic kathi roll. So we decided to roll our own." },
  { year_label: "The Kitchen", title: "Kolkata Street Food, Charlotte Made", sort_order: 2,
    description: "We built our menu around the flavors of Kolkata's street stalls — jhalmuri, fuchka, and rolls wrapped fresh to order." },
  { year_label: "The Menu Grows", title: "Beyond The Roll", sort_order: 3,
    description: "Dosas, biryani, Tangra-style Chinese, momos, and bobba joined the lineup — one kitchen, built for a neighborhood that wanted it all." },
  { year_label: "Today", title: "University City Blvd", sort_order: 4,
    description: "You'll find us at 9630 University City Blvd, Unit D — cooking every order fresh, the way street food is supposed to be." },
];

const valueProps = [
  { icon: "🔥", title: "Rolled to order", sort_order: 1, description: "No pre-made rolls sitting around — every kathi roll is assembled and wrapped after you order." },
  { icon: "🌿", title: "Real Kolkata flavor", sort_order: 2, description: "From jhalmuri to Tangra Chinese, our recipes stay true to the street food they're named after." },
  { icon: "🤝", title: "Honest labeling", sort_order: 3, description: "Clear veg / non-veg marks and spice meters on everything — no guessing what you're ordering." },
];

const rewardSteps = [
  { step_number: "01", title: "Sign up", sort_order: 1, description: "Create your account in 30 seconds — get 100 welcome points on the house." },
  { step_number: "02", title: "Order & earn", sort_order: 2, description: "Earn 10 points for every $1 spent, online or in-store at RollCall Kitchen." },
  { step_number: "03", title: "Redeem", sort_order: 3, description: "Cash points in for free chaat, a free roll, or dollars off your next order." },
];

const rewardTiers = [
  { badge: "🥉 Street Cart", points_range: "0 – 499 points", sort_order: 1, is_featured: false,
    perks: ["Free samosa on your birthday", "Members-only weekly deal"] },
  { badge: "🥈 RollCall Regular", points_range: "500 – 1,499 points", sort_order: 2, is_featured: true,
    perks: ["Everything in Street Cart", "Free delivery on orders $20+", "Early access to new menu items"] },
  { badge: "🥇 Kathi Roll Master", points_range: "1,500+ points", sort_order: 3, is_featured: false,
    perks: ["Everything in RollCall Regular", "Free birthday roll platter", "VIP invite to tasting nights"] },
];

// What a member can actually spend their points on — fully editable here,
// no code changes needed to add/remove/reprice a reward.
const rewardCatalog = [
  { name: "$5 Off Your Order", description: "500 points", points_cost: 500,
    reward_type: "discount", reward_value: "$5", sort_order: 1 },
  { name: "Free Samosa Chaat", description: "1,000 points", points_cost: 1000,
    reward_type: "free_item", reward_value: "Samosa Chaat", sort_order: 2 },
  { name: "Free Kathi Roll", description: "1,500 points — any roll on the menu", points_cost: 1500,
    reward_type: "free_item", reward_value: "Any Kathi Roll", sort_order: 3 },
];

const cateringPackages = [
  { name: "Office Lunch", price_label: "from $14 / person", sort_order: 1, is_featured: false, tag: null,
    features: ["Choice of 2 rolls or platters", "Individually boxed or family-style", "Minimum 10 guests"] },
  { name: "Celebration Spread", price_label: "from $22 / person", sort_order: 2, is_featured: true, tag: "Most Popular",
    features: ["Chaat station + 3 mains + dessert", "Live roll station available", "Minimum 25 guests"] },
  { name: "Full Event Menu", price_label: "Custom pricing", sort_order: 3, is_featured: false, tag: null,
    features: ["Multi-course, custom menus", "Dedicated event coordinator", "Tastings available on request"] },
];

// Flexible global copy — see migration 007_create_content_blocks.sql
// NOTE: phone/email/social links are placeholders. Update with real details.
const contentBlocks = {
  brand: {
    name: "RollCall Kitchen",
    tagline: "Authentic Kathi Rolls, Kebabs & Bobba",
    phone: "(704) 000-0000",
    email: "hello@rollcallkitchen.com",
    address: "9630 University City Blvd, Charlotte, NC 28213 Unit D",
    instagram: "#",
    facebook: "#",
    doordash: "https://www.doordash.com/",
    ubereats: "https://www.ubereats.com/",
  },
  marquee_items: [
    "📍 9630 University City Blvd, Charlotte NC 28213 Unit D",
    "🌯 Authentic Kathi Rolls, rolled fresh to order",
    "🧋 11 Exotic Bobba flavors + Coffee Mocktails",
    "🍢 Try the Maharaja Kebab Platter",
    "🥞 Now serving Dosa & South Indian breakfast",
  ],
  hero_home: {
    eyebrow: "Authentic Kathi Rolls, Kebabs & Bobba",
    title_line1: "Rolled fresh.",
    title_accent: "Served hot.",
    subtitle: "From Kolkata street-cart chaat to charcoal-fired kebabs, dosas, and 11 flavors of bobba — RollCall Kitchen brings it all under one roof on University City Blvd.",
    meta_badges: ["⭐ Rolled to order, every time", "📍 University City Blvd, Charlotte NC", "🧋 11 Exotic Bobba flavors"],
    featured_dish_slug: "house-special-chicken-roll",
  },
  trust_stats: [
    { target: 90, label: "Menu favorites to explore" },
    { target: 14, label: "Menu sections, one kitchen" },
    { target: 11, label: "Exotic bobba flavors" },
    { target: 1, label: "Charlotte kitchen, made fresh daily" },
  ],
  about_story: {
    eyebrow: "Where It Started",
    heading: "A menu built around Kolkata's street stalls.",
    paragraphs: [
      "RollCall Kitchen exists because authentic kathi rolls shouldn't be hard to find. We build every roll, chaat, and platter the way it's done on Kolkata's streets — assembled fresh, wrapped hot, and handed over without shortcuts.",
      "That same street-food spirit runs through the rest of the menu too — Tangra-style Indo-Chinese, South Indian dosas, tandoori kebabs, and a bobba bar with 11 exotic flavors, all cooked to order out of our University City Blvd kitchen.",
    ],
  },
  about_intro: {
    eyebrow: "Our Story",
    heading: "Real Kathi Rolls. Real Kolkata Flavor.",
    subtitle: "RollCall Kitchen brings the street food of Kolkata — and a lot more — to University City Blvd, one order at a time.",
  },
  home_about_split: {
    eyebrow: "From Kolkata's Streets To University City Blvd",
    heading: "We didn't reinvent the kathi roll. We just refused to fake it.",
    body: "RollCall Kitchen started with a rule that still shapes every order: nothing is pre-made. Rolls are wrapped after you order, chaat is assembled to order, and chai is brewed fresh — the way street food is supposed to be.",
    checklist: [
      "Kathi rolls rolled fresh, never pre-made.",
      "Kolkata-style chaat, Tangra Chinese, and South Indian dosas — all in one kitchen.",
      "Vegetarian and vegan options clearly marked across the menu.",
    ],
  },
  page_heroes: {
    menu: { eyebrow: "The Full Menu", title: "Everything's cooked to order.", subtitle: "Filter by category, spice level, or diet — then build your order below. It stays saved as you browse." },
    locations: { eyebrow: "Come Say Hi", title: "Find RollCall Kitchen.", subtitle: "9630 University City Blvd, Charlotte, NC 28213, Unit D — dine-in, takeout, or online ordering." },
    rewards: { eyebrow: "RollCall Rewards", title: "Eat more. Earn more. Repeat.", subtitle: "Free to join. Earn points on every order and unlock real perks, not gimmicks." },
    catering: { eyebrow: "Catering & Events", title: "Feed your whole crew, still hot off the roll.", subtitle: "Office lunches, celebrations, and everything between — we scale the same made-to-order menu for groups of 10 to 500." },
    contact: { eyebrow: "We'd Love to Hear From You", title: "Questions, feedback, or a table to book?", subtitle: "Reach us below, or call the kitchen directly for something urgent." },
  },
  rewards_join: {
    eyebrow: "Join in 30 Seconds",
    heading: "Get 100 points before your first order.",
    body: "Enter your email below to reserve your spot — we'll send a link to finish setting up your account and start earning.",
  },
  // Site-wide dismissible announcement bar, shown above the header on every
  // page. Toggle it off any time by setting enabled: false here and
  // re-running `npm run db:seed` — no code changes needed either way.
  coming_soon_banner: {
    enabled: true,
    message: "The grill is almost hot, the seats are almost ready. RollCall Kitchen is bringing authentic Indian street food straight to your plate. Opening very soon!",
    ctaText: "",
    ctaUrl: "",
  },
};

async function upsertCategories(client) {
  // Full replace, not merge — old category rows whose slug isn't in the
  // current list (e.g. from a prior menu) must not linger in the database.
  await client.query(`TRUNCATE TABLE dishes, categories RESTART IDENTITY CASCADE`);
  const ids = {};
  for (const c of categories) {
    const { rows } = await client.query(
      `INSERT INTO categories (slug, label, icon, blurb, sort_order)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id`,
      [c.slug, c.label, c.icon, c.blurb, c.sort_order]
    );
    ids[c.slug] = rows[0].id;
  }
  return ids;
}

async function upsertDishes(client, categoryIds) {
  for (const [i, d] of dishes.entries()) {
    const priceCents = Math.round(d.price * 100);
    await client.query(
      `INSERT INTO dishes (category_id, slug, name, description, price_cents, is_veg, spice_level, tags, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [categoryIds[d.category], d.slug, d.name, d.desc, priceCents, d.veg, d.spice, d.tags, i + 1]
    );
  }
}

/**
 * Upsert-by-name, NOT truncate-and-reinsert like replaceSimpleTable —
 * redemption_codes has a real foreign key into this table once a customer
 * has redeemed something, so this table can never be safely truncated
 * after the site is live. Re-running the seed updates prices/descriptions
 * in place and adds new catalog rows; it never deletes one a customer may
 * have already redeemed against.
 */
async function upsertRewardCatalog(client) {
  const currentNames = rewardCatalog.map((r) => r.name);
  for (const [i, r] of rewardCatalog.entries()) {
    await client.query(
      `INSERT INTO reward_catalog (name, description, points_cost, reward_type, reward_value, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (name) DO UPDATE SET
         description=$2, points_cost=$3, reward_type=$4, reward_value=$5, sort_order=$6, is_active=TRUE`,
      [r.name, r.description, r.points_cost, r.reward_type, r.reward_value, i + 1]
    );
  }
  // Deactivate (not delete) any catalog item removed from the seed source —
  // keeps old redemption history intact and still readable/joinable.
  await client.query(
    `UPDATE reward_catalog SET is_active = FALSE WHERE name != ALL($1::text[])`,
    [currentNames]
  );
}

async function upsertLocations(client) {
  // Upsert current locations, then remove any old location rows that are no
  // longer in the list (e.g. a prior fictional/placeholder location) — a
  // plain DELETE (not TRUNCATE) so any dependent reservations correctly
  // fall back to NULL via the FK's ON DELETE SET NULL rather than failing.
  const ids = {};
  for (const l of locations) {
    const { rows } = await client.query(
      `INSERT INTO locations (slug, name, address, phone, map_query, hours, features, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (slug) DO UPDATE SET
         name=$2, address=$3, phone=$4, map_query=$5, hours=$6, features=$7, sort_order=$8
       RETURNING id`,
      [l.slug, l.name, l.address, l.phone, l.map_query, JSON.stringify(l.hours), l.features, l.sort_order]
    );
    ids[l.slug] = rows[0].id;
  }
  const currentSlugs = locations.map((l) => l.slug);
  await client.query(`DELETE FROM locations WHERE slug != ALL($1::text[])`, [currentSlugs]);
  return ids;
}

async function replaceSimpleTable(client, table, rows, columns) {
  // These content tables have no natural unique key worth enforcing, and are
  // fully owned by this seed file, so a clean truncate + reinsert keeps the
  // seed both simple and idempotent.
  await client.query(`TRUNCATE TABLE ${table} RESTART IDENTITY`);
  for (const row of rows) {
    const values = columns.map((c) => row[c]);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
    await client.query(
      `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`,
      values
    );
  }
}

async function upsertContentBlocks(client) {
  for (const [key, value] of Object.entries(contentBlocks)) {
    await client.query(
      `INSERT INTO content_blocks (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = $2`,
      [key, JSON.stringify(value)]
    );
  }
}

async function seed() {
  await withTransaction(async (client) => {
    const categoryIds = await upsertCategories(client);
    await upsertDishes(client, categoryIds);
    await upsertLocations(client);

    await replaceSimpleTable(client, "testimonials", testimonials, ["author_name", "author_detail", "quote", "rating", "sort_order"]);
    await replaceSimpleTable(client, "gallery_items", galleryItems, ["icon", "swatch", "sort_order"]);
    await replaceSimpleTable(client, "faqs", faqs, ["question", "answer", "sort_order"]);
    await replaceSimpleTable(client, "timeline_events", timelineEvents, ["year_label", "title", "description", "sort_order"]);
    await replaceSimpleTable(client, "value_props", valueProps, ["icon", "title", "description", "sort_order"]);
    await replaceSimpleTable(client, "reward_steps", rewardSteps, ["step_number", "title", "description", "sort_order"]);
    await replaceSimpleTable(client, "reward_tiers", rewardTiers, ["badge", "points_range", "perks", "is_featured", "sort_order"]);
    await upsertRewardCatalog(client);
    await replaceSimpleTable(client, "catering_packages", cateringPackages, ["name", "price_label", "features", "tag", "is_featured", "sort_order"]);

    await upsertContentBlocks(client);
  });

  logger.info("Seed complete", {
    categories: categories.length,
    dishes: dishes.length,
    locations: locations.length,
    testimonials: testimonials.length,
  });
}

if (require.main === module) {
  seed()
    .then(() => close())
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error("Seed failed", { error: err.message, stack: err.stack });
      process.exit(1);
    });
}

module.exports = { seed };