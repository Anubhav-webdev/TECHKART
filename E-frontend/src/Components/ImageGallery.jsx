import React, { useState } from 'react';
import Modal from 'react-modal';

// Set this once in your App.jsx, not needed in every component
// Modal.setAppElement('#root');

// The component now accepts props for the image sources
export default function ImageGallery({ thumbnailSrc, fullSizeSrc, altText = "Gallery image" }) {
     const [modalIsOpen, setModalIsOpen] = useState(false);

     // Define handler functions for clarity
     const openModal = () => setModalIsOpen(true);
     const closeModal = () => setModalIsOpen(false);

     return (
          <div className="p-4">
               <img
                    src={thumbnailSrc}
                    alt={altText}
                    onClick={openModal}
                    className="cursor-pointer w-48 h-48 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow"
               />

               <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    contentLabel="Image Modal"
                    // Use Tailwind classes for styling the modal
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-2xl outline-none"
                    overlayClassName="fixed inset-0 bg-black bg-opacity-75"
               >
                    <img src={fullSizeSrc} alt={altText} className="max-w-[80vw] max-h-[80vh] rounded" />
                    <button onClick={closeModal} className="absolute top-2 right-4 text-white text-3xl font-bold hover:text-gray-300">
                         &times;
                    </button>
               </Modal>
          </div>
     );
}