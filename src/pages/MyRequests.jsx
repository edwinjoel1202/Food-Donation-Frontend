// src/pages/MyRequests.jsx
import React, { useEffect, useState } from 'react'
import { Table, Button, Modal } from 'react-bootstrap'
import api from '../services/api'
import { toast } from 'react-toastify'
import LoadingButton from '../components/LoadingButton'

const MyRequests = () => {
  const [requests, setRequests] = useState([])
  const [confirm, setConfirm] = useState({ open: false, id: null })

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests/my')
      setRequests(res.data)
    } catch (err) {
      toast.error('Failed to load your requests')
    }
  }

  const handleCancel = async (id) => {
    try {
      await api.post(`/requests/${id}/cancel`)
      toast.success('Request cancelled')
      setConfirm({ open: false, id: null })
      fetchRequests()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel request')
    }
  }

  const contactDonor = (donation) => {
    const donor = donation?.createdBy || {}
    const mail = donor.email || ''
    if (!mail) {
      toast.error('Donor email not available')
      return
    }
    const subject = encodeURIComponent(`Request about donation: ${donation?.title || ''}`)
    window.location.href = `mailto:${mail}?subject=${subject}`
  }

  return (
    <>
      <h2>My Requests</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Donation</th>
            <th>Donor</th>
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
              <td>{r.donation?.createdBy?.name} <br/> <small>{r.donation?.createdBy?.email}</small></td>
              <td>{r.message}</td>
              <td>{r.status}</td>
              <td>
                {r.status !== 'CANCELLED' && r.status !== 'APPROVED' && (
                  <>
                    <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, id: r.id })}>Cancel</Button>{' '}
                  </>
                )}
                {' '}
                <Button size="sm" variant="outline-primary" onClick={() => contactDonor(r.donation)}>Contact Donor</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={confirm.open} onHide={() => setConfirm({ open: false, id: null })}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm cancellation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to cancel this request?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirm({ open: false, id: null })}>No</Button>
          <LoadingButton variant="danger" onClickAsync={async () => { await handleCancel(confirm.id); }}>
            Yes, cancel
          </LoadingButton>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default MyRequests
