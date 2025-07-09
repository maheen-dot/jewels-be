{/*const mongoose = require('mongoose');

const MetalSchema = new mongoose.Schema({
  type: { type: String, enum: ['gold', 'rose-gold', 'platinum', 'silver', 'palladium', 'titanium'], required: true },
  color: { type: String, required: true }
});

const GemstoneSchema = new mongoose.Schema({
  type: { type: String, enum: ['diamond', 'ruby', 'sapphire', 'emerald', 'amethyst', 'crystal'], required: true },
  color: { type: String, required: true },
  position: { type: String, required: true }, // 'main', 'side', 'left', 'right', etc.
  isCustomColor: { type: Boolean, default: false }
});

const SizeSchema = new mongoose.Schema({
  ring: { type: Number, min: 4, max: 12 },
  chain: { type: Number, min: 16, max: 20 }
});

const DesignSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jewelryType: { type: String, enum: ['ring', 'earring', 'necklace', 'bracelet'], required: true },
  modelId: { type: String, required: true },
  modelName: { type: String, required: true },
  metals: {
    main: MetalSchema,
    left: MetalSchema,
    right: MetalSchema,
    chain: MetalSchema
  },
  gemstones: [GemstoneSchema],
  crystals: [{
    position: String,
    color: String
  }],
  sizes: SizeSchema,
  snapshot: String, // URL to rendered image
  price: { type: Number, required: true },
  isInCart: { type: Boolean, default: false },
  isPurchased: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Design', DesignSchema);*/}