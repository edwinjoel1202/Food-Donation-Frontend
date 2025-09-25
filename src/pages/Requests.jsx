// src/pages/Requests.jsx
import React, { useEffect, useState } from 'react'
import { Table } from 'react-bootstrap'
import api from '../services/api'
import { toast } from 'react-toastify'
import LoadingButton from '../components/LoadingButton'

const Requests = () => {
  const [requests, setRequests] = useState([])

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests')
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
                    <LoadingButton size="sm" variant="success" onClickAsync={async () => { await handleAction(r.id, true) }}>Approve</LoadingButton>{' '}
                    <LoadingButton size="sm" variant="danger" onClickAsync={async () => { await handleAction(r.id, false) }}>Reject</LoadingButton>
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
