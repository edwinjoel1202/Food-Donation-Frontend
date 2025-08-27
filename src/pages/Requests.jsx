import React, { useEffect, useState } from 'react'
import { Table, Button } from 'react-bootstrap'
import api from '../services/api'
import { toast } from 'react-toastify'

const Requests = () => {
  const [requests, setRequests] = useState([])

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests') // NOTE: backend must have this endpoint (you can add list endpoints)
      setRequests(res.data)
    } catch (err) {
      toast.error('Failed to load requests')
    }
  }

  const handleAction = async (id, approve) => {
    try {
      await api.post(`/requests/${id}/action`, null, { params: { approve } })
      toast.success(approve ? 'Approved' : 'Rejected')
      fetchRequests()
    } catch (err) {
      toast.error('Action failed')
    }
  }

  return (
    <>
      <h2>Donation Requests</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Donation</th>
            <th>Requester</th>
            <th>Message</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.donation?.title}</td>
              <td>{r.requester?.name}</td>
              <td>{r.message}</td>
              <td>{r.status}</td>
              <td>
                {r.status === 'PENDING' && (
                  <>
                    <Button variant="success" size="sm" onClick={() => handleAction(r.id, true)}>Approve</Button>{' '}
                    <Button variant="danger" size="sm" onClick={() => handleAction(r.id, false)}>Reject</Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  )
}

export default Requests
