const PRICE_MULTIPLIERS = {
  metals: {
    gold: 1.2,
    'rose-gold': 1.3,
    platinum: 1.5,
    silver: 1.0,
    palladium: 1.4,
    titanium: 1.1
  },
  gemstones: {
    diamond: 2.0,
    ruby: 1.8,
    sapphire: 1.7,
    emerald: 1.6,
    amethyst: 1.2,
    crystal: 1.1
  },
  finishes: {
    polished: 1.0,
    brushed: 1.05,
    matte: 1.1
  }
};

exports.calculatePrice = ({ jewelryType, metals, gemstones, hasCrystals, basePrice }) => {
  let price = basePrice;

  // Calculate metal costs
  for (const [position, metal] of Object.entries(metals)) {
    if (metal) {
      const metalMultiplier = PRICE_MULTIPLIERS.metals[metal.type] || 1.0;
      const finishMultiplier = PRICE_MULTIPLIERS.finishes[metal.finish] || 1.0;
      price += basePrice * 0.3 * metalMultiplier * finishMultiplier;
    }
  }

  // Calculate gemstone costs
  gemstones.forEach(gem => {
    const gemMultiplier = PRICE_MULTIPLIERS.gemstones[gem.type] || 1.0;
    price += basePrice * 0.5 * gemMultiplier * (gem.isCustomColor ? 1.2 : 1.0);
  });

  // Add crystal premium
  if (hasCrystals) {
    price += basePrice * 0.2;
  }

  // Type-specific adjustments
  if (jewelryType === 'ring') {
    price *= 1.1;
  } else if (jewelryType === 'necklace') {
    price *= 1.15;
  }

  return Math.round(price * 100) / 100; // Round to 2 decimal places
};