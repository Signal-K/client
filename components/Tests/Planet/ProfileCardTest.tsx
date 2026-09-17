import Head from 'next/head';

const ProfilePage = () => {
  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/tailwindcss@2.2.19/dist/tailwind.min.css"
        />
        {/*Replace with your tailwind.css once created*/}
      </Head>
      <div className="max-w-4xl flex items-center h-auto lg:h-screen flex-wrap mx-auto my-32 lg:my-0">
        {/* Img Col */}
        <div className="w-full lg:w-2/5 h-80vh">
          {/* Big profile image for side bar (desktop) */}
          <img
            src="https://source.unsplash.com/MP0IUfwrn0A"
            className="rounded-none lg:rounded-lg shadow-2xl w-full h-full object-cover lg:block hidden"
          />
          {/* Image from: http://unsplash.com/photos/MP0IUfwrn0A */}
        </div>
        {/* Main Col */}
        <div
          id="profile"
          className="w-full lg:w-3/5 rounded-lg lg:rounded-l-lg lg:rounded-r-none shadow-2xl bg-white opacity-75 mx-6 lg:mx-0 mt-16 lg:mt-0"
        >
          <div className="p-4 md:p-12 text-center lg:text-left">
            {/* Image for mobile view */}
            <div
              className="block lg:hidden rounded-full shadow-xl mx-auto -mt-16 h-48 w-48 bg-cover bg-center"
              style={{
                backgroundImage:
                  'url("https://source.unsplash.com/MP0IUfwrn0A")'
              }}
            />
            <h1 className="text-3xl font-bold pt-8 lg:pt-0">Your Name</h1>
            <div className="mx-auto lg:mx-0 w-4/5 pt-3 border-b-2 border-green-500 opacity-25" />
            <p className="pt-4 text-base font-bold flex items-center justify-center lg:justify-start">
              <svg
                className="h-4 fill-current text-green-700 pr-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9 12H1v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6h-8v2H9v-2zm0-1H0V5c0-1.1.9-2 2-2h4V2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1h4a2 2 0 0 1 2 2v6h-9V9H9v2zm3-8V2H8v1h4z" />
              </svg>
              What you do
            </p>
            <p className="pt-2 text-gray-600 text-xs lg:text-sm flex items-center justify-center lg:justify-start">
              <svg
                className="h-4 fill-current text-green-700 pr-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M10 20a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm7.75-8a8.01 8.01 0 0 0 0-4h-3.82a28.81 28.81 0 0 1 0 4h3.82zm-.82 2h-3.22a14.44 14.44 0 0 1-.95 3.51A8.03 8.03 0 0 0 16.93 14zm-8.85-2h3.84a24.61 24.61 0 0 0 0-4H8.08a24.61 24.61 0 0 0 0 4zm.25 2c.41 2.4 1.13 4 1.67 4s1.26-1.6 1.67-4H8.33zm-6.08-2h3.82a28.81 28.81 0 0 1 0-4H2.25a8.01 8.01 0 0 0 0 4zm.82 2a8.03 8.03 0 0 0 4.17 3.51c-.42-.96-.74-2.16-.95-3.51H3.07zm13.86-8a8.03 8.03 0 0 0-4.17-3.51c.42.96.74 2.16.95 3.51h3.22zm-8.6 0h3.34c-.41-2.4-1.13-4-1.67-4S8.74 3.6 8.33 6zM3.07 6h3.22c.2-1.35.53-2.55.95-3.51A8.03 8.03 0 0 0 3.07 6z" />
              </svg>
              Your Location - 25.0000° N, 71.0000° W
            </p>
            <p className="pt-8 text-sm">
              Totally optional short description about yourself, what you do and so
              on.
            </p>
            <div className="pt-12 pb-8">
              <button className="bg-green-700 hover:bg-green-900 text-white font-bold py-2 px-4 rounded-full">
                Get In Touch
              </button>
            </div>
            <div className="mt-6 pb-16 lg:pb-0 w-4/5 lg:w-full mx-auto flex flex-wrap items-center justify-between">
              <a
                className="link"
                href="https://twitter.com/username"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  className="h-6 fill-current text-gray-600 hover:text-green-700"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill-rule="evenodd"
                    d="M6.153 2C2.927 2 0 4.936 0 8.208c0 2.053.781 3.919 2.05 5.331-.01.146-.01.29-.01.436 0 5.618 4.28 12.105 12.08 12.105 7.805 0 12.085-6.477 12.085-12.104 0-.152 0-.3-.008-.446A6.572 6.572 0 0 0 24 8.21C24 4.936 21.076 2 17.847 2h-11.69zm6.504 17.094c-3.142 0-5.82-1.67-6.516-4.145h.986c1.18 0 2.258-.77 2.634-1.91a3.65 3.65 0 0 0-.404-3.154c.004-.04.004-.075.004-.115 0-2.326 1.753-4.225 3.917-4.225 1.124 0 2.14.474 2.84 1.23a6.602 6.602 0 0 1 2.088-.835 3.29 3.29 0 0 0-.077 3.642 3.65 3.65 0 0 0 2.664 1.832 3.29 3.29 0 0 1-1.518.058 6.586 6.586 0 0 1-6.15 4.29l-.003-.002zm-4.184-1.457c-1.1 0-2.01-.922-2.01-2.06 0-1.14.91-2.062 2.01-2.062 1.104 0 2.01.923 2.01 2.06 0 1.14-.906 2.063-2.01 2.063zm7.22 0c-1.106 0-2.013-.922-2.013-2.06 0-1.14.907-2.062 2.013-2.062 1.1 0 2.005.923 2.005 2.06 0 1.14-.905 2.063-2.005 2.063z"
                  />
                </svg>
              </a>
              <a
                className="link"
                href="https://www.linkedin.com/in/username"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  className="h-6 fill-current text-gray-600 hover:text-green-700"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill-rule="evenodd"
                    d="M2.83 0a2.816 2.816 0 0 0-2.82 2.824v18.352A2.816 2.816 0 0 0 2.83 24H21.18a2.816 2.816 0 0 0 2.82-2.824V2.824A2.816 2.816 0 0 0 21.18 0H2.83zm2.965 5.143c1.35 0 2.08.667 2.428 1.154h.035v-.992h3.33s.044.287 0 1.805h-3.33v4.45h3.104v1.81H8.08v-1.81c0-.358.03-.712.148-.977.324-.712 1.054-1.464 2.29-1.464 1.61 0 2.255 1.227 2.255 3.02v3.482h-3.102V12.97c0-.38-.015-.76-.073-1.016-.16-.756-.617-1.216-1.387-1.216-1.006 0-1.54.68-1.54 1.674v3.258H5.798s.045-9.248 0-10.207h3.164v1.45h-.036c-.32-.633-.885-1.536-2.13-1.536-1.732 0-3.022 1.12-3.022 3.52v4.77H5.8v1.81H5.794l.004-.002v.002h-.003zm-.634 1.15h-.034c-.452 0-.742-.3-.742-.68s.29-.68.73-.68h.035c.452 0 .742.3.742.68s-.29.68-.73.68zm-.636 3.66v-1.812h-.035c-.45 0-.742-.3-.742-.68s.292-.68.733-.68h.034c.452 0 .742.3.742.68s-.29.68-.732.68h-.003v1.812H4.515zm10.453-4.828c.013 1.347-.927 2.314-2.45 2.314-1.522 0-2.453-.967-2.466-2.314.012-1.36.944-2.318 2.466-2.318s2.466.957 2.45 2.318zm-3.146 4.828h3.104V9.11h-3.104v1.713zm0-2.62h3.104v-1.81h-3.104v1.81z"
                  />
                </svg>
              </a>
              <a
                className="link"
                href="https://github.com/username"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  className="h-6 fill-current text-gray-600 hover:text-green-700"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill-rule="evenodd"
                    d="M12 0C5.37 0 0 5.372 0 12c0 5.302 3.438 9.8 8.207 11.385.6.11.82-.26.82-.578 0-.286-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.547-1.384-1.336-1.753-1.336-1.753-1.092-.74.083-.725.083-.725 1.205.084 1.838 1.235 1.838 1.235 1.07 1.835 2.806 1.304 3.495.996.108-.776.419-1.305.762-1.605-2.665-.305-5.466-1.336-5.466-5.93 0-1.31.465-2.384 1.235-3.226-.124-.304-.535-1.527.117-3.18 0 0 1.008-.324 3.3 1.233a11.575 11.575 0 0 1 3.006-.402c1.023.004 2.055.138 3.006.402 2.29-1.557 3.294-1.233 3.294-1.233.654 1.653.243 2.876.12 3.18.765.842 1.23 1.916 1.23 3.226 0 4.608-2.806 5.622-5.48 5.92.43.372.82 1.103.82 2.223 0 1.604-.014 2.898-.014 3.286 0 .32.216.692.825.577C20.566 21.797 24 17.3 24 12c0-6.628-5.373-12-12-12"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
