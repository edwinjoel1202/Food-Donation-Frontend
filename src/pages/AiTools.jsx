import React, { useState } from 'react'
import { Card, Form, Button, Tabs, Tab } from 'react-bootstrap'
import api from '../services/api'
import { toast } from 'react-toastify'

const AiTools = () => {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState('piece')
  const [servings, setServings] = useState(4)
  const [message, setMessage] = useState('')
  const [result, setResult] = useState(null)

  const handleCategorize = async () => {
    try {
      const res = await api.get('/ai/categorize', { params: { name } })
      setResult(res.data)
    } catch {
      toast.error('AI categorize failed')
    }
  }

  const handleExpiry = async () => {
    try {
      const res = await api.get('/ai/predict-expiry', { params: { name } })
      setResult(res.data)
    } catch {
      toast.error('Expiry prediction failed')
    }
  }

  const handleNutrition = async () => {
    try {
      const res = await api.get('/ai/nutrition', { params: { name, quantity, unit } })
      setResult(res.data)
    } catch {
      toast.error('Nutrition failed')
    }
  }

  const handleChat = async () => {
    try {
      const res = await api.post('/ai/chat', { message })
      setResult(res.data)
    } catch {
      toast.error('Chat failed')
    }
  }

  return (
    <>
      <h2>AI Tools</h2>
      <Tabs defaultActiveKey="categorize" id="ai-tabs" className="mb-3">
        <Tab eventKey="categorize" title="Categorize">
          <Form.Group className="mb-2">
            <Form.Label>Food Name</Form.Label>
            <Form.Control value={name} onChange={e => setName(e.target.value)} />
          </Form.Group>
          <Button onClick={handleCategorize}>Categorize</Button>
        </Tab>
        <Tab eventKey="expiry" title="Predict Expiry">
          <Form.Group className="mb-2">
            <Form.Label>Food Name</Form.Label>
            <Form.Control value={name} onChange={e => setName(e.target.value)} />
          </Form.Group>
          <Button onClick={handleExpiry}>Predict</Button>
        </Tab>
        <Tab eventKey="nutrition" title="Nutrition">
          <Form.Group className="mb-2">
            <Form.Label>Food</Form.Label>
            <Form.Control value={name} onChange={e => setName(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Quantity</Form.Label>
            <Form.Control type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Unit</Form.Label>
            <Form.Control value={unit} onChange={e => setUnit(e.target.value)} />
          </Form.Group>
          <Button onClick={handleNutrition}>Get Nutrition</Button>
        </Tab>
        <Tab eventKey="chat" title="Chat">
          <Form.Group>
            <Form.Label>Message</Form.Label>
            <Form.Control as="textarea" value={message} onChange={e => setMessage(e.target.value)} />
          </Form.Group>
          <Button onClick={handleChat}>Send</Button>
        </Tab>
      </Tabs>

      {result && <Card className="mt-3"><Card.Body><pre>{JSON.stringify(result, null, 2)}</pre></Card.Body></Card>}
    </>
  )
}

export default AiTools
