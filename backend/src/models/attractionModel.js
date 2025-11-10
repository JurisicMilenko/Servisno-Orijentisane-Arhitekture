const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, '..', '..', '..', 'data', 'sample-data.json');
let data = [];

try {
  const raw = fs.readFileSync(dataFile);
  data = JSON.parse(raw);
} catch (err) {
  console.warn('Could not load sample-data.json:', err.message);
}

exports.getAll = () => data;

exports.getById = (id) => data.find(d => d.id === id);
