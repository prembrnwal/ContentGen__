import { C } from '../constants/theme';

export default function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: ${C.bg}; font-family: 'DM Sans', sans-serif; color: ${C.black}; }
      ::-webkit-scrollbar { width: 5px; height: 5px; }
      ::-webkit-scrollbar-track { background: ${C.gray100}; }
      ::-webkit-scrollbar-thumb { background: ${C.gray200}; border-radius: 4px; }
      ::-webkit-scrollbar-thumb:hover { background: ${C.gray400}; }
      textarea:focus, select:focus, input:focus { outline: none; border-color: ${C.green} !important; box-shadow: 0 0 0 3px rgba(26,138,92,0.13) !important; }
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
      @keyframes scaleIn { from { opacity:0; transform:scale(0.94); } to { opacity:1; transform:scale(1); } }
      @keyframes slideIn { from { opacity:0; transform:translateX(-16px); } to { opacity:1; transform:translateX(0); } }
      @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(26,138,92,0.4); } 50% { box-shadow: 0 0 0 10px rgba(26,138,92,0); } }
      .fade-up { animation: fadeUp 0.48s cubic-bezier(0.22,1,0.36,1) both; }
      .fade-up-1 { animation: fadeUp 0.48s 0.08s cubic-bezier(0.22,1,0.36,1) both; }
      .fade-up-2 { animation: fadeUp 0.48s 0.16s cubic-bezier(0.22,1,0.36,1) both; }
      .fade-up-3 { animation: fadeUp 0.48s 0.24s cubic-bezier(0.22,1,0.36,1) both; }
      .scale-in { animation: scaleIn 0.4s cubic-bezier(0.22,1,0.36,1) both; }
      .slide-in { animation: slideIn 0.38s cubic-bezier(0.22,1,0.36,1) both; }
      button { font-family: 'DM Sans', sans-serif; }
      select { font-family: 'DM Sans', sans-serif; }
      textarea { font-family: 'DM Sans', sans-serif; }
      input { font-family: 'DM Sans', sans-serif; }
    `}</style>
  );
}
