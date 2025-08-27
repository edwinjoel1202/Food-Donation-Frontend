import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Button } from 'react-bootstrap'
import api from '../services/api'
import { toast } from 'react-toastify'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

const MyDonations = () => {
  const [donations, setDonations] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    fetchMyDonations()
  }, [])

  const fetchMyDonations = async () => {
    try {
      const res = await api.get('/donations/my')
      setDonations(res.data)
    } catch (err) {
      toast.error('Failed to load donations')
    }
  }

  const handleCancel = async (id) => {
    try {
      await api.post(`/donations/${id}/cancel`)
      toast.success('Donation cancelled')
      fetchMyDonations()
    } catch (err) {
      toast.error('Failed to cancel')
    }
  }

  const expiryDates = donations
    .filter(d => d.expiryAt)
    .map(d => new Date(d.expiryAt))

  return (
    <>
      <h2>My Donations</h2>
      <Row>
        <Col md={8}>
          <Row>
            {donations.map(d => (
              <Col md={6} key={d.id} className="mb-3">
                <Card>
                  <Card.Body>
                    <Card.Title>{d.title}</Card.Title>
                    <Card.Text>Status: {d.status}</Card.Text>
                    <div className="mb-2">
                      <small className="text-muted-small">Expiry: {d.expiryAt || 'N/A'}</small>
                    </div>
                    {d.status !== 'CANCELLED' && <Button variant="danger" onClick={() => handleCancel(d.id)}>Cancel</Button>}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
        <Col md={4}>
          <h5>Expiry Calendar</h5>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileClassName={({ date }) => expiryDates.some(ed => ed.toDateString() === date.toDateString()) ? 'highlight' : null}
          />
        </Col>
      </Row>
    </>
  )
}

export default MyDonations
