// src/pages/AiTools.jsx
import React, { useState } from 'react';
import { Card, Form, Button, Tabs, Tab } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import LoadingButton from '../components/LoadingButton';

const AiTools = () => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('piece');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);

  const handleCategorize = async () => {
    try {
      const res = await api.get('/ai/categorize', { params: { name } });
      setResult(res.data);
    } catch {
      toast.error('AI categorize failed');
    }
  };

  const handleExpiry = async () => {
    try {
      const res = await api.get('/ai/predict-expiry', { params: { name } });
      setResult(res.data);
    } catch {
      toast.error('Expiry prediction failed');
    }
  };

  const handleNutrition = async () => {
    try {
      const res = await api.get('/ai/nutrition', { params: { name, quantity, unit } });
      setResult(res.data);
    } catch {
      toast.error('Nutrition failed');
    }
  };

  const handleChat = async () => {
    try {
      const res = await api.post('/ai/chat', { message });
      setResult(res.data);
    } catch {
      toast.error('Chat failed');
    }
  };

  return (
    <>
      <h2>AI Tools</h2>
      <Card className="p-3 mb-3">
        <div className="mb-3">
          <strong>Quick links:</strong>{' '}
          <Button as={Link} to="/ai/chat" variant="outline-primary" size="sm" className="me-2">AI Chat</Button>
          <Button as={Link} to="/ai/recipe" variant="outline-primary" size="sm">Recipe Generator</Button>
        </div>

        <Tabs defaultActiveKey="categorize" id="ai-tabs" className="mb-3">
          <Tab eventKey="categorize" title="Categorize">
            <Form.Group className="mb-2">
              <Form.Label>Food Name</Form.Label>
              <Form.Control value={name} onChange={e => setName(e.target.value)} />
            </Form.Group>
            <LoadingButton onClickAsync={handleCategorize}>Categorize</LoadingButton>
          </Tab>

          <Tab eventKey="expiry" title="Predict Expiry">
            <Form.Group className="mb-2">
              <Form.Label>Food Name</Form.Label>
              <Form.Control value={name} onChange={e => setName(e.target.value)} />
            </Form.Group>
            <LoadingButton onClickAsync={handleExpiry}>Predict</LoadingButton>
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
            <LoadingButton onClickAsync={handleNutrition}>Get Nutrition</LoadingButton>
          </Tab>

          <Tab eventKey="chat" title="Chat">
            <Form.Group>
              <Form.Label>Message</Form.Label>
              <Form.Control as="textarea" value={message} onChange={e => setMessage(e.target.value)} />
            </Form.Group>
            <LoadingButton onClickAsync={handleChat}>Send</LoadingButton>
          </Tab>
        </Tabs>

        {result && <Card className="mt-3"><Card.Body><pre>{JSON.stringify(result, null, 2)}</pre></Card.Body></Card>}
      </Card>
    </>
  );
};

export default AiTools;
