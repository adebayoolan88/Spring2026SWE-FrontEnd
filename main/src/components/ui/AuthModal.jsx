import { useMemo, useState } from "react";
import { X } from "lucide-react";
import {
  loginUser,
  saveToken,
  signupUser,
} from "../../lib/auth";

// Starting shape for the signup form.
// Keeping it in one object makes it easier to update fields by name.
const initialSignupForm = {
  fullName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  phoneNumber: "",
  address: "",
};

// Starting shape for the login form.
const initialLoginForm = {
  identifier: "",
  password: "",
};

function AuthModal({ mode, onClose, onSwitchMode, onAuthSuccess }) {
  // mode comes from the parent. It tells us whether to show login or signup UI.
  const isLogin = mode === "login";

  // Local state for both forms.
  // We keep them separate because login and signup need different fields.
  const [signupForm, setSignupForm] = useState(initialSignupForm);
  const [loginForm, setLoginForm] = useState(initialLoginForm);

  // submitting helps disable buttons and show loading text while waiting on the backend.
  const [submitting, setSubmitting] = useState(false);

  // error stores any message we want to show to the user.
  const [error, setError] = useState("");

  // useMemo is used here just to derive a title from mode.
  const title = useMemo(() => {
    return isLogin ? "Log in to NoteSwap" : "Create your NoteSwap account";
  }, [isLogin]);

  const resetErrors = () => setError("");

  // Generic change handler for signup inputs.
  // It uses the input's "name" attribute to know which field to update.
  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupForm((prev) => ({ ...prev, [name]: value }));
    resetErrors();
  };

  // Generic change handler for login inputs.
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
    resetErrors();
  };

  // Runs when the signup form is submitted.
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // Basic frontend validation before hitting the backend.
      if (signupForm.password !== signupForm.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Send signup data to the backend auth helper.
      const result = await signupUser({
        fullName: signupForm.fullName,
        username: signupForm.username,
        email: signupForm.email,
        password: signupForm.password,
        phoneNumber: signupForm.phoneNumber,
        address: signupForm.address,
      });

      // Save the JWT so the user stays logged in across refreshes.
      saveToken(result.token);

      // Tell the parent app that auth succeeded.
      onAuthSuccess(result.user);

      // Close the modal after success.
      onClose();
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Runs when the login form is submitted.
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const result = await loginUser({
        identifier: loginForm.identifier,
        password: loginForm.password,
      });

      saveToken(result.token);
      onAuthSuccess(result.user);
      onClose();
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // Full-screen overlay.
    // Clicking outside the modal closes it.
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal body.
          stopPropagation prevents clicks inside the modal from bubbling up and closing it. */}
      <div
        className="w-full max-w-md rounded-[32px] border border-white/20 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header area */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-500">
              {isLogin ? "Welcome back" : "Create account"}
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              {title}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {isLogin
                ? "Access saved items, listings, and messages."
                : "Start buying and selling instruments in a few steps."}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Login / Signup switcher */}
        <div className="mb-5 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
          <button
            onClick={() => {
              setError("");
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
              setError("");
              onSwitchMode("signup");
            }}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              !isLogin ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error message box, only shown if there is an error */}
        {error ? (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {/* Conditionally render login or signup form */}
        {isLogin ? (
          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email or Username
              </label>
              <input
                name="identifier"
                type="text"
                value={loginForm.identifier}
                onChange={handleLoginChange}
                placeholder="Enter your email or username"
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

        {/* Bottom helper link to switch between modes */}
        <p className="mt-5 text-center text-sm text-slate-500">
          {isLogin ? "Need an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setError("");
              onSwitchMode(isLogin ? "signup" : "login");
            }}
            className="font-semibold text-orange-500 transition hover:text-orange-600"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthModal;