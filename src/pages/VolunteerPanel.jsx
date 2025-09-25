// src/pages/VolunteerPanel.jsx
import React, { useEffect, useState } from 'react'
import { Table } from 'react-bootstrap'
import api from '../services/api'
import { toast } from 'react-toastify'
import LoadingButton from '../components/LoadingButton'

const VolunteerPanel = () => {
  const [donations, setDonations] = useState([])

  useEffect(() => {
    fetch()
  }, [])

  const fetch = async () => {
    try {
      const res = await api.get('/donations/available')
      setDonations(res.data)
    } catch (err) {
      toast.error('Failed to load donations')
    }
  }

  const handleAccept = async (id) => {
    try {
      await api.post(`/volunteer/accept/${id}`)
      toast.success('Accepted — donor notified')
      fetch()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to accept')
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
              <td>
                <LoadingButton size="sm" onClickAsync={async () => { await handleAccept(d.id) }}>
                  Accept
                </LoadingButton>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  )
}

export default VolunteerPanel
