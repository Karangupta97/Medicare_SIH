/**
 * Generates a secure random password
 * @param {number} length - Password length (default: 10)
 * @returns {string} - Generated password
 */
export const generatePassword = (length = 10) => {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  
  // Ensure password contains at least one uppercase letter, lowercase letter, number, and special character
  password += getRandomChar("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  password += getRandomChar("abcdefghijklmnopqrstuvwxyz");
  password += getRandomChar("0123456789");
  password += getRandomChar("!@#$%^&*");
  
  // Fill the rest of the password with random characters
  for (let i = password.length; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  // Shuffle the password characters
  return shuffleString(password);
};

/**
 * Get a random character from a string
 * @param {string} chars - Character set to choose from
 * @returns {string} - Random character
 */
const getRandomChar = (chars) => {
  return chars.charAt(Math.floor(Math.random() * chars.length));
};

/**
 * Shuffle a string
 * @param {string} string - String to shuffle
 * @returns {string} - Shuffled string
 */
const shuffleString = (string) => {
  const array = string.split('');
  
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  
  return array.join('');
}; 