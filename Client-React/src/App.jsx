import { FormSection } from "./pages/FormSection";
import { CalendarSection } from "./pages/CalendarSection";

import waves from "./assets/waves1.png";
import logo from './assets/logo.svg';

function App() {
  return (
    <>
      <section
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url(${logo})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "7%",
          backgroundPosition: "center",
        }}
        className="h-screen"
      >
        {/* SUB CONTAINER */}
        <div
          style={{
            backgroundImage: `url(${waves})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
            backgroundPosition: "bottom",
          }}
          className="h-screen md:flex"
        >
          {/* LEFT CONTAINER */}
          <FormSection />
          {/* RIGHT CONTAINER */}
          <CalendarSection />
        </div>
      </section>
    </>
  );
}

export default App;
