// src/pages/RecipeGenerator.jsx
import React, { useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import api from '../services/api';
import { toast } from 'react-toastify';
import LoadingButton from '../components/LoadingButton';

const RecipeGenerator = () => {
  const [ingredients, setIngredients] = useState('');
  const [servings, setServings] = useState(2);
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    if (!ingredients.trim()) return toast.info('Add ingredients or food name');
    try {
      const res = await api.post('/ai/recipe', { ingredients, servings });
      setResult(res.data);
    } catch (err) {
      toast.error('Recipe generation failed');
    }
  };

  return (
    <>
      <h2>Recipe Generator</h2>
      <Card className="p-3" style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <Form.Group className="mb-2">
              <Form.Label>Ingredients / Food</Form.Label>
              <Form.Control as="textarea" rows={6} value={ingredients} onChange={e => setIngredients(e.target.value)} placeholder="e.g. 2 potatoes, 1 onion, 200g spinach ..." />
            </Form.Group>
            <Form.Group className="mb-2" style={{ maxWidth: 160 }}>
              <Form.Label>Servings</Form.Label>
              <Form.Control type="number" value={servings} onChange={e => setServings(Number(e.target.value))} />
            </Form.Group>
            <LoadingButton onClickAsync={handleGenerate} variant="success">Generate Recipe</LoadingButton>
          </div>

          <div style={{ flex: 1.4, minHeight: 260 }}>
            <h5>Recipe</h5>
            {result ? (
              <div>
                <h4>{result.title || 'Generated Recipe'}</h4>
                {result.prep && <p><strong>Prep:</strong> {result.prep}</p>}
                {result.cook && <p><strong>Cook:</strong> {result.cook}</p>}
                {result.ingredients && (
                  <>
                    <h6>Ingredients</h6>
                    <ul>{result.ingredients.map((it, i) => <li key={i}>{it}</li>)}</ul>
                  </>
                )}
                {result.instructions && (
                  <>
                    <h6>Instructions</h6>
                    <ol>{result.instructions.map((it, i) => <li key={i}>{it}</li>)}</ol>
                  </>
                )}
                {result.nutrition && <pre style={{ background: '#f8f9fa', padding: 8 }}>{JSON.stringify(result.nutrition, null, 2)}</pre>}
              </div>
            ) : (
              <div className="text-muted">Generated recipes will appear here in a large readable layout.</div>
            )}
          </div>
        </div>
      </Card>
    </>
  );
};

export default RecipeGenerator;
