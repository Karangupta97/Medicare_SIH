import mongoose from "mongoose";

// Database connections for different purposes
let patientDB = null;
let doctorDB = null;
let managementDB = null;
let feedbackDB = null;

// Safely derive DB-specific URIs while preserving the query string (ssl/replicaSet/etc).
// Regex-based replacement here is fragile because your base URI ends with `/?ssl=...`.
const withDatabaseName = (baseURI, dbName) => {
  const [pathPart, queryPart] = baseURI.split("?");
  const updatedPath = pathPart.replace(/\/[^\/]*$/, `/${dbName}`);
  if (!queryPart) return updatedPath;
  return `${updatedPath}?${queryPart}`;
};

const connectAllDatabases = async () => {
  try {
    // Extract base URI from environment variable
    const baseURI = process.env.MONGODB_URI;
    
    if (!baseURI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    console.log('🔗 Connecting to multiple databases...');
    
    // Connection options
    const options = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      retryReads: true
    };
    
    // Create separate database connections
    patientDB = mongoose.createConnection(withDatabaseName(baseURI, "Patient"), options);
    doctorDB = mongoose.createConnection(withDatabaseName(baseURI, "Doctor"), options);
    managementDB = mongoose.createConnection(withDatabaseName(baseURI, "Management"), options);
    feedbackDB = mongoose.createConnection(withDatabaseName(baseURI, "Feedback"), options);
    
    // Create promises with timeout for each connection
    const createConnectionPromise = (connection, name) => {
      return Promise.race([
        new Promise((resolve, reject) => {
          connection.once('open', () => {
            console.log(`✅ ${name} Database Connected`);
            resolve();
          });
          connection.once('error', (err) => {
            reject(new Error(`${name} connection failed: ${err.message}`));
          });
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`${name} connection timeout (30s)`)), 30000)
        )
      ]);
    };
    
    // Wait for all connections to be ready with timeout
    await Promise.all([
      createConnectionPromise(patientDB, 'Patient'),
      createConnectionPromise(doctorDB, 'Doctor'),
      createConnectionPromise(managementDB, 'Management'),
      createConnectionPromise(feedbackDB, 'Feedback')
    ]);
    
    // Handle connection errors after initial connection
    patientDB.on('error', (err) => console.error('❌ Patient DB Error:', err));
    doctorDB.on('error', (err) => console.error('❌ Doctor DB Error:', err));
    managementDB.on('error', (err) => console.error('❌ Management DB Error:', err));
    feedbackDB.on('error', (err) => console.error('❌ Feedback DB Error:', err));
    
    return { patientDB, doctorDB, managementDB, feedbackDB };
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.name || error.message}`);
    console.error('Error details:', error.message);
    
    if (error.message.includes('timeout')) {
      console.error('\nConnection timeout - possible causes:');
      console.error('1. MongoDB Atlas is unreachable or slow');
      console.error('2. Network connectivity issue');
      console.error('3. Firewall or proxy blocking the connection');
    } else if (error.name === 'MongooseServerSelectionError') {
      console.error('\nPossible causes:');
      console.error('1. Your IP address is not whitelisted on MongoDB Atlas');
      console.error('2. Incorrect connection string or credentials');
      console.error('3. MongoDB Atlas service might be experiencing issues');
      console.error('\nTry these solutions:');
      console.error('• Add your current IP address to MongoDB Atlas whitelist');
      console.error('• Check your MONGODB_URI for typos');
      console.error('• Verify network connectivity to MongoDB Atlas');
    }

    // Do not terminate the process here.
    // In container platforms, exiting prevents the HTTP server from becoming ready
    // and causes crash loops. Let the caller decide whether to exit or retry.
    throw error;
  }
};

// Getter functions for database connections
export const getPatientDB = () => {
  if (!patientDB) {
    throw new Error('Patient database not connected. Call connectAllDatabases() first.');
  }
  return patientDB;
};

export const getDoctorDB = () => {
  if (!doctorDB) {
    throw new Error('Doctor database not connected. Call connectAllDatabases() first.');
  }
  return doctorDB;
};

export const getManagementDB = () => {
  if (!managementDB) {
    throw new Error('Management database not connected. Call connectAllDatabases() first.');
  }
  return managementDB;
};

export const getFeedbackDB = () => {
  if (!feedbackDB) {
    throw new Error('Feedback database not connected. Call connectAllDatabases() first.');
  }
  return feedbackDB;
};

// Test-only seam: inject connections (e.g. an in-memory MongoDB) so unit /
// integration tests can exercise the models without a real Atlas cluster. Never
// used by production code paths.
export const __setConnectionsForTests = (conns = {}) => {
  if (conns.patientDB) patientDB = conns.patientDB;
  if (conns.doctorDB) doctorDB = conns.doctorDB;
  if (conns.managementDB) managementDB = conns.managementDB;
  if (conns.feedbackDB) feedbackDB = conns.feedbackDB;
};

// Get appropriate database connection based on origin/context
export const getDBConnection = (origin) => {
  // For now, we'll default to patient database for user-related operations
  // This can be extended later to support multi-tenancy based on origin
  if (!patientDB) {
    throw new Error('Patient database not connected. Call connectAllDatabases() first.');
  }
  return patientDB;
};

// Close all database connections
export const closeAllConnections = async () => {
  try {
    if (patientDB) await patientDB.close();
    if (doctorDB) await doctorDB.close();
    if (managementDB) await managementDB.close();
    if (feedbackDB) await feedbackDB.close();
    console.log('✅ All database connections closed');
  } catch (error) {
    console.error('❌ Error closing database connections:', error);
  }
};

export default connectAllDatabases;
export { connectAllDatabases };
