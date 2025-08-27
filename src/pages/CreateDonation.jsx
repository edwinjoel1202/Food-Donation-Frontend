// src/pages/CreateDonation.jsx
import React, { useState } from 'react';
import { Card, Form, Button, InputGroup } from 'react-bootstrap';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import LoadingButton from '../components/LoadingButton';

const CreateDonation = () => {
  const [formData, setFormData] = useState({
    title: '', description: '', category: '', quantity: '', unit: '', expiryAt: '', pickupLat: '', pickupLng: '', imageBase64: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, imageBase64: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        quantity: Number(formData.quantity) || 0,
        pickupLat: formData.pickupLat ? Number(formData.pickupLat) : null,
        pickupLng: formData.pickupLng ? Number(formData.pickupLng) : null
      };
      await api.post('/donations', payload);
      toast.success('Donation created');
      navigate('/my-donations');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create donation');
    }
  };

  const handleAiCategorize = async () => {
    if (!formData.title && !formData.description) {
      toast.info('Please add a title or description for AI to categorize');
      return;
    }
    try {
      const name = formData.title || formData.description;
      const res = await api.get('/ai/categorize', { params: { name } });
      if (res.data?.category) {
        setFormData(prev => ({ ...prev, category: res.data.category }));
      } else if (typeof res.data === 'string') {
        setFormData(prev => ({ ...prev, category: res.data }));
      } else {
        toast.info('AI categorization returned unexpected result');
      }
    } catch (err) {
      toast.error('AI categorize failed');
    }
  };

  const handlePredictExpiry = async () => {
    if (!formData.title && !formData.description) {
      toast.info('Provide title or description for expiry prediction');
      return;
    }
    try {
      const name = formData.title || formData.description;
      const res = await api.get('/ai/predict-expiry', { params: { name } });
      const raw = res.data || {};

      // Support multiple possible response shapes, now including: { expiryDays: "1" }
      let days;
      if (raw?.expiryDays !== undefined && raw.expiryDays !== null) {
        // expiryDays may come as string, e.g. "1"
        days = parseInt(String(raw.expiryDays).trim(), 10);
      } else if (raw?.days !== undefined && raw.days !== null) {
        days = Number(raw.days);
      } else if (raw?.daysToExpire !== undefined && raw.daysToExpire !== null) {
        days = Number(raw.daysToExpire);
      } else {
        // fallback: if api returned a primitive number/string directly
        const maybeNum = Number(raw);
        days = Number.isFinite(maybeNum) ? maybeNum : undefined;
      }

      if (typeof days === 'number' && Number.isFinite(days)) {
        // compute expiry date based on current date + days
        const created = new Date();
        const expiry = new Date(created.getTime() + days * 24 * 60 * 60 * 1000);

        // convert to input[type=datetime-local] friendly string (local timezone)
        const pad = (n) => String(n).padStart(2, '0');
        const toLocalInput = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

        setFormData(prev => ({ ...prev, expiryAt: toLocalInput(expiry) }));
        toast.success(`Predicted expiry +${days} day${days !== 1 ? 's' : ''}`);
      } else {
        toast.error('AI returned unexpected expiry format');
      }
    } catch (err) {
      toast.error('Expiry prediction failed');
    }
  };

  return (
    <Card className="mx-auto mt-4" style={{ maxWidth: 720 }}>
      <Card.Body>
        <h4>Create Donation</h4>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-2">
            <Form.Label>Title</Form.Label>
            <Form.Control name="title" value={formData.title} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Description</Form.Label>
            <Form.Control name="description" as="textarea" rows={3} value={formData.description} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Category</Form.Label>
            <InputGroup>
              <Form.Control name="category" value={formData.category} onChange={handleChange} />
              <LoadingButton onClickAsync={async () => await handleAiCategorize()} variant="outline-secondary">AI categorise</LoadingButton>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Quantity</Form.Label>
            <Form.Control name="quantity" type="number" value={formData.quantity} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Unit</Form.Label>
            <Form.Control name="unit" value={formData.unit} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Expiry At</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control name="expiryAt" type="datetime-local" value={formData.expiryAt} onChange={handleChange} />
              <LoadingButton onClickAsync={handlePredictExpiry} variant="outline-secondary">Predict expiry using AI</LoadingButton>
            </div>
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Pickup Latitude</Form.Label>
            <Form.Control name="pickupLat" type="number" value={formData.pickupLat} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Pickup Longitude</Form.Label>
            <Form.Control name="pickupLng" type="number" value={formData.pickupLng} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Image</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handleImage} />
          </Form.Group>

          <LoadingButton type="submit" variant="success" onClickAsync={async (e) => {
            // this wrapper ensures overlay appears for the submit action too
            e.preventDefault();
            await handleSubmit(e);
          }}>
            Create
          </LoadingButton>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default CreateDonation;
