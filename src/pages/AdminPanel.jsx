import React, { useState } from 'react'
import { Card, Form, Button } from 'react-bootstrap'
import api from '../services/api'
import { toast } from 'react-toastify'

const AdminPanel = () => {
  const [userId, setUserId] = useState('')

  const handleDisable = async () => {
    try {
      await api.post(`/admin/disable-user/${userId}`)
      toast.success('User disabled')
    } catch (err) {
      toast.error('Failed to disable user')
    }
  }

  return (
    <Card className="p-3">
      <h4>Admin Panel</h4>
      <Form>
        <Form.Group className="mb-2">
          <Form.Label>User ID to disable</Form.Label>
          <Form.Control value={userId} onChange={e => setUserId(e.target.value)} />
        </Form.Group>
        <Button variant="danger" onClick={handleDisable}>Disable User</Button>
      </Form>
    </Card>
  )
}

export default AdminPanel
