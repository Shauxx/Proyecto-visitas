import './App.css'

function App() {

  return (
    <>
      <div>
        <button onDoubleClick={async () => {
          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ping/cliente`)
          const data = await res.json()
          console.log(data)
        }}>
          cliente
        </button>
      </div>
    </>
  )
}

export default App
