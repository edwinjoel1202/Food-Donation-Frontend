import React, { useEffect, useState } from 'react'
import { Card, Button, Form } from 'react-bootstrap'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { toast } from 'react-toastify'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'

const DonationDetails = () => {
  const { id } = useParams()
  const [donation, setDonation] = useState(null)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchDonation()
    // eslint-disable-next-line
  }, [id])

  const fetchDonation = async () => {
    try {
      const res = await api.get(`/donations/${id}`)
      setDonation(res.data)
    } catch (err) {
      toast.error('Failed to load donation')
    }
  }

  const handleRequest = async () => {
    try {
      await api.post('/requests', { donationId: Number(id), message })
      toast.success('Request sent')
      navigate('/requests')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to request')
    }
  }

  if (!donation) return <div>Loading...</div>

  return (
    <Card className="p-3">
      {donation.imageUrl && <Card.Img variant="top" src={donation.imageUrl} alt={donation.title} />}
      <Card.Body>
        <Card.Title>{donation.title}</Card.Title>
        <Card.Text>
          {donation.description}<br />
          <strong>Category:</strong> {donation.category} <br />
          <strong>Quantity:</strong> {donation.quantity} {donation.unit} <br />
          <strong>Expiry:</strong> {donation.expiryAt || 'N/A'} <br />
          <strong>Created by:</strong> {donation.createdByName}
        </Card.Text>

        {donation.pickupLat && donation.pickupLng && (
          <div style={{ height: 300, marginBottom: 12 }}>
            <MapContainer center={[donation.pickupLat, donation.pickupLng]} zoom={13} style={{ height: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[donation.pickupLat, donation.pickupLng]}>
                <Popup>Pickup Location</Popup>
              </Marker>
            </MapContainer>
          </div>
        )}

        <Form.Group className="mb-2">
          <Form.Label>Request Message</Form.Label>
          <Form.Control as="textarea" value={message} onChange={e => setMessage(e.target.value)} />
        </Form.Group>
        <Button onClick={handleRequest} variant="primary">Request Donation</Button>
      </Card.Body>
    </Card>
  )
}

export default DonationDetails
