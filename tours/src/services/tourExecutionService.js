const TourExecution = require("../models/TourExecution")

exports.getAllExecutions = async () => {
  try {
    return await TourExecution.find();
  } catch (err) {
    throw new Error('Failed to fetch executions lol: ' + err.message);
  }
};

exports.getById = async (id) => {
    try {
        return await TourExecution.findById(id);
    } catch (err) {
        throw new Error('Failed to fetch executions: ' + err.message);
    } 
};

exports.createExection = async (data) => {
  try {
    const execution = new TourExecution({
        tourId: data.tourId,
        userId: data.userId,
        completedCheckpoints: [],
        status: 'in progress'
    });
    
    await execution.save();
    return execution;
  } catch (err) {
    throw new Error('Failed to create execution: ' + err.message);
  }
};

exports.updateExection = async (id, data) => {
  try {
    const execution = await TourExecution.findById(id);
    if (!execution) return null;

    execution.completedCheckpoints.push(data);
  
    
    await execution.save();
    return execution;
  } catch (err) {
    throw new Error('Failed to update execution: ' + err.message);
  }
};

exports.completeExecution = async (id) => {
  try {
    const execution = await TourExecution.findById(id);
    if (!execution) return null;

    execution.status = 'completed';
  
    
    await execution.save();
    return execution;
  } catch (err) {
    throw new Error('Failed to update execution: ' + err.message);
  }
};