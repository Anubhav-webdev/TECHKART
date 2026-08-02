import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/apiConfig";

const FormInput = ({ label, id, error, value, onChange, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-medium text-cyan-400">
      {label}
    </label>
    <input
      id={id}
      value={value}
      onChange={onChange}
      {...props}
      className={`w-full bg-slate-900/60 border rounded-md p-2.5 text-slate-100 transition-colors placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 ${
        error ? "border-red-500/60 focus:border-red-500" : "border-slate-700 focus:border-cyan-500"
      }`}
    />
    {error && <span className="text-xs text-red-400 font-medium">{error}</span>}
  </div>
);

const RadioOption = ({ id, name, label, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer group select-none">
    <input
      id={id}
      name={name}
      type="radio"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 border-slate-600 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-950 accent-cyan-500"
    />
    <span className="text-sm font-medium text-slate-300 group-hover:text-cyan-400 transition-colors">
      {label}
    </span>
  </label>
);

const BillingForm = ({ onFormUpdate }) => {
  const { user } = useAuth();

  const [form, setForm] = useState({
    billingType: "individual",
    name: "",
    phone: "",
    email: "",
    address: "",
    country: "",
    city: "",
    state: "",
    zip: "",
    saveToAddressList: false,
  });

  const [errors, setErrors] = useState({});
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  const validateForm = (formData = form) => {
    const temp = {};
    if (!formData.name?.trim()) temp.name = "Name is required";
    if (!formData.phone?.trim()) temp.phone = "Phone number is required";
    else if (!/^[0-9]{10}$/.test(formData.phone)) temp.phone = "Enter a valid 10-digit phone";
    if (!formData.email?.trim()) temp.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) temp.email = "Enter a valid email";
    if (!formData.address?.trim()) temp.address = "Address is required";
    if (!formData.country?.trim()) temp.country = "Country is required";
    if (!formData.city?.trim()) temp.city = "City is required";
    if (!formData.state?.trim()) temp.state = "State is required";
    if (!formData.zip?.trim()) temp.zip = "ZIP is required";

    return { isValid: Object.keys(temp).length === 0, errors: temp };
  };

  const syncFormWithParent = (nextForm) => {
    const validation = validateForm(nextForm);
    setErrors(validation.errors);
    if (onFormUpdate) {
      onFormUpdate({ formData: nextForm, isValid: validation.isValid, errors: validation.errors });
    }
    return validation;
  };

  useEffect(() => {
    if (user) {
      setForm((prev) => {
        const nextForm = {
          ...prev,
          name: user.username || "",
          email: user.email || "",
          phone: user.phone || "",
        };
        syncFormWithParent(nextForm);
        return nextForm;
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;

    fetch(`${API_BASE_URL}/users/${user.id}/addresses`)
      .then((res) => res.json())
      .then((data) => setSavedAddresses(data.addresses || []))
      .catch(() => setSavedAddresses([]));
  }, [user?.id]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setForm((prev) => {
      const newForm = { ...prev, [id]: type === "checkbox" ? checked : value };
      syncFormWithParent(newForm);
      return newForm;
    });
  };

  const handleBillingTypeChange = (e) => {
    const billingType = e.target.id;
    setForm((prev) => {
      const newForm = { ...prev, billingType };
      syncFormWithParent(newForm);
      return newForm;
    });
  };

  const handleAddressSelect = (e) => {
    const addressId = e.target.value;
    setSelectedAddressId(addressId);

    if (!addressId) return;

    const selected = savedAddresses.find((item) => item._id === addressId);
    if (!selected) return;

    const nextForm = {
      ...form,
      address: selected.address || "",
      country: selected.country || "",
      city: selected.city || "",
      state: selected.state || "",
      zip: selected.zip || "",
      phone: selected.phone || form.phone,
      billingType: selected.billingType === "work" ? "company" : "individual",
    };

    setForm(nextForm);
    syncFormWithParent(nextForm);
  };

  const validate = () => {
    const result = validateForm();
    setErrors(result.errors);
    return result.isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please login first!");
    if (!validate()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/billing/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, userId: user.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to save billing info");
        return;
      }

      alert("Billing address saved successfully!");
      if (form.saveToAddressList) {
        try {
          const addrRes = await fetch(`${API_BASE_URL}/users/${user.id}/addresses`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              label: form.billingType === "company" ? "Work" : "Home",
              address: form.address,
              city: form.city,
              state: form.state,
              zip: form.zip,
              country: form.country,
              phone: form.phone,
            }),
          });

          const addrData = await addrRes.json().catch(() => null);
          if (!addrRes.ok) {
            alert(addrData?.message || "Failed to save address to profile");
          }
        } catch (err) {
          console.error("Address save error:", err);
          alert("Failed to save address to profile");
        }
      }

      setForm((prev) => ({ ...prev, address: "", country: "", city: "", state: "", zip: "" }));
      if (onFormUpdate) onFormUpdate({ ...form, address: "", country: "", city: "", state: "", zip: "" });
    } catch (err) {
      console.error("Server error:", err);
      alert("Server error");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl mx-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 text-slate-100 p-6 sm:p-8 rounded-xl shadow-xl flex flex-col gap-6"
    >
      {/* Header section */}
      <div className="flex flex-col gap-1 border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold flex items-center gap-2.5">
          <span className="w-1 h-5 bg-cyan-500 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.8)]"></span>
          Billing Address
        </h2>
        <p className="text-xs text-slate-400">
          Please provide a valid billing address before completing checkout.
        </p>
      </div>

      {/* Account Type Toggle */}
      <div className="flex items-center gap-6 bg-slate-900/40 border border-slate-800/60 p-3.5 rounded-lg w-fit">
        <RadioOption
          id="individual"
          name="billingType"
          label="Individual Account"
          checked={form.billingType === "individual"}
          onChange={handleBillingTypeChange}
        />
        <RadioOption
          id="company"
          name="billingType"
          label="Company Account"
          checked={form.billingType === "company"}
          onChange={handleBillingTypeChange}
        />
      </div>

      {/* Profile Saved Address Lookup */}
      {savedAddresses.length > 0 && (
        <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-4 flex flex-col gap-2.5">
          <div className="flex flex-col gap-1">
            <label htmlFor="saved-address" className="text-sm font-medium text-cyan-400">
              Use a saved address
            </label>
            <p className="text-xs text-slate-400">
              Select an address from your profile to auto-fill the form fields.
            </p>
          </div>
          <select
            id="saved-address"
            value={selectedAddressId}
            onChange={handleAddressSelect}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
          >
            <option value="">Use a new custom address</option>
            {savedAddresses.map((address) => (
              <option key={address._id} value={address._id}>
                {address.label || "Saved address"} — {address.address}, {address.city}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Master Data Grid Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
        <FormInput
          id="name"
          label="Full Name *"
          placeholder="Enter your name"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
        />

        <FormInput
          id="phone"
          label="Phone Number *"
          placeholder="1234567890"
          value={form.phone}
          onChange={handleChange}
          error={errors.phone}
        />

        <div className="md:col-span-2">
          <FormInput
            id="email"
            label="Email Address *"
            placeholder="user@xyz.com"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />
        </div>

        <div className="md:col-span-2">
          <FormInput
            id="address"
            label="Street Address *"
            placeholder="Enter your address"
            value={form.address}
            onChange={handleChange}
            error={errors.address}
          />
        </div>

        <FormInput
          id="city"
          label="City *"
          placeholder="Enter your city"
          value={form.city}
          onChange={handleChange}
          error={errors.city}
        />

        <FormInput
          id="state"
          label="State / Province *"
          placeholder="Enter your state"
          value={form.state}
          onChange={handleChange}
          error={errors.state}
        />

        <FormInput
          id="zip"
          label="ZIP / Postal Code *"
          placeholder="Enter ZIP code"
          value={form.zip}
          onChange={handleChange}
          error={errors.zip}
        />

        <FormInput
          id="country"
          label="Country *"
          placeholder="Enter your country"
          value={form.country}
          onChange={handleChange}
          error={errors.country}
        />
      </div>

      {/* Actions and Utilities Section */}
      <div className="flex flex-col gap-4 border-t border-slate-800 pt-5 mt-2">
        <label className="flex items-center gap-3 cursor-pointer select-none group w-fit">
          <input
            type="checkbox"
            id="saveToAddressList"
            checked={form.saveToAddressList}
            onChange={handleChange}
            className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-950 accent-cyan-500"
          />
          <span className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors">
            Save this address information to my account profile
          </span>
        </label>

        <button
          type="submit"
          className="w-full bg-cyan-600 text-white py-3 rounded-lg font-semibold hover:bg-cyan-500 shadow-md hover:shadow-cyan-500/20 active:scale-[0.99] transition-all duration-150"
        >
          Save Billing Info
        </button>
      </div>
    </form>
  );
};

export default BillingForm;