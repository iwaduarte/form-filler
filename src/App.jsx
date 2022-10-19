import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">

        Variable sets
        <h1 className="text-3xl font-bold underline">
            Hello world!
        </h1>
        Add variable:
        <img src={reactLogo} className="logo react" alt="React logo" />
    </div>
  )
}

export default App
