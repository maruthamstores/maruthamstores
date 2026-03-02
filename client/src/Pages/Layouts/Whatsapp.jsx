import React from 'react';

const WhatsAppFloat = () => {
  return (
    <a
      href="https://wa.me/918870757606"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-15 right-5 z-500"
    >
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
        alt="WhatsApp"
        className="w-15 transform transition duration-300 hover:scale-110"
      />
    </a>
  );
};

export default WhatsAppFloat;