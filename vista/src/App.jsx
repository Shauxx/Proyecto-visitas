import './App.css'

const URL = import.meta.env.VITE_BACKEND_URL;
const URL_CONFIG = import.meta.env.VITE_BACKEND_CONFIG;
const URL_USUARIO = import.meta.env.VITE_BACKEND_USUARIO;
const URL_VISITA = import.meta.env.VITE_BACKEND_VISITA;
function App() {

  return (
    <>
      <div>
        <button onDoubleClick={async () => {
          const res = await fetch(`${URL}/ping/cliente`)
          const data = await res.json()
          console.log(data)
        }}>
          cliente
        </button>

        <button onDoubleClick={async () => {
          const res = await fetch(`${URL_CONFIG}/ping/config`)
          const data = await res.json()
          console.log(data)
        }}>
          config
        </button>

        <button onDoubleClick={async () => {
          const res = await fetch(`${URL_USUARIO}/ping/usuario`)
          const data = await res.json()
          console.log(data)
        }}>
          USUARIO
        </button>

        <button onDoubleClick={async () => {
          const res = await fetch(`${URL_VISITA}/ping/visitas`)
          const data = await res.json()
          console.log(data)
        }}>
          Visita
        </button>
      </div>
    </>
  )
}

export default App
