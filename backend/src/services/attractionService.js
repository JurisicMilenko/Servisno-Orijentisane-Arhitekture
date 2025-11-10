const model = require('../models/attractionModel');

exports.getAll = () => model.getAll();

exports.getById = (id) => model.getById(id);
