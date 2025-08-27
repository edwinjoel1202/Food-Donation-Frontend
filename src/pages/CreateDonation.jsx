import React, { useState } from 'react'
import { Card, Form, Button } from 'react-bootstrap'
import api from '../services/api'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const CreateDonation = () => {
  const [formData, setFormData] = useState({
    title: '', description: '', category: '', quantity: '', unit: '', expiryAt: '', pickupLat: '', pickupLng: '', imageBase64: ''
  })
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, imageBase64: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // ensure numeric fields converted
      const payload = { ...formData, quantity: Number(formData.quantity) || 0, pickupLat: formData.pickupLat ? Number(formData.pickupLat) : null, pickupLng: formData.pickupLng ? Number(formData.pickupLng) : null }
      await api.post('/donations', payload)
      toast.success('Donation created')
      navigate('/my-donations')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create donation')
    }
  }

  return (
    <Card className="mx-auto mt-4" style={{ maxWidth: 720 }}>
      <Card.Body>
        <h4>Create Donation</h4>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-2">
            <Form.Label>Title</Form.Label>
            <Form.Control name="title" value={formData.title} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Description</Form.Label>
            <Form.Control name="description" as="textarea" rows={3} value={formData.description} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Category</Form.Label>
            <Form.Control name="category" value={formData.category} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Quantity</Form.Label>
            <Form.Control name="quantity" type="number" value={formData.quantity} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Unit</Form.Label>
            <Form.Control name="unit" value={formData.unit} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Expiry At</Form.Label>
            <Form.Control name="expiryAt" type="datetime-local" value={formData.expiryAt} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Pickup Latitude</Form.Label>
            <Form.Control name="pickupLat" type="number" value={formData.pickupLat} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Pickup Longitude</Form.Label>
            <Form.Control name="pickupLng" type="number" value={formData.pickupLng} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Image</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handleImage} />
          </Form.Group>
          <Button type="submit" variant="success">Create</Button>
        </Form>
      </Card.Body>
    </Card>
  )
}

export default CreateDonation
