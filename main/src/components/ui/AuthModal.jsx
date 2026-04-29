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
            <X className="auth-modal__icon auth-modal__icon--sm" />
          </button>
        </div>

        {!confirmationRequired && (
          <div className="auth-modal__tabs">
            <button
              type="button"
              onClick={() => {
                resetMessages();
                onSwitchMode("login");
              }}
              className={`auth-modal__tab ${isLogin ? "auth-modal__tab--active" : "auth-modal__tab--inactive"}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                resetMessages();
                onSwitchMode("signup");
              }}
              className={`auth-modal__tab ${!isLogin ? "auth-modal__tab--active" : "auth-modal__tab--inactive"}`}
            >
              Sign Up
            </button>
          </div>
        )}

        {error ? (
          <div className="auth-modal__alert-row auth-modal__alert auth-modal__alert--error">
            <AlertCircle className="auth-modal__requirement-icon" />
            <span>{error}</span>
          </div>
        ) : null}

        {successMessage ? (
          <div className="auth-modal__alert-row auth-modal__alert auth-modal__alert--success">
            <CheckCircle2 className="auth-modal__requirement-icon" />
            <span>{successMessage}</span>
          </div>
        ) : null}

        {confirmationRequired ? (
          <form className="auth-modal__stack" onSubmit={handleConfirmSignup}>
            <div>
              <label className="auth-modal__label">
                Username
              </label>
              <input
                value={confirmationUsername}
                readOnly
                className="auth-modal__input auth-modal__input--readonly"
              />
            </div>

            <div>
              <label className="auth-modal__label">
                Confirmation Code
              </label>
              <input
                value={confirmationCode}
                onChange={(e) => {
                  setConfirmationCode(e.target.value);
                  resetMessages();
                }}
                placeholder="Enter the code you received"
                className="auth-modal__input"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="auth-modal__submit-btn"
            >
              {submitting ? "Confirming..." : "Confirm Account"}
            </button>

            <button
              type="button"
              onClick={handleResendCode}
              disabled={submitting}
              className="auth-modal__secondary-btn auth-modal__secondary-btn--neutral"
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
              className="auth-modal__secondary-btn auth-modal__secondary-btn--link"
            >
              Back to Login
            </button>
          </form>
        ) : isLogin ? (
          <form className="auth-modal__stack" onSubmit={handleLoginSubmit}>
            <div>
              <label className="auth-modal__label">
                Username
              </label>
              <input
                name="identifier"
                type="text"
                value={loginForm.identifier}
                onChange={handleLoginChange}
                placeholder="Enter your username"
                className="auth-modal__input"
              />
            </div>

            <div>
              <label className="auth-modal__label">
                Password
              </label>
              <input
                name="password"
                type="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                placeholder="Enter your password"
                className="auth-modal__input"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="auth-modal__submit-btn"
            >
              {submitting ? "Logging in..." : "Log In"}
            </button>
          </form>
        ) : (
          <form className="auth-modal__stack" onSubmit={handleSignupSubmit}>
            <div>
              <label className="auth-modal__label">
                Full Name
              </label>
              <input
                name="fullName"
                type="text"
                value={signupForm.fullName}
                onChange={handleSignupChange}
                placeholder="Enter your full name"
                className="auth-modal__input"
              />
            </div>

            <div>
              <label className="auth-modal__label">
                Username
              </label>
              <input
                name="username"
                type="text"
                value={signupForm.username}
                onChange={handleSignupChange}
                placeholder="Choose a username"
                className="auth-modal__input"
              />
            </div>

            <div>
              <label className="auth-modal__label">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={signupForm.email}
                onChange={handleSignupChange}
                placeholder="Enter your email"
                className="auth-modal__input"
              />
            </div>

            <div>
              <label className="auth-modal__label">
                Phone Number
              </label>

              <div className="auth-modal__phone-split">
                <select
                  name="countryCode"
                  value={signupForm.countryCode}
                  onChange={handleSignupChange}
                  className="auth-modal__select auth-modal__select--country"
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
                  
                  className="auth-modal__input auth-modal__input--phone"
                />
              </div>

              
            </div>

            <div>
              <label className="auth-modal__label">
                Address
              </label>
              <input
                name="address"
                type="text"
                value={signupForm.address}
                onChange={handleSignupChange}
                placeholder="Enter your address"
                className="auth-modal__input"
              />
            </div>

            <div>
              <label className="auth-modal__label">
                Password
              </label>
              <input
                name="password"
                type="password"
                value={signupForm.password}
                onChange={handleSignupChange}
                placeholder="At least 8 characters"
                className="auth-modal__input"
              />

              <div
                className={`auth-modal__requirements ${
                  passwordHasInput
                    ? "auth-modal__requirements--active"
                    : "auth-modal__requirements--idle"
                }`}
              >
                <div className="auth-modal__requirements-heading">
                  <AlertCircle className="auth-modal__requirements-alert-icon" />
                  Password requirements
                </div>

                <div className="auth-modal__requirements-list">
                  {passwordRequirements.map((requirement) => (
                    <div
                      key={requirement.label}
                      className={`auth-modal__requirement-row ${
                        requirement.isValid
                          ? "auth-modal__requirement-row--valid"
                          : "auth-modal__requirement-row--invalid"
                      }`}
                    >
                      <CheckCircle2
                        className={`auth-modal__requirement-check-icon ${
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
              <label className="auth-modal__label">
                Confirm Password
              </label>
              <input
                name="confirmPassword"
                type="password"
                value={signupForm.confirmPassword}
                onChange={handleSignupChange}
                placeholder="Confirm your password"
                className="auth-modal__input"
              />

              {signupForm.confirmPassword && (
                <p
                  className={`auth-modal__password-match ${
                    signupForm.password === signupForm.confirmPassword
                      ? "auth-modal__text--success"
                      : "auth-modal__text--error"
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
              className="auth-modal__submit-btn"
            >
              {submitting ? "Creating account..." : "Create Account"}
            </button>
          </form>
        )}

        {!confirmationRequired && (
          <p className="auth-modal__footer-text">
            {isLogin ? "Need an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                resetMessages();
                onSwitchMode(isLogin ? "signup" : "login");
              }}
              className="auth-modal__link-btn"
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