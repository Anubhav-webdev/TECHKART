import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/apiConfig";

const FormInput = ({ label, id, value, onChange, ...props }) => (
     <div>
          <label htmlFor={id} className="block text-sm font-medium text-cyan-300 mb-1">{label}</label>
          <input
               id={id}
               value={value}
               onChange={onChange}
               {...props}
               className="w-full bg-teal-700 border border-gray-300 rounded-md p-2.5"
          />
     </div>
);

const RadioOption = ({ id, name, label, checked, onChange }) => (
     <div className="flex items-center bg-cyan-900/2">
          <input
               id={id}
               name={name}
               type="radio"
               checked={checked}
               onChange={onChange}
               className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-cyan-500 accent-teal-600"
          />
          <label htmlFor={id} className="ml-3 block text-base font-medium text-cyan-300">{label}</label>
     </div>
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

     // Prefill user data if logged in
     useEffect(() => {
          if (user) {
               setForm(prev => {
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
               .then(res => res.json())
               .then(data => setSavedAddresses(data.addresses || []))
               .catch(() => setSavedAddresses([]));
     }, [user?.id]);

     const handleChange = (e) => {
          const { id, value, type, checked } = e.target;
          setForm(prev => {
               const newForm = { ...prev, [id]: type === "checkbox" ? checked : value };
               syncFormWithParent(newForm);
               return newForm;
          });
     };

     const handleBillingTypeChange = (e) => {
          const billingType = e.target.id;
          setForm(prev => {
               const newForm = { ...prev, billingType };
               syncFormWithParent(newForm);
               return newForm;
          });
     };

     const handleAddressSelect = (e) => {
          const addressId = e.target.value;
          setSelectedAddressId(addressId);

          if (!addressId) return;

          const selected = savedAddresses.find(item => item._id === addressId);
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
               // if user requested, also save this address in the user's profile
               if (form.saveToAddressList) {
                    try {
                         const addrRes = await fetch(`${API_BASE_URL}/users/${user.id}/addresses`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                   label: form.billingType === 'company' ? 'Work' : 'Home',
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
                              alert(addrData?.message || 'Failed to save address to profile');
                         }
                    } catch (err) {
                         console.error('Address save error:', err);
                         alert('Failed to save address to profile');
                    }
               }

               // reset address fields
               setForm(prev => ({ ...prev, address: "", country: "", city: "", state: "", zip: "" }));
               if (onFormUpdate) onFormUpdate({ ...form, address: "", country: "", city: "", state: "", zip: "" });
          } catch (err) {
               console.error("Server error:", err);
               alert("Server error");
          }
     };

     return (
          <form onSubmit={handleSubmit} className=" bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0a0a2e] via-[#020617] to-[#05051a] text-white p-6 rounded-lg shadow-md">
               <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.6)]"></span>
                    Billing address
               </h2>
               <div className="flex gap-6 mb-4 ">
                    <RadioOption
                         id="individual"
                         name="billingType"
                         label="Individual"
                         checked={form.billingType === "individual"}
                         onChange={handleBillingTypeChange}
                    />
                    <RadioOption
                         id="company"
                         name="billingType"
                         label="Company"
                         checked={form.billingType === "company"}
                         onChange={handleBillingTypeChange}
                    />
               </div>

               {savedAddresses.length > 0 && (
                    <div className="mt-4 rounded-lg border border-cyan-500/20 bg-slate-950/50 p-4">
                         <label htmlFor="saved-address" className="block text-sm font-medium text-cyan-300 mb-2">Use a saved address</label>
                         <select
                              id="saved-address"
                              value={selectedAddressId}
                              onChange={handleAddressSelect}
                              className="w-full rounded-md border border-cyan-500/20 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none"
                         >
                              <option value="">Use a new address</option>
                              {savedAddresses.map((address) => (
                                   <option key={address._id} value={address._id}>
                                        {address.label || "Saved address"} — {address.address}, {address.city}
                                   </option>
                              ))}
                         </select>
                         <p className="mt-2 text-[11px] text-slate-400">Choose one of your saved profile addresses to speed up checkout.</p>
                    </div>
               )}

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-base  ">
                    <FormInput c id="name" label="Name*" placeholder="Enter your name" value={form.name} onChange={handleChange} />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

                    <FormInput id="phone" label="Phone*" placeholder="1234567890" value={form.phone} onChange={handleChange} />
                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}

                    <FormInput id="email" label="Email*" placeholder="user@xyz.com" value={form.email} onChange={handleChange} />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

                    <FormInput id="address" label="Address*" placeholder="Enter your address" value={form.address} onChange={handleChange} />
                    {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}

                    <FormInput id="country" label="Country*" placeholder="Enter your country" value={form.country} onChange={handleChange} />
                    {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}

                    <FormInput id="city" label="City*" placeholder="Enter your city" value={form.city} onChange={handleChange} />
                    {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}

                    <FormInput id="state" label="State*" placeholder="Enter your state" value={form.state} onChange={handleChange} />
                    {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}

                    <FormInput id="zip" label="ZIP*" placeholder="Enter ZIP code" value={form.zip} onChange={handleChange} />
                    {errors.zip && <p className="text-red-500 text-sm">{errors.zip}</p>}
               </div>

               <div className="flex items-center mt-4">
                    <input type="checkbox" id="saveToAddressList" checked={form.saveToAddressList} onChange={handleChange} className="h-4 w-4 accent-teal-600" />
                    <label htmlFor="saveToAddressList" className="ml-2 text-sm">Save to address profile</label>
               </div>

               <div className="mt-4 rounded border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-200">
                    Billing address is required before checkout can be completed.
               </div>

               <button type="submit" className="mt-6 w-full bg-cyan-600 text-white py-2 rounded-lg font-semibold hover:bg-cyan-700">
                    Save Billing Info
               </button>
          </form>
     );
};

export default BillingForm;
