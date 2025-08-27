import React, { useEffect, useState } from 'react'
import { Table, Button } from 'react-bootstrap'
import api from '../services/api'
import { toast } from 'react-toastify'

const VolunteerPanel = () => {
  const [donations, setDonations] = useState([])

  useEffect(() => {
    fetch()
  }, [])

  const fetch = async () => {
    try {
      // backend currently doesn't have filtering by status; this call is an example
      const res = await api.get('/donations/available')
      setDonations(res.data)
    } catch {
      toast.error('Failed to load')
    }
  }

  const handleAccept = async (id) => {
    try {
      await api.post(`/volunteer/accept/${id}`)
      toast.success('Accepted')
      fetch()
    } catch {
      toast.error('Failed to accept')
    }
  }

  return (
    <>
      <h2>Volunteer Panel</h2>
      <Table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {donations.map(d => (
            <tr key={d.id}>
              <td>{d.id}</td>
              <td>{d.title}</td>
              <td><Button size="sm" onClick={() => handleAccept(d.id)}>Accept</Button></td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  )
}

export default VolunteerPanel
