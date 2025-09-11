import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
       <h1 className="text-4xl font-bold mb-4">Welcome to ATM GuardAI</h1>
       <p className="text-lg mb-8">Your security dashboard for ATM monitoring</p>
       <div className="flex space-x-4">
         <button className="bg-blue-700 text-white px-4 py-2 rounded">Get Started</button>
         <button className="bg-gray-300 text-gray-800 px-4 py-2 rounded">Learn More</button>
       </div>
     </div>
    </>
  )
}

export default App
