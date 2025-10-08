// src/pages/CreateDonation.jsx
import React, { useState } from 'react';
import { Card, Form, Button, InputGroup, Row, Col } from 'react-bootstrap';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import LoadingButton from '../components/LoadingButton';

const CreateDonation = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    quantity: '',
    unit: '',
    expiryAt: '',
    pickupLat: '',
    pickupLng: '',
    pickupAddress: '',
    pickupCity: '',
    pickupState: '',
    pickupPostalCode: '',
    pickupCountry: '',
    imageBase64: ''
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

  // Reverse geocode using Nominatim (OpenStreetMap). Replace with Google if desired.
  const reverseGeocode = async (lat, lng) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Reverse geocode failed');
      const data = await res.json();
      const addr = data.address || {};
      setFormData(prev => ({
        ...prev,
        pickupAddress: [
          addr.road, addr.neighbourhood, addr.suburb, addr.house_number, addr.hamlet
        ].filter(Boolean).join(', ') || data.display_name || prev.pickupAddress,
        pickupCity: addr.city || addr.town || addr.village || addr.county || prev.pickupCity,
        pickupState: addr.state || prev.pickupState,
        pickupPostalCode: addr.postcode || prev.pickupPostalCode,
        pickupCountry: addr.country || prev.pickupCountry
      }));
      toast.success('Address filled from coordinates — please confirm fields if needed');
    } catch (err) {
      console.error(err);
      toast.error('Failed to reverse-geocode location');
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setFormData(prev => ({ ...prev, pickupLat: String(lat), pickupLng: String(lng) }));
        reverseGeocode(lat, lng);
      },
      (err) => {
        toast.error('Failed to get location: ' + (err.message || err.code));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        quantity: Number(formData.quantity) || 0,
        pickupLat: formData.pickupLat ? Number(formData.pickupLat) : null,
        pickupLng: formData.pickupLng ? Number(formData.pickupLng) : null,
      };
      // ensure naming matches DTO fields expected by backend
      await api.post('/donations', payload);
      toast.success('Donation created');
      navigate('/my-donations');
    } catch (err) {
      console.error(err);
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
      if (res.data?.category) setFormData(prev => ({ ...prev, category: res.data.category }));
      else if (typeof res.data === 'string') setFormData(prev => ({ ...prev, category: res.data }));
      else toast.info('AI categorization returned unexpected result');
    } catch (err) {
      toast.error('AI categorize failed');
    }
  };

  const handlePredictExpiry = async () => {
    if (!formData.title && !formData.description) {
      toast.info('Please add a title or description for AI expiry prediction');
      return;
    }
    try {
      const name = formData.title || formData.description;
      const res = await api.get('/ai/predict-expiry', { params: { name } });
      if (res.data?.expiryAt) setFormData(prev => ({ ...prev, expiryAt: res.data.expiryAt }));
      else if (typeof res.data === 'string') setFormData(prev => ({ ...prev, expiryAt: res.data }));
      else toast.info('AI expiry returned unexpected result');
    } catch (err) {
      toast.error('AI expiry failed');
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

          <Row>
            <Col md={4}>
              <Form.Group className="mb-2">
                <Form.Label>Quantity</Form.Label>
                <Form.Control name="quantity" type="number" value={formData.quantity} onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-2">
                <Form.Label>Unit</Form.Label>
                <Form.Control name="unit" value={formData.unit} onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-2">
                <Form.Label>Expiry At</Form.Label>
                <Form.Control name="expiryAt" type="datetime-local" value={formData.expiryAt} onChange={handleChange} />
                <LoadingButton onClickAsync={handlePredictExpiry} variant="outline-secondary" className="mt-1">Predict expiry</LoadingButton>
              </Form.Group>
            </Col>
          </Row>

          <hr/>

          <h6>Pickup location</h6>

          <Form.Group className="mb-2">
            <Form.Label>Address (auto-filled from coordinates)</Form.Label>
            <Form.Control name="pickupAddress" as="textarea" rows={2} value={formData.pickupAddress} onChange={handleChange} placeholder="Street / Landmark" />
          </Form.Group>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-2">
                <Form.Label>City</Form.Label>
                <Form.Control name="pickupCity" value={formData.pickupCity} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-2">
                <Form.Label>State / Region</Form.Label>
                <Form.Control name="pickupState" value={formData.pickupState} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-2">
                <Form.Label>Postal Code</Form.Label>
                <Form.Control name="pickupPostalCode" value={formData.pickupPostalCode} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={8}>
              <Form.Group className="mb-2">
                <Form.Label>Country</Form.Label>
                <Form.Control name="pickupCountry" value={formData.pickupCountry} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end mb-2">
              <div style={{ width: '100%' }}>
                <Button variant="outline-primary" onClick={handleUseMyLocation} style={{ width: '100%' }}>
                  Use my location
                </Button>
                <div className="text-muted text-small mt-1" style={{ fontSize: 12 }}>
                  {formData.pickupLat && formData.pickupLng ? `lat: ${formData.pickupLat}, lng: ${formData.pickupLng}` : 'lat/lng not set'}
                </div>
              </div>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Image</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handleImage} />
          </Form.Group>

          <LoadingButton type="submit" variant="success" onClickAsync={async (e) => {
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
