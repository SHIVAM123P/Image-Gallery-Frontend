import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';


function ImageDetailsModal({ selectedImage, onClose }) {
  // Function to format the date in a readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Event handler to close the modal
  const closeModal = (e) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div className="modal-container" onClick={closeModal}>
      <div className="modal-background"></div>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <img src={selectedImage.imageUrl} alt={`Image Details`} className="modal-img" />
        <div className="image-details">
          <h2>Image Details</h2>
          
          <p>Liked: {selectedImage.liked?"Yes":"No"}</p>
        </div>
        <button className="btn-close" onClick={closeModal}>
          &times;
        </button>
      </div>
    </div>
  );
}

export default ImageDetailsModal;

