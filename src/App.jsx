import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import Specs from './components/Specs'
import Newsletter from './components/Newsletter'
import './App.css'

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Specs />
        <Newsletter />
      </main>
    </>
  )
}

export default App
