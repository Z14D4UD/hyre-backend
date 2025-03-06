const Business = require('../models/Business');

exports.verifyID = async (req, res) => {
  const businessId = req.business.id;
  const idDocumentPath = req.file ? req.file.path : '';
  if (!idDocumentPath) return res.status(400).json({ msg: 'No ID document uploaded' });
  try {
    const business = await Business.findByIdAndUpdate(
      businessId,
      { idDocument: idDocumentPath, verified: true },
      { new: true }
    );
    res.json({ msg: 'ID verified successfully', business });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};
