import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import './Styles.css';
import { FaHeart, FaDownload, FaFacebook, FaTwitter } from 'react-icons/fa';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import ImageDetailsModal from './ImageDetailsModal'; // Import the ImageDetailsModal component
import { TwitterShareButton, FacebookShareButton } from 'react-share'; // Import share buttons

function App() {
  const [images, setImages] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [visibleCards, setVisibleCards] = useState(9); // Number of cards to show at a time
  const [likedImages, setLikedImages] = useState([]);
  const [showLikedGallery, setShowLikedGallery] = useState([]);
  const [selectedLikedImage, setSelectedLikedImage] = useState(null);
  const [showAddToAlbumModal, setShowAddToAlbumModal] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  useEffect(() => {
    fetchGalleryImages();
  }, [images]);

  useEffect(() => {
    fetchLikedImages();
  }, [images]);

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
        setImages([...images, `http://localhost:8080${imageUrl}`]); // Include the base URL
      }

      else {
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
          imageUrl: imageObj.imageUrl,
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
          // If the liked image is in the likedImages state and is unliked, remove it from the state
          if (!liked) {
            setLikedImages((prevLikedImages) =>
              prevLikedImages.filter((image) => image._id !== validImageId)
            );
          } else {
            // If the liked image is in the likedImages state and is liked, update the liked property
            const updatedLikedImages = [...likedImages];
            updatedLikedImages[likedImageIndex].liked = liked;
            setLikedImages(updatedLikedImages);
          }
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
          imageUrl: imageObj.imageUrl,
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

  const handleDownload = async (imageUrl, e) => {
    e.stopPropagation(); // Prevent the image click event from triggering

    try {
      // Fetch the image as a Blob
      const response = await fetch(imageUrl);
      const imageBlob = await response.blob();

      // Create a temporary anchor element to initiate the download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(imageBlob);
      link.download = imageUrl.split("/").pop(); // Extract the filename from the URL for the download
      link.click();

      // Clean up the temporary object URL after the download
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error while fetching image for download:', error);
    }
  };

  // // Function to handle adding an image to an album
  // const handleAddToAlbum = (image) => {
  //   // Show the modal or dropdown to select an album or create a new one
  //   // For simplicity, let's assume the user selects the album name as 'albumName'

  //   const albumName = prompt('Enter the album name:');
  //   if (!albumName) return; // If no name is provided, do nothing

  //   // Check if the album already exists
  //   const existingAlbum = albums.find((album) => album.name === albumName);

  //   if (existingAlbum) {
  //     // If the album already exists, add the image to it
  //     const updatedAlbums = albums.map((album) =>
  //       album.name === albumName ? { ...album, images: [...album.images, image.imageUrl] } : album
  //     );
  //     setAlbums(updatedAlbums);
  //   } else {
  //     // If the album does not exist, create a new one and add the image to it
  //     const newAlbum = { name: albumName, images: [image.imageUrl] };
  //     setAlbums([...albums, newAlbum]);
  //   }
  // };


  // Event handler for opening the image details modal
  const handleImageClick = (image) => {
    // Find the index of the clicked image in the images state
    const index = images.findIndex((img) => img._id === image._id);

    // Check if the index is valid (image exists in the images state)
    if (index !== -1) {
      // Set the selectedImage state with the clicked image
      setSelectedImage(images[index]);
      // setShowAddToAlbumModal(true); // Show the modal when the "Add to Album" button is clicked

    }
  };
  // const handleImageClick = (image) => {
  //   setShowAddToAlbumModal(true); // Show the modal when the "Add to Album" button is clicked
  // };

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
  };
  
  const handleLikedImageClick = (image) => {
    setSelectedLikedImage(image);
  };

  // Inside your App function:

  const handleAddToExistingAlbum = () => {
    // Implement logic to fetch existing albums from the backend or local storage
    // and display them in a dropdown or list for the user to select

    // For simplicity, let's assume you have a state variable to store existing albums
    const existingAlbums = [
      { id: 1, name: 'Album 1' },
      { id: 2, name: 'Album 2' },
      // Add more albums as needed
    ];

    // For this example, let's assume the user selects an album with ID 1
    const selectedAlbumId = 1;

    // Show the list of existing albums in a dropdown or a list
    // and allow the user to select an album

    // Here, we'll use a simple prompt to simulate the selection process.
    const selectedAlbumName = prompt('Select an existing album:', existingAlbums.map(album => album.name));

    // Find the selected album from the existingAlbums array based on the user's choice
    const selectedAlbum = existingAlbums.find(album => album.name === selectedAlbumName);

    if (selectedAlbum) {
      // Call the backend API with the selected album ID and the image data
      handleAddToAlbumBackendCall(selectedAlbum.id, selectedImage);
    } else {
      // If the user cancels the prompt or selects an invalid album, do nothing.
      console.log("No album selected or invalid album choice.");
    }
  };


  const handleCreateNewAlbum = (image) => {
    // Show an input field or a prompt to get the new album name from the user

    // For this example, let's assume the user enters "New Album Name"
    const newAlbumName = "New Album Name";

    // Call the backend API with the new album name and the image ID
    handleAddToAlbumBackendCall(newAlbumName, image);
  };

  const handleAddToAlbumBackendCall = async (albumNameOrId, image) => {
    try {
      // Make a POST request to your backend API with the selected album name or ID and image ID
      const response = await axios.post(`http://localhost:8080/handleAddToAlbum/${image._id}`, {
        albumName: albumNameOrId,
      });

      if (response.data.success) {
        // Handle success: Image added to album
        console.log('Image added to album successfully!');
        // You can update the frontend state or perform any other actions as needed
      } else {
        // Handle failure: Failed to add image to album
        console.error('Failed to add image to album');
      }
    } catch (error) {
      console.error('Error adding image to album:', error);
    }

    // Close the modal after the API call is completed
    setShowAddToAlbumModal(false);
  };



  return (

    <div className="App">
      <div className="container">
        <h1 className="text-center my-4">Image Gallery</h1>
        {/* Use the custom button to trigger file input click event */}
        <button id='uploadButton' className="btn btn-primary mb-3" onClick={handleCustomButtonClick}>
          Upload Image
        </button>

        {/* Hide the original file input */}
        <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-3" ref={fileInputRef} style={{ display: 'none' }} />

        {/* <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-3" /> */}

        <button id='viewGallery' onClick={toggleGalleryView} className="btn btn-primary mb-3">
          {showGallery ? 'Hide Gallery' : 'View Gallery'}
        </button>

        {showGallery && (
          <div className="gallery row row-cols-7">
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
                  <div className="download-icon-container" onClick={(e) => handleDownload(image.imageUrl, e)}>
                    <FaDownload className="download-icon" />
                  </div>
                  <div className="share-icon-container">
                    {/* Customize the Twitter icon */}
                    <TwitterShareButton url={image.imageUrl} title="Check out this image!">
                      <FaTwitter className="share-icon twitter-icon" style={{ fill: "#1DA1F2" }} />
                    </TwitterShareButton>

                    {/* Customize the Facebook icon */}
                    <FacebookShareButton url={image.imageUrl}>
                      <FaFacebook className="share-icon facebook-icon" style={{ fill: "#3b5998" }} />
                    </FacebookShareButton>
                  </div>
                  {/* <div className="add-to-album-container" onClick={() => setSelectedImage(image)}>
                    <button className="btn btn-primary add-to-album-button">Add to Album</button>
                  </div> */}
                </div>
              </div>
            ))}
          </div>
        )}


        {showAddToAlbumModal && (
          <div className="modal-container">
            <div className="modal-content">
              <h2>Add to Album</h2>
              <button onClick={handleAddToExistingAlbum}>Add to Existing Album</button>
              <button onClick={() => handleCreateNewAlbum(selectedImage)}>Create New Album</button>
              <button onClick={() => setShowAddToAlbumModal(false)}>Cancel</button>
            </div>
          </div>
        )}


        {/* Render ImageDetailsModal when a selectedImage is available */}
        {selectedImage && (
          <ImageDetailsModal selectedImage={selectedImage} onClose={handleCloseModal} />
        )}

        {showGallery && images.length > visibleCards && (
          <button id='showMore' onClick={showMoreCards} className="btn btn-primary mt-3">
            Show More
          </button>
        )}

        <button id='viewLikedImages' onClick={handleLikedGalleryView} className="btn btn-primary mt-3">
          {showLikedGallery ? 'Back to Gallery' : 'View Liked Images'}
        </button>


        {showLikedGallery && (
          <div className="gallery row row-cols-7">
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
                  <div className="download-icon-container" onClick={(e) => handleDownload(image.imageUrl, e)}>
                    <FaDownload className="download-icon" />
                  </div>
                  <div className="share-icon-container">
                    {/* Customize the Twitter icon */}
                    <TwitterShareButton url={image.imageUrl} title="Check out this image!">
                      <FaTwitter className="share-icon twitter-icon" style={{ fill: "#1DA1F2" }} />
                    </TwitterShareButton>

                    {/* Customize the Facebook icon */}
                    <FacebookShareButton url={image.imageUrl}>
                      <FaFacebook className="share-icon facebook-icon" style={{ fill: "#3b5998" }} />
                    </FacebookShareButton>
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
