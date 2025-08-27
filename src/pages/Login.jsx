import React, { useState, useContext } from 'react'
import { Card, Form, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext.jsx'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      // login errors handled by context toast
    }
  }

  return (
    <Card className="mx-auto mt-5" style={{ maxWidth: 420 }}>
      <Card.Body>
        <Card.Title>Login</Card.Title>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="email" className="mb-2">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </Form.Group>
          <Form.Group controlId="password" className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </Form.Group>
          <Button type="submit" variant="success">Login</Button>
        </Form>
      </Card.Body>
    </Card>
  )
}

export default Login
