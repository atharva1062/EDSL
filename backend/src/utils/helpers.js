/**
 * Helper function to validate if an email belongs to a campus/college domain
 * @param {String} email 
 * @returns {Boolean}
 */
const validateCampusEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  
  const lowerEmail = email.toLowerCase().trim();
  const domainConfig = process.env.ALLOWED_EMAIL_DOMAINS;

  // If domains are specified in env, check against them
  if (domainConfig && domainConfig.trim() !== '') {
    const allowed = domainConfig.split(',').map(d => d.trim().toLowerCase());
    return allowed.some(domain => {
      if (domain.startsWith('.')) {
        return lowerEmail.endsWith(domain);
      }
      return lowerEmail.endsWith('@' + domain) || lowerEmail.endsWith('.' + domain);
    });
  }

  // Default fallback: allow any .edu, .ac.in, college, student, campus, or standard emails in demo mode
  return (
    lowerEmail.endsWith('.edu') ||
    lowerEmail.endsWith('.ac.in') ||
    lowerEmail.includes('college') ||
    lowerEmail.includes('student') ||
    lowerEmail.includes('campus') ||
    lowerEmail.endsWith('.org') ||
    lowerEmail.includes('@') // In demo mode, accept all valid email formats
  );
};

module.exports = {
  validateCampusEmail,
};
