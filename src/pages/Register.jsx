import React, { useState, useContext } from 'react'
import { Card, Form, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext.jsx'

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('USER')
  const { register } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await register(name, email, password, role)
      navigate('/dashboard')
    } catch (err) {
      // errors handled in context toasts
    }
  }

  return (
    <Card className="mx-auto mt-5" style={{ maxWidth: 480 }}>
      <Card.Body>
        <Card.Title>Register</Card.Title>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="name" className="mb-2">
            <Form.Label>Name</Form.Label>
            <Form.Control value={name} onChange={e => setName(e.target.value)} required />
          </Form.Group>
          <Form.Group controlId="email" className="mb-2">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </Form.Group>
          <Form.Group controlId="password" className="mb-2">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </Form.Group>
          <Form.Group controlId="role" className="mb-3">
            <Form.Label>Role</Form.Label>
            <Form.Select value={role} onChange={e => setRole(e.target.value)}>
              <option value="USER">User</option>
              <option value="VOLUNTEER">Volunteer</option>
              <option value="ADMIN">Admin</option>
            </Form.Select>
          </Form.Group>
          <Button type="submit" variant="success">Register</Button>
        </Form>
      </Card.Body>
    </Card>
  )
}

export default Register
