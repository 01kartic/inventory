const Loaders = {
    default: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g stroke="currentColor">
                <circle cx="12" cy="12" r="9.5" fill="none" strokeLinecap="round" strokeWidth="3">
                    <animate attributeName="stroke-dasharray" calcMode="spline" dur="1.5s" keySplines="0.42,0,0.58,1;0.42,0,0.58,1;0.42,0,0.58,1" keyTimes="0;0.475;0.95;1" repeatCount="indefinite" values="0 150;42 150;42 150;42 150" />
                    <animate attributeName="stroke-dashoffset" calcMode="spline" dur="1.5s" keySplines="0.42,0,0.58,1;0.42,0,0.58,1;0.42,0,0.58,1" keyTimes="0;0.475;0.95;1" repeatCount="indefinite" values="0;-16;-59;-59" />
                </circle>
                <animateTransform attributeName="transform" dur="2s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12" />
            </g>
        </svg>
    ),
    color: (
        <svg className="animate-spin w-10 h-10 text-foreground/20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" fill="none">
          <path d="M54 30C54 33.1517 53.3792 36.2726 52.1731 39.1844C50.967 42.0962 49.1992 44.742 46.9706 46.9706C44.742 49.1992 42.0962 50.967 39.1844 52.1731C36.2726 53.3792 33.1517 54 30 54C26.8483 54 23.7274 53.3792 20.8156 52.1731C17.9038 50.967 15.258 49.1992 13.0294 46.9706C10.8008 44.742 9.033 42.0962 7.82689 39.1844C6.62078 36.2726 6 33.1517 6 30C6 26.8483 6.62078 23.7274 7.82689 20.8156C9.03301 17.9038 10.8008 15.258 13.0294 13.0294C15.258 10.8008 17.9038 9.033 20.8156 7.82689C23.7274 6.62078 26.8483 6 30 6C33.1517 6 36.2726 6.62078 39.1844 7.82689C42.0962 9.03301 44.742 10.8008 46.9706 13.0294C49.1992 15.258 50.967 17.9038 52.1731 20.8156C53.3792 23.7274 54 26.8483 54 30L54 30Z" stroke="currentColor" strokeWidth="6" />
          <path d="M54 30C54 35.0683 52.3955 40.0065 49.4164 44.1068C46.4373 48.2072 42.2366 51.2592 37.4164 52.8254C32.5962 54.3915 27.4038 54.3915 22.5836 52.8254C17.7633 51.2592 13.5627 48.2072 10.5836 44.1068" stroke="url(#gradient)" strokeWidth="6" strokeLinecap="round" />
          <defs>
            <linearGradient id="gradient" x1="30" y1="6" x2="30" y2="54" gradientUnits="userSpaceOnUse">
              <stop offset="0.8" stopColor="#ef4444">
                <animate attributeName="stop-color" values="#ef4444; #22c55e; #0ea5e9; #ef4444" dur="1s" repeatCount="indefinite" />
              </stop>
              <stop offset="1" stopColor="hsl(var(--primary) / 0.8)" />
            </linearGradient>
          </defs>
        </svg>
    )
}

export default function Loading({ type = 'default' }) {
    return (
        <div className={type == "color" ? "w-full h-64 flex justify-center items-end" : ""}>
            {Loaders[type]}
        </div>
    )
}