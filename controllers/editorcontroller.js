const Design = require('../models/Design');
const ProductModel = require('../models/ProductModel');
const { calculatePrice } = require('../services/pricingService');
const { generateSnapshot } = require('../services/renderingService');

exports.getProductModels = async (req, res) => {
  try {
    const { category } = req.params;
    const models = await ProductModel.find({ category });
    
    res.json({
      success: true,
      data: models
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product models',
      error: error.message
    });
  }
};

exports.saveDesign = async (req, res) => {
  try {
    const { userId } = req;
    const {
      jewelryType,
      modelId,
      customizationData
    } = req.body;

    // Get base model
    const productModel = await ProductModel.findOne({ modelId });
    if (!productModel) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product model not found' 
      });
    }

    // Prepare design data
    const designData = {
      userId,
      jewelryType,
      modelId,
      modelName: productModel.name,
      metals: {
        main: {
          type: customizationData.metalMain.type,
          color: customizationData.metalMain.color,
          finish: customizationData.metalMain.finish || 'polished'
        }
      },
      gemstones: [],
      sizes: {}
    };

    // Add additional metals based on jewelry type
    if (jewelryType === 'ring') {
      designData.metals.left = {
        type: customizationData.metalLeft.type,
        color: customizationData.metalLeft.color,
        finish: customizationData.metalLeft.finish || 'polished'
      };
      designData.metals.right = {
        type: customizationData.metalRight.type,
        color: customizationData.metalRight.color,
        finish: customizationData.metalRight.finish || 'polished'
      };
      designData.sizes.ring = customizationData.ringSize;
    }

    if (jewelryType === 'necklace') {
      designData.metals.chain = {
        type: customizationData.metalChain.type,
        color: customizationData.metalChain.color,
        finish: customizationData.metalChain.finish || 'polished'
      };
      designData.sizes.chain = customizationData.chainLength;
    }

    // Add gemstones
    if (customizationData.gemMain) {
      designData.gemstones.push({
        type: customizationData.gemMain.type,
        color: customizationData.gemMain.color,
        position: 'main',
        isCustomColor: customizationData.gemMain.isCustomColor || false
      });
    }

    if (customizationData.gemSide) {
      designData.gemstones.push({
        type: customizationData.gemSide.type,
        color: customizationData.gemSide.color,
        position: 'side',
        isCustomColor: customizationData.gemSide.isCustomColor || false
      });
    }

    // Add crystals if any
    if (customizationData.crystals) {
      designData.crystals = customizationData.crystals.map(crystal => ({
        position: crystal.position,
        color: crystal.color
      }));
    }

    // Calculate price
    designData.price = calculatePrice({
      jewelryType,
      metals: designData.metals,
      gemstones: designData.gemstones,
      hasCrystals: designData.crystals && designData.crystals.length > 0,
      basePrice: productModel.basePrice
    });

    // Generate snapshot
    designData.snapshot = await generateSnapshot(designData);

    // Save design
    const design = new Design(designData);
    await design.save();

    res.status(201).json({
      success: true,
      data: design,
      message: 'Design saved successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to save design',
      error: error.message
    });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { userId } = req;
    const { designId } = req.params;

    // Find design
    const design = await Design.findOne({ _id: designId, userId });
    if (!design) {
      return res.status(404).json({ 
        success: false, 
        message: 'Design not found' 
      });
    }

    // Add to cart (in a real app, you'd have a separate Cart model)
    design.isInCart = true;
    design.updatedAt = new Date();
    await design.save();

    res.json({
      success: true,
      message: 'Design added to cart',
      data: design
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add design to cart',
      error: error.message
    });
  }
};