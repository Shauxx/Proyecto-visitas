import './App.css'

function App() {

  return (
    <>
      <div>
        <button onDoubleClick={async () => {
          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users`)
          const data = await res.json()
          console.log(data)
        }}>
          user
        </button>
      </div>
    </>
  )
}

export default App
