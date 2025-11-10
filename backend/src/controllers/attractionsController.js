const service = require('../services/attractionService');

exports.listAttractions = (req, res) => {
  const data = service.getAll();
  res.json(data);
};

exports.getAttraction = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = service.getById(id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
};
