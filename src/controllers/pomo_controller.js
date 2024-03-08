const getanasayfa = (req, res, next) => {
  res.render("main.ejs", {
    layout: "./layout/main_layout.ejs",
    title: "PomoList",
  });
};

module.exports = {
  getanasayfa,
};
