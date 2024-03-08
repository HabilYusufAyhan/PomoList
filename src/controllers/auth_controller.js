const { validationResult } = require("express-validator");
const User = require("../model/user_model");
const passport = require("passport");
require("../config/passport_local")(passport);
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const Pomo = require("../model/pomo_model");

const loginFormunuGoster = (req, res, next) => {
  res.render("login.ejs", {
    layout: "./layout/auth_layout.ejs",
    title: "Giriş Yap",
  });
};
try {
  const login = (req, res, next) => {
    const hatalar = validationResult(req);
    // console.log(hatalarDizisi);
    req.flash("email", req.body.email);
    req.flash("sifre", req.body.sifre);
    if (!hatalar.isEmpty()) {
      req.flash("validation_error", hatalar.array());

      //console.log(req.session);
      res.redirect("/user/auth");
    } else {
      passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/user/auth",
        failureFlash: true,
      })(req, res, next);
    }
  };

  const register = async (req, res, next) => {
    const hatalar = validationResult(req);
    // console.log(hatalarDizisi);
    if (!hatalar.isEmpty()) {
      req.flash("validation_error", hatalar.array());
      req.flash("email", req.body.email);
      req.flash("kullaniciadi", req.body.kullaniciadi);
      req.flash("sifre", req.body.sifre);
      req.flash("resifre", req.body.resifre);

      //console.log(req.session);
      res.redirect("/user/auth");
    } else {
      try {
        const _user = await User.findOne({ email: req.body.email });

        if (_user && _user.emailAktif == true) {
          req.flash("validation_error", [{ msg: "Bu mail kullanımda" }]);
          req.flash("email", req.body.email);
          req.flash("kullaniciadi", req.body.kullaniciadi);
          req.flash("sifre", req.body.sifre);
          req.flash("resifre", req.body.resifre);
          res.redirect("/user/auth");
        } else if ((_user && _user.emailAktif == false) || _user == null) {
          if (_user) {
            await User.findByIdAndRemove({ _id: _user._id });
          }
          const newUser = new User({
            email: req.body.email,
            kullaniciadi: req.body.kullaniciadi,
            sifre: await bcrypt.hash(req.body.sifre, 10),
          });
          await newUser.save();
          console.log("kullanıcı kaydedildi");

          //jwt işlemleri

          const jwtBilgileri = {
            id: newUser.id,
            mail: newUser.email,
          };

          const jwtToken = jwt.sign(
            jwtBilgileri,
            process.env.CONFIRM_MAIL_JWT_SECRET,
            { expiresIn: "1d" }
          );
          console.log(jwtToken);

          //MAIL GONDERME ISLEMLERI
          const url = process.env.WEB_SITE_URL + "user/verify?id=" + jwtToken;
          console.log("gidilecek url:" + url);

          let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.GMAIL_USER,
              pass: process.env.GMAIL_SIFRE,
            },
          });

          await transporter.sendMail(
            {
              from: "Guvercin <info@guvercin.com",
              to: newUser.email,
              subject: "Emailiniz Lütfen Onaylayın",
              text:
                "Emailinizi onaylamak için lütfen şu linki tıklayın: " +
                " " +
                url,
            },
            (error, info) => {
              if (error) {
                console.log("bir hata var" + error);
              }
              console.log("Mail gönderildi");
              console.log(info);
              transporter.close();
            }
          );

          req.flash("success_message", [
            { msg: "Lütfen mail kutunuzu kontrol edin" },
          ]);
          res.redirect("/user/auth");
        }
      } catch (err) {
        console.log("user kaydedilirken hata cıktı " + err);
      }
    }
  };

  const forgetPasswordFormunuGoster = (req, res, next) => {
    res.render("forget_password", {
      layout: "./layout/auth_layout.ejs",
      title: "Şifremi Unuttum",
    });
  };
  const forgetPassword = async (req, res, next) => {
    const hatalar = validationResult(req);

    if (!hatalar.isEmpty()) {
      req.flash("validation_error", hatalar.array());
      req.flash("email", req.body.email);

      //console.log(req.session);
      res.redirect("/forget-password");
    }
    //burası calısıyorsa kullanıcı düzgün bir mail girmiştir
    else {
      try {
        const _user = await User.findOne({
          email: req.body.email,
          emailAktif: true,
        });

        if (_user) {
          //kullanıcıya şifre sıfırlama maili atılabilir
          const jwtBilgileri = {
            id: _user._id,
            mail: _user.email,
          };
          const secret =
            process.env.RESET_PASSWORD_JWT_SECRET + "-" + _user.sifre;
          const jwtToken = jwt.sign(jwtBilgileri, secret, { expiresIn: "1d" });

          //MAIL GONDERME ISLEMLERI
          const url =
            process.env.WEB_SITE_URL +
            "reset-password/" +
            _user._id +
            "/" +
            jwtToken;

          let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.GMAIL_USER,
              pass: process.env.GMAIL_SIFRE,
            },
          });

          await transporter.sendMail(
            {
              from: "Nodejs Uygulaması <info@nodejskursu.com",
              to: _user.email,
              subject: "Şifre Güncelleme",
              text: "Şifrenizi oluşturmak için lütfen şu linki tıklayın:" + url,
            },
            (error, info) => {
              if (error) {
                console.log("bir hata var" + error);
              }
              console.log("Mail gönderildi");
              console.log(info);
              transporter.close();
            }
          );

          req.flash("success_message", [
            { msg: "Lütfen mail kutunuzu kontrol edin" },
          ]);
          res.redirect("/user/auth");
        } else {
          req.flash("validation_error", [
            { msg: "Bu mail kayıtlı değil veya Kullanıcı pasif" },
          ]);
          req.flash("email", req.body.email);
          res.redirect("forget-password");
        }
        //jwt işlemleri
      } catch (err) {
        console.log("user kaydedilirken hata cıktı " + err);
      }
    }

    //res.render('forget_password', { layout: './layout/auth_layout.ejs' });
  };

  const logout = (req, res, next) => {
    req.logout();
    req.session.destroy((error) => {
      res.clearCookie("connect.sid");
      //req.flash('success_message', [{ msg: 'Başarıyla çıkış yapıldı' }]);
      res.render("login", {
        layout: "./layout/auth_layout.ejs",
        title: "Giriş Yap",
        success_message: [{ msg: "Başarıyla çıkış yapıldı" }],
      });
      //res.redirect('/login');
      //res.send('çıkış yapıldı');
    });
  };

  const verifyMail = (req, res, next) => {
    const token = req.query.id;
    if (token) {
      try {
        jwt.verify(
          token,
          process.env.CONFIRM_MAIL_JWT_SECRET,
          async (e, decoded) => {
            if (e) {
              req.flash("error", "Kod Hatalı veya Süresi Geçmiş");
              res.redirect("/user/auth");
            } else {
              const tokenIcindekiIDDegeri = decoded.id;
              const sonuc = await User.findByIdAndUpdate(
                tokenIcindekiIDDegeri,
                {
                  emailAktif: true,
                }
              );
              const newUser = new Pomo({
                UserID: tokenIcindekiIDDegeri,
              });
              await newUser.save();

              if (sonuc) {
                req.flash("success_message", [
                  { msg: "Başarıyla mail onaylandı" },
                ]);
                res.redirect("/user/auth");
              } else {
                req.flash("error", "Lütfen tekrar kullanıcı oluşturun");
                res.redirect("/user/auth");
              }
            }
          }
        );
      } catch (err) {}
    } else {
      req.flash("error", "Token Yok veya Geçersiz");
      res.redirect("/user/auth");
    }
  };

  const yeniSifreyiKaydet = async (req, res, next) => {
    const hatalar = validationResult(req);

    if (!hatalar.isEmpty()) {
      req.flash("validation_error", hatalar.array());
      req.flash("sifre", req.body.sifre);
      req.flash("resifre", req.body.resifre);

      console.log("formdan gelen değerler");
      console.log(req.body);
      //console.log(req.session);
      res.redirect("/reset-password/" + req.body.id + "/" + req.body.token);
    } else {
      const _bulunanUser = await User.findOne({
        _id: req.body.id,
        emailAktif: true,
      });

      const secret =
        process.env.RESET_PASSWORD_JWT_SECRET + "-" + _bulunanUser.sifre;

      try {
        jwt.verify(req.body.token, secret, async (e, decoded) => {
          if (e) {
            req.flash("error", "Kod Hatalı veya Süresi Geçmiş");
            res.redirect("/forget-password");
          } else {
            const hashedPassword = await bcrypt.hash(req.body.sifre, 10);
            const sonuc = await User.findByIdAndUpdate(req.body.id, {
              sifre: hashedPassword,
            });

            if (sonuc) {
              req.flash("success_message", [
                { msg: "Başarıyla şifre güncellendi" },
              ]);
              res.redirect("/user/auth");
            } else {
              req.flash(
                "error",
                "Lütfen tekrar şifre sıfırlama adımlarını yapın"
              );
              res.redirect("/user/auth");
            }
          }
        });
      } catch (err) {
        console.log("hata cıktı" + err);
      }
    }
  };
  const yeniSifreFormuGoster = async (req, res, next) => {
    const linktekiID = req.params.id;
    const linktekiToken = req.params.token;

    if (linktekiID && linktekiToken) {
      const _bulunanUser = await User.findOne({ _id: linktekiID });

      const secret =
        process.env.RESET_PASSWORD_JWT_SECRET + "-" + _bulunanUser.sifre;

      try {
        jwt.verify(linktekiToken, secret, async (e, decoded) => {
          if (e) {
            req.flash("error", "Kod Hatalı veya Süresi Geçmiş");
            res.redirect("/forget-password");
          } else {
            res.render("new_password", {
              id: linktekiID,
              token: linktekiToken,
              layout: "./layout/auth_layout.ejs",
              title: "Şifre Güncelle",
            });
          }
        });
      } catch (err) {}
    } else {
      req.flash("validation_error", [
        { msg: "Lütfen maildeki linki tıklayın. Token Bulunamadı" },
      ]);

      res.redirect("forget-password");
    }
  };

  const openchangepassword = async function (req, res, next) {
    res.render("change_password.ejs", { title: "Şifre Değiştir" });
  };
  const postchangepassword = async function (req, res, next) {
    const oldpass = req.body.oldsifre;
    const hatalar = validationResult(req);

    if (!hatalar.isEmpty()) {
      req.flash("validation_error", hatalar.array());
      req.flash("sifre", req.body.sifre);
      req.flash("resifre", req.body.resifre);

      console.log("formdan gelen değerler");
      console.log(req.body);
      //console.log(req.session);
      res.redirect("/changepassword");
    } else {
      const user = await User.findOne({ _id: req.user.id });
      const mevcutpass = await bcrypt.compare(oldpass, user.sifre);

      if (!mevcutpass) {
        req.flash("validation_error", { msg: "Eski şifreniz yanlış" });
        res.redirect("/changepassword");
      } else {
        let sifre = await bcrypt.hash(req.body.sifre, 10);
        user.sifre = sifre;
        user.save();
        req.flash("success_message", { msg: "Şifre başarıyla değiştirildi" });
        res.redirect("/changepassword");
      }
    }
  };

  module.exports = {
    loginFormunuGoster,
    forgetPasswordFormunuGoster,
    register,
    login,
    forgetPassword,
    logout,
    verifyMail,
    yeniSifreFormuGoster,
    yeniSifreyiKaydet,
    openchangepassword,
    postchangepassword,
  };
} catch (error) {
  console.log(error);
}
