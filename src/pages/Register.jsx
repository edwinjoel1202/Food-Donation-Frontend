import React, { useState, useContext } from 'react'
import { Card, Form, Button, Row, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext.jsx'
import { toast } from 'react-toastify'

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('USER')

  // address/location fields
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [stateRegion, setStateRegion] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')

  const { register } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude))
        setLng(String(pos.coords.longitude))
        toast.success('Location captured — please fill/confirm address fields if needed')
      },
      (err) => {
        toast.error('Failed to get location: ' + (err.message || err.code))
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        name,
        email,
        password,
        role,
        address,
        city,
        state: stateRegion,
        postalCode,
        country,
        lat: lat ? Number(lat) : null,
        lng: lng ? Number(lng) : null
      }
      await register(payload)
      navigate('/dashboard')
    } catch (err) {
      // errors handled in context toasts; also show fallback
      toast.error(err.response?.data?.error || err.message || 'Registration failed')
    }
  }

  return (
    <Card className="mx-auto mt-5" style={{ maxWidth: 680 }}>
      <Card.Body>
        <Card.Title>Register</Card.Title>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group controlId="name" className="mb-2">
                <Form.Label>Name</Form.Label>
                <Form.Control value={name} onChange={e => setName(e.target.value)} required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="email" className="mb-2">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group controlId="password" className="mb-2">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="role" className="mb-2">
                <Form.Label>Role</Form.Label>
                <Form.Select value={role} onChange={e => setRole(e.target.value)}>
                  <option value="USER">User</option>
                  <option value="VOLUNTEER">Volunteer</option>
                  <option value="ADMIN">Admin</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="address" className="mb-2">
            <Form.Label>Address</Form.Label>
            <Form.Control as="textarea" rows={2} value={address} onChange={e => setAddress(e.target.value)} placeholder="Street / Locality / Landmark" />
          </Form.Group>

          <Row>
            <Col md={4}>
              <Form.Group controlId="city" className="mb-2">
                <Form.Label>City</Form.Label>
                <Form.Control value={city} onChange={e => setCity(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="state" className="mb-2">
                <Form.Label>State / Region</Form.Label>
                <Form.Control value={stateRegion} onChange={e => setStateRegion(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="postal" className="mb-2">
                <Form.Label>Postal Code</Form.Label>
                <Form.Control value={postalCode} onChange={e => setPostalCode(e.target.value)} />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={8}>
              <Form.Group controlId="country" className="mb-2">
                <Form.Label>Country</Form.Label>
                <Form.Control value={country} onChange={e => setCountry(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end mb-2">
              <div style={{ width: '100%' }}>
                <Button variant="outline-primary" onClick={handleUseMyLocation} style={{ width: '100%' }}>
                  Use my location
                </Button>
                <div className="text-muted text-small mt-1" style={{ fontSize: 12 }}>
                  {lat && lng ? `lat: ${lat}, lng: ${lng}` : 'lat/lng not set'}
                </div>
              </div>
            </Col>
          </Row>

          <div className="d-flex justify-content-end">
            <Button type="submit" variant="success">Register</Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  )
}

export default Register
