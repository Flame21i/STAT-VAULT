/**
 * Animation keyframes + utility hover/active CSS classes injected via
 * dangerouslySetInnerHTML in App.jsx.
 *
 * Fix 2: Removed duplicate .hover-bg-rose and .active-bg-rose rules
 * (the first definition used rgba(185,16,16) which was silently
 * overridden by the second rgba(244,63,94) rose-500 definition).
 */
export const ANIMATION_STYLES = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  @keyframes bounceIn {
    0% { opacity: 0; transform: scale(0.3); }
    50% { opacity: 1; transform: scale(1.05); }
    70% { transform: scale(0.9); }
    100% { transform: scale(1); }
  }

  @keyframes slideInBottom {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes rotateIn {
    from { opacity: 0; transform: rotate(-180deg); }
    to { opacity: 1; transform: rotate(0); }
  }

  .animate-fade-in { animation: fadeIn 0.2s ease-out; }
  .animate-fade-in-up { animation: fadeInUp 0.2s ease-out; }
  .animate-fade-in-down { animation: fadeInDown 0.2s ease-out; }
  .animate-slide-in-left { animation: slideInLeft 0.2s ease-out; }
  .animate-slide-in-right { animation: slideInRight 0.2s ease-out; }
  .animate-scale-in { animation: scaleIn 0.2s ease-out; }
  .animate-bounce-in { animation: bounceIn 0.5s ease-out; }
  .animate-slide-in-bottom { animation: slideInBottom 0.2s ease-out; }
  .animate-rotate-in { animation: rotateIn 0.2s ease-out; }

  .transition-all-300 { transition: all 0.2s ease-out; }
  .transition-all-500 { transition: all 0.5s ease-out; }
  .transition-transform-300 { transition: transform 0.2s ease-out; }

  .hover-bg-white { transition: background-color 0.2s ease-out; }
  .hover-bg-white:hover { background-color: rgba(255, 255, 255, 0.1); }

  .hover-bg-white-sm { transition: background-color 0.2s ease-out; }
  .hover-bg-white-sm:hover { background-color: rgba(255, 255, 255, 0.05); }

  .hover-bg-rose { transition: background-color 0.2s ease-out;}
  .hover-bg-rose:hover { background-color: rgba(221, 0, 0, 0.22); }

  .hover-bg-rose-sm { transition: background-color 0.2s ease-out;}
  .hover-bg-rose-sm:hover { background-color: rgba(221, 0, 0, 0.1); }

  .hover-bg-amber { transition: background-color 0.2s ease-out; }
  .hover-bg-amber:hover { background-color: rgba(245, 158, 11, 0.15); }

  .hover-bg-blue { transition: background-color 0.2s ease-out; }
  .hover-bg-blue:hover { background-color: rgba(59, 130, 246, 0.15); }

  .hover-bg-purple { transition: background-color 0.2s ease-out; }
  .hover-bg-purple:hover { background-color: rgba(168, 85, 247, 0.15); }

  .hover-bg-yellow { transition: background-color 0.2s ease-out; }
  .hover-bg-yellow:hover { background-color: rgba(250, 204, 21, 0.15); }

  .hover-bg-orange { transition: background-color 0.2s ease-out; }
  .hover-bg-orange:hover { background-color: rgba(249, 115, 22, 0.15); }

  .hover-brightness { transition: filter 0.2s ease-out; }
  .hover-brightness:hover { filter: brightness(1.3); }

  .hover-brightness-sm { transition: filter 0.2s ease-out; }
  .hover-brightness-sm:hover { filter: brightness(1.15); }

  .active-bg-white { transition: background-color 0.2s ease-out; }
  .active-bg-white:active { background-color: rgba(255, 255, 255, 0.2); }

  .active-bg-rose { transition: background-color 0.2s ease-out; }
  .active-bg-rose:active { background-color: rgba(221, 0, 0, 0.35); }

  .active-bg-amber { transition: background-color 0.2s ease-out; }
  .active-bg-amber:active { background-color: rgba(245, 158, 11, 0.3); }

  .active-bg-blue { transition: background-color 0.2s ease-out; }
  .active-bg-blue:active { background-color: rgba(59, 130, 246, 0.3); }

  .active-brightness { transition: filter 0.2s ease-out; }
  .active-brightness:active { filter: brightness(1.4); }
`;
