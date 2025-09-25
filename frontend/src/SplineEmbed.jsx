import React, { useEffect } from 'react';
import Spline from '@splinetool/react-spline';
import './Spline.css'; // Custom CSS file

const SplineEmbed = () => {
  useEffect(() => {
    const hideWatermark = () => {
      const watermark = document.querySelector('.spline-watermark-class'); // Replace with the actual class or ID
      if (watermark) {
        watermark.style.display = 'none';
      }
    };
    hideWatermark();
  }, []);

  return (
    <div className="spline-container">
      <Spline scene="https://prod.spline.design/7zK-qnBHGPGDpAlP/scene.splinecode" />
    </div>
  );
};

export default SplineEmbed;
