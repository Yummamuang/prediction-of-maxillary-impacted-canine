import { useEffect, useRef } from 'react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  title: string;
}

const ImageModal = ({ isOpen, onClose, imageSrc, title }: ImageModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside the modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent scrolling of background
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  // Close on ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-light bg-opacity-70 backdrop-blur-sm poppins">
      <div
        ref={modalRef}
        className="bg-white rounded-lg overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl"
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-medium">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 focus:outline-none cursor-pointer"
          >
            <i className="fa-solid fa-times fa-lg"></i>
          </button>
        </div>

        <div className="p-4 flex-grow overflow-auto flex items-center justify-center bg-gray-100">
          <img
            src={imageSrc}
            alt={title}
            className="max-w-full max-h-[70vh] object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/image-error.png";
            }}
          />
        </div>

        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="btn-secondary w-auto cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
