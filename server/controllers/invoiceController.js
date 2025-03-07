const Invoice = require('../models/Invoice');

exports.getCustomerInvoices = async (req, res) => {
  try {
    // Assuming auth middleware sets req.customer for customers
    const invoices = await Invoice.find({ customer: req.customer.id }).sort({ date: -1 });
    res.json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error retrieving invoices' });
  }
};

exports.downloadInvoice = async (req, res) => {
  try {
    const invoiceId = req.params.invoiceId;
    const invoice = await Invoice.findOne({ _id: invoiceId, customer: req.customer.id });
    if (!invoice) return res.status(404).json({ msg: 'Invoice not found' });
    
    // If the invoice file is stored locally:
    res.download(invoice.filePath);
    // Or you can return the invoice URL:
    // res.json({ fileUrl: invoice.filePath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error downloading invoice' });
  }
};
