import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import FaceLandmarker from './components/Landmarker';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <FaceLandmarker />
    </>
  );
}

export default App;
