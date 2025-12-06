import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import Market from './components/Market'
import Portfolio from './components/Portfolio'
import Trading from './components/Trading'
import Navbar from './components/Navbar'
import { userAPI } from './utils/api'
import { connectSocket, disconnectSocket } from './utils/socket'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // Verify token and get user
      userAPI.getProfile()
        .then(response => {
          setIsAuthenticated(true)
          setUser(response.data)
          connectSocket()
        })
        .catch(() => {
          localStorage.removeItem('token')
          setIsAuthenticated(false)
        })
    }
  }, [])

  const handleLogin = (userData) => {
    setIsAuthenticated(true)
    setUser(userData)
    connectSocket()
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
    localStorage.removeItem('token')
    disconnectSocket()
  }

  return (
    <Router>
      <div className="app">
        {isAuthenticated && <Navbar user={user} onLogout={handleLogout} />}
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/register" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <Register onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? <Dashboard user={user} /> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/market" 
            element={
              isAuthenticated ? <Market /> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/portfolio" 
            element={
              isAuthenticated ? <Portfolio /> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/trade/:symbol" 
            element={
              isAuthenticated ? <Trading /> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App

