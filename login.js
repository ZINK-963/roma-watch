document.addEventListener("DOMContentLoaded", () => {
  const phoneStep = document.getElementById("phoneStep");
  const codeStep = document.getElementById("codeStep");
  const phoneInput = document.getElementById("phone-number");
  const codeInput = document.getElementById("otp-code");
  const phoneDisplay = document.getElementById("phoneDisplay");
  const errorBox = document.getElementById("loginError");
  const sendBtn = document.getElementById("sendCodeBtn");
  const verifyBtn = document.getElementById("verifyBtn");
  const backBtn = document.getElementById("backBtn");

  // اگه از قبل لاگین کرده، مستقیم بره صفحه اصلی
  if (RomaAPI.isLoggedIn()) {
    location.href = "./index.html";
    return;
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.hidden = false;
  }
  function hideError() {
    errorBox.hidden = true;
  }
  function setLoading(btn, loading, label) {
    btn.disabled = loading;
    btn.textContent = loading ? "در حال ارسال..." : label;
  }

  let currentPhone = "";

  phoneStep.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();
    const phone = phoneInput.value.trim();
    if (!/^09\d{9}$/.test(phone)) {
      showError("شماره تلفن معتبر نیست. مثال: 09123456789");
      return;
    }
    setLoading(sendBtn, true, "دریافت کد");
    try {
      const res = await RomaAPI.auth.sendOtp(phone);
      currentPhone = phone;
      phoneDisplay.textContent = phone;
      phoneStep.hidden = true;
      codeStep.hidden = false;
      codeInput.value = "";
      codeInput.focus();
      // فقط در حالت توسعه بک‌اند، کد رو برای تست برمی‌گردونه
      if (res?.devCode) {
        console.log("کد تست (فقط حالت توسعه):", res.devCode);
      }
    } catch (err) {
      showError(err.message || "ارسال کد با خطا مواجه شد.");
    } finally {
      setLoading(sendBtn, false, "دریافت کد");
    }
  });

  codeStep.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();
    const code = codeInput.value.trim();
    if (!code) {
      showError("کد تایید را وارد کنید.");
      return;
    }
    setLoading(verifyBtn, true, "ورود");
    try {
      const res = await RomaAPI.auth.verifyOtp(currentPhone, code);
      RomaAPI.setToken(res.token);
      location.href = "./index.html";
    } catch (err) {
      showError(err.message || "کد وارد شده نامعتبر است.");
    } finally {
      setLoading(verifyBtn, false, "ورود");
    }
  });

  backBtn.addEventListener("click", () => {
    hideError();
    codeStep.hidden = true;
    phoneStep.hidden = false;
  });
});
