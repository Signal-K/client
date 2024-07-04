interface ButtonConfig {
    icon: string | undefined;
    id: string;
    text: string;
    tooltip: string;
    action: () => void; // Action to be performed when the button is clicked
  }
  
  // Define the structure for mission-based tooltips and buttons with a default option
  interface MissionConfig {
    [missionId: number]: {
      buttons: ButtonConfig[];
    };
    default?: {
      buttons: ButtonConfig[];
    };
  }
  
  // Define the configurations for different missions
  export const StructureConfigurations: { [itemId: number]: MissionConfig } = {
    14: {
      8: {
        buttons: [
          {
            id: 'classifyPlanet',
            text: 'Classify your planet',
            tooltip: 'Want to classify your planet again?',
            icon: 'https://github.com/Signal-K/client/blob/initialClassification/public/assets/Inventory/Structures/TelescopeReceiver.png?raw=true',
            action: () => {
              // Action for classifying planet
            }
          },
          {
            id: 'tutorial',
            text: 'Tutorial',
            tooltip: 'Learn how to use the telescope and classify lightcurves.',
            icon: 'https://github.com/Signal-K/client/blob/initialClassification/public/assets/Inventory/Structures/TelescopeReceiver.png?raw=true',
            action: () => {
              // Action for showing the tutorial
            }
          },
          {
            id: 'explorePlanets',
            text: 'Explore other planets',
            tooltip: 'Use your telescope to find other planet candidates and begin classifying them',
            icon: 'https://github.com/Signal-K/client/blob/initialClassification/public/assets/Inventory/Structures/TelescopeReceiver.png?raw=true',
            action: () => {
              // Action for exploring other planets
            }
          },
          {
            id: 'myDiscoveries',
            text: 'My discoveries',
            tooltip: 'View all your discoveries and classified lightcurves.',
            icon: 'https://github.com/Signal-K/client/blob/initialClassification/public/assets/Inventory/Structures/TelescopeReceiver.png?raw=true',
            action: () => {
              // Action for viewing discoveries
            }
          },
          {
            id: 'specialisedGraphs',
            text: 'Specialised graphs',
            tooltip: 'Access advanced graphs and analytics for your lightcurves, adding more data and content to your new planet.',
            icon: 'https://github.com/Signal-K/client/blob/initialClassification/public/assets/Inventory/Structures/TelescopeReceiver.png?raw=true',
            action: () => {
              // Action for showing specialised graphs
            }
          }
        ]
      },
      // Default configuration for users who haven't completed mission 8
      default: {
        buttons: [
          {
            id: 'classifyPlanet',
            text: 'Classify your planet',
            tooltip: 'Your telescope has found some light data that you can use to classify your planet',
            icon: 'https://github.com/Signal-K/client/blob/initialClassification/public/assets/Inventory/Structures/TelescopeReceiver.png?raw=true',
            action: () => {
              // Action for classifying planet
            }
          },
          {
            id: 'tutorial',
            text: 'Tutorial',
            tooltip: 'Learn how to use the telescope and classify lightcurves.',
            icon: 'https://github.com/Signal-K/client/blob/initialClassification/public/assets/Inventory/Structures/TelescopeReceiver.png?raw=true',
            action: () => {
              // Action for showing the tutorial
            }
          }
        ]
      }
    }
    // Add more configurations for other item IDs as needed
  };
  