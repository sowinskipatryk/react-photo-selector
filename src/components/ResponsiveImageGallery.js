import PhotoAlbum from './PhotoAlbum';
import React, { useState, useEffect } from "react";
import styles from "./ResponsiveImageGallery.module.css";
import { PhotoProvider } from "react-photo-view";

let renderCount = 0;

const ResponsiveImageGallery = ({ photosNumber, renderPhoto, hideLiked, hideDisliked, selections }) => {
  const [photos, setPhotos] = useState([]);
  const [loadedPhotosNumber, setLoadedPhotosNumber] = useState(0);
  const [isGalleryRendering, setIsGalleryRendering] = useState(false);
  const [isLoadingError, setIsLoadingError] = useState(false);

  useEffect(() => {
    const fetchPhotos = async () => {
      const loadedPhotos = [];

      for (let i = 1; i <= photosNumber; i++) {
        try {
          const photo = {
            src: require(`../assets/images/fullsize/${i}.jpg`),
            height: 0,
            width: 0,
            fullSize: require(`../assets/images/fullsize/${i}.jpg`),
            id: i - 1,
          };

          const dimensions = await getImageDimensions(photo.src);
          photo.height = dimensions.height;
          photo.width = dimensions.width;

          loadedPhotos.push(photo);
          setLoadedPhotosNumber(loadedPhotos.length);
        } catch (error) {
          setIsLoadingError(true);
        }
      }

      setPhotos(loadedPhotos);
    };

    fetchPhotos();
  }, [photosNumber]);

  const getImageDimensions = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.src = url;
    });
  };

  const filteredPhotos = photos.filter(photo => {
    const isLiked = selections.liked.has(photo.id);
    const isDisliked = selections.disliked.has(photo.id);

    if (hideLiked && hideDisliked) {
      return !isLiked && !isDisliked;
    } else if (hideLiked) {
      return !isLiked;
    } else if (hideDisliked) {
      return !isDisliked;
    }
    return true;
  });

  renderCount++;

  return (
    <div className={styles.imageGallery}>
      {!isGalleryRendering && <div className={styles.loadingContainer}><h2 className={styles.loadingText}>Ładowanie... {loadedPhotosNumber}/{photosNumber}</h2><i className={`fa fa-spinner ${styles.spinnerIcon}`}></i></div>}
      {isLoadingError && <div className={styles.loadingContainer}><h2 className={styles.loadingText}>{'Błąd ładowania zdjęć :('}</h2></div>}
      <PhotoProvider>
        <PhotoAlbum photos={filteredPhotos} layout="rows" renderPhoto={renderPhoto} isGalleryRendering={isGalleryRendering} setIsGalleryRendering={setIsGalleryRendering} />
      </PhotoProvider>
    </div>
  );
};

export default ResponsiveImageGallery;
