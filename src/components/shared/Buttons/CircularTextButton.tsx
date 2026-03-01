const CircularTextButton = () => {
  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      {/* Rotating Circular Text */}
      <div className="animate-spin-slow absolute">
        <svg width="75" height="75" viewBox="0 0 100 100">
          <defs>
            <path
              id="circlePath"
              d="M 50, 50
                 m -30, 0
                 a 30,30 0 1,1 60,0
                 a 30,30 0 1,1 -60,0"
            />
          </defs>
          <text fill="white" fontSize="6" fontFamily="Arial" letterSpacing="1">
            <textPath href="#circlePath" startOffset="0%">
              VIEW LESSON ONLINE • VIEW LESSON ONLINE •
            </textPath>
          </text>
        </svg>
      </div>

      {/* Play Button */}
      <button className="flex h-6 w-6 items-center justify-center rounded-full sm:h-8 sm:w-8">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>
    </div>
  );
};

export default CircularTextButton;
