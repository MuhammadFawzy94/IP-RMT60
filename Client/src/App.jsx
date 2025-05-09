
import { BrowserRouter, Routes, Route, Outlet } from "react-router"
import Home from "./Home"
import Article from "./Articel"
import Register from "./Register"
import Login from "./Login"
import { NavbarUser } from "./assets/Components/Navbar"
import HomeUser from "./HomeUser"
import MechanicById from "./MechanicById"
import Order from "./order"
import Payment from "./Payment"
import OrderById from "./orderById"
import GeminiAssistant from "./AiAssistant"
import AiAssistant from "./AiAssistant"
import { Provider } from 'react-redux'
import { store } from './store'

// import GeminiAssistant from './GeminiAssistant';



function AuthenticatedLayout() {
  return (
    <div>
      <NavbarUser />
      <Outlet />
    </div>
  )
}

function App() {

  return (
    <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AuthenticatedLayout />}>
          <Route index element={<HomeUser />} />
          <Route path="mechanic/:id" element={<MechanicById />} />
          <Route path="/articel" element={<Article />} />
          <Route path="order" element={<Order />} />
          <Route path="getOrder" element={<OrderById />} />
          <Route path="payment" element={<Payment />} />
          <Route path="/ai-assistant" element={<AiAssistant />} />
          {/* <Route path="/gemini-assistant" element={<GeminiAssistant />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
    </Provider>
  )
}

export default App
