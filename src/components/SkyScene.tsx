const SkyScene = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* Sky gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #0b3d8c 0%, #1562b8 12%, #3a9dd4 30%, #7bc5e8 47%, #c2e4f5 58%, #f9d98a 68%, #f5a055 78%, #e8612e 88%, #c33c1a 100%)'
        }}
      />
      
      {/* Sun */}
      <div 
        className="absolute animate-sun-pulse"
        style={{
          bottom: '29%',
          right: '11%',
          width: 130,
          height: 130,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #fff9e6 0%, #fde68a 28%, #fbbf24 52%, transparent 70%)',
          filter: 'blur(2px)',
          boxShadow: '0 0 70px 36px rgba(251,191,36,0.4), 0 0 140px 70px rgba(245,158,50,0.2)',
        }}
      />
      
      {/* Light rays */}
      <div
        className="absolute"
        style={{
          bottom: '28%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '200%',
          height: 220,
          background: 'radial-gradient(ellipse at 50% 100%, rgba(255,215,90,0.16) 0%, transparent 65%)',
        }}
      />
      
      {/* Haze */}
      <div
        className="absolute"
        style={{
          bottom: '36%',
          left: 0,
          right: 0,
          height: 100,
          background: 'linear-gradient(to top, rgba(190,225,248,0.2) 0%, transparent 100%)',
          filter: 'blur(10px)',
        }}
      />
      
      {/* Mountains */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: '46%' }}>
        <svg viewBox="0 0 1440 400" preserveAspectRatio="xMidYMax slice" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,400 160,130 310,210 500,65 660,175 810,85 950,160 1090,55 1270,145 1440,95 1440,400" fill="rgba(150,185,215,0.3)" />
          <polygon points="0,400 110,220 270,310 440,175 590,270 750,145 890,240 1070,125 1210,215 1360,155 1440,190 1440,400" fill="rgba(90,120,160,0.52)" />
          <polygon points="0,400 140,305 290,375 470,255 615,345 775,225 945,315 1095,265 1255,325 1440,275 1440,400" fill="rgba(38,55,90,0.88)" />
          <rect x="0" y="370" width="1440" height="30" fill="rgba(25,38,68,0.95)" />
        </svg>
      </div>
    </div>
  );
};

export default SkyScene;
