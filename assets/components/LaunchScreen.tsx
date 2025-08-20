import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface LaunchScreenProps {
  imageSrc: string;
  imageAlt: string;
}

export function LaunchScreen({ imageSrc, imageAlt }: LaunchScreenProps) {
  const [opacity, setOpacity] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Reset opacity to 0 whenever component mounts (including on refresh)
    setOpacity(0);
    
    // Start animation after a small delay to ensure it's visible
    const timer = setTimeout(() => {
      setOpacity(1);
    }, 100);

    // After the animation completes, navigate to the login page
    const navigationTimer = setTimeout(() => {
      navigate("/login");
    }, 2000); // 2 seconds, adjust as needed

    return () => {
      clearTimeout(timer);
      clearTimeout(navigationTimer);
    };
  }, [navigate]);

  return (
    <section
      className="bg-black w-full h-screen flex flex-col items-center justify-center overflow-hidden"
      role="region"
      aria-label="Launch Screen"
    >
      <div className="max-w-xs px-[38px] flex flex-col items-center">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="aspect-[1] object-contain w-full rounded-[50%] transition-opacity duration-1000 ease-in"
          style={{ opacity }}
          loading="eager"
        />
        <p 
          className="text-lg text-center font-medium text-[#F2FCE2] mt-4 transition-opacity duration-1000 ease-in"
          style={{ opacity }}
        >
          Music Anytime… Anywhere
        </p>
      </div>
    </section>
  );
}

export default LaunchScreen;