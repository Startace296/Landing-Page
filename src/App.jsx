import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import Specs from './components/Specs'
import Newsletter from './components/Newsletter'
import Chatbot from './components/Chatbot'
import { useScrollTracker } from './hooks/useScrollTracker'
import './App.css'

function App() {
  useScrollTracker()

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Specs />
        <Newsletter />
      </main>
      <Chatbot />
    </>
  )
}

export default App
