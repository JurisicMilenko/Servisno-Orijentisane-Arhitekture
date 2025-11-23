const Position = require("../models/Position")

exports.getAllPositions = async () => {
  try {
    return await Position.find();
  } catch (err) {
    throw new Error('Failed to fetch positions: ' + err.message);
  }
};

exports.getById = async (id) => {
    try {
        return await Position.findById(id);
    } catch (err) {
        throw new Error('Failed to fetch positions: ' + err.message);
    } 
};

exports.getByUserId = async (userId) => {
    try {
        return await Position.find({ userId });
    } catch (err) {
        throw new Error('Failed to fetch positions: ' + err.message);
    } 
};

exports.createPosition = async (data) => {
  try {
    const poistion = new Position({
      userId: data.userId
    });
    
    await poistion.save();
    return poistion;
  } catch (err) {
    throw new Error('Failed to create position: ' + err.message);
  }
};

exports.updatePosition = async (id, data) => {
  try {
    const positon = await Position.findById(id);
    if (!positon) return null;
    
    for(var key in data){
            console.log(key);
            }
        console.log(data)

    if (data.latitude !== undefined) positon.latitude = data.latitude;
    if (data.longitude !== undefined) positon.longitude = data.longitude;
    
    await positon.save();
    return positon;
  } catch (err) {
    throw new Error('Failed to update positon: ' + err.message);
  }
};