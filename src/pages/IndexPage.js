import { useState, useCallback, useEffect } from "react";
import { PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import ResponsiveImageGallery from "../components/ResponsiveImageGallery";
import styles from "./IndexPage.module.css";

const IndexPage = () => {
  const [selections, setSelections] = useState(() => {
    const savedSelections = typeof window !== 'undefined' && localStorage.getItem('imageSelections');
    return savedSelections 
      ? JSON.parse(savedSelections, (key, value) => {
          if (key === 'liked' || key === 'disliked') return new Set(value);
          if (key === 'ratings') return value || {};
          return value;
        })
      : {
          liked: new Set(),
          disliked: new Set(),
          ratings: {},
          showSummary: false
        };
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const serializable = {
        ...selections,
        liked: Array.from(selections.liked),
        disliked: Array.from(selections.disliked),
        ratings: selections.ratings
      };
      localStorage.setItem('imageSelections', JSON.stringify(serializable));
    }
  }, [selections]);

  const handleSelection = useCallback((index, type) => {
    setSelections(prev => {
      const newSet = new Set(prev[type]);
      const oppositeType = type === 'liked' ? 'disliked' : 'liked';
      const oppositeSet = new Set(prev[oppositeType]);

      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
        oppositeSet.delete(index);
      }

      return {
        ...prev,
        [type]: newSet,
        [oppositeType]: oppositeSet
      };
    });
  }, []);

  const handleStarRating = useCallback((index, stars) => {
    setSelections(prev => {
      const currentRating = prev.ratings[index] || 0;
      const newRating = currentRating === stars ? 0 : stars;
      const newRatings = { ...prev.ratings, [index]: newRating };
      
      const newLiked = new Set(prev.liked);
      const newDisliked = new Set(prev.disliked);

      if (newRating === 0) {
        newLiked.delete(index);
        newDisliked.delete(index);
      } else {
        if (newRating === 1) {
          newDisliked.add(index);
          newLiked.delete(index);
        } else if (newRating === 5) {
          newLiked.add(index);
          newDisliked.delete(index);
        }
      }

      return {
        ...prev,
        ratings: newRatings,
        liked: newLiked,
        disliked: newDisliked
      };
    });
  }, []);

  const renderPhoto = useCallback(({ photo, layout, wrapperStyle }) => {
    const isLiked = selections.liked.has(layout.index);
    const isDisliked = selections.disliked.has(layout.index);
    const currentRating = (selections.ratings || {})[layout.index] || 0;

    return (
      <div style={{
        ...wrapperStyle,
        position: 'relative',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box',
      }}>
        <PhotoView src={photo.fullSize}>
          <img
            src={photo.src}
            alt={photo.alt || ""}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              cursor: 'pointer',
              opacity: isDisliked ? 0.5 : 1,
              border: `3px solid ${
                isLiked ? '#4CAF50' : 
                isDisliked ? '#F44336' : 
                'transparent'
              }`,
              filter: isDisliked ? 'grayscale(100%)' : 'none',
              transition: 'opacity 0.2s, filter 0.2s'
            }}
          />
        </PhotoView>
        <div style={{
          position: 'absolute',
          top: 5,
          right: 5,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          justifyContent: 'right',
          zIndex: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '4px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelection(layout.index, 'liked');
              }}
              style={{
                padding: '2px 8px',
                fontSize: 12,
                backgroundColor: isLiked ? '#4CAF50' : '#fff',
                border: `1px solid ${isLiked ? '#388E3C' : '#ddd'}`,
                borderRadius: 4,
              }}
            >
              {isLiked ? '❤️' : '👍'}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelection(layout.index, 'disliked');
              }}
              style={{
                padding: '2px 8px',
                fontSize: 12,
                backgroundColor: isDisliked ? '#F44336' : '#fff',
                border: `1px solid ${isDisliked ? '#D32F2F' : '#ddd'}`,
                borderRadius: 4,
              }}
            >
              {isDisliked ? '💔' : '👎'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStarRating(layout.index, star);
                }}
                style={{
                  padding: '0 2px',
                  fontSize: '16px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: star <= currentRating ? '#FFD700' : '#ddd',
                }}
              >
                {star <= currentRating ? '★' : '☆'}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }, [selections, handleSelection, handleStarRating]);

  return (
    <div>
      <div className={styles.indexPage}>
        <section id="imageGallery">
          <div className={styles.content} style={{ margin: "18px 0px", minHeight: "350px" }}>
            <ResponsiveImageGallery
              photosNumber={112}
              renderPhoto={renderPhoto}
            />
          </div>
        </section>
      </div>

      <div style={{
        position: 'fixed',
        bottom: 20,
        right: 18,
        background: 'rgba(255,255,255,0.95)',
        padding: selections.showSummary ? 16 : 8,
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(4px)',
        maxWidth: '90vw',
        transition: 'transform 0.2s',
        filter: `drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))`,
        transform: `scale(${selections.showSummary ? 1 : 0.95})`,
        zIndex: 2
      }}>
        <button 
          className={styles.summaryButton}
          onClick={() => setSelections(prev => ({
            ...prev,
            showSummary: !prev.showSummary
          }))}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: 4,
            transition: 'background-color 0.2s',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          {selections.showSummary ? 'Hide Summary' : 'Show Summary'}
        </button>
        
        {selections.showSummary && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', gap: 24 }}>
              <div>
                <h3 style={{ color: '#4CAF50', margin: '8px 0' }}>
                  Liked ({selections.liked.size})
                </h3>
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {Array.from(selections.liked).map(n => n + 1).sort((a, b) => a - b).join(', ')}
                </div>
              </div>
              <div>
                <h3 style={{ color: '#F44336', margin: '8px 0' }}>
                  Disliked ({selections.disliked.size})
                </h3>
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {Array.from(selections.disliked).map(n => n + 1).sort((a, b) => a - b).join(', ')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndexPage;