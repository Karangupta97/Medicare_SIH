import connectAllDatabases, { getDBConnection } from './connections.js';

// Legacy function for backward compatibility
const connectDB = async () => {
  console.log('⚠️  Using legacy connectDB function. Consider updating to use connectAllDatabases.');
  return await connectAllDatabases();
};

export default connectDB;
export { connectAllDatabases, getDBConnection };
