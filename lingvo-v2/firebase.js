/* === ЯДРО ОБЛАЧНОЙ БАЗЫ И АВТОРИЗАЦИИ (firebase.js) === */
(function () {
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBfwQFDIK2O2JBtmem5XtLNne6fTxdxQM",
    authDomain: "://firebaseapp.com",
    projectId: "lingvo-trainer-d5aab",
    storageBucket: "lingvo-trainer-d5aab.firebasestorage.app",
    messagingSenderId: "42810725807",
    appId: "1:42810725807:web:5c4c47d378292ad7d00b5a"
  };

  const ADMIN_EMAIL = "trenazer.support@gmail.com";

  window.AppState = window.AppState || {
    user: null,
    profile: null,
    isAdmin: false,
    selectedLang: null
  };

  window.getRankByXP = function (xp) {
    const val = Number(xp) || 0;
    if (val >= 7500) return { title: "Мастер языков", next: null };
    if (val >= 2500) return { title: "Практик", next: 7500 };
    if (val >= 500) return { title: "Исследователь", next: 2500 };
    return { title: "Новичок", next: 500 };
  };

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

   async function initCloud() {
    const proto = "https:/" + "/";
    const host = "www.gstatic" + ".com";
    const path = "/firebasejs" + "/10.12.2/";
    const base = proto + host + path;

    await loadScript(base + "firebase-app-compat.js");
    await loadScript(base + "firebase-auth-compat.js");
    await loadScript(base + "firebase-firestore-compat.js");

    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
    const auth = firebase.auth();
    const db = firebase.firestore();
    window.fbDb = db;

    window.CloudAuth = {
      async ensureUserProfile(user) {
        const email = (user.email || "").toLowerCase();
        const isAdmin = email === ADMIN_EMAIL;
        const ref = db.collection("users").doc(user.uid);
        const snap = await ref.get();

        if (!snap.exists) {
          const baseNick = isAdmin ? "Администратор" : email.split("@").at(0);
          const newProfile = {
            uid: user.uid,
            email: email,
            isAdmin: isAdmin,
            nick: baseNick,
            handle: "@" + (isAdmin ? "admin_lingvo" : baseNick.toLowerCase().replace(/[^a-z0-9_]/g, "") || "user"),
            status: isAdmin ? "Администрация Lingvo Trainer" : "Изучаю языки на Lingvo Trainer",
            xp: 0,
            streakDays: 1,
            learnedCount: 0,
            learnedIds: [],
            friends: [],
            privacy: { showBirthday: true, showCity: true, allowComments: true, showLearned: true },
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          };
          await ref.set(newProfile);
          return newProfile;
        }
        const data = snap.data();
        data.isAdmin = isAdmin;
        return data;
      },

      async signUp() {
        const email = document.getElementById("authEmailInp").value.trim().toLowerCase();
        const pass = document.getElementById("authPassInp").value.trim();
        const msg = document.getElementById("authErrorBox");
        msg.textContent = "";

        if (!email || !email.includes("@") || pass.length < 6) {
          msg.textContent = "Введите корректный Email и пароль (минимум 6 символов).";
          return;
        }
        try {
          await auth.createUserWithEmailAndPassword(email, pass);
          AuthUI.close();
        } catch (err) {
          msg.textContent = err.code === "auth/email-already-in-use"
            ? "Этот Email уже зарегистрирован. Нажмите «Войти»."
            : err.message;
        }
      },

      async signIn() {
        const email = document.getElementById("authEmailInp").value.trim().toLowerCase();
        const pass = document.getElementById("authPassInp").value.trim();
        const msg = document.getElementById("authErrorBox");
        msg.textContent = "";

        if (!email || !pass) {
          msg.textContent = "Введите Email и пароль.";
          return;
        }
        try {
          await auth.signInWithEmailAndPassword(email, pass);
          AuthUI.close();
        } catch (err) {
          msg.textContent = "Неверный Email или пароль (или аккаунт ещё не создан).";
        }
      },

      async resetPassword() {
        const email = document.getElementById("resetEmailInp").value.trim().toLowerCase();
        const msg = document.getElementById("resetMsgBox");
        if (!email || !email.includes("@")) {
          msg.style.color = "#f87171";
          msg.textContent = "Введите ваш Email.";
          return;
        }
        try {
          await auth.sendPasswordResetEmail(email);
          msg.style.color = "#22c55e";
          msg.textContent = "Письмо со ссылкой для сброса пароля отправлено на " + email;
        } catch (err) {
          msg.style.color = "#f87171";
          msg.textContent = err.message;
        }
      },

      async signOut() {
        await auth.signOut();
        if (window.Router) Router.go("home");
      },

      async addXP(points) {
        if (!AppState.user) return;
        await db.collection("users").doc(AppState.user.uid).update({
          xp: firebase.firestore.FieldValue.increment(points)
        });
        if (AppState.profile) AppState.profile.xp = (AppState.profile.xp || 0) + points;
      }
    };

    auth.onAuthStateChanged(async function (user) {
      const btn = document.getElementById("topAccountBtn");
      const lbl = document.getElementById("topAccountLabel");
      const arrow = document.getElementById("topAccountArrow");

      if (user) {
        AppState.user = user;
        AppState.isAdmin = (user.email || "").toLowerCase() === ADMIN_EMAIL;
        AppState.profile = await CloudAuth.ensureUserProfile(user);

        if (btn) btn.classList.add("is-auth");
        if (lbl) lbl.textContent = AppState.profile.nick;
        if (arrow) arrow.style.display = "inline";
      } else {
        AppState.user = null;
        AppState.profile = null;
        AppState.isAdmin = false;

        if (btn) btn.classList.remove("is-auth");
        if (lbl) lbl.textContent = "Аккаунт";
        if (arrow) arrow.style.display = "none";
      }
      if (typeof Router !== "undefined") Router.renderCurrent();
    });
  }

  initCloud().catch(function (e) {
    console.error("Ошибка загрузки Firebase:", e);
  });
})();

