import { useMemo, useState } from "react";
import { X } from "lucide-react";
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
  phoneNumber: "",
  address: "",
};

const initialLoginForm = {
  identifier: "",
  password: "",
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

      const result = await signupUser({
        fullName: signupForm.fullName,
        username: signupForm.username,
        email: signupForm.email,
        password: signupForm.password,
        phoneNumber: signupForm.phoneNumber,
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[32px] border border-white/20 bg-white p-5 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-500">
              {confirmationRequired
                ? "Verify account"
                : isLogin
                ? "Welcome back"
                : "Create account"}
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              {title}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {confirmationRequired
                ? "Enter the confirmation code sent to finish creating your account."
                : isLogin
                ? "Access saved items, listings, and messages."
                : "Start buying and selling instruments in a few steps."}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!confirmationRequired && (
          <div className="mb-5 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
            <button
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
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        {confirmationRequired ? (
          <form className="space-y-4" onSubmit={handleConfirmSignup}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Username
              </label>
              <input
                value={confirmationUsername}
                readOnly
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
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
              className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
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
          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
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
              <label className="mb-2 block text-sm font-medium text-slate-700">
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
              className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Logging in..." : "Log In"}
            </button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleSignupSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
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
              <label className="mb-2 block text-sm font-medium text-slate-700">
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
              <label className="mb-2 block text-sm font-medium text-slate-700">
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
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Phone Number
              </label>
              <input
                name="phoneNumber"
                type="text"
                value={signupForm.phoneNumber}
                onChange={handleSignupChange}
                placeholder="Enter your phone number"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
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
              <label className="mb-2 block text-sm font-medium text-slate-700">
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
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
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
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating account..." : "Create Account"}
            </button>
          </form>
        )}

        {!confirmationRequired && (
          <p className="mt-5 text-center text-sm text-slate-500">
            {isLogin ? "Need an account?" : "Already have an account?"}{" "}
            <button
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