import { ReactNode } from "react";
import { PlanetLayout } from "@/ui/Sections/PlanetLayout";
import { useMediaQuery } from "react-responsive";

interface Layout {
    children: ReactNode;
}; 

const Layout: React.FC<Layout> = ({ children }) => {
  const isDesktop = useMediaQuery({ query: "(min-width: 1224px)" });
  const isMobile = useMediaQuery({ query: "(max-width: 1224px)" });

  return (
    <div className="p-5" style={{ 
      backgroundImage: `url("https://cdn.cloud.scenario.com/assets/asset_RvNeM4bDcA84BoLkNRZ7VWTJ?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy9hc3NldF9Sdk5lTTRiRGNBODRCb0xrTlJaN1ZXVEo~cD0xMDAqIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzE1MTI2Mzk5fX19XX0_&Key-Pair-Id=K36FIAB9LE2OLR&Signature=dR5kVF2SBsY8lrK0nEiM07Si70t7AQgG00XQ~WDOKf3Vbymx-eQSaQBU9yPoyXe~DVNwLCNGx8~Lj8ZE0Iix4Ev9x0SN26-5jFBd9S-PY7pjf~t-IfYbKcuL8EUKn6k5TOa8nLiFlOgtXJj3MADdZScpWqHuR9UNju~~W836GOlEB~nf7YkkiaPA1Pov94ALcr-Kq5t2OntS19oQM9h45yoidhNUKVvrFhnMVdy2uVyZ8LCwM~y2fKqcLXCq2nJe3LPJlEFq76eBpES02RFGDMXekTl9WDMj4~gnCsvswPwhgGaQPF~2E53nFRYlueYyWn93BBDeVcl-X3yYt9d5pw__")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
  }}>  
      <div className="flex relative items-start h-screen y-full">
        <main className="h-max pb-10 grow overflow-y-auto">
          <PlanetLayout>
              {children}
          </PlanetLayout>
        </main>
    </div>
    </div>
  );
};

export default Layout;