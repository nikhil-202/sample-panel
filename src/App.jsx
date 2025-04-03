import { useState } from 'react'
import './App.css'
import DesignCanvas from '../components/DesignCanvas'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <DesignCanvas/>
    </>
  )
}

export default App
