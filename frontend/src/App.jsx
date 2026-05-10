import { useState } from 'react'
import './index.css'

function App() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    const endpoint = isLogin ? '/auth/login' : '/auth/register'
    const payload = isLogin 
      ? { username: formData.username, password: formData.password }
      : formData

    try {
      const apiBaseUrl = '/api'
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.text()

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: isLogin ? 'Login successful! Welcome back.' : 'Registration successful! You can now login.' 
        })
        if (!isLogin) {
          setIsLogin(true)
        }
      } else {
        setMessage({ type: 'error', text: data || 'Something went wrong' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Server connection failed' })
    }
  }

  return (
    <div className="container">
      <div className="bg-blob"></div>
      
      <div className="auth-container">
        <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
        <p className="subtitle">
          {isLogin 
            ? 'Enter your credentials to access your account' 
            : 'Join our community and start your journey today'}
        </p>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              name="username" 
              value={formData.username} 
              onChange={handleChange} 
              placeholder="johndoe" 
              required 
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="john@example.com" 
                required 
              />
            </div>
          )}

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              placeholder="••••••••" 
              required 
            />
          </div>

          <button type="submit">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="switch-auth">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span onClick={() => {
            setIsLogin(!isLogin)
            setMessage({ type: '', text: '' })
          }}>
            {isLogin ? 'Register' : 'Login'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default App
