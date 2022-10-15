import Header from "@/ui/Sections/Header";
import { PlanetLayout } from "@/ui/Sections/PlanetLayout";
import { ReactNode } from "react";
import { useMediaQuery } from "react-responsive";

interface Layout {
    children: ReactNode;
}; 

const Layout: React.FC<Layout> = ({ children }) => {
  const isDesktop = useMediaQuery({ query: "(min-width: 1224px)" });
  const isMobile = useMediaQuery({ query: "(max-width: 1224px)" });

  return (
    <div className="flex relative items-start h-screen y-full">
      {/* {isMobile && (
        <style jsx global>
          {`
            body {
              background: url('https://cdn.cloud.scenario.com/assets/asset_J8Mo3eYBJWMjdC8wSQQ15edx?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy9hc3NldF9KOE1vM2VZQkpXTWpkQzh3U1FRMTVlZHg~cD0xMDAqIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzE0NTIxNTk5fX19XX0_&Key-Pair-Id=K36FIAB9LE2OLR&Signature=ERw02sLK6d6yXD0YC6USsU8GckSYAn61zS8Wkn4v7zi9bQuF303LROIwETSCGLu8cL8ICi9sL6urbsKBCgy7R75pzGSYWGlz5sK9kIlrjEVBEk--1IOb6RckcuYGF8hDFzxziZubJ828j3CMAuYD3EV7PdNb0NmtTIlVBDVQUQyyY5t3IJ2hMJhkixjBIpTPFnnBzZbiNVK-BWaNlskb4d-~E9W8AOH8nN1hz7JGvJzKBun96cLGL-jq-fr1esT7ehdDuO0aYqad6mLXHrSHoPb1ZTXg4VjB5zRiAvQ2w6O8s1w8azsMBD4aTe0QmRepBopiHjS8-dYZp~olGkGd7Q__&format=jpeg') center/cover;
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
      {isDesktop && (
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
      )} */}
        <main className="h-max pb-10 grow overflow-y-auto">
            <div className="p-5">
                {/* <Header /> */}
                <PlanetLayout />
                {children}
            </div>
        </main>
    </div>
  );
};

export default Layout;