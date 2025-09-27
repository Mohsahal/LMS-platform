const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle SPA routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  // Check if it's an asset request
  if (req.path.includes('/assets/') || req.path.includes('.')) {
    return res.status(404).send('Asset not found');
  }
  
  // For all other routes, serve the SPA
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`SPA routing enabled for all routes`);
});
