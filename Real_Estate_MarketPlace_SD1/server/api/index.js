const app = require('../server');
const connectDB = require('../db');

let connectionPromise;

module.exports = async function handler(req, res) {
  try {
    if (!connectionPromise) {
      connectionPromise = connectDB().catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
    }

    await connectionPromise;
    return app(req, res);
  } catch (error) {
    console.error('Could not connect to MongoDB:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed',
    });
  }
};
