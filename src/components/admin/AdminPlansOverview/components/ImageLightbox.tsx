import React from 'react';

interface Props {
  image: { src: string; alt: string } | null;
  onClose: () => void;
}

const ImageLightbox: React.FC<Props> = ({ image, onClose }) => {
  if (!image?.src) return null;
  return (
    <div
      className="fixed inset-0 z-[999] bg-black/70 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          className="absolute -top-4 -right-4 bg-white text-black rounded-full shadow p-2 text-xl"
          onClick={onClose}
        >
          ✕
        </button>
        <img
          src={image.src}
          alt={image.alt}
          className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-xl border-4 border-white"
        />
        {image.alt && (
          <div className="text-center mt-3 text-lg text-white font-semibold">{image.alt}</div>
        )}
      </div>
    </div>
  );
};

export default ImageLightbox;