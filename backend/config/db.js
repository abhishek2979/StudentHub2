const mongoose = require('mongoose');
async function repairSparseIndexes() {
  try {
    const col = mongoose.connection.collection('users');
    const indexes = await col.indexes();

    const fix = async (indexName) => {
      const existing = indexes.find(ix => ix.name === indexName);
      if (existing && !existing.sparse) {
        await col.dropIndex(indexName);
        console.log(`🔧 Dropped non-sparse index "${indexName}" — Mongoose will recreate it as sparse`);
      }
    };

    await fix('username_1');
    await fix('googleId_1');

    // Let Mongoose sync the correct sparse indexes
    await mongoose.model('User').syncIndexes();
    console.log(' User indexes verified (sparse)');
  } catch (err) {
    // Non-fatal: log and continue
    console.warn(' Index repair warning:', err.message);
  }
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await repairSparseIndexes();
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
