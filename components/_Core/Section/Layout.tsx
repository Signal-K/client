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
    <div className="flex relative items-start h-screen overflow-hidden">
      {/* <div className="absolute top-4 right-4 px-20 py-20">
      <img
        className="rounded-full w-32 h-32 z-50"
        src="https://cdn.cloud.scenario.com/assets-transform/KO7W80GhRPab0kOWPFsFIw?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy10cmFuc2Zvcm0vS083VzgwR2hSUGFiMGtPV1BGc0ZJdz9wPTEwMCoiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3MTQ1MjE1OTl9fX1dfQ__&Key-Pair-Id=K36FIAB9LE2OLR&Signature=fUmRKK~sb9XaklxuXfXmzRd4YUzATcKtCcXSpu7glOyLJkhX1p9HIVts7hys4DJiDaj1YYK42r5S0mWVRCvUuT29hoDESp0NTHf6pYBAqXwXSt-bHk1nwsqlGObpB5H-EbSwhKAIDwyR1a4WgA9PpHky-h2lcH9pdu6Ec3twrpQKebDwHUgTwtlltUrRSaH1O6lRdm312oEvQmTWE7815HgKgknfZwGny5OiBnVhr7od~rOhwDbbdAhZnwD5GRjNgZUjeDQQQ5IIsRuqm2Lmoq2LjCkfQIQAi8skSrwq67PQsDnuxwbfmvbtiK0wFVyFrWIxIJOgYXB1SJonxNPcNA__"
        alt="image description"
        height='20px'
        width='20px' // https://cdn.cloud.scenario.com/assets-transform/asset_PYYjX5wik9uUqRFBRdYGYLsE?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy10cmFuc2Zvcm0vYXNzZXRfUFlZalg1d2lrOXVVcVJGQlJkWUdZTHNFP3A9MTAwKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTcxNDUyMTU5OX19fV19&Key-Pair-Id=K36FIAB9LE2OLR&Signature=DboZe1XxGjahVU3yAzryD1Q9u9K8ED-SVG0uhVexkb9XwsAOpxE6yUJ4oJVzbe4L4AhZcpWpYCgU5E3K7IS3jpA~fqATCYOdw0zZMpGI2-dGhbrBBuszSEaBgv0llyAnYDTpSDIyfs8vTKfFsT-j5Kvg-TA0JbJtT74WPs9VSHKkH148XEqniSKNUM7Gj4yOHZ9zTwIP1l0y5SSUuPPIGt9hThis0BOMZbDMr~rKLW~XdU9RiUD25eEJwk9D-FEiXrEg8Vexiy~iKJSU6Bwv51bvdJJRWYoClv3iqYnuncIdbtGrA1KtpLaGyudZAvob-8ul3JaEJ3i-SsRzjAnwMA__ // Waterdrop.jpg
      />
    </div> */}
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
    <div className="mt-10 relative z-0">
        <div className="fixed bottom-10 left-0 w-full">
            {showGalaxy && (
                <div className="z-40">
                    <Garden onClose={() => setShowGalaxy(false)} />
                </div>
            )}

            {/* FeedOverlay section */}
            {/* {showFeedOverlay && (
                <div className="fixed bottom-0 left-0 w-full z-50 mt-20">
                    <FeedOverlay onClose={() => handleCloseFeedOverlay()} />
                </div>
            )} */}
        </div>
    </div>
</main>
</div>
  );
};