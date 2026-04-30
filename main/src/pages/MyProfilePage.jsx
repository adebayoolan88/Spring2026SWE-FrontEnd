import { useEffect, useState } from "react";
import { getStoredToken } from "../lib/auth";
import { getCurrentUserProfile, updateCurrentUserProfile } from "../lib/users";

function MyProfilePage({ onProfileUpdated }) {
  const [form, setForm] = useState({ username: "", email: "", firstName: "", lastName: "", phoneNumber: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = getStoredToken();
        if (!token) throw new Error("You must be logged in to view your profile.");
        const result = await getCurrentUserProfile(token);
        const user = result.user;
        setForm({
          username: user.username || "",
          email: user.email || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          phoneNumber: user.phoneNumber || "",
          address: user.address || "",
        });
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSuccessMessage("");
    setError("");
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = getStoredToken();
      if (!token) throw new Error("You must be logged in to update your profile.");
      setSaving(true);
      setError("");
      setSuccessMessage("");
      const result = await updateCurrentUserProfile(token, form);
      if (onProfileUpdated) onProfileUpdated(result.user);
      setSuccessMessage("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-my-profile">
      <div className="my-profile__container">
        {loading ? (
          <div className="my-profile__state my-profile__state--center">
            <h1 className="my-profile__title">Loading Profile...</h1>
            <p className="my-profile__subtitle">Please wait while we load your account details.</p>
          </div>
        ) : (
          <>
            <div className="my-profile__header">
              <p className="my-profile__eyebrow">Account</p>
              <h1 className="my-profile__title">My Profile</h1>
              <p className="my-profile__subtitle">Update the account information associated with your NoteSwap profile.</p>
            </div>

            {error ? <div className="my-profile__alert my-profile__alert--error">{error}</div> : null}
            {successMessage ? <div className="my-profile__alert my-profile__alert--success">{successMessage}</div> : null}

            <form className="my-profile__form" onSubmit={handleSave}>
              <div className="my-profile__grid my-profile__grid--2">
                <div><label className="my-profile__label">First Name</label><input name="firstName" value={form.firstName} onChange={handleChange} className="my-profile__input" /></div>
                <div><label className="my-profile__label">Last Name</label><input name="lastName" value={form.lastName} onChange={handleChange} className="my-profile__input" /></div>
              </div>
              <div className="my-profile__grid my-profile__grid--2">
                <div><label className="my-profile__label">Username</label><input name="username" value={form.username} onChange={handleChange} className="my-profile__input" /></div>
                <div><label className="my-profile__label">Email</label><input name="email" type="email" value={form.email} onChange={handleChange} className="my-profile__input" /></div>
              </div>
              <div className="my-profile__grid my-profile__grid--2">
                <div><label className="my-profile__label">Phone Number</label><input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className="my-profile__input" /></div>
                <div><label className="my-profile__label">Address</label><input name="address" value={form.address} onChange={handleChange} className="my-profile__input" /></div>
              </div>

              <div className="my-profile__actions">
                <button type="submit" disabled={saving} className="btn-primary my-profile__save-btn">{saving ? "Saving..." : "Save Changes"}</button>
                <button type="button" onClick={() => (window.location.href = "/")} className="btn-secondary">Return Home</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default MyProfilePage;
