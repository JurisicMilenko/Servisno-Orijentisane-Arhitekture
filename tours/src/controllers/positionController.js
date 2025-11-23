const positionService = require('../services/positionService.js');

exports.getPositionByUserId = async (req, res) => {
  try {
    const position = await positionService.getByUserId(req.params.userId);
    if (!position || position.length === 0) {
      return res.status(404).json({ error: 'Position for given user not found' });
    }
    res.json(position);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.nothing = async (req, res) => {
  try {
    res.json("position");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listPositions = async (req, res) => {console.log("helppppp")
  try {
    
    const positions = await positionService.getAllPositions();
    res.json(positions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createEmptyPosition = async (req, res) => {
  try {
    const { latitude, longitude} = req.body;
    
    // Get userId from JWT token (set by authenticate middleware)
    const userId = req.user?.sub || req.user?.id;
    console.log(userId)
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const tourData = {
      userId
    };
    
    const tour = await positionService.createPosition(tourData);
    res.status(201).json(tour);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updatePosition = async(req, res)=>{
    try{
        const position = await positionService.getById(req.params.id);
            if (!position) {
              return res.status(404).json({ error: 'Postion not found' });
            }
            
            const updated = await positionService.updatePosition(req.params.id, req.body);
            res.json(updated);
    }catch(err){
        res.status(400).json({ error: err.message });
    }
}