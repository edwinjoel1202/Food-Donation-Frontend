import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Button, Form } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { toast } from 'react-toastify'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'

const Dashboard = () => {
  const [donations, setDonations] = useState([])
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('createdAt')

  useEffect(() => {
    fetchDonations()
  }, [])

  const fetchDonations = async () => {
    try {
      const res = await api.get('/donations/available')
      setDonations(res.data)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load donations')
    }
  }

  const filtered = donations.filter(d =>
    (d.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.category || '').toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    if (!a[sort] && !b[sort]) return 0
    if (!a[sort]) return 1
    if (!b[sort]) return -1
    return a[sort] > b[sort] ? 1 : -1
  })

  return (
    <>
      <h2>Available Donations</h2>
      <Form className="mb-3">
        <Form.Control placeholder="Search by title or category" value={search} onChange={e => setSearch(e.target.value)} />
        <Form.Select className="mt-2" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="createdAt">Sort by Date</option>
          <option value="quantity">Sort by Quantity</option>
        </Form.Select>
      </Form>

      <Row>
        {filtered.map(d => (
          <Col md={4} key={d.id} className="mb-3">
            <Card>
              {d.imageUrl && <Card.Img variant="top" src={d.imageUrl} alt={d.title} />}
              <Card.Body>
                <Card.Title>{d.title}</Card.Title>
                <Card.Text>
                  <span className="text-muted-small">Category:</span> {d.category}<br/>
                  <span className="text-muted-small">Quantity:</span> {d.quantity} {d.unit}<br/>
                  <span className="text-muted-small">Expiry:</span> {d.expiryAt || 'N/A'}
                </Card.Text>

                {d.pickupLat && d.pickupLng && (
                  <div style={{ height: 160, marginBottom: 8 }}>
                    <MapContainer center={[d.pickupLat, d.pickupLng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={[d.pickupLat, d.pickupLng]}>
                        <Popup>Pickup Location</Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                )}

                <Button as={Link} to={`/donations/${d.id}`} variant="primary">Details</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  )
}

export default Dashboard
