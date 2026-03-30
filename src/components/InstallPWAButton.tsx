'use client';

import React, { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform?: string }>;
}

// تعريف iOS Safari standalone
declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isInStandaloneMode() {
  return window.navigator.standalone === true;
}

const InstallPWAButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [closed, setClosed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  
  useEffect(() => {
    const iOS = isIOS();
    const standalone = isInStandaloneMode();

    setIsIOSDevice(iOS);

    if (iOS && !standalone) {
      // iOS Safari: التطبيق مش مثبّت
      setShowInstallButton(true);
      return;
    }

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    const onAppInstalled = () => setIsInstalled(true);

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOSDevice) {
      setShowModal(true); // عرض المودال بدل alert
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowInstallButton(false);
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  if (!showInstallButton || closed || isInstalled) return null;

  return (
    <>
      <div
        className="fixed z-50 flex tems-end justify-center w-full px-2 pb-6 pointer-events-none sm:justify-end" dir="ltr"
        style={{ bottom: -11, right: -7 }}
      >
        <div
          className="bg-white shadow-2xl rounded-xl border border-gray-200 w-[90%] sm:max-w-xs max-w-full pointer-events-auto relative flex flex-row items-stretch p-2 gap-1 sm:mx-6 w-72"
        >
          <div className="flex items-center gap-2 w-[100%]  justify-center">
            <span className="text-xl">📲</span>
            <span className="text-sm  font-bold text-gray-800">Install App </span>
          </div>
          <div className="flex w-full gap-2 ">
            <button
              onClick={handleInstallClick}
              className="flex-1 px-1 py-2 rounded-lg bg-[#777] hover:bg-[#000] text-white font-bold text-xs transition-colors duration-200 shadow cursor-pointer"
              style={{ border: 'none' }}
            >
             Install
            </button>
            <button
              onClick={() => setClosed(true)}
              className="flex-1 px-1 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors duration-200 shadow"
              style={{ border: 'none' }}
            >
              Close
            </button>
          </div>
          <button
            type="button"
            aria-label="إغلاق"
            className="absolute top-0 left-[-20px] w-11 h-12 rounded-full bg-white hover:bg-red-200 text-gray-600 hover:text-red-600 flex items-center justify-center text-2xl  cursor-pointer focus:outline-none"
            onClick={() => setClosed(true)}
            style={{ border: 'none' }}
          >
            &times;
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-end justify-end z-50 px-2 pb-6 sm:justify-center sm:items-center">
          <div
            className="bg-white shadow-2xl rounded-xl border border-gray-200 w-full sm:max-w-xs max-w-full pointer-events-auto relative flex flex-col items-stretch p-4 gap-2 w-72"
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-1 left-2 w-7 h-7 rounded-full bg-gray-100 hover:bg-red-200 text-gray-600 hover:text-red-600 flex items-center justify-center text-2xl shadow cursor-pointer focus:outline-none"
              aria-label="إغلاق"
              style={{ border: 'none' }}
            >
              &times;
            </button>
            <div className="flex items-center gap-2 mb-1 mt-1 justify-right">
              <span className="text-2xl">📲</span>
              <span className="text-lg font-bold text-gray-800">ثبّت التطبيق</span>
            </div>
            <div className="w-full text-center mb-1">
            <span className="text-[11px] text-gray-500 font-normal">
              لتثبيت التطبيق على جهاز الآيفون اضغط مشاركة ثم اختر &quot;إضافة إلى الشاشة الرئيسية&quot; أو "Add to Home Screen" من القائمة.
            </span>
            </div>
            <img
              src="/pwa_ios.png"
              alt="شرح تثبيت التطبيق على iOS"
              className="w-full rounded shadow mb-2"
            />
            <div className="flex w-full gap-2 mt-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-3 py-2 rounded-lg bg-[#222] hover:bg-[#000] text-white font-bold text-xs transition-colors duration-200 shadow"
                style={{ border: 'none' }}
              >
                فهمت
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors duration-200 shadow"
                style={{ border: 'none' }}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
  
};


export default InstallPWAButton;
