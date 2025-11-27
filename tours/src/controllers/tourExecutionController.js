const tourExecutionService = require('../services/tourExecutionService.js');

exports.listExecutions = async (req, res) => {
  try {
    const executions = await tourExecutionService.getAllExecutions();
    res.json(executions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getExecution = async (req, res) => {
  try {
    const execution = await tourExecutionService.getById(req.params.id);
    if (!execution || execution.length === 0) {
      return res.status(404).json({ error: 'Execution not found' });
    }
    res.json(execution);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addCheckpoint = async (req, res) => {
  try{
    const execution = await tourExecutionService.getById(req.params.id);
        if (!execution || execution.length === 0) {
            return res.status(404).json({ error: 'Execution not found' });
                }
              
            const updated = await tourExecutionService.updateExection(req.params.id, req.body);
            res.json(updated);
        }catch(err){
            res.status(400).json({ error: err.message });
        }

};

exports.createTourExecution = async (req, res) => {
  try {
    const { tourId } = req.body;
    
    // Get authorId from JWT token (set by authenticate middleware)
    const userId = req.user?.sub || req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const tourExecutionData = {
      tourId,
      userId
    };
    
    const execution = await tourExecutionService.createExection(tourExecutionData);
    res.status(201).json(execution);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.completeExecution = async (req, res) => {
  try{
    const execution = await tourExecutionService.getById(req.params.id);
        if (!execution || execution.length === 0) {
            return res.status(404).json({ error: 'Execution not found' });
                }
              
            const updated = await tourExecutionService.completeExecution(req.params.id);
            res.json(updated);
        }catch(err){
            res.status(400).json({ error: err.message });
        }

};
exports.startExecution = async (req, res) => {
  try{
    const execution = await tourExecutionService.getById(req.params.id);
        if (!execution || execution.length === 0) {
            return res.status(404).json({ error: 'Execution not found' });
                }
              
            const updated = await tourExecutionService.startExecution(req.params.id);
            res.json(updated);
        }catch(err){
            res.status(400).json({ error: err.message });
        }

};
