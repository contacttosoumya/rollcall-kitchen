/**
 * src/controllers/adminAuth.controller.js
 */
const adminAuthService = require("../services/adminAuth.service");
const { setAdminSessionCookie, clearAdminSessionCookie } = require("../middleware/adminSession");

function loginPage(req, res) {
  if (req.adminUser) return res.redirect("/admin");
  res.render("admin/login", { title: "Admin Login", error: null });
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await adminAuthService.verifyLogin(email, password);

  if (!user) {
    return res.status(401).render("admin/login", {
      title: "Admin Login",
      error: "Incorrect email or password.",
    });
  }

  setAdminSessionCookie(res, user.id);
  res.redirect("/admin");
}

function logout(req, res) {
  clearAdminSessionCookie(res);
  res.redirect("/admin/login");
}

module.exports = { loginPage, login, logout };
