import Navbar from "./Navbar";
import React, { ReactNode, useEffect, useState } from "react";
import Bottombar from "./BottomBar";
import { useMediaQuery } from "react-responsive";
import FeedOverlay from "../../Overlays/1-Feed";
import { Garden } from "../../Content/Planets/GalleryList";

interface DashboardLayoutProps {
  children: ReactNode;
}; 

const Layout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 1224px)' });
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' });

  const [showFeedOverlay, setShowFeedOverlay] = useState(false);
  const handleOpenFeedOverlay = () => {
    setShowFeedOverlay(true);
  };

  return (
    <>
        {isDesktopOrLaptop && (
          <main className="h-max pb-10 grow pt-6">
            <Navbar />
            <div className="py-12">
            {children}
            </div>
          </main>
        )}
      {isTabletOrMobile && (
        <div className="md:hidden overflow-y-auto h-screen p-4">
          <main className="h-max pb-10 grow">{children}</main>
          <Bottombar />
        </div>
      )}
    </>
  );
};

export default Layout;

export const LayoutNoNav: React.FC<DashboardLayoutProps> = ({ children }) => {
  const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 1224px)' });
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' });
  const [showGalaxy, setShowGalaxy] = useState(true);
  const [showFeedOverlay, setShowFeedOverlay] = useState(false);
  const handleOpenFeedOverlay = () => {
    setShowGalaxy(false);
    setShowFeedOverlay(true);
  };
  const handleCloseFeedOverlay = () => {
    setShowGalaxy(true);
    setShowFeedOverlay(false);
  }

  return (
    <div className="flex relative items-start h-screen y-full">
      {isTabletOrMobile && (
        <style jsx global>
          {`
            body {
              background: url('https://cdn.cloud.scenario.com/assets-transform/KO7W80GhRPab0kOWPFsFIw?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy10cmFuc2Zvcm0vS083VzgwR2hSUGFiMGtPV1BGc0ZJdz9wPTEwMCoiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3MTQ1MjE1OTl9fX1dfQ__&Key-Pair-Id=K36FIAB9LE2OLR&Signature=fUmRKK~sb9XaklxuXfXmzRd4YUzATcKtCcXSpu7glOyLJkhX1p9HIVts7hys4DJiDaj1YYK42r5S0mWVRCvUuT29hoDESp0NTHf6pYBAqXwXSt-bHk1nwsqlGObpB5H-EbSwhKAIDwyR1a4WgA9PpHky-h2lcH9pdu6Ec3twrpQKebDwHUgTwtlltUrRSaH1O6lRdm312oEvQmTWE7815HgKgknfZwGny5OiBnVhr7od~rOhwDbbdAhZnwD5GRjNgZUjeDQQQ5IIsRuqm2Lmoq2LjCkfQIQAi8skSrwq67PQsDnuxwbfmvbtiK0wFVyFrWIxIJOgYXB1SJonxNPcNA__') center/cover;
            }

            @media only screen and (max-width: 767px) {
              .planet-heading {
                color: white;
                font-size: 24px;
                text-align: center;
                margin-bottom: 10px;
              }
            }
          `}
        </style>
      )}
      {isDesktopOrLaptop && (
        <style jsx global>
          {`
            body {
              background: url('https://cdn.cloud.scenario.com/assets/asset_qKG9F9VyYL2Lrm4NypYEH8Pd?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy9hc3NldF9xS0c5RjlWeVlMMkxybTROeXBZRUg4UGQ~cD0xMDAqIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzE0NTIxNTk5fX19XX0_&Key-Pair-Id=K36FIAB9LE2OLR&Signature=aS2TO5Cc8KU13TNhVDqsu4si2lUH8IUAQAtuplL1X5Fr78mWwr22xnYy0nzoSsSdwW2TYbqFuoRoqpdX8CVV-kHmmlM27Tm7xjkBjvB-Otjbjlnhbvu~Ut72YtI-Y2edrNE3XKTNf5XhcJ9-y5SlF02zC0DeFAVgDbPsQLGSJIcQ1QrN0ayX~HyA2I5K39RYlc-N3WGgRPxLMBgzrWAZurK6SqN5xCmu1~nWL1t5IadvkDyDBG~ctN-jSX-bsDmx80cCKVLi7C-IfFzCtTe4nZ0qdKbKd~AgQekbhSsl40FZhbaQYJmiS5pQ2wlDGkd0yBhOKuVgkFT8UY3y1pE1XQ__&format=jpeg') center/cover;
              background-attachment: fixed;
            }

            @media only screen and (max-width: 767px) {
              .planet-heading {
                color: white;
                font-size: 24px;
                text-align: center;
                margin-bottom: 10px;
              }
            }
          `}
        </style>
      )}
<main className="h-max pb-10 grow overflow-y-auto">
    <div className="p-5">
        {children}
    </div>
    <div className="mt-10">
        <div className="fixed bottom-10 left-0 w-full">
            {showGalaxy && (
                <div className="z-40">
                    <Garden onClose={() => setShowGalaxy(false)} />
                </div>
            )}
        </div>
    </div>
</main>
</div>
  );
};