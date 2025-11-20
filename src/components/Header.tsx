import indigoLogo from "@/assets/indigo-logo.png";
import goersLogo from "@/assets/goers-logo.png";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-gradient-to-r from-primary via-secondary to-primary/90 shadow-md z-50">
      <div className="container mx-auto h-full px-6 flex items-center justify-between">
        <div className="flex-shrink-0">
          <img src={indigoLogo} alt="Indigo" className="h-12" />
        </div>
        
        <div className="flex-1 text-center">
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Sistema de Transcripción Comercial
          </h1>
        </div>
        
        <div className="flex-shrink-0">
          <img src={goersLogo} alt="Goers" className="h-10" />
        </div>
      </div>
    </header>
  );
};
