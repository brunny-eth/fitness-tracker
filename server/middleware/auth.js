export const auth = async (req, res, next) => {
  // Simple pass-through middleware
  req.user = { _id: 'dummy-user-id' }; // Provide a dummy user ID for now
  next();
};