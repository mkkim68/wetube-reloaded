import User from "../models/User";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) =>
  res.render("users/join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
  const { name, username, email, password, password2, location } = req.body;
  const { file } = req;
  const pageTitle = "Join";
  if (password !== password2) {
    return res.status(400).render("users/join", {
      pageTitle,
      errorMessage: "Password confirmation does not match.",
    });
  }
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render("users/join", {
      pageTitle,
      errorMessage: "This username/email is already taken",
    });
  }
  try {
    await User.create({
      name,
      username,
      email,
      password,
      location,
      avatarUrl: file ? file.path : null,
    });
    return res.redirect("/login");
  } catch (error) {
    console.log(error);
    return res.status(400).render("users/join", {
      pageTitle: "Upload Video",
      errorMessage: error_message,
    });
  }
};
export const getLogin = (req, res) =>
  res.render("users/login", { pageTitle: "Login" });

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({ username, socialOnly: false });
  if (!user) {
    return res.status(400).render("users/login", {
      pageTitle,
      errorMessage: "An account with this username does not exists.",
    });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("users/login", {
      pageTitle,
      errorMessage: "Wrong Password",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};
export const getEdit = (req, res) => {
  return res.render("users/edit-profile", {
    pageTitle: "Edit Profile",
    user: req.session.user,
  });
};
export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl }, //const id = req.session.user.id;와 같음
    },
    body: { name, email, username, location }, //const {name, email, username, location } = req.body;
    file,
  } = req;
  const userEmail = req.session.user.email;
  const userUsername = req.session.user.username;
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (email !== userEmail && username !== userUsername && exists) {
    return res.status(400).render("users/edit-profile", {
      pageTitle: "error",
      errorMessage: "This username/email is already taken",
    });
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        avatarUrl: file ? file.path : avatarUrl,
        name,
        email,
        username,
        location,
      },
      { new: true }
    );
    req.session.user = updatedUser;
    return res.redirect(`/users/${_id}`);
  } catch (error) {
    console.log(error);
    return res.status(400).render("users/edit-profile", {
      pageTitle: "Edit Profile",
      errorMessage: error_message,
    });
  }
};
export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    req.flash("error", "Can't change password.");
    return res.redirect("/");
  }
  return res.render("users/change-password", { pageTitle: "Change Password" });
};
export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { id }, //const id = req.session.user.id;와 같음
    },
    body: { oldPassword, newPassword, newPasswordConfirmation },
  } = req;
  const user = await User.findById(id);
  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect",
    });
  }
  if (newPassword !== newPasswordConfirmation) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The new password does not match the confirmation",
    });
  }
  user.password = newPassword;
  await user.save(); //User.js 내부의 hash 작업을 위해 save
  req.flash("info", "Password updated.");
  return res.redirect("/");
};
export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/users/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};
export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/users/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        header: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name ? userData.name : "Unknown",
        username: userData.users / login ? userData.users / login : "Unknown",
        email: emailObj.email,
        password: "",
        socialOnly: true,
        location: userData.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const startKakaoLogin = (req, res) => {
  Kakao.init(`${KAKAO_CLIENT}`);
  console.log(Kakao.isInitialized());
  const baseUrl = "https://github.com/users/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishKakaoLogin = (req, res) => {};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};

export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner",
    },
  });

  console.log(user.videos);
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User Not Found" });
  }
  return res.render("users/profile", {
    pageTitle: `${user.name}'s Profile`,
    user,
    videos: user.videos,
  });
};
