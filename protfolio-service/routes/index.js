import express from 'express';
import userService from '../services/user.service.js';

const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({ 
    message: 'Welcome to Portfolio Service API',
    status: 'running'
  });
});

/* GET user by username */
router.get('/user/:username', async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await userService.getUserByUsername(username);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        username 
      });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

/* GET user by ID */
router.get('/user/id/:userId', async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    const user = await userService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        userId 
      });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

export default router;
