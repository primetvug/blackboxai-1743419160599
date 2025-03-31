const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const moviesPath = path.join(__dirname, '../../data/movies.json');
const usersPath = path.join(__dirname, '../../data/users.json');

// Helper functions
const getMovies = () => JSON.parse(fs.readFileSync(moviesPath));
const getUsers = () => JSON.parse(fs.readFileSync(usersPath));
const saveUsers = (users) => fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

// Get all movies
router.get('/movies', (req, res) => {
  const movies = getMovies();
  res.json(movies);
});

// Get single movie
router.get('/movies/:id', (req, res) => {
  const movies = getMovies();
  const movie = movies.find(m => m.id == req.params.id);
  if (!movie) return res.status(404).json({ error: 'Movie not found' });
  res.json(movie);
});

// Purchase movie
router.post('/movies/purchase', (req, res) => {
  try {
    const { userId, movieId } = req.body;
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const movies = getMovies();
    const movie = movies.find(m => m.id == movieId);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });

    if (user.purchasedMovies.includes(movieId)) {
      return res.status(400).json({ error: 'Movie already purchased' });
    }

    user.purchasedMovies.push(movieId);
    saveUsers(users);
    res.json({ success: true, purchasedMovies: user.purchasedMovies });
  } catch (error) {
    res.status(500).json({ error: 'Server error during purchase' });
  }
});

// Subscribe to plan
router.post('/subscribe', (req, res) => {
  try {
    const { userId, plan } = req.body;
    const validPlans = ['daily', '3day', 'weekly', '2week', 'monthly', 'yearly'];
    
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ error: 'Invalid subscription plan' });
    }

    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Calculate expiration date based on plan
    const expirationDate = new Date();
    switch(plan) {
      case 'daily': expirationDate.setDate(expirationDate.getDate() + 1); break;
      case '3day': expirationDate.setDate(expirationDate.getDate() + 3); break;
      case 'weekly': expirationDate.setDate(expirationDate.getDate() + 7); break;
      case '2week': expirationDate.setDate(expirationDate.getDate() + 14); break;
      case 'monthly': expirationDate.setMonth(expirationDate.getMonth() + 1); break;
      case 'yearly': expirationDate.setFullYear(expirationDate.getFullYear() + 1); break;
    }

    user.subscription = {
      plan,
      expiresAt: expirationDate.toISOString().split('T')[0]
    };

    saveUsers(users);
    res.json({ 
      success: true, 
      subscription: user.subscription 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during subscription' });
  }
});

module.exports = router;