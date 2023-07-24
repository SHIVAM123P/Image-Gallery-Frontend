import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { FaHeart } from 'react-icons/fa';
import axios from 'axios';
import { ObjectId } from 'mongoose';
import 'bootstrap/dist/css/bootstrap.min.css';
import ImageDetailsModal from './ImageDetailsModal'; // Import the ImageDetailsModal component

function App() {
  const [images, setImages] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [visibleCards, setVisibleCards] = useState(9); // Number of cards to show at a time
  const [likedImages, setLikedImages] = useState([]);
  const [showLikedGallery, setShowLikedGallery] = useState([]);
  const [selectedLikedImage, setSelectedLikedImage] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);
  useEffect(() => {
    // Fetch images from the server whenever the `images` state changes
    fetchGalleryImages();
    fetchLikedImages();
  }, [images, likedImages]); // Add `images` to the dependency array
  // Create a ref to access the file input element
  const fileInputRef = useRef(null);

  // Function to open the file input when the custom button is clicked
  const handleCustomButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleImageUpload = async (e) => {
    const formData = new FormData();
    formData.append('image', e.target.files[0]);

    try {
      const response = await fetch('http://localhost:8080/uploadImage', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const { imageUrl } = await response.json();
        setImages([...images, imageUrl]);
      } else {
        console.error('Image upload failed');
      }
    } catch (error) {
      console.error('Error while uploading image:', error);
    }
  };

  const fetchGalleryImages = async () => {
    try {
      const response = await fetch('http://localhost:8080/getImages');
      if (response.ok) {
        const { images } = await response.json();
        // Construct complete image data with imageURL and imageID
        const completeImageData = images.map((imageObj) => ({
          imageUrl: `http://localhost:8080${imageObj.imageUrl}`,
          _id: imageObj._id, // Add the "_id" property to the image data
          liked: imageObj.liked, // Add the "liked" property and initialize it to false
        }));
        setImages(completeImageData);
        console.log("see this", completeImageData)
      } else {
        console.error('Failed to fetch gallery images');
      }
    } catch (error) {
      console.error('Error while fetching gallery images:', error);
    }
  };



  // const toggleLike = async (index, _id) => {
  //   try {
  //     const response1 = await fetch('http://localhost:8080/getImages');
  //     if (response1.ok) {
  //       const { images } = await response1.json();
  //       // Construct complete image data with imageURL and imageID
  //       const completeImageData = images.map((imageObj) => ({
  //         imageUrl: `http://localhost:8080${imageObj.imageUrl}`,
  //         _id: imageObj._id, // Add the "_id" property to the image data
  //         liked: imageObj.liked, // Add the "liked" property and initialize it to false
  //       }));

  //       console.log("see this", completeImageData)


  //       const validImageId = completeImageData[index]._id;
  //       console.log("imageid", validImageId)


  //       // Use 'validImageId' in the PUT request URL
  //       const response = await axios.put(`http://localhost:8080/toggleLike/${validImageId}`);
  //       if (response.status === 200) {
  //         const { liked } = response.data;
  //         const updatedImages = [...images];
  //         updatedImages[index].liked = liked;
  //         setImages(updatedImages);

  //         // Update the likedImages state to store the liked images only
  //         const likedImagesUrls = updatedImages
  //           .filter((image) => image.liked)
  //           .map((image) => image.imageUrl);
  //         setLikedImages(likedImagesUrls);
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error toggling like:', error);
  //   }

  // };


  const toggleLike = async (index, _id) => {
    try {
      const validImageId = images[index]._id;
  
      // Use 'validImageId' in the PUT request URL
      const response = await axios.put(`http://localhost:8080/toggleLike/${validImageId}`);
      if (response.status === 200) {
        const { liked } = response.data;
        const updatedImages = [...images];
        updatedImages[index].liked = liked;
        setImages(updatedImages);
  
        // Check if the liked image is in the likedImages state
        const likedImageIndex = likedImages.findIndex((image) => image._id === validImageId);
        if (likedImageIndex !== -1) {
          // If the liked image is in the likedImages state, update the liked property
          const updatedLikedImages = [...likedImages];
          updatedLikedImages[likedImageIndex].liked = liked;
          setLikedImages(updatedLikedImages);
        } else if (liked) {
          // If the image is liked and not present in the likedImages state, add it
          setLikedImages((prevLikedImages) => [...prevLikedImages, images[index]]);
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };
  
  const fetchLikedImages = async () => {
    try {
      const response = await fetch('http://localhost:8080/getLikedImages');
      if (response.ok) {
        const { likedImages } = await response.json();
        const completeImageData = likedImages.map((imageObj) => ({
          imageUrl: `http://localhost:8080${imageObj.imageUrl}`,
          _id: imageObj._id, // Add the "_id" property to the image data
          liked: true, // Add the "liked" property and initialize it to false
        }));
        setLikedImages(completeImageData);
      } else {
        console.error('Failed to fetch liked images');
      }
    } catch (error) {
      console.error('Error while fetching liked images:', error);
    }
  };


  // Event handler for opening the image details modal
  const handleImageClick = (image) => {
    // Find the index of the clicked image in the images state
    const index = images.findIndex((img) => img._id === image._id);

    // Check if the index is valid (image exists in the images state)
    if (index !== -1) {
      // Set the selectedImage state with the clicked image
      setSelectedImage(images[index]);
    }
  };



  // Event handler for closing the image details modal
  const handleCloseModal = () => {
    setSelectedImage(null);
    setSelectedLikedImage(null);
  };
  const toggleGalleryView = () => {
    setShowGallery(!showGallery);
    // Reset the showLikedGallery state when switching to the main gallery
    setShowLikedGallery(false);
  };

  const showMoreCards = () => {
    setVisibleCards((prevVisibleCards) => prevVisibleCards + 9);
  };

  const handleLikedGalleryView = () => {
    setShowLikedGallery(!showLikedGallery);
    if (!showLikedGallery) {
      fetchLikedImages();
    }
  };
  const handleLikedImageClick = (image) => {
    setSelectedLikedImage(image);
  };




  return (

    <div className="App">
      <div className="container">
        <h1 className="text-center my-4">Image Gallery</h1>
        {/* Use the custom button to trigger file input click event */}
        <button className="btn btn-primary mb-3" onClick={handleCustomButtonClick}>
          Upload Image
        </button>

        {/* Hide the original file input */}
        <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-3" ref={fileInputRef} style={{ display: 'none' }} />

        {/* <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-3" /> */}

        <button id='viewGallery' onClick={toggleGalleryView} className="btn btn-primary mb-3">
          {showGallery ? 'Hide Gallery' : 'View Gallery'}
        </button>

        {showGallery && (
          <div className="gallery row row-cols-5">
            {images.slice(0, visibleCards).map((image, index) => (
              <div key={index} className="col mb-5">
                <div id='cards' className="card image-container img-thumbnail" onClick={() => handleImageClick(image)}>
                  <img src={image.imageUrl} alt={`Image ${index + 1}`} className="card-img-top" />
                  <div className="heart-icon-container" onClick={() => toggleLike(index, image._id)}>
                    {image.liked ? (
                      <FaHeart className="heart-icon heart-filled" />
                    ) : (
                      <FaHeart className="heart-icon heart-outline" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Render ImageDetailsModal when a selectedImage is available */}
        {selectedImage && (
          <ImageDetailsModal selectedImage={selectedImage} onClose={handleCloseModal} />
        )}

        {showGallery && images.length > visibleCards && (
          <button onClick={showMoreCards} className="btn btn-primary mt-3">
            Show More
          </button>
        )}

        <button id='viewLikedImages' onClick={handleLikedGalleryView} className="btn btn-primary mt-3">
          {showLikedGallery ? 'Back to Gallery' : 'View Liked Images'}
        </button>

        {showLikedGallery && (
          <div className="gallery row row-cols-5">
            {likedImages.map((image, index) => (
              <div key={index} className="col mb-5">
                <div
                  id="likedcards"
                  className="card image-container"
                  onClick={() => handleLikedImageClick(image)} // <-- Call the handleLikedImageClick function
                >
                  <img
                    src={image.imageUrl}
                    alt={`Liked Image ${index + 1}`}
                    className="card-img-top img-thumbnail"
                  />
                  <div className="heart-icon-container" onClick={() => toggleLike(index)}>
                    <FaHeart
                      className={image.liked ? "heart-icon heart-filled" : "heart-icon heart-outline"}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {selectedLikedImage && (
          <ImageDetailsModal selectedImage={selectedLikedImage} onClose={handleCloseModal} />
        )}

      </div>
    </div>
  );
}



export default App;
