const oturumAcilmismi = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("error", ["Lütfen önce oturum açın"]);
    res.redirect("/login");
  }
};

const oturumAcilmamismi = function (req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/");
  }
};

module.exports = {
  oturumAcilmismi,
  oturumAcilmamismi,
};
