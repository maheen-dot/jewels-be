const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp'); // optional
const Design = require('../models/Design');

const ensureUploads = async () => {
  const outDir = path.join(__dirname, '..', 'uploads', 'designs');
  await fs.mkdir(outDir, { recursive: true });
  return outDir;
};

 const saveDesign = async (req, res) => {
  try {
    const userId = req.userId;
    if (!req.file) return res.status(400).json({ success: false, message: 'Screenshot is required' });

    // Parse JSON strings coming from FormData
    let { slug, name, model, description, bodyColors = [], gemColors = [], size, price } = req.body;
    if (typeof bodyColors === 'string') { try { bodyColors = JSON.parse(bodyColors); } catch { bodyColors = []; } }
    if (typeof gemColors === 'string')  { try { gemColors  = JSON.parse(gemColors); }  catch { gemColors = []; } }

    const uploadsDir = await ensureUploads();
    const base = `${userId}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

    // ----- OPTION A (no compression / keep PNG as-is) -----
    // const fileName = `${base}.png`;
    // const absPath  = path.join(uploadsDir, fileName);
    // await fs.writeFile(absPath, req.file.buffer);
    // const imagePath = `/uploads/designs/${fileName}`;

    // ----- OPTION B (optional) Convert to WebP for smaller files -----
    const fileName = `${base}.webp`;
    const absPath  = path.join(uploadsDir, fileName);
    await sharp(req.file.buffer).webp({ quality: 82 }).toFile(absPath);
    const imagePath = `/uploads/designs/${fileName}`;

    const newDesign = await Design.create({
      userId, slug, name, model, description, bodyColors, gemColors, size, price,
      imagePath // ✅ store path only
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

    const designs = await Design.find({ userId })
      .sort({ createdAt: -1 })
      .select('name slug model description bodyColors gemColors size price imagePath createdAt') // no buffer!
      .lean();

    // Absolute URL (optional convenience)
    const base = `${req.protocol}://${req.get('host')}`;
    const data = designs.map(d => ({ ...d, imageUrl: `${base}${d.imagePath}` }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch designs', error: error.message });
  }
};


// designsController.js
const getDesignById = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) {
      return res.status(404).json({ success: false, message: "Design not found" });
    }
    res.status(200).json(design);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch design", error: error.message });
  }
};


// delete controller
deleteDesign = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the design in DB
    const design = await Design.findById(id);
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }

    // Build absolute path for the stored image
    const filePath = path.join(__dirname, '..', design.imagePath);

    // Try to unlink file (ignore if already deleted)
    try {
      await fs.unlink(filePath);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err; // ignore file not found
    }

    // Delete from DB
    await Design.findByIdAndDelete(id);

    res.status(200).json({ message: 'Design deleted successfully' });
  } catch (error) {
    console.error('Error deleting design:', error);
    res.status(500).json({ message: 'Error deleting design' });
  }
};



// Export functions
module.exports = {
  saveDesign,
  getDesignsByUser,
  getDesignById,
  deleteDesign
};
