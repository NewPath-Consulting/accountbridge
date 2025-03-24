import { useEffect, useState } from "react";
import './BlurryOverlay.css'

interface BlurryOverlayProps {
  isLoading: boolean;
  message: string,
  icon: string,
  subtitle: string
}

export const BlurryOverlay: React.FC<BlurryOverlayProps> = ({ isLoading, message, icon, subtitle }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShow(true);
    } else if (show) {
      const timer = setTimeout(() => setShow(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, show]);

  if (!show) return null;

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center blur-container" style={{ backdropFilter: "blur(8px)", zIndex: 1050 }}>
      <div className="text-black text-center d-flex flex-column align-items-center justify-content-center">
        {isLoading ? <div className="custom-spinner mb-5">
          <div className={"inner-icon"}>
            <i className={`bi bi-${icon}`} style={{color: 'white'}}></i>
          </div>
        </div> : message === "Error Occurred!" ?
          <i className={'bi bi-exclamation-circle-fill fs-1'} style={{color: 'red', fontSize: '30px'}}></i> :
      <i className={'bi bi-check-circle-fill fs-1'} style={{color: '#71DD93FF'}}></i>}
        <p className="fw-medium fs-4 mb-1" style={{fontFamily: 'sans-serif'}}>{message}</p>
        {isLoading && <h6 className="fw-light" style={{fontFamily: 'sans-serif'}}>{subtitle}</h6>}
      </div>
    </div>
  );
};
