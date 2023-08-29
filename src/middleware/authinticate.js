const authinticate = (req, _res, next) => {
  req.user = {
    id: '64dce740588983463aea788e',
    name: 'HM Nayem',
  };
  next();
};

module.exports = authinticate;
