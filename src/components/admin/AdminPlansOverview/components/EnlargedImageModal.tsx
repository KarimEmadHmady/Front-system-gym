import React from 'react';

interface EnlargedImageModalProps {
  enlargedImage: { src: string; alt: string } | null;
  onClose: () => void;
}

const EnlargedImageModal: React.FC<EnlargedImageModalProps> = ({
  enlargedImage,
  onClose
}) => {
  if (!enlargedImage) return null;

  return (
    <div 
      className="fixed inset-0 z-[999] bg-black/70 flex items-center justify-center" 
      onClick={onClose}
    >
      <div className="relative" onClick={e => e.stopPropagation()}>
        <button 
          className="absolute -top-4 -right-4 bg-white text-black rounded-full shadow p-2 text-xl" 
          onClick={onClose}
        >
          ×
        </button>
        <img 
          src={enlargedImage.src} 
          alt={enlargedImage.alt} 
          className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-xl border-4 border-white" 
        />
        {enlargedImage.alt && (
          <div className="text-center mt-3 text-lg text-white font-semibold">
            {enlargedImage.alt}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnlargedImageModal;
