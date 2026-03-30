// components/VideoTutorial.tsx
'use client';

import { useState } from 'react';
import { X, PlayCircle, Youtube } from 'lucide-react';

interface VideoTutorialProps {
  videoId: string; // YouTube video ID (من الرابط بعد v=)
  title?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  buttonText?: string;
}

export default function VideoTutorial({
  videoId,
  title = 'شرح الفيديو',
  position = 'top-right',
  buttonText = 'شرح'
}: VideoTutorialProps) {
  const [isOpen, setIsOpen] = useState(false);
 const [isVisible, setIsVisible] = useState(true);

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-15'
  };

    if (!isVisible) {
    return null;
  }


  return (
    <>
      {/* Floating Button */}
      <div className={`fixed ${positionClasses[position]} z-40 group flex items-start gap-1`}>
        <button
          onClick={() => setIsOpen(true)}
          className={` ${positionClasses[position]} z-40 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 group cursor-pointer`}
          aria-label={buttonText}
        >
          <Youtube className="w-4 h-4" />
          <span className="font-normal">{buttonText}</span>
          <PlayCircle className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
                {/* Close button for the floater */}
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 bg-black/20 hover:bg-black/40 rounded-full text-red-200 opacity-0 group-hover:opacity-100 transition-opacity top-[-15px] left-[-10px] absolute cursor-pointer z-20"
            aria-label="إخفاء"
          >
            <X className="w-3 h-3" />
          </button>
      </div>

      {/* Modal/Popup */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="sm:text-lg text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Youtube className="w-6 h-6 text-red-600" />
                {title}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Video Container */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}