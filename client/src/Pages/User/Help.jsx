import React, { useState } from "react";
import axios from "axios";

const Help = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const steps = [
    "Cleanse with organic extracts to refresh your skin daily.",
    "Nourish with antioxidant-rich oils for hydration and repair.",
    "Protect with natural SPF to maintain a youthful glow."
  ];

  const skinTypes = [
    { img: "https://images.pexels.com/photos/3762466/pexels-photo-3762466.jpeg", label: "Oily" },
    { img: "https://images.pexels.com/photos/5938539/pexels-photo-5938539.jpeg", label: "Dry" },
    { img: "https://images.pexels.com/photos/3762465/pexels-photo-3762465.jpeg", label: "Sensitive" },
    { img: "https://images.pexels.com/photos/5938639/pexels-photo-5938639.jpeg", label: "Combination" }
  ];

  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    skinType: "",
    skinConcern: ""
  });
  const [loading, setLoading] = useState(false);

  // input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // reset form
  const resetForm = () => {
    setFormData({ name: "", phoneNumber: "", skinType: "", skinConcern: "" });
  };

  // validation
  const validate = () => {
    const { name, phoneNumber, skinType, skinConcern } = formData;
    if (!name || !phoneNumber || !skinType || !skinConcern) return "Please fill in all fields";
    if (!/^[+]?[0-9]{6,15}$/.test(phoneNumber)) return "Invalid phone number";
    return null;
  };

  // submit request
  const submitRequest = async (type) => {
    const err = validate();
    if (err) {
      alert(err);
      return;
    }
    setLoading(true);
    try {
      const payload = { type, ...formData };
      console.log("Submitting payload:", { type, ...formData });

      const res = await axios.post(`${API_URL}/api/contact-requests`, payload, { Withcredntials: true });
      alert(res.data.message || "Request submitted");
      resetForm();
      setShowWhatsappModal(false);
      setShowCallModal(false);
    } catch (error) {
      alert(error.response?.data?.error || error.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-poppins">
      {/* Hero */}
      <header className="bg-gray-100 sm:min-h-screen flex flex-col justify-center items-center text-center px-4">
        <h1 className="font-playfair text-5xl font-semibold text-gray-800">Organic SkinCare</h1>
        <h2 className="text-2xl mt-4 text-gray-600">Glow Naturally Every Day</h2>
        <p className="mt-2 text-gray-500">Pure • Organic • Dermatologist Approved</p>
        <p className="mt-2 text-green-600">Trusted by 10,000+ Customers</p>
        <a href="/" className="mt-4 px-6 py-3 rounded-full bg-green-600 text-white font-medium hover:bg-green-700 transition">Explore Products</a>
        <img src="https://images.pexels.com/photos/3764013/pexels-photo-3764013.jpeg" alt="Skin Care Model" className="mt-6 rounded shadow-lg max-w-full h-auto transform transition duration-300 hover:scale-105" />
      </header>

      {/* Steps */}
      <section className="py-16 text-center">
        <h2 className="text-3xl text-green-800 font-semibold">3 Simple Steps to Radiant Skin</h2>
        <div className="mt-10 flex flex-wrap justify-center gap-8">
          {steps.map((text, i) => (
            <div key={i} className="w-64 transform transition duration-300 hover:-translate-y-2 hover:shadow-lg">
              <div className="w-16 h-16 bg-green-800 text-white text-xl rounded-full flex items-center justify-center mx-auto">{i + 1}</div>
              <p className="mt-3 text-gray-700">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Skin Types */}
      <section id="products" className="bg-green-800 text-white py-16 text-center">
        <h2 className="text-3xl font-semibold">Find the Perfect Product for Your Skin Type</h2>
        <p className="mt-3 text-white/80">Whether your skin is oily, dry, sensitive, or combination — we have a natural solution.</p>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center px-4">
          {skinTypes.map((s, idx) => (
            <div key={idx} className="text-center transform transition duration-300 hover:-translate-y-2 hover:shadow-lg cursor-pointer">
              <img src={s.img} alt={s.label} className="rounded shadow-lg w-full h-48 object-cover transform transition duration-300 hover:scale-105" />
              <p className="mt-2">{s.label} Skin</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Boxes */}
      <section className="py-16 flex flex-wrap justify-center gap-8">
        <div className="bg-white border-2 border-green-800 rounded-xl p-8 w-64 text-center cursor-pointer transform transition duration-300 hover:-translate-y-2 hover:shadow-lg" onClick={() => setShowWhatsappModal(true)}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-14 mx-auto mb-4 transform transition duration-300 hover:scale-110" />
          <h5 className="font-semibold">Chat on WhatsApp</h5>
        </div>

        <div className="bg-white border-2 border-green-800 rounded-xl p-8 w-64 text-center cursor-pointer transform transition duration-300 hover:-translate-y-2 hover:shadow-lg" onClick={() => setShowCallModal(true)}>
          <img src="https://cdn-icons-png.flaticon.com/512/483/483947.png" alt="Call" className="w-12 mx-auto mb-4 transform transition duration-300 hover:scale-110" />
          <h5 className="font-semibold">Request a Call</h5>
        </div>
      </section>

      {/* WhatsApp Modal */}
      {showWhatsappModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowWhatsappModal(false)}>
          <div className="bg-white rounded-lg w-11/12 md:w-96 p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-500 text-xl" onClick={() => setShowWhatsappModal(false)}>×</button>
            <h5 className="text-lg font-semibold mb-4">Chat with Us (WhatsApp)</h5>
            <div className="space-y-3">
              <input name="name" placeholder="Your Name" className="w-full border rounded px-3 py-2" value={formData.name} onChange={handleInputChange} />
              <input name="phoneNumber" placeholder="Your Phone Number" className="w-full border rounded px-3 py-2" value={formData.phoneNumber} onChange={handleInputChange} />
              <select name="skinType" className="w-full border rounded px-3 py-2" value={formData.skinType} onChange={handleInputChange}>
                <option value="">Select Skin Type</option>
                <option value="Oily">Oily</option>
                <option value="Dry">Dry</option>
                <option value="Sensitive">Sensitive</option>
                <option value="Combination">Combination</option>
              </select>
              <textarea name="skinConcern" placeholder="Describe your skin concern" rows={3} className="w-full border rounded px-3 py-2" value={formData.skinConcern} onChange={handleInputChange} />
              {/* ✅ whatsapp type */}
              <button onClick={() => submitRequest("whatsapp")} disabled={loading} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
                {loading ? "Submitting..." : "Submit via WhatsApp"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call Modal */}
      {showCallModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCallModal(false)}>
          <div className="bg-white rounded-lg w-11/12 md:w-96 p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-500 text-xl" onClick={() => setShowCallModal(false)}>×</button>
            <h5 className="text-lg font-semibold mb-4">Request a Call</h5>
            <div className="space-y-3">
              <input name="name" placeholder="Your Name" className="w-full border rounded px-3 py-2" value={formData.name} onChange={handleInputChange} />
              <input name="phoneNumber" placeholder="Your Phone Number" className="w-full border rounded px-3 py-2" value={formData.phoneNumber} onChange={handleInputChange} />
              <select name="skinType" className="w-full border rounded px-3 py-2" value={formData.skinType} onChange={handleInputChange}>
                <option value="">Select Skin Type</option>
                <option value="Oily">Oily</option>
                <option value="Dry">Dry</option>
                <option value="Sensitive">Sensitive</option>
                <option value="Combination">Combination</option>
              </select>
              <textarea name="skinConcern" placeholder="Describe your skin concern" rows={3} className="w-full border rounded px-3 py-2" value={formData.skinConcern} onChange={handleInputChange} />
              {/* ✅ mobile type */}
              <button onClick={() => submitRequest("mobile")} disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                {loading ? "Submitting..." : "Submit via Mobile"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 text-center">
        <h4 className="text-white text-xl mb-2">Contact Us</h4>
        <p>Email: Maruthamstoresinternational@gmail.com</p>
        <p>Phone: +91 90036 89821</p>
        <p>Address: 202, Bhavani Main Road, Vaikalamedu, Chithode, Erode - 638102, Tamil Nadu</p>
        <p>Working Hours: Mon - Sat (10 AM – 7 PM)</p>
        <a href="https://wa.me/919003689821" target="_blank" rel="noopener noreferrer" className="text-green-600 font-semibold">Chat on WhatsApp</a>
      </footer>
    </div>
  );
};

export default Help;
