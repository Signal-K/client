import { AllStructures } from "@/components/Gameplay/Inventory/Structures/Structure";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import UserStructures from "../_[archive]/(structures)/StructureModal";

interface ResponsiveLayoutProps {
    leftContent: React.ReactNode;
    middleContent: React.ReactNode;
    // rightContent: React.ReactNode;
};

interface SectionProps {
    background: string;
    children: React.ReactNode;
};

const Section: React.FC<SectionProps> = ({ background, children }) => (
    <div
        className="flex items-center justify-center h-full w-full"
        style={{
            backgroundImage: background,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '100%',
            width: '100%',
        }}
    >
      {children}
    </div>
);

export const SidebarLayout: React.FC<ResponsiveLayoutProps> = ({
    leftContent,
    middleContent,
    // rightContent
  }) => {
    return (
      <div className="min-h-screen h-screen w-screen">
        {/* Desktop layout */}
        <div className="hidden md:flex md:flex-row h-full w-full">
          <div className="w-1/3 h-full">
            <Section background="url('https://cdn.cloud.scenario.com/assets/asset_W9ntQkasoZdEWHBKki2aczui?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy9hc3NldF9XOW50UWthc29aZEVXSEJLa2kyYWN6dWk~cD0xMDAqIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzIwMzk2Nzk5fX19XX0_&Key-Pair-Id=K36FIAB9LE2OLR&Signature=fg079eZKhY1JGCnYCFvczY3QNzQEDUFGsVoyl1S8jMK563Gq9x7uC~2y-BLouaKeXpUMZ~3koWD7XT8yhNTgFgZ3K9jNiZTyLW-HoCeyUxo~ZiR6tjDqSXbFsgAt7OY1A9E6oo5ENTPG7z0kseEQ6~hcpki9h~LmlT2mMl9cakFvIsvXfsOystd5tZK-deaQw-werQiQBO7pmXrv5jAoviMOQlivWrS5AqQ~Pxf1Y6UVAnumSCGazVJ9~neSYWq1ZSMT-u9NKcvb5cRqXClcuRfILmc18Cv5BkY3j0kXLTXTOHjSxPGMGwOmwJ-fwd4YrK5sesuNgK6rnMWgL38aAQ__')">
              {leftContent}
            </Section>
          </div>
          <div className="w-2/3 h-full py-8">
            <Section background="url('')">
              {middleContent}
            </Section>
          </div>
        </div>
  
        {/* Mobile layout */}      
        <div className="md:hidden flex flex-col min-h-screen h-screen relative">
          <div className="h-1/4">
            <Section background="url('https://cdn.cloud.scenario.com/assets/asset_W9ntQkasoZdEWHBKki2aczui?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy9hc3NldF9XOW50UWthc29aZEVXSEJLa2kyYWN6dWk~cD0xMDAqIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzIwMzk2Nzk5fX19XX0_&Key-Pair-Id=K36FIAB9LE2OLR&Signature=fg079eZKhY1JGCnYCFvczY3QNzQEDUFGsVoyl1S8jMK563Gq9x7uC~2y-BLouaKeXpUMZ~3koWD7XT8yhNTgFgZ3K9jNiZTyLW-HoCeyUxo~ZiR6tjDqSXbFsgAt7OY1A9E6oo5ENTPG7z0kseEQ6~hcpki9h~LmlT2mMl9cakFvIsvXfsOystd5tZK-deaQw-werQiQBO7pmXrv5jAoviMOQlivWrS5AqQ~Pxf1Y6UVAnumSCGazVJ9~neSYWq1ZSMT-u9NKcvb5cRqXClcuRfILmc18Cv5BkY3j0kXLTXTOHjSxPGMGwOmwJ-fwd4YrK5sesuNgK6rnMWgL38aAQ__')">
              {leftContent}
            </Section>
          </div>
          <div className="h-3/4 py-4">
            <Section background="url('')">
              {middleContent}
            </Section>
          </div>
          {/* <Section background="url('/path/to/right-image.jpg')">
            {rightContent}
          </Section> */}
        </div>
      </div>
    );
  };

  export function Panels() {
    const [isMiddleHovered, setIsMiddleHovered] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [maximizedSection, setMaximizedSection] = useState<null | string>(null);
  
    const openModal = (section: string) => {
      setMaximizedSection(section);
      setIsModalOpen(true);
    };
  
    const closeModal = () => {
      setIsModalOpen(false);
      setMaximizedSection(null);
    };
  
    return (
      <div className="flex h-screen flex-col">
        {!isModalOpen && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="relative flex-1 overflow-hidden bg-primary-foreground transition-all duration-300">
              <div className="absolute top-4 right-4 z-10">
                <Button variant="ghost" size="icon" onClick={() => openModal('section1')}>
                  <MaximizeIcon className="h-6 w-6" /> 
                </Button>
              </div>
              <div className="flex h-full items-center justify-center p-8">
                <div className="space-y-4 text-center">
                    <UserStructures />
                  {/* <AllStructures /> */}
                </div>
              </div>
            </div>
            <div
              className={`relative flex-1 overflow-hidden bg-secondary-foreground transition-all duration-300 group ${isMiddleHovered ? 'flex-[2]' : 'flex-[0.5]'}`}
              onMouseEnter={() => setIsMiddleHovered(true)}
              onMouseLeave={() => setIsMiddleHovered(false)}
              onClick={() => setIsMiddleHovered(true)}
            >
              <div className="absolute top-4 right-4 z-10">
                <Button variant="ghost" size="icon" onClick={() => openModal('section2')}>
                  <MaximizeIcon className="h-6 w-6" />
                </Button>
              </div>
              <div className="flex h-full items-center justify-center p-8">
                <div className="space-y-4 text-center">
                  <h2 className="text-3xl font-bold text-secondary">Section 2</h2>
                  <p className="text-secondary-foreground">Tutorial info could go here?</p>
                </div>
              </div>
            </div>
            <div className="relative flex-1 overflow-hidden bg-muted-foreground transition-all duration-300">
              <div className="absolute top-4 right-4 z-10">
                <Button variant="ghost" size="icon" onClick={() => openModal('section3')}>
                  <MaximizeIcon className="h-6 w-6" />
                </Button>
              </div>
              <div className="flex h-full items-center justify-center p-8">
                <div className="space-y-4 text-center">
                  <h2 className="text-3xl font-bold text-muted">Section 3</h2>
                  <p className="text-muted-foreground">Automatons will go here</p>
                </div>
              </div>
            </div>
          </div>
        )}
  
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div
              className="bg-white w-[95%] h-[95%] rounded-lg p-6 transform transition-transform duration-300"
              style={{ transform: isModalOpen ? 'scale(1)' : 'scale(0.95)' }}
            >
              <div className="flex justify-end">
                <Button variant="ghost" size="icon" onClick={closeModal}>
                  <CloseIcon className="h-6 w-6" />
                </Button>
              </div>
              <div className="p-4">
                <h2 className="text-2xl font-bold mb-4">
                  {maximizedSection === 'section1' ? 'Section 1' : maximizedSection === 'section2' ? 'Section 2' : 'Section 3'}
                </h2>
                <p>
                  {maximizedSection === 'section1'
                    ? 'Structures will go here.'
                    : maximizedSection === 'section2'
                    ? 'Tutorial info could go here?'
                    : 'Automatons will go here'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

function MaximizeIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}


function CloseIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    );
  }