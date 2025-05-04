# CountryExplorer

A React application that allows users to explore countries around the world using the REST Countries API. This project demonstrates skills in front-end development, API integration, and user interface design.

## Live Demo

[View the Live Demo](https://global-route.vercel.app/)

## Features

- Browse through all countries with essential information
- Search countries by name
- Filter countries by region
- View detailed information about each country
- Add countries to favorites (requires login)
- Map view of countries in the list
- Global news page with upto date BBC news
- Browse the news through news page
- A travel route planner with dream county listing feature
- Responsive design for all device sizes

## Technologies Used

- **Frontend Framework**: React with functional components
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **State Management**: Context API
- **Authentication**: Local storage-based authentication (simulated)
- **API**: REST Countries API
- **ExternalURL**: Use the BBC global news fetching url to get daily BBC news
- **Testing**: Jest and React Testing Library

## API Integration

This application uses the REST Countries API with the following endpoints:

1. `GET /all` - Fetch all countries
2. `GET /name/{name}` - Search countries by name
3. `GET /region/{region}` - Filter countries by region
4. `GET /alpha/{code}` - Get detailed information about a specific country

## Setup and Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/country-explorer.git
   cd country-explorer
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm start
   ```

4. To build for production
   ```bash
   npm run build
   ```

5. To run tests
   ```bash
   npm test
   ```

## Project Structure

```
src/
├── components/
│   ├── layout/          # Layout components (Navbar, Footer, etc.)
│   ├── countries/       # Country-related components
│   └── auth/            # Authentication components
├── context/             # React Context for state management
├── services/            # API services
├── pages/               # Page components
├── utils/               # Helper utilities
└── tests/               # Test files
```

## User Authentication

This application includes a simulated user authentication system:

- Users can register and log in
- User sessions are maintained using localStorage
- Authenticated users can add countries to their favorites
- Favorites are persisted in localStorage

## Testing

The application includes unit and integration tests covering key functionality:

- Component rendering
- API integration
- State management
- User interactions

Run tests with:
```bash
npm test
```

## Responsive Design

The application is fully responsive and works well on:
- Mobile devices
- Tablets
- Desktop computers

## Development Challenges and Solutions


### Challenge 1: State Management
Managing application state across multiple components was challenging. I solved this by using React Context API to create a centralized state that all components can access.

### Challenge 2: Performance Optimization
Loading all countries at once caused performance issues. I optimized this by implementing lazy loading and efficient filtering mechanisms.

### Challenge 3: Map Integration
Integrating Leaflet.js maps with React required careful management of component lifecycles. I solved this by creating custom hooks to handle map initialization and cleanup, ensuring proper memory management and preventing map-related memory leaks.

### Challenge 4: Testing Environment Configuration
During development, I encountered significant challenges with the Jest testing environment, particularly with JSX parsing and DOM simulation. The tests were failing with errors related to missing React configuration and document objects not being defined. To solve this, I created a proper Jest configuration that included the jsdom test environment and appropriate Babel presets for React. I also added data-testid attributes to critical components to make testing more robust and less dependent on implementation details. This improved both the reliability and maintainability of the test suite.

## Future Improvements

- Add more filtering options (population, area, etc.)
- Implement a theme switcher (light/dark mode)
- Add more detailed country information and visualizations
- Implement a map view of countries

