import { useMemo, useState } from "react";
import { X, CheckCircle2, AlertCircle } from "lucide-react";
import {
  confirmSignup,
  loginUser,
  resendSignupCode,
  signupUser,
} from "../../lib/auth";

const initialSignupForm = {
  fullName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  countryCode: "+1",
  phoneNumber: "",
  address: "",
};

const initialLoginForm = {
  identifier: "",
  password: "",
};

const formatPhoneForCognito = (countryCode, phoneNumber) => {
  const digitsOnly = phoneNumber.replace(/\D/g, "");

  if (!digitsOnly) {
    return "";
  }

  return `${countryCode}${digitsOnly}`;
};

const getPasswordRequirements = (password) => [
  {
    label: "At least 8 characters",
    isValid: password.length >= 8,
  },
  {
    label: "At least 1 uppercase letter",
    isValid: /[A-Z]/.test(password),
  },
  {
    label: "At least 1 lowercase letter",
    isValid: /[a-z]/.test(password),
  },
  {
    label: "At least 1 number",
    isValid: /\d/.test(password),
  },
  {
    label: "At least 1 special character",
    isValid: /[^A-Za-z0-9]/.test(password),
  },
];

const isPasswordValid = (password) => {
  return getPasswordRequirements(password).every((requirement) => requirement.isValid);
};

function AuthModal({ mode, onClose, onSwitchMode, onAuthSuccess }) {
  const isLogin = mode === "login";

  const [signupForm, setSignupForm] = useState(initialSignupForm);
  const [loginForm, setLoginForm] = useState(initialLoginForm);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [confirmationRequired, setConfirmationRequired] = useState(false);
  const [confirmationUsername, setConfirmationUsername] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");

  const passwordRequirements = useMemo(
    () => getPasswordRequirements(signupForm.password),
    [signupForm.password]
  );

  const passwordHasInput = signupForm.password.length > 0;

  const title = useMemo(() => {
    if (confirmationRequired) {
      return "Confirm your NoteSwap account";
    }

    return isLogin ? "Log in to NoteSwap" : "Create your NoteSwap account";
  }, [isLogin, confirmationRequired]);

  const resetMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupForm((prev) => ({ ...prev, [name]: value }));
    resetMessages();
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
    resetMessages();
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    resetMessages();

    try {
      if (signupForm.password !== signupForm.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (!isPasswordValid(signupForm.password)) {
        throw new Error(
          "Password does not meet the requirements. Please include at least 8 characters, uppercase and lowercase letters, a number, and a special character."
        );
      }

      const digitsOnlyPhone = signupForm.phoneNumber.replace(/\D/g, "");

      if (digitsOnlyPhone && digitsOnlyPhone.length !== 10) {
        throw new Error("Phone number must be exactly 10 digits.");
      }

      const formattedPhoneNumber = formatPhoneForCognito(
        signupForm.countryCode,
        signupForm.phoneNumber
      );

      const result = await signupUser({
        fullName: signupForm.fullName,
        username: signupForm.username,
        email: signupForm.email,
        password: signupForm.password,
        phoneNumber: formattedPhoneNumber || undefined,
        address: signupForm.address,
      });

      if (result.requiresConfirmation) {
        setConfirmationRequired(true);
        setConfirmationUsername(result.username || signupForm.username);
        setSuccessMessage(
          "Your account was created. Enter the confirmation code sent by Cognito."
        );
        return;
      }

      setSuccessMessage("Account created successfully. You can now log in.");
      setLoginForm((prev) => ({
        ...prev,
        identifier: signupForm.username || signupForm.email,
      }));
      onSwitchMode("login");
    } catch (err) {
      console.error(err);
      setError(err.message || "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmSignup = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    resetMessages();

    try {
      await confirmSignup(confirmationUsername, confirmationCode);

      setSuccessMessage("Account confirmed successfully. Please log in.");
      setConfirmationRequired(false);
      setConfirmationCode("");

      setLoginForm((prev) => ({
        ...prev,
        identifier: confirmationUsername || signupForm.email,
      }));

      onSwitchMode("login");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to confirm account");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setSubmitting(true);
    resetMessages();

    try {
      await resendSignupCode(confirmationUsername);
      setSuccessMessage("A new confirmation code has been sent.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to resend confirmation code");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    resetMessages();

    try {
      const result = await loginUser({
        identifier: loginForm.identifier,
        password: loginForm.password,
      });

      onAuthSuccess(result.user);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="auth-modal auth-modal--overlay"
      onClick={onClose}
    >
      <div
        className="auth-modal__panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="auth-modal__header">
          <div>
            <p className="auth-modal__eyebrow">
              {confirmationRequired
                ? "Verify account"
                : isLogin
                ? "Welcome back"
                : "Create account"}
            </p>
            <h2 className="auth-modal__title">
              {title}
            </h2>
            <p className="auth-modal__subtitle">
              {confirmationRequired
                ? "Enter the confirmation code sent to finish creating your account."
                : isLogin
                ? "Access saved items, listings, and messages."
                : "Start buying and selling instruments in a few steps."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="auth-modal__close-btn"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!confirmationRequired && (
          <div className="mb-5 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                resetMessages();
                onSwitchMode("login");
              }}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                isLogin ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                resetMessages();
                onSwitchMode("signup");
              }}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                !isLogin ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {error ? (
          <div className="mb-4 flex gap-2 auth-modal__alert auth-modal__alert--error">
            <AlertCircle className="auth-modal__requirement-icon" />
            <span>{error}</span>
          </div>
        ) : null}

        {successMessage ? (
          <div className="mb-4 flex gap-2 auth-modal__alert auth-modal__alert--success">
            <CheckCircle2 className="auth-modal__requirement-icon" />
            <span>{successMessage}</span>
          </div>
        ) : null}

        {confirmationRequired ? (
          <form className="auth-modal__stack" onSubmit={handleConfirmSignup}>
            <div>
              <label className="mb-2 auth-modal__label">
                Username
              </label>
              <input
                value={confirmationUsername}
                readOnly
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 auth-modal__label">
                Confirmation Code
              </label>
              <input
                value={confirmationCode}
                onChange={(e) => {
                  setConfirmationCode(e.target.value);
                  resetMessages();
                }}
                placeholder="Enter the code you received"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 auth-modal__submit-btn"
            >
              {submitting ? "Confirming..." : "Confirm Account"}
            </button>

            <button
              type="button"
              onClick={handleResendCode}
              disabled={submitting}
              className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Resend Code
            </button>

            <button
              type="button"
              onClick={() => {
                setConfirmationRequired(false);
                setConfirmationCode("");
                resetMessages();
                onSwitchMode("login");
              }}
              className="inline-flex w-full items-center justify-center rounded-2xl text-sm font-semibold text-orange-500 transition hover:text-orange-600"
            >
              Back to Login
            </button>
          </form>
        ) : isLogin ? (
          <form className="auth-modal__stack" onSubmit={handleLoginSubmit}>
            <div>
              <label className="mb-2 auth-modal__label">
                Username
              </label>
              <input
                name="identifier"
                type="text"
                value={loginForm.identifier}
                onChange={handleLoginChange}
                placeholder="Enter your username"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-2 auth-modal__label">
                Password
              </label>
              <input
                name="password"
                type="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                placeholder="Enter your password"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 auth-modal__submit-btn"
            >
              {submitting ? "Logging in..." : "Log In"}
            </button>
          </form>
        ) : (
          <form className="auth-modal__stack" onSubmit={handleSignupSubmit}>
            <div>
              <label className="mb-2 auth-modal__label">
                Full Name
              </label>
              <input
                name="fullName"
                type="text"
                value={signupForm.fullName}
                onChange={handleSignupChange}
                placeholder="Enter your full name"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-2 auth-modal__label">
                Username
              </label>
              <input
                name="username"
                type="text"
                value={signupForm.username}
                onChange={handleSignupChange}
                placeholder="Choose a username"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-2 auth-modal__label">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={signupForm.email}
                onChange={handleSignupChange}
                placeholder="Enter your email"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-2 auth-modal__label">
                Phone Number
              </label>

              <div className="flex gap-2">
                <select
                  name="countryCode"
                  value={signupForm.countryCode}
                  onChange={handleSignupChange}
                  className="w-28 rounded-2xl border border-slate-200 px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                >
                  <option value="+1">US +1</option>
                  <option value="+44">UK +44</option>
                  <option value="+52">MX +52</option>
                  <option value="+234">NG +234</option>
                  <option value="+91">IN +91</option>
                </select>

                <input
                  name="phoneNumber"
                  type="tel"
                  value={signupForm.phoneNumber}
                  onChange={(e) => {
                    const digitsOnly = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);

                    setSignupForm((prev) => ({
                      ...prev,
                      phoneNumber: digitsOnly,
                    }));

                    resetMessages();
                  }}
                  
                  className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>

              
            </div>

            <div>
              <label className="mb-2 auth-modal__label">
                Address
              </label>
              <input
                name="address"
                type="text"
                value={signupForm.address}
                onChange={handleSignupChange}
                placeholder="Enter your address"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-2 auth-modal__label">
                Password
              </label>
              <input
                name="password"
                type="password"
                value={signupForm.password}
                onChange={handleSignupChange}
                placeholder="At least 8 characters"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />

              <div
                className={`mt-3 rounded-2xl border px-4 py-3 text-sm transition ${
                  passwordHasInput
                    ? "border-orange-200 bg-orange-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="mb-2 flex items-center gap-2 font-medium text-slate-700">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  Password requirements
                </div>

                <div className="space-y-1.5">
                  {passwordRequirements.map((requirement) => (
                    <div
                      key={requirement.label}
                      className={`flex items-center gap-2 text-xs ${
                        requirement.isValid
                          ? "text-emerald-700"
                          : "text-slate-500"
                      }`}
                    >
                      <CheckCircle2
                        className={`h-3.5 w-3.5 ${
                          requirement.isValid
                            ? "auth-modal__text--success"
                            : "auth-modal__text--muted"
                        }`}
                      />
                      <span>{requirement.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 auth-modal__label">
                Confirm Password
              </label>
              <input
                name="confirmPassword"
                type="password"
                value={signupForm.confirmPassword}
                onChange={handleSignupChange}
                placeholder="Confirm your password"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />

              {signupForm.confirmPassword && (
                <p
                  className={`mt-2 text-xs ${
                    signupForm.password === signupForm.confirmPassword
                      ? "auth-modal__text--success"
                      : "text-red-600"
                  }`}
                >
                  {signupForm.password === signupForm.confirmPassword
                    ? "Passwords match."
                    : "Passwords do not match."}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 auth-modal__submit-btn"
            >
              {submitting ? "Creating account..." : "Create Account"}
            </button>
          </form>
        )}

        {!confirmationRequired && (
          <p className="mt-5 text-center text-sm text-slate-500">
            {isLogin ? "Need an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                resetMessages();
                onSwitchMode(isLogin ? "signup" : "login");
              }}
              className="font-semibold text-orange-500 transition hover:text-orange-600"
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default AuthModal;