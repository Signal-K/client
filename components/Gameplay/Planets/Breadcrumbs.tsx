import React, { useState } from "react";

const Breadcrumb = () => {
  const [isProjectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [isDatabaseDropdownOpen, setDatabaseDropdownOpen] = useState(false);

  const toggleProjectDropdown = () => {
    setProjectDropdownOpen(!isProjectDropdownOpen);
  };

  const toggleDatabaseDropdown = () => {
    setDatabaseDropdownOpen(!isDatabaseDropdownOpen);
  };

  return (
    <nav className="flex justify-between" aria-label="Breadcrumb">
      <ol className="inline-flex items-center mb-3 sm:mb-0">
        <li>
          <div className="flex items-center">
            <button
              id="dropdownProject"
              onClick={toggleProjectDropdown}
              data-dropdown-toggle="dropdown-project"
              className="inline-flex items-center px-3 py-2 text-sm font-normal text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-white dark:focus:ring-gray-700"
            >
              <svg
                className="w-3 h-3 mr-2"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 16 20"
              >
                {/* ... */}
              </svg>
              flowbite.com
              <svg
                className="w-2.5 h-2.5 ml-2.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                {/* ... */}
              </svg>
            </button>
            {isProjectDropdownOpen && (
              <div
                id="dropdown-project"
                className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
              >
                <ul
                  className="py-2 text-sm text-gray-700 dark:text-gray-200"
                  aria-labelledby="dropdownDefault"
                >
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      themesberg.com
                    </a>
                  </li>
                  {/* ... other dropdown items */}
                </ul>
              </div>
            )}
          </div>
        </li>
        <span className="mx-2 text-gray-400">/</span>
        <li aria-current="page">
          <div className="flex items-center">
            <button
              id="dropdownDatabase"
              onClick={toggleDatabaseDropdown}
              data-dropdown-toggle="dropdown-database"
              className="inline-flex items-center px-3 py-2 text-sm font-normal text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-white dark:focus:ring-gray-700"
            >
              <svg
                className="w-3 h-3 mr-2"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 16 20"
              >
                {/* ... */}
              </svg>
              databaseName
              <svg
                className="w-2.5 h-2.5 ml-2.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                {/* ... */}
              </svg>
            </button>
            {isDatabaseDropdownOpen && (
              <div
                id="dropdown-database"
                className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
              >
                <ul
                  className="py-2 text-sm text-gray-700 dark:text-gray-200"
                  aria-labelledby="dropdownDefault"
                >
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      databaseProd
                    </a>
                  </li>
                  {/* ... other dropdown items */}
                </ul>
              </div>
            )}
          </div>
        </li>
      </ol>
    </nav>
  );
};

export default Breadcrumb;