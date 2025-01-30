export const auth = (req, res, next) => {
  // Temporary development auth middleware
  req.user = {
    _id: '65b9474e39d3a34e8fd3e372'  
  };
  next();
};