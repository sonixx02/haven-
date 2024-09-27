import HereMap from './components/RouteMap';

function App() {
  return (
    <div className="App">
      <HereMap 
        apiKey='0dTJ0gdlk6g9m0jMNs7hs4297YJWc3l2wlx9x7qm9Ls'
        destination="18.520430,73.856743" // Example: New York City coordinates
      />
    </div>
  );
}

export default App;