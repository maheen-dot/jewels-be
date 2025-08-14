const Design = require('../models/Design');

// Save a new design
const saveDesign = async (req, res) => {
  try {
    //console.log("Received Design Payload:", req.body);
    //console.log("Decoded User ID:", req.user);

    const userId = req.user?.userId;

    const {
      slug,
      name,
      image,
      model,
      description,
      bodyColors = [],
      gemColors = [],
      size,
      price
    } = req.body;

   

    const newDesign = new Design({
      userId,
      slug,
      name,
      image,
      model,
      description,
      bodyColors,
      gemColors,
      size,
      price
    });

    await newDesign.save();

    res.status(201).json({
      success: true,
      message: 'Design saved successfully',
      data: newDesign
    });
  } catch (error) {
    console.error("Error in saveDesign:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to save design',
      error: error.message
    });
  }
};

// Get all designs saved by the authenticated user
const getDesignsByUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const designs = await Design.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: designs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch designs',
      error: error.message
    });
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


const deleteDesign = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design){
      return res.status(404).json({message:"Design not found"});
    }
    await Design.findByIdAndDelete(req.params.id);
    res.status(200).json({message: "Design deleted successfully"})
  } catch (error) {
    console.error("Error in deleteDesign:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete design',
      error: error.message
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
