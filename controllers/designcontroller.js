const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp'); 
const Design = require('../models/Design');
const Product = require("../models/Product");


const ensureUploads = async () => {
  const outDir = path.join(__dirname, '..', 'uploads', 'designs');
  await fs.mkdir(outDir, { recursive: true });
  return outDir;
};

 const saveDesign = async (req, res) => {
  try {
    const userId = req.userId;
    if (!req.file) return res.status(400).json({ success: false, message: 'Screenshot is required' });

    // parsing JSON strings coming from FormData at frontend
    let { slug, name, model, description, bodyColors = [], gemColors = [], size, price } = req.body;
    if (typeof bodyColors === 'string') { try { bodyColors = JSON.parse(bodyColors); } catch { bodyColors = []; } }
    if (typeof gemColors === 'string')  { try { gemColors  = JSON.parse(gemColors); }  catch { gemColors = []; } }

    const uploadsDir = await ensureUploads();
    const base = `${userId}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    const fileName = `${base}.webp`;
    const absPath  = path.join(uploadsDir, fileName);
    await sharp(req.file.buffer).webp({ quality: 82 }).toFile(absPath);
    const imagePath = `/uploads/designs/${fileName}`;
    
    
        //  Always fetch fresh product using correct slug/link
        const product = await Product.findOne({ link: slug }); 
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
    const newDesign = await Design.create({
      productId: product._id, 
      userId, slug, name, model, description, bodyColors, gemColors, size, price,
      imagePath 
    });

    return res.status(201).json({ success: true, message: 'Design saved', data: newDesign });
  } catch (error) {
    console.error('Error in saveDesign:', error);
    res.status(500).json({ success: false, message: 'Failed to save design', error: error.message });
  }
};


// Get all designs saved by the authenticated user
const getDesignsByUser = async (req, res) => {
  try {
    const userId = req.userId;

    // Fetch all designs for user
    const designs = await Design.find({ userId })
      .sort({ createdAt: -1 })
      .select('name slug model description bodyColors gemColors size price imagePath createdAt productId')
      .lean();

    const base = `${req.protocol}://${req.get('host')}`;

    // Check product existence and isHidden
    const filteredDesigns = [];
    for (const d of designs) {
      if (!d.productId) continue; // skip if no product reference

      const product = await Product.findById(d.productId).lean();
      if (!product) continue; // skip if product no longer exists
      if (product.isHidden) continue; // skip if product is hidden

      filteredDesigns.push({
        ...d,
        imageUrl: `${base}${d.imagePath}`
      });
    }

    res.status(200).json({ success: true, data: filteredDesigns });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch designs', error: error.message });
  }
};


// Get specific design
const getDesignById = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id).lean();
    if (!design) {
      return res.status(404).json({ success: false, message: "Design not found" });
    }

    // Check product existence and isHidden
    if (!design.productId) {
      return res.status(404).json({ success: false, message: "Design linked product missing" });
    }

    const product = await Product.findById(design.productId).lean();
    if (!product || product.isHidden) {
      return res.status(404).json({ success: false, message: "Design not available" });
    }

    res.status(200).json(design);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch design", error: error.message });
  }
};




//delete user's design saved in his profile
const deleteDesign = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) {
      return res.status(404).json({ message: "Design not found" });
    }

    // build absolute path of the image file
    const absPath = path.join(__dirname, "..", design.imagePath); 
    // design.imagePath is like "/uploads/designs/file.webp"

    try {
      await fs.unlink(absPath); // remove file
      console.log("Deleted design file:", absPath);
    } catch (err) {
      // if file already missing, just log it but don't block deletion
      console.warn("Could not delete file:", absPath, err.message);
    }

    await Design.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Design deleted successfully" });
  } catch (error) {
    console.error("Error in deleteDesign:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete design",
      error: error.message,
    });
  }
};


// Export functions
module.exports = {
  saveDesign,
  getDesignsByUser,
  getDesignById,
  deleteDesign
};
