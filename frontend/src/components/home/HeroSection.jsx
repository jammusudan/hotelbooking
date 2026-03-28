import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const HeroSection = () => {
  const { user } = useContext(AuthContext);
  return (
    <section className="relative min-h-screen bg-[#EFEBE4] flex flex-col items-center justify-center pt-28 pb-16 overflow-hidden">
      
      {/* Decorative airplanes and dotted paths (Background vectors) */}
      <div className="absolute top-1/4 left-5 md:left-20 opacity-40">
        <svg width="200" height="150" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20,130 Q80,80 180,20" stroke="white" strokeWidth="2.5" strokeDasharray="8 8" fill="transparent"/>
          <svg x="160" y="0" width="35" height="35" viewBox="0 0 24 24" fill="white" className="transform rotate-[25deg]">
             <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
          </svg>
        </svg>
      </div>
      
      <div className="absolute bottom-1/4 right-5 md:right-20 opacity-40">
        <svg width="200" height="150" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M180,130 Q120,80 20,20" stroke="white" strokeWidth="2.5" strokeDasharray="8 8" fill="transparent"/>
          <svg x="0" y="0" width="35" height="35" viewBox="0 0 24 24" fill="white" className="transform -rotate-[105deg]">
             <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
          </svg>
        </svg>
      </div>

      {/* Image Collage */}
      <div className="relative w-full max-w-5xl h-[300px] sm:h-[350px] md:h-[450px] mb-8 md:mb-12 flex justify-center items-center z-10 px-4 mt-8 md:mt-0">
        
        {/* Left Image (Hammock) */}
        <div className="absolute left-0 sm:left-4 md:left-24 top-12 sm:top-16 md:top-24 transform -rotate-[15deg] transition hover:scale-105 hover:z-30 duration-300 z-10">
          <div className="bg-[#EDF7BD] p-1.5 md:p-3 shadow-2xl rounded-sm">
            <img 
              src="/images/sunset.png" 
              alt="Sunset Hammock" 
              className="w-28 h-36 sm:w-36 sm:h-48 md:w-64 md:h-72 object-cover"
            />
          </div>
        </div>

        {/* Center Image (Breakfast) - overlapping */}
        <div className="absolute z-20 transform -translate-y-4 hover:scale-105 duration-300">
          <div className="bg-[#EDF7BD] p-1.5 md:p-4 shadow-2xl rounded-sm">
            <img 
              src="/images/breakfast.png" 
              alt="Breakfast on Bed" 
              className="w-36 h-44 sm:w-48 sm:h-56 md:w-80 md:h-96 object-cover"
            />
          </div>
        </div>

        {/* Right Image (Room) */}
        <div className="absolute right-0 sm:right-4 md:right-24 top-16 sm:top-20 md:top-24 transform rotate-[10deg] transition hover:scale-105 hover:z-30 duration-300 z-10">
          <div className="bg-[#EDF7BD] p-1.5 md:p-3 shadow-2xl rounded-sm">
            <img 
              src="/images/room.png" 
              alt="Luxury Room" 
              className="w-28 h-36 sm:w-36 sm:h-48 md:w-64 md:h-72 object-cover"
            />
          </div>
        </div>
      </div>

      {/* Typography and Call to Action */}
      <div className="z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center mt-4 md:mt-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[64px] font-serif font-black text-[#003049] tracking-tight leading-[1.1] mb-8 drop-shadow-sm uppercase">
          WELCOME TO A NEW<br className="hidden sm:block" /> LEVEL OF LUXURY
        </h1>
        
        <Link 
          to={user ? "/hotels" : "/register"} 
          className="group relative inline-flex items-center justify-center px-10 py-4 font-bold text-white transition-all duration-300 bg-[#003049] rounded-full hover:bg-[#003049]/90 hover:scale-105 active:scale-95 shadow-xl shadow-[#003049]/20"
        >
          <span className="relative uppercase tracking-widest text-sm md:text-base">Book Your Stay</span>
          <div className="absolute inset-0 rounded-full border-2 border-white/10 group-hover:border-white/20 transition-colors" />
        </Link>
        
        <p className="text-[#003049]/60 font-black tracking-[0.3em] uppercase text-[10px] md:text-xs mt-8">
          www.navan.com
        </p>
      </div>

    </section>
  );
};

export default HeroSection;
